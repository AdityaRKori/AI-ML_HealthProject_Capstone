
import type { Vitals, UserProfile, RiskPrediction, ChestXRayAnalysis, SkinLesionAnalysis } from '../types';
import { calculateBMI } from '../utils/helpers';

// This file simulates ML model predictions using rule-based logic.
// In a real-world application, these predictions would come from a secure backend service
// hosting actual trained models (e.g., RandomForest, XGBoost, CNNs).

export function predictHealthRisks(vitals: Vitals, profile: UserProfile): RiskPrediction[] {
    const predictions: RiskPrediction[] = [];
    const bmi = calculateBMI(vitals.height, vitals.weight);

    predictions.push(predictDiabetes(vitals, profile, bmi));
    predictions.push(predictCardioDisease(vitals, profile, bmi));
    predictions.push(predictHypertension(vitals, profile, bmi));

    return predictions;
}

function predictDiabetes(vitals: Vitals, profile: UserProfile, bmi: number): RiskPrediction {
    let score = 0;
    const factors: string[] = [];

    if (vitals.bloodGlucose > 125) {
        score += 0.5;
        factors.push("High fasting blood glucose level.");
    } else if (vitals.bloodGlucose > 100) {
        score += 0.25;
        factors.push("Elevated fasting blood glucose (pre-diabetic range).");
    }

    if (bmi > 30) {
        score += 0.3;
        factors.push("Obesity (BMI > 30).");
    } else if (bmi > 25) {
        score += 0.15;
        factors.push("Overweight (BMI > 25).");
    }
    
    if (vitals.weight > 300) {
        score += 0.2; // Add significant risk for morbid obesity
        factors.push("Extremely high body weight is a critical risk factor.");
    }

    if (profile.age > 45) {
        score += 0.15;
        factors.push("Age over 45.");
    }

    return {
        disease: 'Type 2 Diabetes',
        riskLevel: getRiskLevel(score),
        score: Math.min(score, 1),
        factors,
    };
}

function predictCardioDisease(vitals: Vitals, profile: UserProfile, bmi: number): RiskPrediction {
    let score = 0;
    const factors: string[] = [];

    if (vitals.cholesterol > 240) {
        score += 0.4;
        factors.push("High total cholesterol.");
    } else if (vitals.cholesterol > 200) {
        score += 0.2;
        factors.push("Borderline high cholesterol.");
    }
    
    if (vitals.systolicBP > 140 || vitals.diastolicBP > 90) {
        score += 0.3;
        factors.push("High blood pressure.");
    }

    if (bmi > 30) score += 0.15;
    if (profile.age > 50) score += 0.15;
    if (bmi > 30 || profile.age > 50) factors.push("BMI and/or age are contributing factors.");

    return {
        disease: 'Cardiovascular Disease',
        riskLevel: getRiskLevel(score),
        score: Math.min(score, 1),
        factors,
    };
}

function predictHypertension(vitals: Vitals, profile: UserProfile, bmi: number): RiskPrediction {
    let score = 0;
    const factors: string[] = [];
    
    const { systolicBP, diastolicBP } = vitals;

    if (systolicBP >= 180 || diastolicBP >= 120) {
        score = 0.95;
        factors.push("Hypertensive Crisis - consult a doctor immediately.");
    } else if (systolicBP >= 140 || diastolicBP >= 90) {
        score = 0.75;
        factors.push("Stage 2 Hypertension.");
    } else if (systolicBP >= 130 || diastolicBP >= 80) {
        score = 0.5;
        factors.push("Stage 1 Hypertension.");
    } else if (systolicBP >= 120) {
        score = 0.25;
        factors.push("Elevated blood pressure.");
    }

    if (profile.age > 60) score = Math.min(score + 0.1, 1);
    if(score > 0.1 && profile.age > 60) factors.push("Age is a contributing factor.");
    
    if (bmi > 30) {
        score = Math.min(score + 0.15, 1);
        factors.push("Obesity is a major contributing factor.");
    }


    return {
        disease: 'Hypertension',
        riskLevel: getRiskLevel(score),
        score: Math.min(score, 1),
        factors,
    };
}

function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Very High' {
    if (score >= 0.75) return 'Very High';
    if (score >= 0.5) return 'High';
    if (score >= 0.25) return 'Medium';
    return 'Low';
}

// --- Image Analysis Simulations ---

export async function analyzeChestXRay(image: File): Promise<Omit<ChestXRayAnalysis, 'explanation'>> {
    await new Promise(res => setTimeout(res, 1500));

    const categories: ChestXRayAnalysis['predictions'][0]['name'][] = ['Normal', 'Bacterial Pneumonia', 'Viral Pneumonia', 'Tuberculosis', 'COVID-19', 'Lung Opacity'];
    let probabilities = categories.map(() => Math.random());
    const sum = probabilities.reduce((a, b) => a + b, 0);
    probabilities = probabilities.map(p => p / sum);

    const predictions = categories.map((name, index) => ({
        name,
        probability: probabilities[index],
    })).sort((a, b) => b.probability - a.probability);

    return { predictions };
}

export async function analyzeSkinLesion(image: File): Promise<Omit<SkinLesionAnalysis, 'explanation'>> {
    await new Promise(res => setTimeout(res, 1500));
    
    const categories: SkinLesionAnalysis['prediction'][] = ['Benign Keratosis', 'Melanoma', 'Basal Cell Carcinoma', 'Acne', 'Eczema', 'Normal Skin'];
    const prediction = categories[Math.floor(Math.random() * categories.length)];
    const confidence = Math.random() * (0.98 - 0.75) + 0.75;

    return { prediction, confidence };
}