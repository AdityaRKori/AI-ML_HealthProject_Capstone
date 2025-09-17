import React from 'react';
import type { ThematicData } from '../types';

interface IndiaMapProps {
    onStateSelect: (stateName: string) => void;
    selectedState: string | null;
    thematicData: ThematicData | null;
}

const STATES = {
    "Jammu and Kashmir": "M328.9,62.3l-13.6,21.6l-10.9,13.2l-10.5,10.9l-19.4,3.2l-13.2-4.8l-12-14.8l-9.3-19.2l-4.4-23.2l12-16.8l16.4-12l20-4.4l15.2,1.2l16.8,8.4l16.4,22.4L328.9,62.3z",
    "Ladakh": "M391.8,75.1l-15.6,20l-12.8,18.8l-21.6,10l-12.8-2.4l-6.8-9.2l-10-24.8l-2.4-14.8l2.8-23.2l13.2-22.8l21.2-12l17.6-2l16,6.4l11.2,16.8L391.8,75.1z",
    "Himachal Pradesh": "M336.1,123.5l-10,13.6l-13.6,10.8l-14.8,2.4l-11.2-8l-4-10.8l-1.2-15.2l12.8-24.8l15.6-3.2l14.4,4.4l10,12.8L336.1,123.5z",
    "Punjab": "M295.7,149.5l-12.4,16.4l-12,12.8l-10.4,2.4l-8.8-8.8l-2.8-12.8l5.2-18.8l10.8-10.4l14-2l12.4,5.2L295.7,149.5z",
    "Uttarakhand": "M368.5,147.1l-10,16.4l-12.8,11.2l-13.2,1.6l-10.4-10.4l-2.8-14.4l6.4-18l12-9.2l14.4-0.8l11.2,6.4L368.5,147.1z",
    "Haryana": "M316.5,173.9l-10.8,14l-12.4,9.6l-12.4,0.4l-9.6-11.2l-1.6-14l8-16.4l12.4-6.4l13.2,0.8l11.2,8L316.5,173.9z",
    "Delhi": "M329.3,185.1l-4.4,4.8l-4.8,0.4l-2.8-4.4l0.4-4.8l4.4-2.8l4.4,0.4l2.4,4L329.3,185.1z",
    "Rajasthan": "M255.4,223.9l-18.8,20.4l-20.8,17.2l-21.6,9.6l-16-6.4l-12.8-15.2l-8-20.8l-2-24.4l12-28.4l20.4-18.8l24-9.2l18.8,4.8l11.2,14.4L255.4,223.9z",
    "Uttar Pradesh": "M417.8,225.5l-17.6,18.8l-20,16l-22.4,9.2l-20.8-2.4l-16.8-12.8l-10.8-20.4l-2-25.2l12.8-26.8l20-16.4l23.2-7.2l19.6,3.2l14,12.8L417.8,225.5z",
    "Bihar": "M481.8,231.9l-14,16.8l-18,14l-20.4,6.4l-18.4-4.8l-14-14.8l-7.6-20l-0.4-24.4l12-22.4l17.6-14.4l20.4-4.8l18,4.8l13.2,14L481.8,231.9z",
    "Sikkim": "M525,195.9l-4.8,7.2l-6.4,1.2l-4-6.4l-0.4-7.2l4.8-4.8l6,0.4l4.4,4.8L525,195.9z",
    "Arunachal Pradesh": "M594.6,183.9l-12,14.8l-16,12.4l-18.8,7.2l-17.6-3.6l-13.6-12.8l-8.4-19.2l-1.2-23.6l11.2-20.8l16.8-13.2l19.6-4l17.2,5.2l12.4,14.4L594.6,183.9z",
    "Nagaland": "M603,222.7l-7.2,8.8l-8.8,1.6l-6.4-8l-1.2-9.6l6.8-8l8-1.2l8,5.6L603,222.7z",
    "Manipur": "M594.6,249.9l-6.8,8.4l-8.4,0.8l-5.6-8.4l-0.4-9.2l6.8-7.2l7.6-0.4l7.2,5.2L594.6,249.9z",
    "Mizoram": "M581,273.5l-6,7.6l-7.6,0.4l-4.8-7.6l-0.4-8.4l6-6.4l6.8-0.4l6.4,4.8L581,273.5z",
    "Tripura": "M564.2,267.1l-5.2,6.8l-6.8,0.4l-4-6.8l-0.4-7.6l5.2-5.6l6-0.4l5.2,4.4L564.2,267.1z",
    "Meghalaya": "M558.6,233.1l-9.2,10.8l-11.2,2.4l-8.4-10l-1.6-12l8.8-10l10-2l10.4,7.2L558.6,233.1z",
    "Assam": "M567.4,213.1l-14.8,16.4l-17.6,12.8l-19.6,4.8l-18-5.6l-13.6-15.6l-7.2-21.2l-0.4-25.2l12.4-21.6l17.2-13.6l20-4.4l18,5.2l12.8,15.2L567.4,213.1z",
    "West Bengal": "M519.8,281.5l-12.8,14.8l-16,12l-18,6l-16.4-5.2l-12.4-14.8l-6.4-20l-0.4-24l11.2-20.8l15.6-13.2l18-4l16.4,5.2l12,14.4L519.8,281.5z",
    "Jharkhand": "M475.4,286.3l-12,14l-15.2,11.2l-17.2,4.8l-15.6-6l-11.6-14.8l-5.6-19.6l-0.4-23.2l10.4-19.6l14.4-12.4l17.2-3.6l15.6,5.6l11.2,14L475.4,286.3z",
    "Odisha": "M465,349.5l-14.8,16.8l-18,13.6l-20.4,6.4l-18.8-5.2l-14.4-15.6l-8-21.6l-0.8-26l12.4-22.8l17.2-14.8l20-4.8l18.4,5.6l13.6,15.2L465,349.5z",
    "Chhattisgarh": "M420.2,331.1l-14.4,16.4l-17.6,12.8l-19.2,5.2l-17.6-6.4l-13.2-16.4l-6.8-22l-0.4-26.4l12-22l16.4-14l19.2-4.4l17.6,6l12.8,16L420.2,331.1z",
    "Madhya Pradesh": "M354.2,289.5l-19.6,20l-22,16.8l-24,8.4l-22-3.2l-18-14.4l-11.2-22l-1.6-27.2l14.4-26.8l21.2-18l24.4-7.6l22,4l17.6,14L354.2,289.5z",
    "Gujarat": "M189.8,283.5l-15.6,18.8l-18.8,16l-20.8,8.4l-18.4-4l-14-14.8l-7.6-20.4l-0.4-24.8l12.8-25.2l18-17.2l21.2-6.8l18.8,4.4l14,14.4L189.8,283.5z",
    "Dadra and Nagar Haveli and Daman and Diu": "M211,357.1l-1.6,2.4l-2.4,0.2l-1.2-2.4l0.2-2.4l2-1.2l2,0.2l1.2,2L211,357.1z",
    "Maharashtra": "M281.8,359.1l-18,20.4l-20.8,17.6l-22.8,9.2l-20.8-2.8l-17.2-14l-10.4-21.2l-1.2-26.4l13.6-26l19.6-17.6l23.2-7.2l21.2,3.6l16.8,13.6L281.8,359.1z",
    "Telangana": "M349.4,385.9l-12.8,14.8l-16,11.6l-18,4.8l-16.4-6l-12-15.2l-6-20.4l-0.4-24.8l11.2-20.8l15.2-13.2l18-4l16.4,5.6l12,14.8L349.4,385.9z",
    "Andhra Pradesh": "M366.6,441.9l-16.4,18l-19.6,14.4l-21.6,6.4l-20-5.6l-15.6-16l-8.8-22.4l-0.8-27.2l13.2-23.6l18.4-15.6l21.6-5.2l20,6.4l15.2,16.4L366.6,441.9z",
    "Karnataka": "M291.8,443.5l-16.8,18.4l-20,15.2l-22,7.2l-20.4-4.8l-16.4-15.6l-9.2-22l-0.8-26.8l13.6-24l18.8-16l22-5.6l20.4,5.2l16,16L291.8,443.5z",
    "Goa": "M231.8,445.1l-2.8,4l-4,0.4l-2-4l0.4-4l3.2-2l3.2,0.4l2,3.2V445.1z",
    "Kerala": "M291,525.1l-9.6,10.4l-11.6,2.8l-9.6-10.8l-1.6-12.4l8.8-11.2l10.4-2.4l11.2,8L291,525.1z",
    "Tamil Nadu": "M341.4,529.5l-15.2,16.4l-18.4,12.8l-20.8,5.2l-19.2-6l-14.8-16l-8-22l-0.8-26.8l12.8-23.2l17.6-15.2l20.8-4.8l19.2,6l14.4,15.6L341.4,529.5z",
    "Puducherry": "M357.8,502.7l-1.6,2.4l-2.4,0.2l-1.2-2.4l0.2-2.4l2-1.2l2,0.2l1.2,2L357.8,502.7z",
    "Lakshadweep": "M183.8,521.1l-2,3.2l-3.2,0.2l-1.6-3.2l0.2-3.2l2.4-1.6l2.8,0.2l1.6,2.4V521.1z",
    "Andaman and Nicobar Islands": "M581.4,505.5l-4.8,6.4l-6,0.8l-3.2-6.4l-0.4-6.8l4.8-4.8l5.2-0.4l4.8,4.4L581.4,505.5z"
};

const STATE_LABELS = {
    "Ladakh": { x: 350, y: 50 }, "Jammu and Kashmir": { x: 295, y: 80 }, "Himachal Pradesh": { x: 320, y: 120 },
    "Punjab": { x: 280, y: 155 }, "Uttarakhand": { x: 355, y: 155 }, "Haryana": { x: 300, y: 185 },
    "Delhi": { x: 327, y: 187 }, "Rajasthan": { x: 220, y: 240 }, "Uttar Pradesh": { x: 380, y: 235 },
    "Bihar": { x: 460, y: 240 }, "Gujarat": { x: 170, y: 300 }, "Madhya Pradesh": { x: 320, y: 295 },
    "Chhattisgarh": { x: 400, y: 335 }, "Jharkhand": { x: 455, y: 290 }, "West Bengal": { x: 490, y: 285 },
    "Odisha": { x: 440, y: 355 }, "Maharashtra": { x: 260, y: 365 }, "Telangana": { x: 340, y: 390 },
    "Andhra Pradesh": { x: 350, y: 445 }, "Karnataka": { x: 280, y: 450 }, "Goa": { x: 235, y: 448 },
    "Kerala": { x: 285, y: 520 }, "Tamil Nadu": { x: 330, y: 525 }, "Sikkim": { x: 518, y: 195 },
    "Arunachal Pradesh": { x: 565, y: 180 }, "Nagaland": { x: 595, y: 225 }, "Manipur": { x: 588, y: 250 },
    "Mizoram": { x: 575, y: 275 }, "Tripura": { x: 558, y: 268 }, "Meghalaya": { x: 545, y: 235 },
    "Assam": { x: 540, y: 210 }, "Andaman and Nicobar Islands": { x: 570, y: 500 }, "Puducherry": { x: 360, y: 505 },
    "Lakshadweep": { x: 180, y: 520 }, "Dadra and Nagar Haveli and Daman and Diu": { x: 205, y: 355 },
};


const IndiaMap: React.FC<IndiaMapProps> = ({ onStateSelect, selectedState, thematicData }) => {
    
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
        <svg viewBox="120 0 500 600" className="w-full h-full stroke-secondary dark:stroke-primary stroke-[0.5px]">
            <g>
                {Object.entries(STATES).map(([id, d]) => {
                    const data = thematicData ? thematicData[id] : null;
                    const color = data && minMax ? getColorForValue(data.value, minMax.min, minMax.max) : 'var(--color-accent)';
                    return (
                        <path
                            key={id}
                            d={d}
                            fill={color}
                            className={`cursor-pointer transition-all duration-300 ${selectedState === id ? 'stroke-highlight stroke-[2.5px] opacity-100' : 'hover:opacity-80'}`}
                            onClick={() => onStateSelect(id)}
                        >
                            <title>{id}{data ? `: ${data.label}` : ''}</title>
                        </path>
                    );
                })}
            </g>
             <g className="pointer-events-none">
                {Object.entries(STATE_LABELS).map(([id, { x, y }]) => (
                    <text key={id} x={x} y={y} className="text-[7px] fill-text-primary font-semibold" textAnchor="middle" dominantBaseline="middle" style={{ paintOrder: 'stroke', stroke: 'var(--color-primary)', strokeWidth: '0.5px', strokeLinecap: 'butt', strokeLinejoin: 'miter' }}>{id}</text>
                ))}
            </g>
        </svg>
    );
};

export default IndiaMap;