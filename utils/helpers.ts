import type { UserProfile, CoachSettings } from './types';

const USER_PROFILE_KEY = 'oracleHealthUserProfile';
const COACH_SETTINGS_KEY = 'oracleCoachSettings';

export function saveUserProfile(profile: UserProfile): void {
    try {
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.error("Failed to save user profile:", error);
    }
}

export function getUserProfile(): UserProfile | null {
    try {
        const profileJson = localStorage.getItem(USER_PROFILE_KEY);
        return profileJson ? JSON.parse(profileJson) : null;
    } catch (error) {
        console.error("Failed to retrieve user profile:", error);
        return null;
    }
}

export function saveCoachSettings(settings: CoachSettings): void {
    try {
        localStorage.setItem(COACH_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save coach settings:", error);
    }
}

export function getCoachSettings(): CoachSettings | null {
    try {
        const settingsJson = localStorage.getItem(COACH_SETTINGS_KEY);
        return settingsJson ? JSON.parse(settingsJson) : null;
    } catch (error) {
        console.error("Failed to retrieve coach settings:", error);
        return null;
    }
}

export function calculateBMI(heightCm: number, weightKg: number): number {
    if (heightCm <= 0 || weightKg <= 0) {
        return 0;
    }
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number): { category: string; color: string } {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-400' };
    if (bmi >= 18.5 && bmi <= 24.9) return { category: 'Normal weight', color: 'text-success' };
    if (bmi >= 25 && bmi <= 29.9) return { category: 'Overweight', color: 'text-warning' };
    if (bmi > 29.9) return { category: 'Obesity', color: 'text-danger' };
    return { category: 'N/A', color: 'text-light'};
}

export function getIdealWeightRange(heightCm: number, currentWeightKg: number): { idealMin: number, idealMax: number, weightToChange: number } {
    if (heightCm <= 0) return { idealMin: 0, idealMax: 0, weightToChange: 0 };
    const heightM = heightCm / 100;
    const idealMin = 18.5 * (heightM * heightM);
    const idealMax = 24.9 * (heightM * heightM);
    
    let weightToChange = 0;
    if (currentWeightKg > idealMax) {
        // Calculate weight to lose to get to max of normal range
        weightToChange = currentWeightKg - idealMax;
    } else if (currentWeightKg < idealMin) {
        // Calculate weight to gain to get to min of normal range
        weightToChange = currentWeightKg - idealMin; // will be negative
    }

    return { idealMin, idealMax, weightToChange };
}

export function getBase64(file: File): Promise<{ data: string; mimeType: string; }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                const [header, data] = reader.result.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1];
                if (data && mimeType) {
                    resolve({ data, mimeType });
                } else {
                    reject(new Error('Failed to parse data URL'));
                }
            } else {
                reject(new Error('Failed to read file as data URL'));
            }
        };
        reader.onerror = error => reject(error);
    });
}

// Simulates processing various medical image file formats
export async function processMedicalImageFile(file: File): Promise<{ data: string; mimeType: string; previewUrl: string }> {
    const fileType = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (['image/jpeg', 'image/png'].includes(fileType)) {
        const result = await getBase64(file);
        return { ...result, previewUrl: URL.createObjectURL(file) };
    }

    // Simulate processing for PDF and DICOM
    if (fileType === 'application/pdf' || extension === 'dcm') {
        const isDicom = extension === 'dcm';
        // Create a placeholder SVG to represent the processed file
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
                <rect width="100%" height="100%" fill="#2C2C2C" />
                <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="20" fill="#E0E1DD">${isDicom ? 'DICOM' : 'PDF'}</text>
                <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#BDBDBD">Image Processed</text>
            </svg>
        `;
        const base64Svg = btoa(svgContent);
        const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
        
        return {
            data: base64Svg,
            mimeType: 'image/svg+xml',
            previewUrl: dataUrl,
        };
    }

    throw new Error('Unsupported file format');
}


export function estimateCityPopulation(countryPopulation: number): number {
    if (!countryPopulation) return 0;
    // This is a simplified heuristic. A real app might use more complex logic or a dedicated city API.
    // Let's assume a major city might be between 2% and 8% of the country's population.
    const cityFraction = 0.05; // Using an average of 5%
    const estimatedPop = countryPopulation * cityFraction;
    // Cap at a reasonable maximum for a city and give it a floor
    return Math.max(250000, Math.min(estimatedPop, 20000000));
}