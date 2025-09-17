import React, { useState, useMemo } from 'react';
import type { LiveDiseaseCase } from '../types';
import DiseaseInfoModal from './DiseaseInfoModal';

interface GlobalLiveMapProps {
    liveCases: LiveDiseaseCase[];
}

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

// A simplified path for the world map outlines.
const WORLD_MAP_PATH = "M998.5 250q-21.5-12.5-43-22.5t-43-17.5-40-10.5-36.5-4-32.5-0.5h-28.5q-28 0-53 5.5t-49 14-46.5 19.5-42.5 22.5-39.5 22-36 19-32.5 13.5-29.5 7-26 2h-22q-20.5 0-38.5-6.5t-35-17.5-31.5-26-27-31.5-22.5-33.5-18.5-32-15-27-11.5-20q-2-3-2.5-3.5t-1-1.5-1-1-0.5-0.5h-1q-0.5 0-1 0.5t-1 1-1.5 1.5-2 3-2.5 4-3 5-3 6.5-3 7-2.5 7.5-2 7.5-1.5 7-1 6-0.5 5.5v4q0.5 3 1 5.5t1 5 1.5 5 1.5 4.5 2 4.5 2 3.5 2.5 3.5 2 2.5 2.5 2 2.5 1.5q5 2 10.5 3t10.5 2.5 10 1.5 10 1 9.5 0.5h9q8.5 0 16-1t15-2.5 14-4.5 13-6.5 12.5-8.5 11.5-11 11-13 10-15.5 9.5-18 8.5-21 8-24 7-27.5 6-31.5 5-35.5 4-39.5q-10 27-22 53t-23.5 51-24.5 47-24 41-23.5 34.5-22 26-20.5 18-18.5 10-16.5 4.5-14.5 1h-12.5q-11 0-21-2t-19-5.5-17.5-9-15.5-12.5-14-16-12-19.5-10-23-8-26.5-6-30-4-33.5-2-37.5q-0.5-3.5-0.5-7v-10.5q0-10.5 2-20.5t5.5-19 8-17 11-15 13.5-12.5 15.5-10.5 17-8.5 18.5-6.5 19.5-4.5 20-2.5h20q19.5 0 38 4t35.5 11 32.5 17 29 21.5 25.5 25 21.5 27 17.5 28 13.5 28 9.5 27 5.5 25v-1q-2-3.5-4-7t-4-7-4.5-7-4.5-6.5-5-6-5-5-5-4.5-5-3.5-5-3q-5-2.5-10-4.5t-10-3.5-10.5-3-10.5-2-11-1-11-0.5h-11q-10.5 0-20 1.5t-19 4-17.5 6.5-16 8.5-14.5 10.5-13 12.5-11.5 14.5-9.5 16.5-8 18-6.5 19.5-5 21-3 22-1.5 22.5q0 11.5 2 22.5t5.5 21.5 8.5 19.5 11.5 17 14 14 16 11 18 8 20 5 21.5 2.5h23q22.5 0 43-4.5t39.5-12.5 35-20 30-26.5 24.5-32 18.5-36 13-39 7-41 2-42.5z";

// Convert lat/lon to SVG coordinates
const mercatorProjection = (lat: number, lon: number): [number, number] => {
    const x = (lon + 180) * (MAP_WIDTH / 360);
    const latRad = lat * Math.PI / 180;
    const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    const y = (MAP_HEIGHT / 2) - (MAP_WIDTH * mercN / (2 * Math.PI));
    return [x, y];
};

const getSeverityDetails = (severity: LiveDiseaseCase['severity'], cases: number) => {
    const baseSize = 4 + Math.log(cases + 1);
    switch (severity) {
        case 'Mild': return { color: 'fill-success/70', size: baseSize * 0.8 };
        case 'Moderate': return { color: 'fill-yellow-500/70', size: baseSize };
        case 'Severe': return { color: 'fill-orange-500/70', size: baseSize * 1.2 };
        case 'Critical': return { color: 'fill-danger/70', size: baseSize * 1.5 };
        default: return { color: 'fill-gray-500/70', size: baseSize };
    }
};

// FIX: Defined a new type for map points to include x/y coordinates
type MapPoint = LiveDiseaseCase & { x: number; y: number };

export const GlobalLiveMap: React.FC<GlobalLiveMapProps> = ({ liveCases }) => {
    // FIX: Updated state to use the new MapPoint type.
    const [selectedCase, setSelectedCase] = useState<MapPoint | null>(null);
    const [modalDisease, setModalDisease] = useState<string | null>(null);

    const mapPoints: MapPoint[] = useMemo(() => {
        return liveCases.map(c => {
            const [x, y] = mercatorProjection(c.lat, c.lon);
            return { ...c, x, y };
        });
    }, [liveCases]);

    return (
        <div className="bg-secondary p-4 rounded-lg shadow-lg relative">
            <h2 className="text-2xl font-bold text-highlight mb-2">Live Global Outbreak Map</h2>
            <p className="text-xs text-light absolute top-4 right-4 italic">Note: Data is a real-time AI simulation.</p>

            <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="w-full h-auto bg-primary rounded">
                <path d={WORLD_MAP_PATH} className="fill-accent stroke-secondary stroke-[0.5px]"></path>
                
                <g>
                    {mapPoints.map(point => {
                        const { color, size } = getSeverityDetails(point.severity, point.cases);
                        return (
                            <circle
                                key={point.id}
                                cx={point.x}
                                cy={point.y}
                                r={size}
                                className={`${color} cursor-pointer transition-all duration-200 hover:stroke-highlight-text stroke-2 pulse`}
                                onMouseEnter={() => setSelectedCase(point)}
                                onMouseLeave={() => setSelectedCase(null)}
                                onClick={() => setModalDisease(point.disease)}
                            />
                        );
                    })}
                </g>
            </svg>
            
            {selectedCase && (
                 <div
                    className="absolute bg-primary/80 text-white p-2 rounded-lg text-xs pointer-events-none"
                    style={{ left: selectedCase.x + 10, top: selectedCase.y + 10, backdropFilter: 'blur(4px)' }}
                >
                    <p className="font-bold">{selectedCase.disease} in {selectedCase.country}</p>
                    <p>Cases: {selectedCase.cases.toLocaleString()}</p>
                    <p>Severity: {selectedCase.severity}</p>
                </div>
            )}

            {modalDisease && (
                <DiseaseInfoModal diseaseName={modalDisease} onClose={() => setModalDisease(null)} />
            )}

            <div className="flex justify-center items-center gap-4 mt-2 text-xs text-light">
                <span>Severity:</span>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-success"></div>Mild</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>Moderate</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500"></div>Severe</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-danger"></div>Critical</div>
            </div>
        </div>
    );
};