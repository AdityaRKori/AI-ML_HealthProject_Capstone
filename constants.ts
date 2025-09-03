
import React from 'react';

export const COUNTRIES = [
    { code: 'IN', name: 'India', cities: ['Bangalore', 'Delhi', 'Mumbai', 'Chennai'] },
    { code: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago'] },
    { code: 'CN', name: 'China', cities: ['Beijing', 'Shanghai', 'Shenzhen'] },
    { code: 'ID', name: 'Indonesia', cities: ['Jakarta', 'Surabaya'] },
    { code: 'PK', name: 'Pakistan', cities: ['Karachi', 'Lahore'] },
    { code: 'BR', name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro'] },
    { code: 'NG', name: 'Nigeria', cities: ['Lagos', 'Kano'] },
    { code: 'BD', name: 'Bangladesh', cities: ['Dhaka', 'Chittagong'] },
    { code: 'RU', name: 'Russia', cities: ['Moscow', 'Saint Petersburg'] },
    { code: 'MX', name: 'Mexico', cities: ['Mexico City', 'Guadalajara'] },
];

export const POPULATION_AVERAGES = {
    systolicBP: 125,
    diastolicBP: 82,
    bloodGlucose: 100,
    cholesterol: 210,
    bmi: 26.5
};

// FIX: Replaced JSX with React.createElement to be compatible with .ts files.
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