import React, { useState, useEffect } from 'react';
import { getDiseaseFactSheet } from '../services/apiService';
import type { DiseaseFactSheet } from '../types';
import { ICONS } from '../constants';

interface DiseaseInfoModalProps {
    diseaseName: string;
    onClose: () => void;
}

const DiseaseInfoModal: React.FC<DiseaseInfoModalProps> = ({ diseaseName, onClose }) => {
    const [factSheet, setFactSheet] = useState<DiseaseFactSheet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFacts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getDiseaseFactSheet(diseaseName);
                setFactSheet(data);
            } catch (err) {
                setError("Could not load detailed information for this disease.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFacts();
    }, [diseaseName]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-secondary border border-accent rounded-lg shadow-xl p-6 w-full max-w-lg text-left" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-highlight">{diseaseName}</h2>
                    <button onClick={onClose} className="text-light hover:text-white">&times;</button>
                </div>
                {isLoading && <div className="text-center p-4">Loading...</div>}
                {error && <div className="text-center p-4 text-danger">{error}</div>}
                {factSheet && (
                    <div className="space-y-3 text-sm">
                        <div><strong className="text-text-primary">Cause:</strong> <span className="text-light">{factSheet.cause}</span></div>
                        <div><strong className="text-text-primary">Prevention:</strong> <span className="text-light">{factSheet.prevention}</span></div>
                        <div><strong className="text-text-primary">History:</strong> <span className="text-light">{factSheet.historicalContext}</span></div>
                        <div><strong className="text-text-primary">Statistics:</strong> <span className="text-light">{factSheet.statistics}</span></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseInfoModal;
