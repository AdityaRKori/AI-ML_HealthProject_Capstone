export interface GeneticMarker {
    id: string;
    name: string;
    description: string;
    userHas: boolean;
}

export interface UserProfile {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    country: string;
    city: string;
    healthHistory: HealthRecord[];
    allergies: string[];
    geneticMarkers: GeneticMarker[];
    healthNotes?: string[];
    dashboardBackgroundUrl?: string;
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
    timeOfDay: 'morning' | 'afternoon' | 'evening';
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

export interface CommunityStats {
    worldPopulation: number;
    countryPopulation: number;
    cityPopulation: number;
}

export interface AQIPredictionPoint {
    hour: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
}

export interface RegionalHealthData {
    disclaimer: string;
    weather: string;
    airQuality: string;
    aqiValue: number;
    pollutants: { name: string; level: string; value: string; }[];
    diseaseTrends: { name: string; cases: number; alertLevel: 'low' | 'medium' | 'high' }[];
    analysis: string;
    historicalAQI: {
        month: { high: number; low: number; };
        year: { high: number; low: number; };
    };
    predictedAQI: AQIPredictionPoint[];
    allTimeHigh?: { value: number; year: number };
    allTimeLow?: { value: number; year: number };
}


export interface ThematicData {
    [district: string]: {
        value: number;
        label: string;
    };
}


export interface ChestXRayAnalysis {
    predictions: {
        name: 'Normal' | 'Bacterial Pneumonia' | 'Viral Pneumonia' | 'Tuberculosis' | 'COVID-19' | 'Lung Opacity';
        probability: number;
    }[];
    explanation: string;
}

export interface SkinLesionAnalysis {
    prediction: 'Benign Keratosis' | 'Melanoma' | 'Basal Cell Carcinoma' | 'Acne' | 'Eczema' | 'Normal Skin';
    confidence: number;
    explanation: string;
}

export interface DiseaseFactSheet {
    cause: string;
    prevention: string;
    historicalContext: string;
    statistics: string;
}

export interface RegionalTopicData {
    disclaimer: string;
    title: string;
    analysis: string;
    keyStats: { label: string; value: string }[];
}

export type ImageType = 'chest-x-ray' | 'skin-lesion';

export interface BluetoothDeviceState {
    name: string;
    batteryLevel: number;
    connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export interface AITrendAnalysis {
    overallAssessment: string;
    positiveTrends: string[];
    areasForImprovement: string[];
    dynamicRecommendations: string[];
}

export interface GlobalTrendingStats {
    trendingDiseaseName: string;
    highestCases: { country: string; value: number; };
    lowestCases: { country: string; value: number; };
    highestDeaths: { country: string; value: number; };
    lowestDeaths: { country: string; value: number; };
    highestCures: { country: string; value: number; };
    userCountryStats: { cases: number; deaths: number; cures: number; };
    userCityStats: { cases: number; };
}

export interface CityLiveFeedEvent {
    id: string;
    time: string;
    disease: string;
    area: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
}

export interface SearchedDiseaseStats {
    diseaseName: string;
    totalGlobalCases: number;
    countryBreakdown: {
        country: string;
        cases: number;
        deaths: number;
        cures: number;
    }[];
    recognizedDrugs: string[];
    symptoms: string[];
    whoGuidelines: {
        prevention: string[];
        treatment: string[];
    };
}

export interface LiveDiseaseCase {
    id: string;
    disease: string;
    country: string;
    lat: number;
    lon: number;
    cases: number;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
}

export interface HealthNewsArticle {
    title: string;
    summary: string;
    source: string;
    url: string;
    publishedAt: string;
    imageUrl?: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
}