
// FIX: Replaced OpenAI API with Google Gemini API and removed hardcoded API key.
import { GoogleGenAI, Type } from '@google/genai';
import type { Vitals, UserProfile, RiskPrediction, CommunityData, WorldPopulation, CoachSettings, TrendingDisease, GlobalDiseaseStat } from '../types';

// FIX: Initialize Gemini client with API key from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const WORLD_BANK_API_URL = 'https://api.worldbank.org/v2';


export async function getAIHealthAnalysis(vitals: Vitals, profile: UserProfile, predictions: RiskPrediction[]): Promise<string> {
    const prompt = `
        Analyze the following health profile and provide personalized, actionable recommendations based on WHO guidelines.
        The user is in ${profile.city}, ${profile.country}, so consider regional factors if relevant (e.g., dietary staples).
        Keep the tone encouraging and clear. Structure the output into sections: "Key Observations" and "Recommendations".
        Do not repeat the risk levels, but explain what the combination of vitals and risks means.

        User Profile:
        - Age: ${profile.age}
        - Gender: ${profile.gender}
        - Location: ${profile.city}, ${profile.country}

        Vitals:
        - Blood Pressure: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
        - Blood Glucose: ${vitals.bloodGlucose} mg/dL
        - Cholesterol: ${vitals.cholesterol} mg/dL
        - BMI: ${(vitals.weight / ((vitals.height / 100) ** 2)).toFixed(1)}

        ML Model Risk Predictions:
        ${predictions.map(p => `- ${p.disease}: ${p.riskLevel} risk`).join('\n')}
    `;

    try {
        // FIX: Replaced fetch to OpenAI with Gemini's generateContent method.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
                maxOutputTokens: 400,
                thinkingConfig: { thinkingBudget: 100 },
            }
        });
        return response.text;
    } catch (error) {
        console.error("Failed to fetch AI analysis from Gemini:", error);
        throw new Error('Failed to fetch AI analysis');
    }
}

export async function getChatCompletion(
    message: string,
    history: { sender: 'user' | 'bot'; text: string }[],
    settings: CoachSettings
): Promise<string> {
    // FIX: Map 'bot' role to 'model' for Gemini compatibility.
    const contents = [
        ...history.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
    ];

    const personalityInstructions = {
        'Empathetic & Encouraging': 'Your tone should be encouraging and supportive.',
        'Direct & Data-Driven': 'You should be direct, concise, and focus on factual, data-driven information.',
        'Calm & Reassuring': 'Your goal is to provide information in a soothing, non-alarming, and reassuring way.',
        'Energetic & Motivational': 'You should use positive and energetic language to inspire and motivate the user.'
    };

    const baseInstruction = 'You are an AI Health Companion, not a doctor. Always advise users to consult a healthcare professional for medical advice or diagnosis. For non-medical questions, answer them naturally.';
    const personalityInstruction = personalityInstructions[settings.personality];
    const systemInstruction = `You are a helpful and versatile AI Health Companion named ${settings.name}. ${personalityInstruction} ${baseInstruction} You can provide safe, general health information, answer questions about drug costs, suggest types of doctors for specific conditions, and even answer general knowledge questions like the current time, date, or weather in a specific city. Be confident and human-like in your responses.`;


    try {
        // FIX: Replaced fetch to OpenAI with Gemini's generateContent for chat.
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

export async function getImageAnalysis(prompt: string, base64Image: string, mimeType: string): Promise<string> {
    const textPart = {
        text: `Analyze this medical image with the following context: "${prompt}". IMPORTANT: You are an AI assistant providing preliminary observations. You are NOT a medical professional. Start your response with a clear disclaimer: "Disclaimer: This is an AI-powered analysis and not a medical diagnosis. Please consult a qualified healthcare professional." Then, explain the visual indicators that might lead to a classification and provide general, safe advice or information related to the potential finding.`
    };
    const imagePart = {
        inlineData: {
            mimeType: mimeType,
            data: base64Image,
        },
    };

    try {
        // FIX: Replaced fetch to OpenAI with Gemini's generateContent for multimodal input.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [textPart, imagePart] }],
            config: {
                maxOutputTokens: 500,
                thinkingConfig: { thinkingBudget: 100 },
            }
        });
        return response.text;
    } catch (error) {
        console.error("Failed to fetch image analysis from Gemini:", error);
        throw new Error('Failed to fetch image analysis');
    }
}

export async function getTrendingDiseases(country: string, city: string): Promise<TrendingDisease[]> {
    const prompt = `
        Based on the location (${city}, ${country}) and the current time of year, list three common communicable diseases that might be trending.
        For each, provide a realistic but simulated number of monthly cases for the city, and one concise, actionable preventative tip.
        Provide your response as a JSON object that adheres to the provided schema.
    `;
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
                        properties: {
                            name: { type: Type.STRING },
                            cases: { type: Type.INTEGER },
                            prevention: { type: Type.STRING },
                        },
                        required: ["name", "cases", "prevention"],
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Failed to fetch trending diseases from Gemini:", error);
        // Return a fallback static list on error
        return [
            { name: "Seasonal Influenza", cases: 1500, prevention: "Get an annual flu shot and wash hands frequently." },
            { name: "Common Cold", cases: 3200, prevention: "Avoid touching your face and maintain distance from sick individuals." },
            { name: "COVID-19", cases: 450, prevention: "Stay up-to-date with vaccinations and wear a mask in crowded indoor spaces." },
        ];
    }
}

export async function getGlobalTrendingDiseases(countryName: string): Promise<GlobalDiseaseStat[]> {
    const prompt = `
        List three globally trending communicable diseases for the current month.
        For each disease, provide a realistic but simulated number of total global monthly cases.
        Also, provide a plausible, simulated number of monthly cases for just ${countryName}.
        The country cases should be a small, realistic fraction of the global cases.
        Provide your response as a JSON object that adheres to the provided schema.
    `;
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
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Failed to fetch global disease stats from Gemini:", error);
        return [
            { name: "Influenza", globalCases: 12000000, countryCases: 150000 },
            { name: "RSV", globalCases: 8500000, countryCases: 95000 },
            { name: "Norovirus", globalCases: 5000000, countryCases: 75000 },
        ];
    }
}


// --- Public Data APIs ---

async function fetchWorldBankData(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch World Bank data');
    const data = await response.json();
    if (!data || data.length < 2 || !data[1] || data[1].length === 0) return null;
    return data[1][0];
}

export async function getCountryData(countryCode: string): Promise<Omit<CommunityData, 'cityPopulation'>> {
    const populationUrl = `${WORLD_BANK_API_URL}/country/${countryCode}/indicator/SP.POP.TOTL?format=json&date=2022`;
    const deathRateUrl = `${WORLD_BANK_API_URL}/country/${countryCode}/indicator/SP.DYN.CDRT.IN?format=json&date=2022`;
    
    const [popData, deathData] = await Promise.all([
        fetchWorldBankData(populationUrl),
        fetchWorldBankData(deathRateUrl)
    ]);

    return {
        countryName: popData?.country?.value || countryCode,
        countryCode: countryCode,
        population: popData?.value || null,
        deathRate: deathData?.value || null,
    };
}


export async function getWorldPopulation(): Promise<WorldPopulation> {
    const url = `${WORLD_BANK_API_URL}/country/WLD/indicator/SP.POP.TOTL?format=json&date=2022`;
    const data = await fetchWorldBankData(url);
    return {
        value: data?.value || null,
    };
}
