import { GoogleGenAI, Type } from '@google/genai';
import type { Vitals, UserProfile, RiskPrediction, CommunityData, WorldPopulation, CoachSettings, TrendingDisease, GlobalDiseaseStat, RegionalHealthData, ThematicData, DiseaseFactSheet, RegionalTopicData, CommunityStats, ImageType, HealthRecord, AITrendAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAIHealthAnalysis(vitals: Vitals, profile: UserProfile, predictions: RiskPrediction[]): Promise<string> {
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

    try {
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
        return response.text;
    } catch (error) {
        console.error("Failed to fetch AI analysis from Gemini:", error);
        throw new Error('Failed to fetch AI analysis');
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


export async function validateImageType(base64Image: string, mimeType: string, expectedType: ImageType): Promise<boolean> {
    const prompt = `Analyze the content of this image. Classify it as one of the following categories: "Chest X-Ray", "Skin Lesion", "Animal", "Object", "Text Document", "Other". Respond with only the single most appropriate category name from this list.`;
    const imagePart = { inlineData: { mimeType, data: base64Image } };
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, imagePart] },
            config: { temperature: 0.0, maxOutputTokens: 10 }
        });
        
        const classification = response.text?.trim().toLowerCase() ?? '';
        const expectedClassification = expectedType.replace('-', ' ').toLowerCase();
        
        // Check if the model's classification includes what we expect.
        // This is more robust against responses like "This is a Chest X-Ray."
        return classification.includes(expectedClassification);
    } catch (error) {
        console.error("Failed to validate image type:", error);
        return false; // Fail safely
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

// FIX: Modified function to accept an optional image payload for multimodal chat.
// This allows the AI Companion to handle image-based queries correctly without misusing the specialized getImageAnalysis function.
export async function getChatCompletion(
    message: string,
    history: { sender: 'user' | 'bot'; text: string }[],
    settings: CoachSettings,
    image?: { base64Image: string, mimeType: string }
): Promise<string> {
    // FIX: Explicitly type `contents` to allow for multimodal parts (text and image). This prevents
    // TypeScript from inferring a narrow type from `history.map` that only allows text parts,
    // which would cause an error when adding the user's potentially image-containing message.
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
    // FIX: Updated system instruction to guide the model on how to handle images safely in a general chat context.
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
        You are an expert AI medical imaging assistant. Your task is to analyze the provided image and provide a detailed, evidence-based report based on the preliminary ML model findings. Your analysis MUST adhere to WHO guidelines and standards.

        **Context:**
        - Image Type: ${analysisType}
        - Preliminary ML Finding: ${prompt}

        **Your Task:**
        1.  **Disclaimer:** Start with a clear, bolded disclaimer: "**Disclaimer: This is an AI-powered analysis and not a medical diagnosis. Please consult a qualified healthcare professional.**"
        2.  **Visual Indicator Analysis:** Based on the preliminary finding, explain *what visual evidence in the image* could lead to such a conclusion. Be specific. For example:
            - For Tuberculosis: "I am observing a potential cavitation (a hollow, shadowed space) in the upper-left lobe of the lung field, which is a common indicator for Tuberculosis."
            - For Melanoma: "The lesion shows some asymmetry and has irregular borders, which are characteristics often evaluated when assessing for Melanoma."
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
    const prompt = `Based on the location (${city}, ${country}) and current time of year, list the three most common or trending health issues. Provide realistic but simulated monthly cases for the city, and one concise, actionable preventative tip. Respond as a JSON object adhering to the provided schema.`;
    try {
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
}

export async function getGlobalDiseaseStats(country: string): Promise<GlobalDiseaseStat[]> {
    const prompt = `Generate plausible, simulated statistics comparing the disease burden for [Type 2 Diabetes, Cardiovascular Disease, Hypertension] globally versus specifically for ${country}. Provide the data as prevalence per 100,000 people. Respond as a JSON object.`;
    try {
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
        console.error("Failed to fetch global disease stats:", error);
        // Return plausible fallback data
        return [
            { name: "Diabetes", globalCases: 8500, countryCases: 9200 },
            { name: "Cardio Disease", globalCases: 23500, countryCases: 21000 },
            { name: "Hypertension", globalCases: 22000, countryCases: 25000 },
        ];
    }
}

export async function getCommunityStats(country: string, city: string): Promise<CommunityStats> {
    const prompt = `Provide realistic, simulated "live" population counts for the World, for the country of ${country}, and for the city of ${city}. Respond with a JSON object containing three integer values.`;
    try {
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
        console.error("Failed to fetch community stats:", error);
        // Return plausible fallback data
        return {
            worldPopulation: 8100000000,
            countryPopulation: 1400000000,
            cityPopulation: 13000000,
        };
    }
}


export async function getDiseaseFactSheet(diseaseName: string): Promise<DiseaseFactSheet> {
    const prompt = `Generate a concise fact sheet for the disease: "${diseaseName}". Provide details on its common cause, primary prevention methods, historical context (e.g., when discovered, its impact, its current status), and key statistics (simulated historical cases/mortality rate). Respond as a JSON object.`;
    try {
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
        console.error(`Failed to fetch fact sheet for ${diseaseName}:`, error);
        throw new Error(`Failed to fetch fact sheet for ${diseaseName}`);
    }
}

export async function getThematicMapData(topic: 'air_pollution' | 'seasonal_diseases' | 'water_borne_diseases'): Promise<ThematicData> {
    const districts = ["Bagalkot", "Bangalore Rural", "Bangalore Urban", "Belgaum", "Bellary", "Bidar", "Bijapur", "Chamarajanagar", "Chikkaballapur", "Chikmagalur", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Gulbarga", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Ramanagara", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada", "Yadgir"];
    const topicDescription = {
        air_pollution: "current average Air Quality Index (AQI)",
        seasonal_diseases: "simulated number of seasonal disease cases (like flu, dengue) per 100,000 people",
        water_borne_diseases: "simulated number of water-borne disease cases (like cholera, typhoid) per 100,000 people"
    };

    const prompt = `For each district in Karnataka, provide a realistic, simulated value for the following topic: "${topicDescription[topic]}". The values should show realistic geographical variation (e.g., urban areas might have worse air quality). Respond as a JSON object where each key is a district name.`;

    try {
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
        throw new Error('Failed to fetch thematic map data');
    }
}

export async function getRegionalTopicData(district: string, topic: string): Promise<RegionalTopicData> {
    const prompt = `Generate a plausible, simulated health report for the district of ${district}, Karnataka, focusing specifically on the topic of "${topic}". The report should include a title, a disclaimer about the data being a simulation, a brief analysis of the current situation for that topic, and 2-3 key statistics relevant to it. Respond as a JSON object.`;
    try {
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
        console.error(`Failed to fetch topic data for ${district}:`, err);
        throw new Error(`Failed to fetch topic data`);
    }
}


export async function getRegionalHealthData(district: string): Promise<RegionalHealthData> {
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
    try {
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
         throw new Error("Failed to fetch regional health data");
    }
}