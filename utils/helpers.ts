
import type { UserProfile, CoachSettings } from '../types';

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


export function estimateCityPopulation(countryPopulation: number): number {
    if (!countryPopulation) return 0;
    // This is a simplified heuristic. A real app might use more complex logic or a dedicated city API.
    // Let's assume a major city might be between 2% and 8% of the country's population.
    const cityFraction = 0.05; // Using an average of 5%
    const estimatedPop = countryPopulation * cityFraction;
    // Cap at a reasonable maximum for a city and give it a floor
    return Math.max(250000, Math.min(estimatedPop, 20000000));
}
