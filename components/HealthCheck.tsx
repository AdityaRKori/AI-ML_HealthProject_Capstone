import React, { useState, useMemo } from 'react';
import type { UserProfile, Vitals, RiskAnalysis, HealthRecord } from '../types';
import { predictHealthRisks } from '../services/mlService';
import { getAIHealthAnalysis } from '../services/apiService';
import { calculateBMI, getBMICategory, getIdealWeightRange } from '../utils/helpers';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
// Fix: Import the COUNTRIES constant.
import { POPULATION_AVERAGES, COUNTRIES } from '../constants';

interface HealthCheckProps {
    userProfile: UserProfile;
    onProfileUpdate: (profile: UserProfile) => void;
    onViewReport: (record: HealthRecord) => void;
}

// --- Helper Functions and Sub-Components (moved to top-level) ---

const getRiskColor = (level: string) => {
    if (level === 'Low') return 'text-success';
    if (level === 'Medium') return 'text-warning';
    if (level === 'High' || level === 'Very High') return 'text-danger';
    return 'text-text-primary';
};

const VitalsComparisonChart: React.FC<{ vitals: Vitals; bmi: number }> = ({ vitals, bmi }) => {
    const data = [
        { subject: 'Systolic BP', user: vitals.systolicBP, average: POPULATION_AVERAGES.systolicBP, fullMark: 200 },
        { subject: 'Diastolic BP', user: vitals.diastolicBP, average: POPULATION_AVERAGES.diastolicBP, fullMark: 120 },
        { subject: 'Glucose', user: vitals.bloodGlucose, average: POPULATION_AVERAGES.bloodGlucose, fullMark: 180 },
        { subject: 'Cholesterol', user: vitals.cholesterol, average: POPULATION_AVERAGES.cholesterol, fullMark: 300 },
        { subject: 'BMI', user: parseFloat(bmi.toFixed(1)), average: POPULATION_AVERAGES.bmi, fullMark: 40 },
    ];

    return (
        <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="var(--color-accent)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 20']} tick={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-accent)', borderRadius: '0.5rem' }} />
                <Legend wrapperStyle={{fontSize: "12px"}} />
                <Radar name="Your Vitals" dataKey="user" stroke="var(--color-highlight)" fill="var(--color-highlight)" fillOpacity={0.6} />
                <Radar name="Population Avg" dataKey="average" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.4} />
            </RadarChart>
        </ResponsiveContainer>
    );
};

const IdealVitalsGuide: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
    const data = {
        male: [
            { age: 'Kid (1-17y)', bp: '<120 / <80', sugar: '70-140' },
            { age: 'Young Adult (18-39y)', bp: '<120 / <80', sugar: '<100 (fasting)' },
            { age: 'Adult (40-64y)', bp: '<120 / <80', sugar: '<100 (fasting)' },
            { age: 'Elderly (65+y)', bp: '<130 / <80', sugar: '<100 (fasting)' },
        ],
        female: [
            { age: 'Kid (1-17y)', bp: '<120 / <80', sugar: '70-140' },
            { age: 'Young Adult (18-39y)', bp: '<120 / <80', sugar: '<100 (fasting)' },
            { age: 'Adult (40-64y)', bp: '<120 / <80', sugar: '<100 (fasting)' },
            { age: 'Elderly (65+y)', bp: '<130 / <80', sugar: '<100 (fasting)' },
        ]
    };

    const isSouthEastAsian = COUNTRIES.find(c => c.name === userProfile.country && ['India', 'Indonesia', 'Pakistan', 'Bangladesh'].includes(c.name));

    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-highlight">Ideal Vitals Guide</h2>
            <p className="text-sm text-light mb-4">
                General reference values based on WHO/AHA guidelines. 
                {isSouthEastAsian && " Note: Standards for BMI and metabolic health can vary for South East Asian populations."}
                {' '}Consult a doctor for personalized advice.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-bold text-center text-text-primary mb-2">Male</h3>
                     <table className="w-full text-sm text-left text-light">
                        <thead className="text-xs text-text-primary uppercase bg-accent">
                            <tr>
                                <th scope="col" className="px-2 py-2">Age Group</th>
                                <th scope="col" className="px-2 py-2">BP (mmHg)</th>
                                <th scope="col" className="px-2 py-2">Sugar (mg/dL)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.male.map(row => (
                                <tr key={row.age} className="border-b border-accent">
                                    <td className="px-2 py-2 font-medium text-text-primary">{row.age}</td>
                                    <td className="px-2 py-2">{row.bp}</td>
                                    <td className="px-2 py-2">{row.sugar}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div>
                    <h3 className="font-bold text-center text-text-primary mb-2">Female</h3>
                     <table className="w-full text-sm text-left text-light">
                        <thead className="text-xs text-text-primary uppercase bg-accent">
                            <tr>
                                <th scope="col" className="px-2 py-2">Age Group</th>
                                <th scope="col" className="px-2 py-2">BP (mmHg)</th>
                                <th scope="col" className="px-2 py-2">Sugar (mg/dL)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.female.map(row => (
                                <tr key={row.age} className="border-b border-accent">
                                    <td className="px-2 py-2 font-medium text-text-primary">{row.age}</td>
                                    <td className="px-2 py-2">{row.bp}</td>
                                    <td className="px-2 py-2">{row.sugar}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Main HealthCheck Component ---

const HealthCheck: React.FC<HealthCheckProps> = ({ userProfile, onProfileUpdate, onViewReport }) => {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setVitals(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleAnalysis = async () => {
        setIsLoading(true);
        setAnalysisResult(null);

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
    
    const { bmi, bmiCategory, bmiColor } = useMemo(() => {
        if(vitals.height <= 0 || vitals.weight <= 0) return { bmi: 0, bmiCategory: 'N/A', bmiColor: 'text-light'};
        const calculatedBmi = calculateBMI(vitals.height, vitals.weight);
        const { category, color } = getBMICategory(calculatedBmi);
        return { bmi: calculatedBmi, bmiCategory: category, bmiColor: color };
    }, [vitals.height, vitals.weight]);

    const { idealMin, idealMax, weightToChange } = useMemo(() => {
        return getIdealWeightRange(vitals.height, vitals.weight);
    }, [vitals.height, vitals.weight]);
    
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-text-primary">Health Check-up</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Vitals Input */}
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-highlight">Enter Your Vitals</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(vitals).map(([key, value]) => (
                             <div key={key}>
                                <label className="text-sm text-light capitalize">{key.replace(/([A-Z])/g, ' $1')}{key === 'height' ? ' (cm)' : key === 'weight' ? ' (kg)' : ''}</label>
                                <input type="number" name={key} value={value} onChange={handleInputChange} className="w-full p-2 mt-1 bg-accent rounded-md text-text-primary border-transparent focus:ring-highlight focus:border-highlight" />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAnalysis} disabled={isLoading} className="w-full mt-6 bg-primary-action text-primary-action-text font-bold py-3 rounded-lg hover:opacity-90 disabled:bg-gray-500 transition-colors">
                        {isLoading ? 'Analyzing...' : 'Analyze My Health'}
                    </button>
                </div>

                {/* Vitals Snapshot */}
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-highlight">Vitals Snapshot</h2>
                     <p className="text-center text-light mb-4">Your key vitals compared to population averages.</p>
                    <VitalsComparisonChart vitals={vitals} bmi={bmi} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                     <h2 className="text-2xl font-semibold mb-4 text-highlight">BMI & Weight Target</h2>
                     <div className="text-center">
                        <p className="text-light">Your BMI</p>
                        <p className={`text-5xl font-bold ${bmiColor}`}>{bmi > 0 ? bmi.toFixed(1) : '-'}</p>
                        <p className={`font-semibold ${bmiColor}`}>{bmiCategory}</p>
                        <div className="mt-4 text-sm text-light">
                            <p>For your height, a healthy weight range is approximately <strong className="text-text-primary">{idealMin.toFixed(1)} kg</strong> to <strong className="text-text-primary">{idealMax.toFixed(1)} kg</strong>.</p>
                            {weightToChange > 0 && <p className="mt-2">Target to lose: <strong className="text-warning">{weightToChange.toFixed(1)} kg</strong> to reach a healthy BMI of 24.9.</p>}
                             {weightToChange < 0 && <p className="mt-2">Target to gain: <strong className="text-warning">{Math.abs(weightToChange).toFixed(1)} kg</strong> to reach a healthy BMI of 18.5.</p>}
                        </div>
                     </div>
                </div>
                <IdealVitalsGuide userProfile={userProfile} />
            </div>

            {isLoading && <div className="text-center p-8"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto"></div> <p className="mt-4 text-text-primary">AI is analyzing your results...</p></div>}

            {analysisResult && (
                <div className="bg-secondary p-6 rounded-lg shadow-lg space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-center text-highlight">Analysis Complete</h2>
                    <p className="text-center text-light">Your health report is ready. View the detailed report for personalized insights and recommendations.</p>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                         {analysisResult.riskAnalysis.predictions.map(p => (
                            <div key={p.disease} className="bg-accent p-4 rounded-lg">
                                <h4 className="font-semibold text-text-primary">{p.disease}</h4>
                                <p className={`font-bold text-2xl ${getRiskColor(p.riskLevel)}`}>{p.riskLevel}</p>
                            </div>
                         ))}
                     </div>
                    <button onClick={() => onViewReport(analysisResult)} className="w-full mt-4 bg-primary-action text-primary-action-text font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                        View Detailed Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default HealthCheck;