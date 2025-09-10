import React, { useState, useMemo } from 'react';
import type { LiveDiseaseCase } from '../types';
import DiseaseInfoModal from './DiseaseInfoModal';

interface GlobalLiveMapProps {
    liveCases: LiveDiseaseCase[];
}

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

// A simplified path for the world map outlines.
const WORLD_MAP_PATH = "";

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

            <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="w-full h-auto">
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
