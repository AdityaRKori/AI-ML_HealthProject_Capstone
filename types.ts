
export interface UserProfile {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    country: string;
    city: string;
    healthHistory: HealthRecord[];
}

export interface Vitals {
    systolicBP: number;
    diastolicBP: number;
    bloodGlucose: number;
    cholesterol: number;
    height: number; // in cm
    weight: number; // in kg
}

export interface HealthRecord {
    id: string;
    date: string;
    vitals: Vitals;
    bmi: number;
    riskAnalysis: RiskAnalysis;
}

export interface RiskPrediction {
    disease: string;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
    score: number;
    factors: string[];
}

export interface RiskAnalysis {
    predictions: RiskPrediction[];
    recommendations: string;
}

export interface CommunityData {
    countryName: string;
    countryCode: string;
    population: number | null;
    cityPopulation: number | null;
    deathRate: number | null;
}

export interface WorldPopulation {
    value: number | null;
}

export interface CoachSettings {
    name: string;
    personality: 'Empathetic & Encouraging' | 'Direct & Data-Driven' | 'Calm & Reassuring' | 'Energetic & Motivational';
}

export interface TrendingDisease {
    name: string;
    cases: number;
    prevention: string;
}

export interface GlobalDiseaseStat {
    name: string;
    globalCases: number;
    countryCases: number;
}

export interface ChestXRayAnalysis {
    predictions: {
        name: 'Normal' | 'Bacterial Pneumonia' | 'Tuberculosis' | 'COVID-19';
        probability: number;
    }[];
    explanation: string;
}

export interface SkinLesionAnalysis {
    prediction: 'Acne' | 'Mosquito Bite' | 'Eczema' | 'Normal Skin';
    confidence: number;
    explanation: string;
}