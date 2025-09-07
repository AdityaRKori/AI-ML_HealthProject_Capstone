import React from 'react';
import { BLOOD_PRESSURE_CATEGORIES } from '../constants';

interface BloodPressureMeterProps {
    systolic: number;
    diastolic: number;
}

const BloodPressureMeter: React.FC<BloodPressureMeterProps> = ({ systolic, diastolic }) => {
    // Determine category based on the higher value (systolic or diastolic equivalent)
    // For simplicity, we'll primarily categorize by systolic as it's the top number.
    const category = BLOOD_PRESSURE_CATEGORIES.find(c => systolic <= c.max) || BLOOD_PRESSURE_CATEGORIES[BLOOD_PRESSURE_CATEGORIES.length - 1];

    // Position the indicator. We'll use a scale from 70 to 190 for positioning.
    const minRange = 70;
    const maxRange = 190;
    const positionPercent = Math.max(0, Math.min(100, ((systolic - minRange) / (maxRange - minRange)) * 100));

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2 text-center">Blood Pressure Reading</h3>
            <div className="relative p-4 bg-accent rounded-lg">
                <div className="w-full h-3 flex rounded-full overflow-hidden">
                    {BLOOD_PRESSURE_CATEGORIES.map((cat, index) => (
                        <div key={cat.name} className={`h-full ${cat.color}`} style={{ width: `${index === 0 ? 15 : index < 5 ? 18 : 13}%` }}></div>
                    ))}
                </div>
                <div className="absolute top-8 left-0 w-full" style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}>
                     <div className="relative w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-highlight"></div>
                </div>
                <div className="mt-4 text-center">
                    <p className="text-2xl font-bold text-text-primary">{systolic} / {diastolic} <span className="text-sm text-light">mmHg</span></p>
                    <p className={`font-semibold text-lg ${category.color.replace('bg-','text-')}`}>{category.name}</p>
                </div>
                 <div className="flex justify-between text-xs text-light mt-2 px-2">
                    <span>Low</span>
                    <span>Normal</span>
                    <span>Elevated</span>
                    <span>High</span>
                    <span>Crisis</span>
                </div>
            </div>
        </div>
    );
};

export default BloodPressureMeter;