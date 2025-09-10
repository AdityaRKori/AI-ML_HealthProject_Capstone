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

// In a typical setup, this file would be renamed to constants.tsx to allow JSX syntax.
export const ICONS: { [key: string]: React.ReactElement } = {
    logo: React.createElement("svg", { viewBox: "0 0 64 64", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, 
        React.createElement("circle", { cx: "32", cy: "32", r: "28", stroke: "currentColor", strokeWidth: "4" }),
        React.createElement("path", { d: "M32 12C32 12 40 24 40 32C40 40 32 52 32 52", stroke: "currentColor", strokeWidth: "4", strokeLinecap: "round" }),
        React.createElement("path", { d: "M32 12C32 12 24 24 24 32C24 40 32 52 32 52", stroke: "currentColor", strokeWidth: "4", strokeLinecap: "round" }),
        React.createElement("circle", { cx: "32", cy: "32", r: "4", fill: "currentColor" })
    ),
    dashboard: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6M4 6h16M4 10h16M4 14h16M4 18h16" })),
    community: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" })),
    progress: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" })),
    chat: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" })),
    methodology: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" })),
    send: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z", clipRule: "evenodd" })),
    upload: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" })),
    user: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" })),
    bot: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V5c7 0 7 3 7 4s0 4-7 4-7-1-7-4 0-4 7-4zm0 14c-3.333 0-5-1.333-5-4s1.667-4 5-4 5 1.333 5 4-1.667 4-5 4z" })),
    settings: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }), React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })),
    imageAnalysis: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10L3 3" })),
    warning: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" })),
    chevronDown: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement("path", { fillRule: "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", clipRule: "evenodd" })),
    sun: React.createElement("svg", { xmlns:"http://www.w3.org/2000/svg", className:"h-6 w-6", fill:"none", viewBox:"0 0 24 24", stroke:"currentColor" }, React.createElement("path", { strokeLinecap:"round", strokeLinejoin:"round", strokeWidth:2, d:"M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" })),
    moon: React.createElement("svg", { xmlns:"http://www.w3.org/2000/svg", className:"h-6 w-6", fill:"none", viewBox:"0 0 24 24", stroke:"currentColor" }, React.createElement("path", { strokeLinecap:"round", strokeLinejoin:"round", strokeWidth:2, d:"M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" })),
    report: React.createElement("svg", { xmlns:"http://www.w3.org/2000/svg", className:"h-6 w-6", fill:"none", viewBox:"0 0 24 24", stroke:"currentColor" }, React.createElement("path", { strokeLinecap:"round", strokeLinejoin:"round", strokeWidth:2, d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" })),
    world: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.707-.707a2 2 0 012.828 0l.707.707M15.293 4.293l.707.707a2 2 0 002.828 0l.707-.707M4 11a9 9 0 1016 0H4z" })),
    flag: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" })),
    microphone: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement("path", { fillRule: "evenodd", d: "M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 10.5a.5.5 0 01.5.5v.5a.5.5 0 01-1 0V15a.5.5 0 01.5-.5zM8 15a.5.5 0 00-1 0v.5a.5.5 0 001 0V15zM10 18a5 5 0 005-5h-1a4 4 0 01-8 0H5a5 5 0 005 5z", clipRule: "evenodd" })),
    speaker: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement("path", { d: "M10 3.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V4A.75.75 0 0110 3.25zM4.75 5.5a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM14.75 5.5a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM5.5 8a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 015.5 8zm9.5 0a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zM8 10.5a.75.75 0 000 1.5h.5a.75.75 0 000-1.5H8zm3.5 0a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z" })),
    stop: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z", clipRule: "evenodd" })),
    globalStats: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m0 0a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9V3m0 9v9m6-15l-3 6 3 6" })),
    news: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2zM9 12h6m-6 4h6m2-12H7" })),
};

export const DISEASE_INFO = {
    'Type 2 Diabetes': {
        description: 'A chronic condition that affects how your body metabolizes sugar (glucose), your body\'s main source of fuel. Your body either resists the effects of insulin — a hormone that regulates the movement of sugar into your cells — or doesn\'t produce enough insulin to maintain normal glucose levels.',
        prevention: [
            'Maintain a healthy weight through a balanced diet and regular exercise.',
            'Eat a diet rich in whole grains, fruits, and vegetables.',
            'Limit intake of sugary drinks and processed foods.',
            'Get at least 150 minutes of moderate aerobic exercise per week.'
        ],
    },
    'Cardiovascular Disease': {
        description: 'Refers to a range of conditions affecting the heart and blood vessels. It is usually associated with a build-up of fatty deposits inside the arteries (atherosclerosis) and an increased risk of blood clots.',
        prevention: [
            'Maintain healthy blood pressure and cholesterol levels.',
            'Do not smoke and avoid secondhand smoke.',
            'Engage in regular physical activity.',
            'Eat a heart-healthy diet low in saturated fats, trans fats, and sodium.'
        ],
    },
    'Hypertension': {
        description: 'Also known as high blood pressure, it is a long-term medical condition in which the blood pressure in the arteries is persistently elevated. It is a major risk factor for coronary artery disease, stroke, and heart failure.',
        prevention: [
            'Reduce salt intake.',
            'Limit alcohol consumption.',
            'Eat a diet rich in fruits, vegetables, and low-fat dairy products.',
            'Regularly monitor your blood pressure.'
        ],
    },
};