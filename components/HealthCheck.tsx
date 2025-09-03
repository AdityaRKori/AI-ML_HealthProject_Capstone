
import React, { useState } from 'react';
import type { UserProfile, Vitals, RiskAnalysis, HealthRecord, RiskPrediction } from '../types';
import { predictHealthRisks } from '../services/mlService';
import { getAIHealthAnalysis } from '../services/apiService';
import { calculateBMI } from '../utils/helpers';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import { POPULATION_AVERAGES, DISEASE_INFO, ICONS } from '../constants';

interface HealthCheckProps {
    userProfile: UserProfile;
    onProfileUpdate: (profile: UserProfile) => void;
}

const HealthCheck: React.FC<HealthCheckProps> = ({ userProfile, onProfileUpdate }) => {
    const [vitals, setVitals] = useState<Vitals>({
        systolicBP: 120,
        diastolicBP: 80,
        bloodGlucose: 90,
        cholesterol: 200,
        height: 170,
        weight: 70,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<HealthRecord | null>(null);
    const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setVitals(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleAnalysis = async () => {
        setIsLoading(true);
        setAnalysisResult(null);
        setExpandedRisk(null);

        const riskPredictions = predictHealthRisks(vitals, userProfile);
        
        try {
            const aiRecommendations = await getAIHealthAnalysis(vitals, userProfile, riskPredictions);
            const riskAnalysis: RiskAnalysis = {
                predictions: riskPredictions,
                recommendations: aiRecommendations,
            };

            const bmi = calculateBMI(vitals.height, vitals.weight);

            const newRecord: HealthRecord = {
                id: new Date().toISOString(),
                date: new Date().toISOString(),
                vitals,
                bmi,
                riskAnalysis,
            };

            setAnalysisResult(newRecord);
            
            const updatedProfile = {
                ...userProfile,
                healthHistory: [...userProfile.healthHistory, newRecord],
            };
            onProfileUpdate(updatedProfile);

        } catch (error) {
            console.error("Error getting AI analysis:", error);
            // Fallback to ML predictions only
             const riskAnalysis: RiskAnalysis = {
                predictions: riskPredictions,
                recommendations: "Could not fetch AI-powered recommendations. Please check your connection. Based on your inputs, maintaining a balanced diet and regular exercise is advised.",
            };
            const bmi = calculateBMI(vitals.height, vitals.weight);
            const newRecord: HealthRecord = {
                id: new Date().toISOString(),
                date: new Date().toISOString(),
                vitals,
                bmi,
                riskAnalysis,
            };
            setAnalysisResult(newRecord);
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleRiskExpansion = (disease: string) => {
        setExpandedRisk(expandedRisk === disease ? null : disease);
    };

    const bmi = calculateBMI(vitals.height, vitals.weight);
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-light">Health Check-up</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Vitals Input */}
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-highlight">Enter Your Vitals</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(vitals).map(([key, value]) => (
                             <div key={key}>
                                <label className="text-sm text-light/70 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                <input type="number" name={key} value={value} onChange={handleInputChange} className="w-full p-2 mt-1 bg-accent rounded-md text-light" />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAnalysis} disabled={isLoading} className="w-full mt-6 bg-highlight text-white font-bold py-3 rounded-lg hover:bg-blue-500 disabled:bg-gray-500 transition-colors">
                        {isLoading ? 'Analyzing...' : 'Analyze My Health'}
                    </button>
                </div>

                {/* BMI Chart and Vitals Comparison */}
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                     <h2 className="text-2xl font-semibold mb-4 text-highlight">Body Mass Index (BMI)</h2>
                     <p className="text-center text-5xl font-bold mb-4">{bmi.toFixed(1)}</p>
                     <BMIChart bmi={bmi} gender={userProfile.gender} />
                     <VitalsComparisonChart vitals={vitals} />
                </div>
            </div>

            {isLoading && <div className="text-center p-8"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto"></div> <p className="mt-4">AI is analyzing your results...</p></div>}

            {analysisResult && (
                <div className="bg-secondary p-6 rounded-lg shadow-lg space-y-6">
                    <h2 className="text-3xl font-bold text-center text-highlight">Your Health Report</h2>
                    
                    {/* Risk Overview */}
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-highlight">Risk Prediction Overview</h3>
                        <div className="space-y-2">
                        {analysisResult.riskAnalysis.predictions.map(p => (
                            <RiskAccordion
                                key={p.disease}
                                prediction={p}
                                isExpanded={expandedRisk === p.disease}
                                onToggle={() => toggleRiskExpansion(p.disease)}
                            />
                        ))}
                        </div>
                    </div>


                     {/* Mini Dashboard Comparison */}
                     <ResultsDashboard userVitals={vitals} userProfile={userProfile} />

                    {/* AI Recommendations */}
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-highlight">AI-Powered Recommendations</h3>
                        <p className="text-light/90 whitespace-pre-wrap bg-accent p-4 rounded-md">{analysisResult.riskAnalysis.recommendations}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const RiskAccordion: React.FC<{ prediction: RiskPrediction, isExpanded: boolean, onToggle: () => void }> = ({ prediction, isExpanded, onToggle }) => {
    const getRiskColor = (level: string) => {
        if (level === 'Low') return 'text-success';
        if (level === 'Medium') return 'text-warning';
        if (level === 'High') return 'text-danger';
        if (level === 'Very High') return 'text-red-700';
        return 'text-light';
    };
    
    const diseaseInfo = DISEASE_INFO[prediction.disease as keyof typeof DISEASE_INFO];

    return (
        <div className="bg-accent rounded-lg">
            <button onClick={onToggle} className="w-full flex justify-between items-center p-4 text-left">
                <span className="font-semibold">{prediction.disease}</span>
                <div className="flex items-center gap-4">
                    <span className={`font-bold ${getRiskColor(prediction.riskLevel)}`}>{prediction.riskLevel}</span>
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>{ICONS.chevronDown}</span>
                </div>
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-primary/50">
                    <p className="text-sm text-light/80 mb-4">{diseaseInfo?.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-light mb-2">Your Contributing Factors</h4>
                            <ul className="list-disc list-inside text-sm text-light/70 space-y-1">
                                {prediction.factors.map((factor, i) => <li key={i}>{factor}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-light mb-2">Preventative Measures</h4>
                             <ul className="list-disc list-inside text-sm text-light/70 space-y-1">
                                {diseaseInfo?.prevention.map((tip, i) => <li key={i}>{tip}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const BMIChart: React.FC<{ bmi: number, gender: string }> = ({ bmi, gender }) => {
    const data = [{ name: 'Your BMI', bmi }];
    
    // Simplified ranges. A real app would use more nuanced data.
    const ranges = {
        underweight: 18.5,
        normal: 24.9,
        overweight: 29.9,
    };

    return (
        <div style={{ width: '100%', height: 150 }}>
            <ResponsiveContainer>
                <BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" domain={[10, 40]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip wrapperStyle={{ backgroundColor: '#1B263B', border: '1px solid #415A77', borderRadius: '0.5rem' }} />
                    <Bar dataKey="bmi" fill="#3B82F6" barSize={30}>
                    </Bar>
                    <ReferenceLine x={ranges.underweight} stroke="#F59E0B" strokeDasharray="3 3">
                        <Legend content={() => <text x={0} y={0} fill="#F59E0B" dx={50} dy={10}>Underweight</text>} />
                    </ReferenceLine>
                    <ReferenceLine x={ranges.normal} stroke="#10B981" strokeDasharray="3 3">
                         <Legend content={() => <text x={0} y={0} fill="#10B981" dx={150} dy={10}>Normal</text>} />
                    </ReferenceLine>
                     <ReferenceLine x={ranges.overweight} stroke="#EF4444" strokeDasharray="3 3">
                         <Legend content={() => <text x={0} y={0} fill="#EF4444" dx={250} dy={10}>Overweight</text>} />
                     </ReferenceLine>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const VitalsComparisonChart: React.FC<{ vitals: Vitals }> = ({ vitals }) => {
    const data = [
        { name: 'Systolic BP', you: vitals.systolicBP, average: POPULATION_AVERAGES.systolicBP },
        { name: 'Diastolic BP', you: vitals.diastolicBP, average: POPULATION_AVERAGES.diastolicBP },
        { name: 'Glucose', you: vitals.bloodGlucose, average: POPULATION_AVERAGES.bloodGlucose },
        { name: 'Cholesterol', you: vitals.cholesterol, average: POPULATION_AVERAGES.cholesterol },
    ];

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-highlight">Your Vitals vs. Average</h2>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#E0E1DD" fontSize={12} />
                        <YAxis stroke="#E0E1DD" />
                        <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: 'none', borderRadius: '0.5rem' }} />
                        <Legend />
                        <Bar dataKey="you" fill="#3B82F6" name="Your Vitals" />
                        <Bar dataKey="average" fill="#415A77" name="Population Average" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const ResultsDashboard: React.FC<{ userVitals: Vitals, userProfile: UserProfile }> = ({ userVitals, userProfile }) => {
    const userBmi = calculateBMI(userVitals.height, userVitals.weight);

    const comparisonData = [
        { name: 'Systolic BP', you: userVitals.systolicBP, average: POPULATION_AVERAGES.systolicBP },
        { name: 'Glucose', you: userVitals.bloodGlucose, average: POPULATION_AVERAGES.bloodGlucose },
        { name: 'Cholesterol', you: userVitals.cholesterol, average: POPULATION_AVERAGES.cholesterol },
        { name: 'BMI', you: parseFloat(userBmi.toFixed(1)), average: POPULATION_AVERAGES.bmi },
    ];
    
    return (
         <div>
            <h3 className="text-xl font-semibold mb-2 text-highlight">Comparison with Population Average</h3>
            <div className="bg-accent p-4 rounded-md">
                 <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#E0E1DD" />
                        <YAxis stroke="#E0E1DD" />
                        <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: 'none', borderRadius: '0.5rem' }} />
                        <Legend />
                        <Bar dataKey="you" fill="#3B82F6" name="Your Vitals" />
                        <Bar dataKey="average" fill="#415A77" name="Population Average" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default HealthCheck;