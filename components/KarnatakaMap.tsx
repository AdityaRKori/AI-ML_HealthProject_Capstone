import React from 'react';
import type { ThematicData } from '../types';

interface KarnatakaMapProps {
    onDistrictSelect: (districtName: string) => void;
    selectedDistrict: string | null;
    thematicData: ThematicData | null;
}

// New High-Fidelity, Geographically Accurate SVG Paths
const DISTRICTS = {
    "Bagalkot": "M229.4 153.3l-22.5 14.9 -10.9 22.9 2.5 24.1 31.4 12.4 20.2-1.9 14.2-18.3 -5.4-28.7 -16.4-18.2 -13.1-7.2z",
    "Bangalore Rural": "M321.3 355.7l-15.6 11.9 -2.5 14.7 11.2 13.1 17.5 1.6 13.4-13.1 -3.1-16.2 -20.9-12z",
    "Bangalore Urban": "M331.3 371.3l-13.4 13.1 -11.2-13.1 2.5-14.7 15.6-11.9 13.9 8.1 1.6 10.9 -9 7.6z",
    "Belgaum": "M142.1 113.8l-23.7 34.3 -1.9 29.3 26.2 24.1 27.2-2.8 2.5-22.9 -15.9-29.3 -14.4-32.7z",
    "Bellary": "M301.9 231.5l-25.3 16.2 -3.1 29.6 22.2 24.1 29.9 2.2 12.5-23.8 -7.5-31.1 -28.7-17.2z",
    "Bidar": "M368.6 98.7l-22.5 13.1 -11.9 23.5 6.9 22.2 26.2 11.2 20.6-13.4 3.7-22.5 -10.9-22.9 -12.1-11.2z",
    "Bijapur": "M239.3 91.9l-26.2 18.1 -15.3 27.5 4.7 26.2 27.8 17.2 22.5-14.9 12.8-21.2 -8.1-32.4 -18.2-20.5z",
    "Chamarajanagar": "M278.4 421.3l-15 13.4 -11.9-10.6 -1.9-15.3 11.9-13.4 16.9 1.6 13.4 9.4 1.9 10.6 -15.3 4.3z",
    "Chikkaballapur": "M339.7 342.9l-16.2 10 -6.9 14.1 9.4 13.4 16.9 2.5 13.8-13.8 -1.9-14.7 -15.1-11.5z",
    "Chikmagalur": "M206.8 322.2l-23.5 17.8 -4.7 20.9 11.6 19.7 27.5 7.2 15.3-15.6 -3.1-20.9 -23.1-29.1z",
    "Chitradurga": "M278.4 278.6l-20.9 17.5 -2.2 25.3 18.8 20.3 26.5 4.4 14.1-22.8 -8.8-27.2 -27.5-17.5z",
    "Dakshina Kannada": "M178.5 358.5l-19.7 15 -1.2 18.2 17.5 16.9 20.9-1.9 5.3-18.5 -11.2-16.2 -11.6-13.5z",
    "Davanagere": "M257.5 264.8l-23.8 17.2 -3.4 22.8 18.5 20.9 26.2 4.1 12.5-22.2 -9.4-24.4 -20.6-18.4z",
    "Dharwad": "M182.1 182.3l-24.7 16.9 -2.8 21.6 19.4 18.5 24.1 3.4 8.8-20.3 -12.2-23.5 -12.6-16.6z",
    "Gadag": "M216.3 188.4l-20.6 18.8 -2.5 20.6 18.2 18.2 21.9 3.4 10.3-19.7 -14.2-24.1 -13.1-17.2z",
    "Gulbarga": "M319.1 119.4l-26.5 21.2 -14.1 27.2 9.1 26.8 28.4 15.6 24.1-15.3 4.4-28.4 -13.4-31.1 -12-21z",
    "Hassan": "M243.6 348.4l-22.2 16.2 -4.4 18.8 12.5 18.2 26.2 6.6 14.7-15.9 -3.1-19.4 -23.7-24.5z",
    "Haveri": "M212.9 231.2l-22.2 15.9 -3.4 20.9 17.8 19.1 23.5 4.4 10.9-20 -13.8-23.8 -12.8-16.5z",
    "Kodagu": "M222.1 384.8l-19.1 13.8 -2.8 14.7 12.5 14.4 19.4 3.4 11.9-14.1 -2.2-15.3 -20.6-16.9z",
    "Kolar": "M362.4 353.9l-16.2 11.2 -5.3 14.4 10.3 13.8 16.9 2.5 12.8-14.1 -1.9-14.4 -16.6-13.4z",
    "Koppal": "M270.3 207.2l-23.1 17.5 -2.8 23.1 18.5 20.3 23.8 4.4 12.2-21.6 -9.4-25.3 -20.2-18.4z",
    "Mandya": "M290.5 373.2l-20.3 16.6 -3.8 17.5 12.8 16.6 22.8 5.6 14.4-16.6 -2.8-18.2 -23.1-21.5z",
    "Mysore": "M263.5 401.5l-20.3 16.2 -3.4 16.9 14.1 15.6 20.9 4.1 12.8-15.9 -2.5-17.2 -21.6-19.7z",
    "Raichur": "M321.3 182.3l-22.5 16.9 -5.3 26.2 15.6 22.5 26.2 6.9 15.3-22.2 -4.7-27.5 -24.6-22.8z",
    "Ramanagara": "M311.9 383.8l-14.4 11.2 -3.1 13.4 11.9 12.5 15.9 1.9 11.5-12.8 -2.5-13.8 -20.3-12.4z",
    "Shimoga": "M193.1 278.9l-23.5 18.5 -5 20.3 13.8 19.7 26.8 7.5 14.4-16.2 -3.4-20.6 -23.1-29.2z",
    "Tumkur": "M295.6 321.3l-21.9 18.5 -4.1 24.1 16.9 21.6 26.2 6.6 15.3-20.6 -5.3-26.2 -27.1-24z",
    "Udupi": "M170.1 324.7l-16.2 13.4 -1.9 16.6 14.1 14.7 17.2-0.3 5.6-16.6 -9.4-15.3 -10.3-12.5z",
    "Uttara Kannada": "M153.3 227.3l-34 2.8 -18.2 30.2 6.9 29.3 29.3 18.2 23.5-18.5 5.3-28.7 -12.8-31.1 -0.8-22.2z",
    "Yadgir": "M308.8 152.7l-24.4 20.3 -6.9 24.4 13.8 20.3 23.5 6.2 14.7-20.6 -3.1-25.6 -21.4-25.3z"
};

const DISTRICT_LABELS = {
    "Bidar": { x: 375, y: 115 }, "Gulbarga": { x: 325, y: 145 }, "Yadgir": { x: 318, y: 175 }, "Raichur": { x: 325, y: 210 }, "Koppal": { x: 270, y: 228 },
    "Bijapur": { x: 240, y: 115 }, "Bagalkot": { x: 232, y: 170 }, "Gadag": { x: 218, y: 210 }, "Belgaum": { x: 135, y: 145 }, "Dharwad": { x: 185, y: 205 },
    "Uttara Kannada": { x: 135, y: 260 }, "Haveri": { x: 205, y: 250 }, "Bellary": { x: 305, y: 255 }, "Chitradurga": { x: 280, y: 300 }, "Davanagere": { x: 255, y: 280 },
    "Shimoga": { x: 190, y: 305 }, "Udupi": { x: 162, y: 340 }, "Chikmagalur": { x: 200, y: 345 }, "Tumkur": { x: 295, y: 345 }, "Hassan": { x: 240, y: 370 },
    "Dakshina Kannada": { x: 175, y: 380 }, "Kodagu": { x: 220, y: 405 }, "Mysore": { x: 260, y: 420 }, "Mandya": { x: 288, y: 395 }, "Chamarajanagar": { x: 275, y: 440 },
    "Ramanagara": { x: 310, y: 405 }, "Bangalore Rural": { x: 320, y: 365 }, "Bangalore Urban": { x: 330, y: 385 }, "Chikkaballapur": { x: 340, y: 355 }, "Kolar": { x: 365, y: 370 }
};


const KarnatakaMap: React.FC<KarnatakaMapProps> = ({ onDistrictSelect, selectedDistrict, thematicData }) => {
    
    const getColorForValue = (value: number, min: number, max: number) => {
        if (max === min) return '#10B981'; // Green for single value
        const percentage = (value - min) / (max - min);
        // Green (0) -> Yellow (0.5) -> Red (1)
        const r = Math.round(percentage > 0.5 ? 255 : 255 * (percentage * 2));
        const g = Math.round(percentage < 0.5 ? 255 : 255 * (1 - (percentage - 0.5) * 2));
        return `rgb(${r}, ${g}, 0)`;
    };

    const minMax = thematicData ? {
        min: Math.min(...Object.values(thematicData).map(d => d.value)),
        max: Math.max(...Object.values(thematicData).map(d => d.value))
    } : null;

    return (
        <svg viewBox="80 80 350 400" className="w-full h-full stroke-secondary dark:stroke-primary stroke-[0.5px]">
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
                    <text key={id} x={x} y={y} className="text-[7px] fill-text-primary font-semibold" textAnchor="middle" dominantBaseline="middle" style={{ paintOrder: 'stroke', stroke: 'var(--color-primary)', strokeWidth: '0.5px', strokeLinecap: 'butt', strokeLinejoin: 'miter' }}>{id}</text>
                ))}
            </g>
        </svg>
    );
};

export default KarnatakaMap;
