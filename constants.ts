import React from 'react';
import type { GeneticMarker } from './types';

export const COUNTRIES = [
    { code: 'IN', name: 'India', cities: ['Bangalore', 'Delhi', 'Mumbai', 'Chennai'], emergencyNumber: '112' },
    { code: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago'], emergencyNumber: '911' },
    { code: 'CN', name: 'China', cities: ['Beijing', 'Shanghai', 'Shenzhen'], emergencyNumber: '120' },
    { code: 'ID', name: 'Indonesia', cities: ['Jakarta', 'Surabaya'], emergencyNumber: '112' },
    { code: 'PK', name: 'Pakistan', cities: ['Karachi', 'Lahore'], emergencyNumber: '1122' },
    { code: 'BR', name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro'], emergencyNumber: '192' },
    { code: 'NG', name: 'Nigeria', cities: ['Lagos', 'Kano'], emergencyNumber: '112' },
    { code: 'BD', name: 'Bangladesh', cities: ['Dhaka', 'Chittagong'], emergencyNumber: '999' },
    { code: 'RU', name: 'Russia', cities: ['Moscow', 'Saint Petersburg'], emergencyNumber: '112' },
    { code: 'MX', name: 'Mexico', cities: ['Mexico City', 'Guadalajara'], emergencyNumber: '911' },
];

export const KARNATAKA_DISTRICTS = ["Bagalkot", "Bangalore Rural", "Bangalore Urban", "Belgaum", "Bellary", "Bidar", "Bijapur", "Chamarajanagar", "Chikkaballapur", "Chikmagalur", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Gulbarga", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Ramanagara", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada", "Yadgir"];

export const INDIA_STATES_UTS = ["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];


export const GLOBAL_POPULATION_AVERAGES = {
    systolicBP: 125,
    diastolicBP: 82,
    bloodGlucose: 100,
    cholesterol: 210,
    bmi: 26.5
};

export const NATIONAL_POPULATION_AVERAGES: { [key: string]: typeof GLOBAL_POPULATION_AVERAGES } = {
    'IN': { systolicBP: 128, diastolicBP: 83, bloodGlucose: 105, cholesterol: 200, bmi: 28.0 },
    'US': { systolicBP: 122, diastolicBP: 80, bloodGlucose: 98, cholesterol: 220, bmi: 28.8 },
    'CN': { systolicBP: 130, diastolicBP: 85, bloodGlucose: 110, cholesterol: 190, bmi: 25.5 },
    'DEFAULT': GLOBAL_POPULATION_AVERAGES, // Fallback for other countries
};


export const BLOOD_PRESSURE_CATEGORIES = [
    { name: 'Low', max: 89, color: 'bg-blue-500' },
    { name: 'Normal', max: 119, color: 'bg-success' },
    { name: 'Elevated', max: 129, color: 'bg-yellow-500' },
    { name: 'High (S1)', max: 139, color: 'bg-orange-500' },
    { name: 'High (S2)', max: 179, color: 'bg-danger' },
    { name: 'Hypertensive Crisis', max: Infinity, color: 'bg-red-800' },
];

export const VITAL_RANGES = {
    systolicBP: { normal: 120, borderline: 130, high: 140 },
    diastolicBP: { normal: 80, borderline: 85, high: 90 },
    bloodGlucose: { normal: 100, borderline: 125, high: 126 },
    cholesterol: { normal: 200, borderline: 239, high: 240 },
};

export const VITAL_CHART_RANGES = {
    systolicBP: { min: 90, max: 120 },
    diastolicBP: { min: 60, max: 80 },
    bloodGlucose: { min: 70, max: 100 },
    cholesterol: { min: 125, max: 200 },
    bmi: { min: 18.5, max: 24.9 },
};

export const GENETIC_MARKERS_DATA: Omit<GeneticMarker, 'userHas'>[] = [
    {
        id: 'cyp2c19',
        name: 'CYP2C19 Gene Variant',
        description: 'Affects metabolism of certain drugs, including some blood thinners (like Plix) and antidepressants. Having a variant may require dose adjustments.'
    },
    {
        id: 'brca1',
        name: 'BRCA1 Gene Mutation',
        description: 'Significantly increases the risk of developing breast and ovarian cancer. Early screening and preventative measures are often recommended for carriers.'
    },
    {
        id: 'mthfr',
        name: 'MTHFR Gene Variant',
        description: 'Impacts how the body processes folate (vitamin B9). Certain variants can be linked to elevated homocysteine levels, a risk factor for heart disease.'
    },
    {
        id: 'fvl',
        name: 'Factor V Leiden',
        description: 'A common genetic mutation that increases the risk of developing abnormal blood clots (thrombophilia), particularly in the legs or lungs.'
    }
];

export const DEFAULT_DASHBOARD_BG_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMTAyLDEyNiwyMzQpO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxMTgsNzUsMTYyKTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2dyYWQxKSIgLz4KPC9zdmc+Cg==';

// FIX: Converted JSX to React.createElement calls to be valid in a .ts file and resolve parsing errors.
export const ICONS: { [key: string]: React.ReactElement } = {
    logo: React.createElement('svg', { viewBox: "0 0 24 24", fill: "currentColor", className: "w-full h-full" },
        React.createElement('path', { d: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" }),
        React.createElement('path', { d: "M3.5 12h5l2-4 3 6 2.5-3.5h4", stroke: "var(--color-secondary)", strokeWidth: "1.5", fill: "none" })
    ),
    dashboard: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-full h-full" },
        React.createElement('rect', { x: "3", y: "3", width: "7", height: "7" }),
        React.createElement('rect', { x: "14", y: "3", width: "7", height: "7" }),
        React.createElement('rect', { x: "14", y: "14", width: "7", height: "7" }),
        React.createElement('rect', { x: "3", y: "14", width: "7", height: "7" })
    ),
    imageAnalysis: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-full h-full" },
        React.createElement('circle', { cx: "11", cy: "11", r: "8" }),
        React.createElement('line', { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
        React.createElement('rect', { x: "4", y: "4", width: "6", height: "6", strokeWidth: "1.5" })
    ),
    community: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-full h-full" },
        React.createElement('path', { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
        React.createElement('circle', { cx: "9", cy: "7", r: "4" }),
        React.createElement('path', { d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
        React.createElement('path', { d: "M16 3.13a4 4 0 0 1 0 7.75" })
    ),
    globalStats: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-full h-full" },
        React.createElement('circle', { cx: "12", cy: "12", r: "10" }),
        React.createElement('line', { x1: "2", y1: "12", x2: "22", y2: "12" }),
        React.createElement('path', { d: "M12 2a15.3 15.3 0 0 1 4 18 15.3 15.3 0 0 1-8 0 15.3 15.3 0 0 1 4-18z" })
    ),
    progress: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-full h-full" },
        React.createElement('polyline', { points: "23 6 13.5 15.5 8.5 10.5 1 18" }),
        React.createElement('polyline', { points: "17 6 23 6 23 12" })
    ),
    chat: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-full h-full" },
        React.createElement('path', { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
    ),
    methodology: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-full h-full" },
        React.createElement('path', { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }),
        React.createElement('path', { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })
    ),
    report: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-full h-full" },
        React.createElement('path', { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
        React.createElement('polyline', { points: "14 2 14 8 20 8" }),
        React.createElement('line', { x1: "16", y1: "13", x2: "8", y2: "13" }),
        React.createElement('line', { x1: "16", y1: "17", x2: "8", y2: "17" }),
        React.createElement('polyline', { points: "10 9 9 9 8 9" })
    ),
    warning: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-full h-full" },
        React.createElement('path', { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }),
        React.createElement('line', { x1: "12", y1: "9", x2: "12", y2: "13" }),
        React.createElement('line', { x1: "12", y1: "17", x2: "12.01", y2: "17" })
    ),
    chevronDown: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-4 h-4" },
        React.createElement('polyline', { points: "6 9 12 15 18 9" })
    ),
    world: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-10 h-10" },
        React.createElement('circle', { cx: "12", cy: "12", r: "10" }),
        React.createElement('line', { x1: "2", y1: "12", x2: "22", y2: "12" }),
        React.createElement('path', { d: "M12 2a15.3 15.3 0 0 1 4 18 15.3 15.3 0 0 1-8 0 15.3 15.3 0 0 1 4-18z" })
    ),
    flag: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-10 h-10" },
        React.createElement('path', { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" }),
        React.createElement('line', { x1: "4", y1: "22", x2: "4", y2: "15" })
    ),
    settings: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-5 h-5" },
        React.createElement('circle', { cx: "12", cy: "12", r: "3" }),
        React.createElement('path', { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })
    ),
    bot: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-5 h-5" },
        React.createElement('path', { d: "M12 8V4H8" }),
        React.createElement('rect', { x: "4", y: "12", width: "16", height: "8", rx: "2" }),
        React.createElement('path', { d: "M4 14H2" }),
        React.createElement('path', { d: "M20 14H22" }),
        React.createElement('path', { d: "M15 7h2" }),
        React.createElement('path', { d: "M7 7h2" })
    ),
    stop: React.createElement('svg', { viewBox: "0 0 24 24", fill: "currentColor", className: "w-4 h-4" },
        React.createElement('rect', { x: "6", y: "6", width: "12", height: "12", rx: "2" })
    ),
    speaker: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-4 h-4" },
        React.createElement('polygon', { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
        React.createElement('path', { d: "M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" })
    ),
    user: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-5 h-5" },
        React.createElement('path', { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
        React.createElement('circle', { cx: "12", cy: "7", r: "4" })
    ),
    upload: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-8 h-8" },
        React.createElement('path', { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
        React.createElement('polyline', { points: "17 8 12 3 7 8" }),
        React.createElement('line', { x1: "12", y1: "3", x2: "12", y2: "15" })
    ),
    sun: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-6 h-6" },
        React.createElement('circle', { cx: "12", cy: "12", r: "5" }),
        React.createElement('line', { x1: "12", y1: "1", x2: "12", y2: "3" }),
        React.createElement('line', { x1: "12", y1: "21", x2: "12", y2: "23" }),
        React.createElement('line', { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }),
        React.createElement('line', { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }),
        React.createElement('line', { x1: "1", y1: "12", x2: "3", y2: "12" }),
        React.createElement('line', { x1: "21", y1: "12", x2: "23", y2: "12" }),
        React.createElement('line', { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }),
        React.createElement('line', { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })
    ),
    moon: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-6 h-6" },
        React.createElement('path', { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" })
    ),
    connected: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-4 h-4" },
        React.createElement('path', { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
        React.createElement('circle', { cx: "12", cy: "12", r: "3" })
    ),
    battery: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-5 h-5" },
        React.createElement('rect', { x: "1", y: "6", width: "18", height: "12", rx: "2", ry: "2" }),
        React.createElement('line', { x1: "23", y1: "13", x2: "23", y2: "11" })
    ),
    microphone: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-5 h-5" },
        React.createElement('path', { d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" }),
        React.createElement('path', { d: "M19 10v2a7 7 0 0 1-14 0v-2" }),
        React.createElement('line', { x1: "12", y1: "19", x2: "12", y2: "23" }),
        React.createElement('line', { x1: "8", y1: "23", x2: "16", y2: "23" })
    ),
    send: React.createElement('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-5 h-5" },
        React.createElement('line', { x1: "22", y1: "2", x2: "11", y2: "13" }),
        React.createElement('polygon', { points: "22 2 15 22 11 13 2 9 22 2" })
    ),
};