import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { UserProfile, Vitals, RiskAnalysis, HealthRecord, BluetoothDeviceState } from '../types';
import { predictHealthRisks } from '../services/mlService';
import { getAIHealthAnalysis } from '../services/apiService';
import { calculateBMI, getBMICategory, getIdealWeightRange, getBase64 } from '../utils/helpers';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { GLOBAL_POPULATION_AVERAGES, NATIONAL_POPULATION_AVERAGES, COUNTRIES, ICONS, DEFAULT_DASHBOARD_BG_URL } from '../constants';
import BluetoothManager from './BluetoothManager';
import BloodPressureMeter from './BloodPressureMeter';

interface HealthCheckProps {
    userProfile: UserProfile;
    onProfileUpdate: (profile: UserProfile) => void;
    onViewReport: (record: HealthRecord) => void;
}

// --- Sub-Components (moved to top-level) ---

interface EmergencyModalProps {
    onClose: () => void;
    emergencyNumber: string;
    message: string;
    firstAid: React.ReactNode;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({ onClose, emergencyNumber, message, firstAid }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-secondary border-2 border-danger rounded-lg shadow-xl p-6 w-full max-w-lg text-center">
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 text-danger">{ICONS.warning}</div>
            </div>
            <h2 className="text-3xl font-bold text-danger mb-4">Emergency Alert</h2>
            <p className="text-text-primary text-lg mb-6">{message}</p>
            
            <div className="bg-accent p-4 rounded-lg text-left mb-6">
                 <h3 className="font-bold text-highlight mb-2">Immediate First Aid:</h3>
                 {firstAid}
            </div>

            <a href={`tel:${emergencyNumber}`} className="w-full block bg-danger text-white font-bold py-4 rounded-lg text-2xl hover:opacity-90 transition-opacity">
                Call {emergencyNumber} Now
            </a>
            <button onClick={onClose} className="mt-4 text-sm text-light hover:underline">
                I understand, close this alert.
            </button>
        </div>
    </div>
);


const getRiskColor = (level: string) => {
    if (level === 'Low') return 'text-success';
    if (level === 'Medium') return 'text-warning';
    if (level === 'High' || level === 'Very High') return 'text-danger';
    return 'text-text-primary';
};

const VitalsComparisonChart: React.FC<{ vitals: Vitals; bmi: number; nationalAverage: typeof GLOBAL_POPULATION_AVERAGES }> = ({ vitals, bmi, nationalAverage }) => {
    const data = [
        { subject: 'Systolic BP', user: vitals.systolicBP, national: nationalAverage.systolicBP, global: GLOBAL_POPULATION_AVERAGES.systolicBP, fullMark: 200 },
        { subject: 'Diastolic BP', user: vitals.diastolicBP, national: nationalAverage.diastolicBP, global: GLOBAL_POPULATION_AVERAGES.diastolicBP, fullMark: 120 },
        { subject: 'Glucose', user: vitals.bloodGlucose, national: nationalAverage.bloodGlucose, global: GLOBAL_POPULATION_AVERAGES.bloodGlucose, fullMark: 180 },
        { subject: 'Cholesterol', user: vitals.cholesterol, national: nationalAverage.cholesterol, global: GLOBAL_POPULATION_AVERAGES.cholesterol, fullMark: 300 },
        { subject: 'BMI', user: parseFloat(bmi.toFixed(1)), national: nationalAverage.bmi, global: GLOBAL_POPULATION_AVERAGES.bmi, fullMark: 40 },
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
                <Radar name="National Avg" dataKey="national" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.4} />
                <Radar name="Global Avg" dataKey="global" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.2} />
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
    const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
    const [bpReading, setBpReading] = useState<{ systolic: number; diastolic: number} | null>(null);
    const [warnings, setWarnings] = useState<Record<string, string>>({});
    const [emergency, setEmergency] = useState<{ type: 'bp' | 'glucose'; message: string; firstAid: React.ReactNode } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<HealthRecord | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { countryData, nationalAverage } = useMemo(() => {
        const data = COUNTRIES.find(c => c.code === userProfile.country) || COUNTRIES[0];
        const averages = NATIONAL_POPULATION_AVERAGES[data.code] || NATIONAL_POPULATION_AVERAGES['DEFAULT'];
        return { countryData: data, nationalAverage: averages };
    }, [userProfile.country]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const { data, mimeType } = await getBase64(file);
                const dataUrl = `data:${mimeType};base64,${data}`;
                const updatedProfile = {
                    ...userProfile,
                    dashboardBackgroundUrl: dataUrl,
                };
                onProfileUpdate(updatedProfile);
            } catch (error) {
                console.error("Failed to process image:", error);
            }
        }
    };

    const handleRemoveImage = () => {
        const { dashboardBackgroundUrl, ...rest } = userProfile;
        onProfileUpdate(rest);
    };

    const validateVitals = (name: string, value: number) => {
        const newWarnings = { ...warnings };
        delete newWarnings[name];

        // Emergency Checks
        if ((name === 'systolicBP' && value > 180) || (name === 'diastolicBP' && value > 120)) {
            setEmergency({
                type: 'bp',
                message: 'Your blood pressure is in a hypertensive crisis range. This is a medical emergency requiring immediate attention.',
                firstAid: (
                    <ul className="list-disc list-inside space-y-1 text-text-primary">
                        <li><strong className="text-warning">Sit down and try to remain calm.</strong></li>
                        <li>Do not drive yourself. Have someone else call for help.</li>
                        <li>Follow instructions from emergency services.</li>
                    </ul>
                ),
            });
        } else if ((name === 'bloodGlucose' && value > 300) || (name === 'bloodGlucose' && value < 60)) {
            setEmergency({
                type: 'glucose',
                message: value > 300 ? 'Your blood glucose is critically high (hyperglycemia).' : 'Your blood glucose is critically low (hypoglycemia).',
                firstAid: value > 300 ? (
                     <ul className="list-disc list-inside space-y-1 text-text-primary">
                         <li><strong className="text-warning">Do not administer extra insulin unless advised by a doctor.</strong></li>
                         <li>Drink water to help flush excess sugar, if conscious and able.</li>
                     </ul>
                ) : (
                    <ul className="list-disc list-inside space-y-1 text-text-primary">
                        <li><strong className="text-warning">Consume 15g of fast-acting carbs</strong> (e.g., half a cup of juice or soda, 3-4 glucose tablets).</li>
                        <li>Re-check blood sugar in 15 minutes.</li>
                    </ul>
                ),
            });
        }

        // Implausible Value Checks
        else if (name === 'weight' && value > 500) {
            newWarnings[name] = 'This weight is highly abnormal. If this is not a typo, please consult a medical professional immediately.';
        }
        setWarnings(newWarnings);
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = parseFloat(value) || 0;
        setVitals(prev => ({ ...prev, [name]: numericValue }));
        if (name === 'systolicBP' || name === 'diastolicBP') {
             setBpReading(prev => ({
                systolic: name === 'systolicBP' ? numericValue : prev?.systolic ?? vitals.systolicBP,
                diastolic: name === 'diastolicBP' ? numericValue : prev?.diastolic ?? vitals.diastolicBP,
            }));
        }
        validateVitals(name, numericValue);
    };

    const handleBPReading = (systolic: number, diastolic: number) => {
        setVitals(prev => ({
            ...prev,
            systolicBP: systolic,
            diastolicBP: diastolic,
        }));
        setBpReading({ systolic, diastolic });
        validateVitals('systolicBP', systolic);
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
                timeOfDay,
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
                timeOfDay,
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
             {emergency && (
                <EmergencyModal 
                    onClose={() => setEmergency(null)}
                    emergencyNumber={countryData.emergencyNumber}
                    message={emergency.message}
                    firstAid={emergency.firstAid}
                />
            )}
            <div 
                className="relative h-48 bg-secondary rounded-lg shadow-lg bg-cover bg-center group"
                style={{ backgroundImage: `url(${userProfile.dashboardBackgroundUrl || DEFAULT_DASHBOARD_BG_URL})` }}
                aria-label="Dashboard background banner"
            >
                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">Health Check-up</h1>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-black/50 text-white text-xs px-2 py-1 rounded hover:bg-black/80"
                        aria-label="Change dashboard background"
                    >
                        Change BG
                    </button>
                    {userProfile.dashboardBackgroundUrl && (
                        <button 
                            onClick={handleRemoveImage}
                            className="bg-danger/80 text-white text-xs px-2 py-1 rounded hover:bg-danger"
                            aria-label="Remove dashboard background"
                        >
                            Remove
                        </button>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/png, image/jpeg" 
                    className="hidden" 
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vitals Input */}
                <div className="lg:col-span-2 bg-secondary p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-highlight">Enter Your Vitals</h2>
                        <div className="flex items-center gap-1 bg-accent p-1 rounded-lg">
                            {(['morning', 'afternoon', 'evening'] as const).map(time => (
                                <button
                                    key={time}
                                    onClick={() => setTimeOfDay(time)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${timeOfDay === time ? 'bg-highlight text-white' : 'text-light hover:bg-primary'}`}
                                >
                                    {time.charAt(0).toUpperCase() + time.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(vitals).map(([key, value]) => (
                             <div key={key}>
                                <label className="text-sm text-light capitalize">{key.replace(/([A-Z])/g, ' $1')}{key === 'height' ? ' (cm)' : key === 'weight' ? ' (kg)' : ''}</label>
                                <input type="number" name={key} value={value} onChange={handleInputChange} className="w-full p-2 mt-1 bg-accent rounded-md text-text-primary border-transparent focus:ring-highlight focus:border-highlight" />
                                {warnings[key] && <p className="text-xs text-warning mt-1">{warnings[key]}</p>}
                            </div>
                        ))}
                    </div>
                    {bpReading && <BloodPressureMeter systolic={bpReading.systolic} diastolic={bpReading.diastolic} />}
                    <button onClick={handleAnalysis} disabled={isLoading} className="w-full mt-6 bg-gradient-theme text-primary-action-text font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors">
                        {isLoading ? 'Analyzing...' : 'Analyze My Health'}
                    </button>
                </div>

                {/* Bluetooth & Snapshot */}
                <div className="space-y-8">
                    <BluetoothManager onReceiveReading={handleBPReading} />
                    <div className="bg-secondary p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4 text-highlight">Vitals Snapshot</h2>
                        <p className="text-center text-light mb-4 text-sm">Your key vitals vs. National & Global averages.</p>
                        <VitalsComparisonChart vitals={vitals} bmi={bmi} nationalAverage={nationalAverage} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                     <h2 className="text-2xl font-semibold mb-4 text-highlight">BMI & Weight Target</h2>
                     <div className="text-center">
                        <p className="text-light">Your BMI</p>
                        <p className={`text-5xl font-bold ${bmiColor}`}>{bmi > 0 ? bmi.toFixed(1) : '-'}</p>
                        <p className={`font-semibold ${bmiColor}`}>{bmiCategory}</p>
                        
                        <div className="mt-4 text-sm text-light border-t border-accent pt-4">
                            <p>For your height, a healthy weight range is approx. <strong className="text-text-primary">{idealMin.toFixed(1)} kg</strong> to <strong className="text-text-primary">{idealMax.toFixed(1)} kg</strong>.</p>
                            {weightToChange > 0 && <p className="mt-2">Target to lose: <strong className="text-warning">{weightToChange.toFixed(1)} kg</strong> to reach a healthy BMI of 24.9.</p>}
                             {weightToChange < 0 && <p className="mt-2">Target to gain: <strong className="text-warning">{Math.abs(weightToChange).toFixed(1)} kg</strong> to reach a healthy BMI of 18.5.</p>}
                        </div>

                         <div className="mt-4 text-sm text-light border-t border-accent pt-4">
                             <div className="flex justify-around">
                                 <div className="px-2">
                                     <p>National Avg BMI</p>
                                     <p className="font-bold text-lg text-warning">{nationalAverage.bmi.toFixed(1)}</p>
                                 </div>
                                  <div className="px-2">
                                     <p>Global Avg BMI</p>
                                     <p className="font-bold text-lg text-danger">{GLOBAL_POPULATION_AVERAGES.bmi.toFixed(1)}</p>
                                 </div>
                             </div>
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
                    <button onClick={() => onViewReport(analysisResult)} className="w-full mt-4 bg-gradient-theme text-primary-action-text font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                        View Detailed Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default HealthCheck;