import { GoogleGenAI, Type } from '@google/genai';
import type { Vitals, UserProfile, RiskPrediction, CommunityData, WorldPopulation, CoachSettings, TrendingDisease, GlobalDiseaseStat, RegionalHealthData, ThematicData, DiseaseFactSheet, RegionalTopicData, CommunityStats, ImageType, HealthRecord, AITrendAnalysis, GlobalTrendingStats, CityLiveFeedEvent, SearchedDiseaseStats, LiveDiseaseCase, HealthNewsArticle, GroundingSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Caching Utility ---
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
    timestamp: number;
    data: T;
}

async function withCache<T>(cacheKey: string, apiCall: () => Promise<T>, ttl: number = CACHE_TTL): Promise<T> {
    try {
        const cachedItem = sessionStorage.getItem(cacheKey);
        if (cachedItem) {
            const entry: CacheEntry<T> = JSON.parse(cachedItem);
            if (Date.now() - entry.timestamp < ttl) {
                return entry.data;
            }
        }
    } catch (error) {
        console.error(`[Cache] Error reading from cache for ${cacheKey}:`, error);
        sessionStorage.removeItem(cacheKey); // Clear corrupted entry
    }

    const data = await apiCall(); // Let errors propagate

    try {
        const entry: CacheEntry<T> = { timestamp: Date.now(), data };
        sessionStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
        console.error(`[Cache] Error writing to cache for ${cacheKey}:`, error);
    }
    
    return data;
}
// --- End Caching Utility ---


// --- AI Analysis Cooldown & Fallback ---
const AI_ANALYSIS_COOLDOWN_KEY = 'aiAnalysisCooldownUntil';
const COOLDOWN_DURATION = 2 * 60 * 1000; // 2 minutes cooldown on rate limit

const FALLBACK_AI_ANALYSIS = `
**1. Health Risk Analysis:**
Based on your provided vitals, there are several areas to focus on for proactive health management. Elevated readings in blood pressure or glucose are often linked to lifestyle factors, including diet and physical activity, which can be effectively managed with consistent effort. Your BMI is also a key indicator of overall health, and maintaining it within a healthy range is crucial for reducing strain on your cardiovascular system.

**2. Personalized Dietary Plan (Grounded in Local Context):**
A balanced diet is fundamental. While a personalized plan could not be generated at this time, here are some universally beneficial guidelines:
- **Breakfast:** [DO]Opt for whole grains like oatmeal or a vegetable omelet to provide sustained energy.[/DO]
- **Lunch:** [DO]A salad with lean protein (like chicken or chickpeas) and a light vinaigrette is an excellent choice.[/DO] [AVOID]Try to limit processed dressings that can be high in sugar and sodium.[/AVOID]
- **Dinner:** [DO]Focus on baked or grilled fish or lentils with a generous portion of steamed vegetables.[/DO] [AVOID]Reduce intake of red meat and fried foods, which can contribute to higher cholesterol.[/AVOID]

**3. Recommended Exercise Regimen:**
Regular physical activity is key to improving cardiovascular health and managing weight.
- [DO]Aim for at least 30 minutes of moderate-intensity exercise, like brisk walking, five days a week.[/DO]
- [DO]Incorporate strength training exercises twice a week to build muscle mass, which helps in metabolism.[/DO]
- [AVOID]Avoid sedentary behavior for long periods. Try to stand up and stretch every hour if you have a desk job.[/AVOID]
`;

export async function getAIHealthAnalysis(vitals: Vitals, profile: UserProfile, predictions: RiskPrediction[]): Promise<string> {
    const cacheKey = `ai-health-analysis-${JSON.stringify(vitals)}`;
    const cacheTtl = 5 * 60 * 1000; // 5 minutes

    // 1. Check cache first
    try {
        const cachedItem = sessionStorage.getItem(cacheKey);
        if (cachedItem) {
            const entry: CacheEntry<string> = JSON.parse(cachedItem);
            if (Date.now() - entry.timestamp < cacheTtl) {
                return entry.data;
            }
        }
    } catch (error) {
        console.error(`[Cache] Error reading from cache for ${cacheKey}:`, error);
        sessionStorage.removeItem(cacheKey);
    }

    // 2. Check for API cooldown period
    const cooldownUntil = sessionStorage.getItem(AI_ANALYSIS_COOLDOWN_KEY);
    if (cooldownUntil && Date.now() < parseInt(cooldownUntil, 10)) {
        console.warn('AI Analysis API is in a cooldown period due to rate limiting. Returning fallback data.');
        const entry: CacheEntry<string> = { timestamp: Date.now(), data: FALLBACK_AI_ANALYSIS };
        sessionStorage.setItem(cacheKey, JSON.stringify(entry));
        return FALLBACK_AI_ANALYSIS;
    }

    // 3. If not cached and not in cooldown, make the API call
    try {
        const geneticInfo = profile.geneticMarkers?.filter(m => m.userHas).map(m => m.name).join(', ') || 'Not provided.';
        const allergiesInfo = profile.allergies?.join(', ') || 'Not provided.';
        const healthNotesInfo = profile.healthNotes?.join('; ') || 'None noted.';
        const bmi = (vitals.weight / ((vitals.height / 100) ** 2));
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });

        const prompt = `
            As an expert AI health analyst trained on millions of health records and successful intervention plans, your task is to provide a detailed, evidence-based, and actionable health assessment using Google Search to ground your answers in real-world, location-specific context.

            **User Profile & Vitals:**
            - Age: ${profile.age}
            - Gender: ${profile.gender}
            - Location: ${profile.city}, ${profile.country}
            - Known Allergies: ${allergiesInfo}
            - Genetic Markers: ${geneticInfo}
            - Health Notes from AI Chat: ${healthNotesInfo}
            - Blood Pressure: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
            - Blood Glucose: ${vitals.bloodGlucose} mg/dL
            - Cholesterol: ${vitals.cholesterol} mg/dL
            - BMI: ${bmi.toFixed(1)}
            - Current Month: ${currentMonth}

            **ML Model Risk Predictions:**
            ${predictions.map(p => `- ${p.disease}: ${p.riskLevel} risk`).join('\n')}

            **Your Task:**
            Generate a comprehensive report in three distinct, bolded sections as outlined below. Maintain an encouraging and clear tone. **Crucially, for all recommendations in sections 2 and 3, you MUST wrap positive, actionable advice in [DO]...[/DO] tags and things to avoid or warnings in [AVOID]...[/AVOID] tags.**

            **1. Health Risk Analysis:**
            First, provide a root cause analysis of the user's risks. Explain how their regional background might influence their results. For example, use your search capabilities to comment on how a diet popular in ${profile.country} might contribute to factors like cholesterol or weight. Connect their vitals, BMI, and any relevant health notes to the ML predictions, explaining *why* these factors contribute to the predicted risks.

            **2. Personalized Dietary Plan (Grounded in Local Context):**
            Create a **sample 3-day meal plan** (Breakfast, Lunch, Dinner). This plan MUST be:
            - **Culturally Relevant:** Use Google Search to suggest meal ideas using ingredients common and accessible in ${profile.country}. If a major local food (e.g., cheese in some European countries) is a health concern, address it directly (e.g., "[AVOID]While popular, consider reducing cheese consumption...[/AVOID]").
            - **Allergy-Aware:** The plan must NOT include any foods the user is allergic to (${allergiesInfo}).
            - **Seasonally Smart:** Use Google Search to add brief warnings if any recommended foods (like specific vegetables) might have seasonal issues (e.g., "[AVOID]For cauliflower in ${currentMonth}, ensure thorough cleaning as it's a rainy season...[/AVOID]").
            - **Goal-Oriented:** Directly address risk factors (e.g., "[DO]Incorporate low-sodium options like grilled fish and steamed vegetables to help manage hypertension.[/DO]").

            **3. Recommended Exercise Regimen:**
            Recommend a specific, beginner-friendly **weekly exercise schedule**. Detail the type, duration, and frequency using the required tags. Example: "[DO]Monday: 30-minute brisk walk in the morning.[/DO]".
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
                maxOutputTokens: 1200, 
                thinkingConfig: { thinkingBudget: 400 },
                tools: [{googleSearch: {}}],
            }
        });

        const result = response.text;
        const entry: CacheEntry<string> = { timestamp: Date.now(), data: result };
        sessionStorage.setItem(cacheKey, JSON.stringify(entry));
        sessionStorage.removeItem(AI_ANALYSIS_COOLDOWN_KEY); // Clear cooldown on a successful call
        return result;

    } catch (error: any) {
        console.error("Failed to fetch AI analysis from Gemini:", error);

        // If it's a rate limit error, set the cooldown
        const errorString = error.toString();
        if (errorString.includes('429') || (error.error && error.error.status === 'RESOURCE_EXHAUSTED')) {
            console.warn(`Rate limit hit for AI Analysis. Activating cooldown for ${COOLDOWN_DURATION / 1000} seconds.`);
            sessionStorage.setItem(AI_ANALYSIS_COOLDOWN_KEY, (Date.now() + COOLDOWN_DURATION).toString());
        }

        // Always return and cache the fallback on any error
        const entry: CacheEntry<string> = { timestamp: Date.now(), data: FALLBACK_AI_ANALYSIS };
        sessionStorage.setItem(cacheKey, JSON.stringify(entry));
        return FALLBACK_AI_ANALYSIS;
    }
}

export async function getAITrendAnalysis(healthHistory: HealthRecord[]): Promise<AITrendAnalysis> {
    const simplifiedHistory = healthHistory.map(r => ({
        date: r.date,
        time: r.timeOfDay,
        bp: `${r.vitals.systolicBP}/${r.vitals.diastolicBP}`,
        glucose: r.vitals.bloodGlucose,
        bmi: r.bmi.toFixed(1)
    }));

    const prompt = `
        You are an AI health data analyst. Analyze the following time-series data from a user's health records. Your task is to identify key trends, provide an overall assessment, and generate dynamic recommendations.

        Health Data:
        ${JSON.stringify(simplifiedHistory, null, 2)}

        **Your Task:**
        Respond with a JSON object that strictly adheres to the provided schema.
        1.  **overallAssessment:** A brief, encouraging summary of the user's progress (1-2 sentences).
        2.  **positiveTrends:** An array of strings. Identify and describe any clear improvements (e.g., "Excellent work on lowering your average Systolic BP this period."). If none, return an empty array.
        3.  **areasForImprovement:** An array of strings. Identify any negative trends or consistently high values and explain their potential implications (e.g., "Your morning blood glucose levels remain elevated, which could increase long-term risk."). If none, return an empty array.
        4.  **dynamicRecommendations:** An array of strings. Provide 2-3 new, actionable recommendations based *directly* on the observed trends. For example, if morning glucose is high, suggest a specific breakfast change. If BP is improving, suggest maintaining the current exercise plan.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallAssessment: { type: Type.STRING },
                        positiveTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
                        areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
                        dynamicRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["overallAssessment", "positiveTrends", "areasForImprovement", "dynamicRecommendations"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Failed to fetch AI trend analysis:", error);
        throw new Error("Failed to analyze health trends.");
    }
}


export async function getSummaryFromChat(chatHistory: { sender: 'user' | 'bot'; text: string }[]): Promise<string | null> {
    const userMessages = chatHistory.filter(m => m.sender === 'user').map(m => m.text).join('\n');
    if (userMessages.length < 50) return null;

    const prompt = `
        Analyze the following user messages from a conversation with a health AI. Identify if the user mentioned any specific, new, or persistent health concerns (like 'frequent headaches', 'trouble sleeping', 'knee pain', 'feeling stressed').
        
        - If a clear health concern is mentioned, summarize it in a short, neutral phrase suitable for a health record (e.g., "Reports frequent headaches and sensitivity to light.").
        - If no clear, new health concern is mentioned, respond ONLY with the exact string "NO_CONCERN".
        - Do not summarize general health questions or requests for information. Focus only on personal health status reports from the user.

        User Messages:
        ---
        ${userMessages}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
                maxOutputTokens: 100,
            }
        });
        const summary = response.text.trim();
        return (summary === 'NO_CONCERN' || summary.length < 5) ? null : summary;
    } catch (error) {
        console.error("Failed to get summary from chat:", error);
        return null;
    }
}

export async function getChatCompletion(
    message: string,
    history: { sender: 'user' | 'bot'; text: string }[],
    settings: CoachSettings,
    image?: { base64Image: string, mimeType: string }
): Promise<string> {
    const contents: { role: string; parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] }[] = history.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    const userParts: ({ text: string } | { inlineData: { mimeType: string, data: string } })[] = [{ text: message }];
    if (image) {
        userParts.push({ inlineData: { mimeType: image.mimeType, data: image.base64Image } });
    }
    contents.push({ role: 'user', parts: userParts });

    const personalityInstructions = {
        'Empathetic & Encouraging': 'Your tone should be encouraging and supportive.',
        'Direct & Data-Driven': 'You should be direct, concise, and focus on factual, data-driven information.',
        'Calm & Reassuring': 'Your goal is to provide information in a soothing, non-alarming, and reassuring way.',
        'Energetic & Motivational': 'You should use positive and energetic language to inspire and motivate the user.'
    };
    const systemInstruction = `You are a helpful and versatile AI Health Companion named ${settings.name}. ${personalityInstructions[settings.personality]} You are an AI Health Companion, not a doctor. Always advise users to consult a healthcare professional for medical advice or diagnosis. You can provide safe, general health information. If an image is provided, describe it or answer questions about it, but do not provide any medical diagnosis based on the image. For any medical-related images, reiterate the importance of consulting a professional.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 300,
                thinkingConfig: { thinkingBudget: 100 },
            }
        });
        return response.text;
    } catch (error) {
        console.error("Failed to fetch chat completion from Gemini:", error);
        throw new Error('Failed to fetch chat completion');
    }
}

export async function getImageAnalysis(prompt: string, base64Image: string, mimeType: string, imageType: ImageType): Promise<string> {
    const analysisType = imageType === 'chest-x-ray' ? 'chest x-ray' : 'skin lesion';
    
    const fullPrompt = `
        You are an expert AI medical imaging assistant. Your task is to analyze the provided image and provide a detailed, evidence-based report based on the preliminary ML model findings.

        **Context:**
        - Image Type: ${analysisType}
        - Preliminary ML Finding: ${prompt}

        **Your Task:**
        Generate a report with the following four sections.

        1.  **Disclaimer:** Start with a clear, bolded disclaimer: "**Disclaimer: This is an AI-powered analysis and not a medical diagnosis. Please consult a qualified healthcare professional.**"

        2.  **Detailed Visual Analysis:** Describe the specific visual features in the image that support the preliminary finding. Be precise and descriptive, as if you are a specialist explaining the image. For example:
            - If it's a chest x-ray suggesting Tuberculosis: "I am observing what appears to be a cavitation (a hollow, dark gap) in the upper-right lobe of the lung field. Additionally, there are signs of opacity in the surrounding area, which can be indicative of inflammation associated with TB."
            - If it's a skin lesion suggesting an insect bite: "The lesion presents with localized swelling and significant erythema (redness). There is a visible central punctum (the bite mark itself), and no signs of widespread infection like purulent discharge (pus), which points towards a reaction to an insect bite rather than a primary bacterial infection."
            - If it's a skin lesion suggesting Melanoma: "The lesion exhibits several of the ABCDE characteristics: Asymmetry, irregular Borders, and uneven Color distribution. This combination of features is a key reason for the preliminary finding."

        3.  **Cause & Prevention (WHO-based):** Briefly explain the common causes of the potential condition and provide 2-3 key, actionable prevention tips based on WHO guidelines.

        4.  **Next Steps:** Provide clear, safe, and responsible next steps. This should always include consulting a doctor. For example: "The recommended next step is to share this image and preliminary report with a radiologist or your primary care physician for a definitive diagnosis and treatment plan."
    `;

    const imagePart = { inlineData: { mimeType, data: base64Image } };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: fullPrompt }, imagePart] },
            config: { maxOutputTokens: 800, thinkingConfig: { thinkingBudget: 100 } }
        });
        return response.text;
    } catch (error) {
        console.error("Failed to fetch image analysis from Gemini:", error);
        throw new Error('Failed to fetch image analysis');
    }
}

export async function getTrendingDiseases(country: string, city: string): Promise<TrendingDisease[]> {
    const cacheKey = `trending-diseases-${country}-${city}`;
    const apiCall = async (): Promise<TrendingDisease[]> => {
        try {
            const prompt = `Based on the location (${city}, ${country}) and current time of year, list the three most common or trending health issues. Provide realistic but simulated monthly cases for the city, and one concise, actionable preventative tip. Respond as a JSON object adhering to the provided schema.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { name: { type: Type.STRING }, cases: { type: Type.INTEGER }, prevention: { type: Type.STRING } },
                            required: ["name", "cases", "prevention"],
                        },
                    },
                },
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error("Failed to fetch trending diseases from Gemini:", error);
            return [
                { name: "Seasonal Influenza", cases: 1500, prevention: "Get an annual flu shot and wash hands frequently." },
                { name: "Common Cold", cases: 3200, prevention: "Avoid touching your face and maintain distance from sick individuals." },
                { name: "Dengue Fever", cases: 450, prevention: "Eliminate stagnant water to prevent mosquito breeding." },
            ];
        }
    };
    return withCache(cacheKey, apiCall);
}

export async function getGlobalDiseaseStats(country: string): Promise<GlobalDiseaseStat[]> {
    const cacheKey = `global-disease-stats-${country}`;
    const apiCall = async (): Promise<GlobalDiseaseStat[]> => {
        try {
            const prompt = `Generate plausible, simulated statistics comparing the disease burden for [Type 2 Diabetes, Cardiovascular Disease, Hypertension] globally versus specifically for ${country}. Provide the data as prevalence per 100,000 people. Respond as a JSON object.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                globalCases: { type: Type.INTEGER },
                                countryCases: { type: Type.INTEGER },
                            },
                            required: ["name", "globalCases", "countryCases"],
                        },
                    },
                },
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error("Failed to fetch global disease stats from Gemini:", error);
            return [
                { name: "Diabetes", globalCases: 8500, countryCases: 9200 },
                { name: "Cardio Disease", globalCases: 23500, countryCases: 21000 },
                { name: "Hypertension", globalCases: 22000, countryCases: 25000 },
            ];
        }
    };
    return withCache(cacheKey, apiCall);
}

export async function getCommunityStats(country: string, city: string): Promise<CommunityStats> {
    const cacheKey = `community-stats-${country}-${city}`;
    const apiCall = async (): Promise<CommunityStats> => {
        try {
            const prompt = `Provide realistic, simulated "live" population counts for the World, for the country of ${country}, and for the city of ${city}. Respond with a JSON object containing three integer values.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            worldPopulation: { type: Type.INTEGER },
                            countryPopulation: { type: Type.INTEGER },
                            cityPopulation: { type: Type.INTEGER },
                        },
                        required: ["worldPopulation", "countryPopulation", "cityPopulation"],
                    },
                },
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error("Failed to fetch community stats from Gemini:", error);
            return {
                worldPopulation: 8100000000,
                countryPopulation: 1400000000,
                cityPopulation: 13000000,
            };
        }
    };
    return withCache(cacheKey, apiCall);
}


export async function getDiseaseFactSheet(diseaseName: string): Promise<DiseaseFactSheet> {
    const cacheKey = `disease-fact-sheet-${diseaseName}`;
    const apiCall = async (): Promise<DiseaseFactSheet> => {
        try {
            const prompt = `Generate a concise fact sheet for the disease: "${diseaseName}". Provide details on its common cause, primary prevention methods, historical context (e.g., when discovered, its impact, its current status), and key statistics (simulated historical cases/mortality rate). Respond as a JSON object.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            cause: { type: Type.STRING },
                            prevention: { type: Type.STRING },
                            historicalContext: { type: Type.STRING },
                            statistics: { type: Type.STRING },
                        },
                        required: ["cause", "prevention", "historicalContext", "statistics"],
                    },
                },
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error(`Failed to fetch fact sheet for ${diseaseName} from Gemini:`, error);
            throw new Error(`Failed to fetch fact sheet for ${diseaseName}`);
        }
    };
    return withCache(cacheKey, apiCall);
}

export async function getThematicMapData(topic: 'air_pollution' | 'seasonal_diseases' | 'water_borne_diseases'): Promise<ThematicData> {
    const cacheKey = `thematic-map-data-${topic}`;
    const apiCall = async (): Promise<ThematicData> => {
        try {
            const districts = ["Bagalkot", "Bangalore Rural", "Bangalore Urban", "Belgaum", "Bellary", "Bidar", "Bijapur", "Chamarajanagar", "Chikkaballapur", "Chikmagalur", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Gulbarga", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Ramanagara", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada", "Yadgir"];
            const topicDescription = {
                air_pollution: "current average Air Quality Index (AQI)",
                seasonal_diseases: "simulated number of seasonal disease cases (like flu, dengue) per 100,000 people",
                water_borne_diseases: "simulated number of water-borne disease cases (like cholera, typhoid) per 100,000 people"
            };
            const prompt = `For each district in Karnataka, provide a realistic, simulated value for the following topic: "${topicDescription[topic]}". The values should show realistic geographical variation (e.g., urban areas might have worse air quality). Respond as a JSON object where each key is a district name.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: districts.reduce((acc, district) => {
                            acc[district] = {
                                type: Type.OBJECT,
                                properties: {
                                    value: { type: Type.INTEGER, description: `The numeric value for the topic.` },
                                    label: { type: Type.STRING, description: `A very short text label for the value (e.g., "152 AQI", "25 cases").` }
                                },
                                required: ["value", "label"]
                            };
                            return acc;
                        }, {} as any)
                    }
                }
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error("Failed to fetch thematic map data from Gemini:", error);
            const districts = ["Bagalkot", "Bangalore Rural", "Bangalore Urban", "Belgaum", "Bellary", "Bidar", "Bijapur", "Chamarajanagar", "Chikkaballapur", "Chikmagalur", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Gulbarga", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Ramanagara", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada", "Yadgir"];
            const fallbackData: ThematicData = {};
            districts.forEach(district => {
                let value, label;
                if (topic === 'air_pollution') {
                    value = district.includes('Bangalore') ? Math.floor(Math.random() * 50) + 100 : Math.floor(Math.random() * 80) + 30;
                    label = `${value} AQI`;
                } else {
                    value = Math.floor(Math.random() * 100) + 10;
                    label = `${value} cases`;
                }
                fallbackData[district] = { value, label };
            });
            return fallbackData;
        }
    };
    return withCache(cacheKey, apiCall);
}

export async function getRegionalTopicData(district: string, topic: string): Promise<RegionalTopicData> {
    const cacheKey = `regional-topic-data-${district}-${topic}`;
    const apiCall = async (): Promise<RegionalTopicData> => {
        try {
            const prompt = `Generate a plausible, simulated health report for the district of ${district}, Karnataka, focusing specifically on the topic of "${topic}". The report should include a title, a disclaimer about the data being a simulation, a brief analysis of the current situation for that topic, and 2-3 key statistics relevant to it. Respond as a JSON object.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            disclaimer: { type: Type.STRING },
                            title: { type: Type.STRING },
                            analysis: { type: Type.STRING },
                            keyStats: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        label: { type: Type.STRING },
                                        value: { type: Type.STRING }
                                    },
                                    required: ["label", "value"]
                                }
                            }
                        },
                        required: ["disclaimer", "title", "analysis", "keyStats"]
                    }
                }
            });
            return JSON.parse(response.text.trim());
        } catch (err) {
            console.error(`Failed to fetch topic data for ${district} from Gemini:`, err);
            throw new Error(`Failed to fetch topic data`);
        }
    };
    return withCache(cacheKey, apiCall);
}


export async function getRegionalHealthData(district: string): Promise<RegionalHealthData> {
    const cacheKey = `regional-health-data-${district}`;
    const apiCall = async (): Promise<RegionalHealthData> => {
        try {
            const prompt = `
                Generate a plausible, simulated health and environmental report for the district of ${district}, Karnataka for today.
                Your response MUST be a single JSON object that adheres to the provided schema.
                The data should be realistic and reflect the characteristics of the district (e.g., urban vs. rural).

                - disclaimer: Start with "This is a real-time AI simulation, not data from live sensors."
                - analysis: Provide a clear correlation between the environmental factors (like weather and pollutants) and how they can influence local health risks and disease trends.
                - historicalAQI: Provide simulated high and low AQI values for the past month and year.
                - allTimeHigh/Low: Provide a simulated all-time high and low AQI value and the year it was recorded.
                - predictedAQI: Provide a 24-hour AQI forecast, simulating a Prophet ML model output. It should be an array of 8 points (every 3 hours), each with 'hour', 'yhat' (prediction), 'yhat_lower', and 'yhat_upper' (confidence interval). The confidence interval should widen for later hours.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            disclaimer: { type: Type.STRING },
                            weather: { type: Type.STRING },
                            airQuality: { type: Type.STRING },
                            aqiValue: { type: Type.INTEGER },
                            pollutants: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, level: { type: Type.STRING }, value: { type: Type.STRING } }, required: ["name", "level", "value"] } },
                            diseaseTrends: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, cases: { type: Type.INTEGER }, alertLevel: { type: Type.STRING, enum: ["low", "medium", "high"] } }, required: ["name", "cases", "alertLevel"] } },
                            analysis: { type: Type.STRING },
                            historicalAQI: { type: Type.OBJECT, properties: { month: { type: Type.OBJECT, properties: { high: { type: Type.INTEGER }, low: { type: Type.INTEGER } }, required: ["high", "low"] }, year: { type: Type.OBJECT, properties: { high: { type: Type.INTEGER }, low: { type: Type.INTEGER } }, required: ["high", "low"] } }, required: ["month", "year"] },
                            predictedAQI: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { hour: { type: Type.STRING }, yhat: { type: Type.INTEGER }, yhat_lower: { type: Type.INTEGER }, yhat_upper: { type: Type.INTEGER } }, required: ["hour", "yhat", "yhat_lower", "yhat_upper"] } },
                            allTimeHigh: { type: Type.OBJECT, properties: { value: { type: Type.INTEGER }, year: { type: Type.INTEGER } } },
                            allTimeLow: { type: Type.OBJECT, properties: { value: { type: Type.INTEGER }, year: { type: Type.INTEGER } } }
                        },
                        required: ["disclaimer", "weather", "airQuality", "aqiValue", "pollutants", "diseaseTrends", "analysis", "historicalAQI", "predictedAQI"]
                    },
                },
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error("Failed to fetch regional health data from Gemini:", error);
            return {
                disclaimer: "This is fallback data as the AI simulation could not be fetched.",
                weather: "29°C, Partly Cloudy",
                airQuality: "Moderate",
                aqiValue: 88,
                pollutants: [
                    { name: "PM2.5", level: "Moderate", value: "29 µg/m³" },
                    { name: "O3", level: "Good", value: "50 µg/m³" },
                    { name: "NO2", level: "Good", value: "18 µg/m³" },
                ],
                diseaseTrends: [ { name: "Influenza", cases: 150, alertLevel: "medium" }, { name: "Dengue", cases: 40, alertLevel: "low" } ],
                analysis: "The current moderate air quality might affect individuals with respiratory sensitivities. It's advisable to monitor local health advisories for seasonal disease trends.",
                historicalAQI: { month: { high: 135, low: 50 }, year: { high: 170, low: 45 } },
                predictedAQI: [
                    { hour: "00:00", yhat: 85, yhat_lower: 80, yhat_upper: 90 },
                    { hour: "03:00", yhat: 80, yhat_lower: 75, yhat_upper: 85 },
                    { hour: "06:00", yhat: 82, yhat_lower: 76, yhat_upper: 88 },
                    { hour: "09:00", yhat: 95, yhat_lower: 88, yhat_upper: 102 },
                    { hour: "12:00", yhat: 100, yhat_lower: 92, yhat_upper: 108 },
                    { hour: "15:00", yhat: 98, yhat_lower: 90, yhat_upper: 106 },
                    { hour: "18:00", yhat: 92, yhat_lower: 86, yhat_upper: 99 },
                    { hour: "21:00", yhat: 90, yhat_lower: 85, yhat_upper: 96 },
                ],
                allTimeHigh: { value: 215, year: 2021 },
                allTimeLow: { value: 28, year: 2020 },
            };
        }
    };
    return withCache(cacheKey, apiCall);
}


export async function getGlobalTrendingDiseaseStats(country: string, city: string): Promise<GlobalTrendingStats> {
    const cacheKey = `global-trending-stats-${country}-${city}`;
    const apiCall = async (): Promise<GlobalTrendingStats> => {
        try {
            const prompt = `
                As a global health surveillance AI, identify the most seasonally relevant trending infectious disease for ${city}, ${country} right now.
                Then, generate a plausible, simulated statistical report for this disease.
                Your response must be a single JSON object that adheres to the provided schema.
                Provide diverse country names for the highest/lowest stats.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            trendingDiseaseName: { type: Type.STRING },
                            highestCases: { type: Type.OBJECT, properties: { country: { type: Type.STRING }, value: { type: Type.INTEGER } }, required: ["country", "value"] },
                            lowestCases: { type: Type.OBJECT, properties: { country: { type: Type.STRING }, value: { type: Type.INTEGER } }, required: ["country", "value"] },
                            highestDeaths: { type: Type.OBJECT, properties: { country: { type: Type.STRING }, value: { type: Type.INTEGER } }, required: ["country", "value"] },
                            lowestDeaths: { type: Type.OBJECT, properties: { country: { type: Type.STRING }, value: { type: Type.INTEGER } }, required: ["country", "value"] },
                            highestCures: { type: Type.OBJECT, properties: { country: { type: Type.STRING }, value: { type: Type.INTEGER } }, required: ["country", "value"] },
                            userCountryStats: { type: Type.OBJECT, properties: { cases: { type: Type.INTEGER }, deaths: { type: Type.INTEGER }, cures: { type: Type.INTEGER } }, required: ["cases", "deaths", "cures"] },
                            userCityStats: { type: Type.OBJECT, properties: { cases: { type: Type.INTEGER } }, required: ["cases"] }
                        },
                        required: ["trendingDiseaseName", "highestCases", "lowestCases", "highestDeaths", "lowestDeaths", "highestCures", "userCountryStats", "userCityStats"]
                    }
                }
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error("Failed to fetch global trending stats from Gemini:", error);
            return {
                trendingDiseaseName: "Influenza",
                highestCases: { country: "Brazil", value: 85203 },
                lowestCases: { country: "New Zealand", value: 1245 },
                highestDeaths: { country: "United States", value: 4521 },
                lowestDeaths: { country: "Iceland", value: 12 },
                highestCures: { country: "Germany", value: 79834 },
                userCountryStats: { cases: 15432, deaths: 321, cures: 14890 },
                userCityStats: { cases: 1234 }
            };
        }
    };
    return withCache(cacheKey, apiCall);
}

export async function getCityLiveFeed(city: string): Promise<CityLiveFeedEvent[]> {
    const cacheKey = `city-live-feed-${city}`;
    const LIVE_FEED_TTL = 85 * 1000; // 85 seconds
    
    const apiCall = async (): Promise<CityLiveFeedEvent[]> => {
        try {
            const prompt = `Generate a plausible, simulated "live feed" of 5 recent public health events for ${city}. The events should be for common diseases. Respond as a JSON array of objects.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING, description: "A unique ID for the event, e.g., a timestamp." },
                                time: { type: Type.STRING, description: "Relative time like '2m ago' or 'Just now'." },
                                disease: { type: Type.STRING },
                                area: { type: Type.STRING, description: "A plausible neighborhood or area in the city." },
                                severity: { type: Type.STRING, enum: ["Mild", "Moderate", "Severe"] }
                            },
                            required: ["id", "time", "disease", "area", "severity"]
                        }
                    }
                }
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error("Failed to fetch city live feed from Gemini:", error);
            return [
                { id: `fallback-${Date.now()}`, time: "1m ago", disease: "Influenza", area: `${city} Central`, severity: "Moderate" },
                { id: `fallback-${Date.now()-1}`, time: "8m ago", disease: "Common Cold", area: "North District", severity: "Mild" },
                { id: `fallback-${Date.now()-2}`, time: "25m ago", disease: "Stomach Flu", area: "Eastside", severity: "Mild" },
            ];
        }
    };
    return withCache(cacheKey, apiCall, LIVE_FEED_TTL);
}

export async function getDiseaseStats(diseaseName: string, userCountry: string): Promise<SearchedDiseaseStats> {
    const cacheKey = `disease-stats-${diseaseName}-${userCountry}`;
    const apiCall = async (): Promise<SearchedDiseaseStats> => {
        try {
            const prompt = `
                Provide a detailed statistical and informational breakdown for the disease: "${diseaseName}".
                Your response must be a single JSON object.
                1.  **diseaseName**: The name of the disease.
                2.  **totalGlobalCases**: The total simulated global cases (integer).
                3.  **countryBreakdown**: A breakdown for at least 15 diverse countries, ensuring ${userCountry} is one of them. Include 'country', 'cases', 'deaths', and 'cures'.
                4.  **recognizedDrugs**: An array of 2-4 commonly recognized and globally approved drug names or treatment types for this disease.
                5.  **symptoms**: An array of 5-7 common symptoms.
                6.  **whoGuidelines**: An object with two keys: 'prevention' and 'treatment'. Each key should have an array of 2-4 concise, actionable tips based on WHO recommendations.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            diseaseName: { type: Type.STRING },
                            totalGlobalCases: { type: Type.INTEGER },
                            countryBreakdown: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        country: { type: Type.STRING },
                                        cases: { type: Type.INTEGER },
                                        deaths: { type: Type.INTEGER },
                                        cures: { type: Type.INTEGER }
                                    },
                                    required: ["country", "cases", "deaths", "cures"]
                                }
                            },
                            recognizedDrugs: { type: Type.ARRAY, items: { type: Type.STRING } },
                            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                            whoGuidelines: {
                                type: Type.OBJECT,
                                properties: {
                                    prevention: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    treatment: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["prevention", "treatment"]
                            }
                        },
                        required: ["diseaseName", "totalGlobalCases", "countryBreakdown", "recognizedDrugs", "symptoms", "whoGuidelines"]
                    }
                }
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error(`Failed to fetch stats for ${diseaseName} from Gemini:`, error);
            throw new Error(`Failed to fetch stats for ${diseaseName}`);
        }
    };
    return withCache(cacheKey, apiCall);
}

export async function getLiveGlobalCases(): Promise<LiveDiseaseCase[]> {
    const cacheKey = 'live-global-cases';
    const apiCall = async (): Promise<LiveDiseaseCase[]> => {
        try {
            const prompt = `
                Generate a plausible, simulated dataset of 15 live, ongoing infectious disease outbreaks around the world.
                The data must be diverse, covering at least 5 different diseases (e.g., COVID-19, Influenza, Dengue, Cholera, Measles) and various continents.
                Each data point must include a unique ID, disease name, country, latitude, longitude, the number of active cases (ranging from 50 to 50000), and a severity level ('Mild', 'Moderate', 'Severe', 'Critical').
                Provide the response as a JSON array of objects.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                disease: { type: Type.STRING },
                                country: { type: Type.STRING },
                                lat: { type: Type.NUMBER },
                                lon: { type: Type.NUMBER },
                                cases: { type: Type.INTEGER },
                                severity: { type: Type.STRING, enum: ["Mild", "Moderate", "Severe", "Critical"] }
                            },
                            required: ["id", "disease", "country", "lat", "lon", "cases", "severity"]
                        }
                    }
                }
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error("Failed to fetch live global cases from Gemini:", error);
            return [
                { id: "1", disease: "Influenza", country: "USA", lat: 39.8283, lon: -98.5795, cases: 12000, severity: "Moderate" },
                { id: "2", disease: "Dengue", country: "Brazil", lat: -14.2350, lon: -51.9253, cases: 8500, severity: "Severe" },
                { id: "3", disease: "COVID-19", country: "India", lat: 20.5937, lon: 78.9629, cases: 25000, severity: "Moderate" },
                { id: "4", disease: "Cholera", country: "Nigeria", lat: 9.0820, lon: 8.6753, cases: 1500, severity: "Critical" },
                { id: "5", disease: "Measles", country: "DRC", lat: -4.0383, lon: 21.7587, cases: 3500, severity: "Severe" },
                { id: "6", disease: "Influenza", country: "Australia", lat: -25.2744, lon: 133.7751, cases: 5500, severity: "Mild" },
                { id: "7", disease: "COVID-19", country: "UK", lat: 55.3781, lon: -3.4360, cases: 9800, severity: "Moderate" },
            ];
        }
    };
    return withCache(cacheKey, apiCall);
}

export async function getHealthNews(): Promise<{ articles: HealthNewsArticle[], sources: GroundingSource[] }> {
    const cacheKey = 'health-news';
    const apiCall = async (): Promise<{ articles: HealthNewsArticle[], sources: GroundingSource[] }> => {
        try {
            const prompt = `
                Act as a health news aggregator AI. Find the top 5 most recent and significant global health news articles from the last 24 hours.
                Topics must include new disease outbreaks, major medical research breakthroughs, or significant public health alerts.
                For each article, provide:
                1. A title.
                2. A concise 2-3 sentence summary.
                3. The original source publication name (e.g., "Reuters", "WHO").
                4. The direct URL to the article.
                5. A relative publication time (e.g., "3 hours ago").
                6. A direct, publicly accessible URL to a high-quality, relevant image for the article. The URL must end in .jpg, .jpeg, .png, or .webp. If no suitable image is found, provide an empty string "".

                If the original source is not in English, you MUST translate the title and summary to English.
                Respond with ONLY a valid JSON array of objects that adheres to the schema.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                summary: { type: Type.STRING },
                                source: { type: Type.STRING },
                                url: { type: Type.STRING },
                                publishedAt: { type: Type.STRING },
                                imageUrl: { type: Type.STRING, description: "A direct URL to a relevant image." }
                            },
                            required: ["title", "summary", "source", "url", "publishedAt", "imageUrl"]
                        }
                    },
                    tools: [{googleSearch: {}}],
                }
            });

            const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources: GroundingSource[] = rawSources.map((s: any) => ({
                uri: s.web.uri,
                title: s.web.title
            })).filter((s: GroundingSource) => s.uri);

            const articles: HealthNewsArticle[] = JSON.parse(response.text.trim());

            return { articles, sources };
        } catch (error) {
            console.error("Failed to fetch health news from Gemini:", error);
            throw new Error('Failed to fetch health news');
        }
    };
    return withCache(cacheKey, apiCall);
}