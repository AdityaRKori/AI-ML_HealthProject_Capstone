import React from 'react';
import type { ThematicData } from '../types';

interface MaharashtraMapProps {
    onDistrictSelect: (districtName: string) => void;
    selectedDistrict: string | null;
    thematicData: ThematicData | null;
}

// Plausible SVG paths for Maharashtra districts
const DISTRICTS = {
    "Ahmednagar": "M301.1 334.6l-20.9 12.1 -10.4 20.2 3.1 22.3 27.9 11.4 18.6-2.5 13.1-16.1 -6.2-25.1 -14.3-15.6 -10.9-6.7z",
    "Akola": "M281.8 286.2l-21.7 15.6 -2.5 24.8 20.2 21.1 26.1 2.8 9.3-21.7 -8.7-25.1 -22.7-17.5z",
    "Amravati": "M267.4 231.8l-25.1 19.2 -4.9 26.7 22.3 22.3 28.5 2.5 11.1-23.8 -7.5-27.9 -24.4-19z",
    "Aurangabad": "M337.5 301.9l-22.3 14.3 -6.2 23.5 13.7 20.5 25.4 5.6 15.5-19.5 -4.3-24.8 -21.8-19.6z",
    "Beed": "M328.2 355.7l-18.6 11.1 -5.6 21.1 12.4 19.8 23.5 5.6 16.1-18.3 -3.1-22.3 -24.7-17z",
    "Bhandara": "M404.9 261.2l-15.5 9.3 -4.3 15.5 9.3 14.3 16.7 3.1 11.1-14.3 -2.5-16.1 -14.8-11.1z",
    "Buldhana": "M294.9 260.6l-24.8 17.5 -4.3 24.8 21.1 21.1 27.3 3.1 10.5-22.3 -8.1-26.1 -21.7-18.1z",
    "Chandrapur": "M390.5 315.8l-20.2 13.1 -7.5 22.3 11.1 20.5 24.2 6.9 17.4-17.5 -2.5-23.5 -22.5-21.8z",
    "Dhule": "M234.3 250.2l-23.5 16.7 -3.1 22.9 18.6 20.5 25.4 3.1 11.1-21.1 -8.7-24.2 -20.8-17.9z",
    "Gadchiroli": "M422.3 325.2l-19.5 12.4 -8.7 24.2 12.4 21.7 25.4 7.5 18.6-18.6 -2.5-24.8 -25.7-22.4z",
    "Gondia": "M428.8 259.9l-16.1 9.9 -4.9 16.7 10.5 15.5 17.4 3.7 11.7-15 -3.1-17.4 -15.5-12.4z",
    "Hingoli": "M318.9 310.6l-19.5 13.7 -3.7 22.9 15.5 19.2 24.8 4.3 12.4-20.5 -5.6-23.5 -24.4-16.1z",
    "Jalgaon": "M263.6 248.4l-24.2 17.4 -3.7 24.2 19.8 21.1 26.7 3.7 11.1-21.7 -8.1-25.4 -21.6-18.7z",
    "Jalna": "M322.9 285.5l-21.1 14.3 -4.9 23.5 16.7 20.5 25.4 4.9 13.7-21.1 -6.2-24.8 -23.5-17.3z",
    "Kolhapur": "M228.0 410.1l-15.5 9.9 -1.2 14.3 11.1 13.1 16.7 1.2 9.9-13.1 -2.5-14.3 -18.5-11.1z",
    "Latur": "M319.5 385.5l-16.1 9.9 -3.1 16.7 11.1 16.1 19.8 3.1 11.7-16.1 -3.7-17.4 -19.6-12.3z",
    "Mumbai City": "M165.7 348.4l-3.1 4.3 -4.3 0.6 -2.5-4.3 0.6-4.3 3.7-2.5 3.7 0.6 2.5 4.3 0-1.2z",
    "Mumbai Suburban": "M171.3 344.1l-4.3 -0.6 -3.7 2.5 -0.6 4.3 2.5 4.3 4.3 -0.6 3.1 -4.3 0.6 -4.3 -2 -1.8z",
    "Nagpur": "M358.8 256.5l-23.5 16.1 -4.9 24.8 21.1 21.7 28.5 4.3 11.7-22.9 -7.5-26.1 -25.4-18.9z",
    "Nanded": "M341.3 331.5l-19.5 13.1 -4.9 22.3 14.3 20.5 25.4 5.6 14.3-19.8 -4.9-24.2 -25-17.5z",
    "Nandurbar": "M216.2 221.7l-22.9 15.5 -2.5 21.7 17.4 19.2 24.2 2.5 9.9-19.8 -9.3-22.3 -17.2-16.8z",
    "Nashik": "M224.7 291.8l-21.7 15 -4.3 22.9 19.2 21.1 26.1 4.3 11.7-21.1 -8.1-24.8 -22.9-17.4z",
    "Osmanabad": "M302.3 379.3l-16.7 10.5 -3.7 17.4 11.7 16.7 20.5 3.7 12.4-16.7 -4.3-18.6 -20.4-13z",
    "Palghar": "M189.6 317.0l-15.5 10.5 -2.5 15.5 12.4 14.3 18.6 1.2 9.3-14.3 -3.1-15.5 -19.2-11.7z",
    "Parbhani": "M318.3 333.4l-19.2 12.4 -4.3 21.1 14.3 18.6 24.2 4.3 13.1-19.8 -4.9-22.3 -23.2-16.7z",
    "Pune": "M246.6 364.7l-19.8 13.1 -6.2 21.7 15.5 20.5 26.1 6.2 16.1-19.2 -4.3-23.5 -27.4-19.8z",
    "Raigad": "M205.5 363.5l-16.1 10.5 -3.7 16.1 13.1 15.5 19.8 2.5 10.5-15.5 -3.7-16.7 -20-12.4z",
    "Ratnagiri": "M205.5 401.3l-14.3 9.3 -1.8 13.1 9.9 12.4 15.5 1.2 9.3-12.4 -2.5-13.1 -16.1-9.9z",
    "Sangli": "M247.2 399.5l-17.4 11.1 -3.1 16.1 12.4 15.5 19.8 3.7 11.1-15.5 -3.7-17.4 -22.1-13.5z",
    "Satara": "M231.7 386.1l-18.6 11.7 -4.3 18.6 13.7 17.4 22.9 4.9 13.7-17.4 -4.3-19.8 -23.1-15.4z",
    "Sindhudurg": "M211.7 428.0l-13.7 8.7 -0.6 12.4 9.3 11.7 14.3 0.6 8.7-11.7 -1.8-12.4 -16.2-9.3z",
    "Solapur": "M278.0 384.8l-18.6 11.7 -5.6 19.8 14.3 19.2 24.8 5.6 15.5-18.6 -4.3-21.1 -26.1-16.6z",
    "Thane": "M202.4 340.5l-17.4 11.1 -3.7 16.7 13.7 16.1 20.5 3.1 11.1-16.1 -4.3-17.4 -20-13.5z",
    "Wardha": "M328.8 281.8l-22.3 15 -4.9 22.9 19.8 21.1 27.3 3.7 11.7-21.7 -7.5-25.4 -24.1-15.6z",
    "Washim": "M299.7 299.8l-20.5 13.7 -3.7 21.7 16.7 19.2 25.4 3.7 11.7-20.5 -6.2-22.9 -23.4-15.1z",
    "Yavatmal": "M337.5 301.9l-21.7 14.3 -6.2 22.9 16.1 21.1 26.1 4.9 14.3-20.5 -5.6-24.2 -23-18.5z"
};

const DISTRICT_LABELS = {
    "Nandurbar": { x: 210, y: 235 }, "Dhule": { x: 235, y: 265 }, "Jalgaon": { x: 265, y: 265 }, "Buldhana": { x: 290, y: 280 },
    "Akola": { x: 280, y: 305 }, "Washim": { x: 298, y: 318 }, "Amravati": { x: 265, y: 250 }, "Wardha": { x: 328, y: 300 },
    "Nagpur": { x: 355, y: 275 }, "Bhandara": { x: 400, y: 275 }, "Gondia": { x: 425, y: 275 }, "Gadchiroli": { x: 420, y: 345 },
    "Chandrapur": { x: 390, y: 335 }, "Yavatmal": { x: 335, y: 320 }, "Hingoli": { x: 318, y: 328 }, "Nanded": { x: 340, y: 350 },
    "Parbhani": { x: 315, y: 348 }, "Jalna": { x: 320, y: 300 }, "Aurangabad": { x: 335, y: 320 }, "Nashik": { x: 220, y: 310 },
    "Palghar": { x: 190, y: 330 }, "Thane": { x: 200, y: 355 }, "Mumbai Suburban": { x: 170, y: 340 }, "Mumbai City": { x: 162, y: 350 },
    "Raigad": { x: 205, y: 380 }, "Pune": { x: 245, y: 380 }, "Ahmednagar": { x: 300, y: 350 }, "Beed": { x: 325, y: 370 },
    "Latur": { x: 318, y: 395 }, "Osmanabad": { x: 300, y: 395 }, "Solapur": { x: 275, y: 400 }, "Satara": { x: 230, y: 400 },
    "Sangli": { x: 245, y: 415 }, "Ratnagiri": { x: 205, y: 415 }, "Kolhapur": { x: 225, y: 425 }, "Sindhudurg": { x: 210, y: 440 }
};

const MaharashtraMap: React.FC<MaharashtraMapProps> = ({ onDistrictSelect, selectedDistrict, thematicData }) => {
    
    const getColorForValue = (value: number, min: number, max: number) => {
        if (max === min) return '#10B981';
        const percentage = (value - min) / (max - min);
        const r = Math.round(percentage > 0.5 ? 255 : 255 * (percentage * 2));
        const g = Math.round(percentage < 0.5 ? 255 : 255 * (1 - (percentage - 0.5) * 2));
        return `rgb(${r}, ${g}, 0)`;
    };

    const minMax = thematicData ? {
        min: Math.min(...Object.values(thematicData).map(d => d.value)),
        max: Math.max(...Object.values(thematicData).map(d => d.value))
    } : null;

    return (
        <svg viewBox="150 210 300 250" className="w-full h-full stroke-secondary dark:stroke-primary stroke-[0.5px]">
            <g>
                {Object.entries(DISTRICTS).map(([id, d]) => {
                    const data = thematicData ? thematicData[id] : null;
                    const color = data && minMax ? getColorForValue(data.value, minMax.min, minMax.max) : 'var(--color-accent)';
                    return (
                        <path
                            key={id}
                            d={d}
                            fill={color}
                            className={`cursor-pointer transition-all duration-300 ${selectedDistrict === id ? 'stroke-highlight stroke-[2.5px] opacity-100' : 'hover:opacity-80'}`}
                            onClick={() => onDistrictSelect(id)}
                        >
                            <title>{id}{data ? `: ${data.label}` : ''}</title>
                        </path>
                    );
                })}
            </g>
             <g className="pointer-events-none">
                {Object.entries(DISTRICT_LABELS).map(([id, { x, y }]) => (
                    <text key={id} x={x} y={y} className="text-[5px] fill-text-primary font-semibold" textAnchor="middle" dominantBaseline="middle" style={{ paintOrder: 'stroke', stroke: 'var(--color-primary)', strokeWidth: '0.5px', strokeLinecap: 'butt', strokeLinejoin: 'miter' }}>{id}</text>
                ))}
            </g>
        </svg>
    );
};

export default MaharashtraMap;
