import React from 'react';
import type { UserProfile, HealthRecord, RiskPrediction, Vitals } from '../types';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ICONS, VITAL_RANGES } from '../constants';

interface HealthReportProps {
    report: HealthRecord;
    userProfile: UserProfile;
}

// --- Sub-components moved to top-level ---

const RiskItem: React.FC<{ prediction: RiskPrediction }> = ({ prediction }) => {
    const getRiskColor = (level: string) => {
        if (level === 'Low') return 'text-success';
        if (level === 'Medium') return 'text-warning';
        if (level === 'High') return 'text-danger';
        if (level === 'Very High') return 'text-red-700 dark:text-red-500';
        return 'text-text-primary';
    };
    return (
        <div className="bg-accent p-4 rounded-lg print:bg-gray-100">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-text-primary print:text-black">{prediction.disease}</span>
                <span className={`font-bold ${getRiskColor(prediction.riskLevel)}`}>{prediction.riskLevel}</span>
            </div>
             <p className="text-sm text-light mt-2 print:text-gray-700"><strong>Contributing Factors:</strong> {prediction.factors.join(', ')}</p>
        </div>
    )
}

const TrendChart: React.FC<{ data: any[], dataKey: string, title: string, stroke: string }> = ({ data, dataKey, title, stroke }) => (
    <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2 print:text-black">{title}</h3>
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#333" fontSize={12} />
                <YAxis stroke="#333" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '0.5rem' }} />
                <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
            </LineChart>
        </ResponsiveContainer>
    </div>
);

// --- Main HealthReport Component ---

const HealthReport: React.FC<HealthReportProps> = ({ report, userProfile }) => {
    const { healthHistory } = userProfile;
    const chartData = healthHistory.slice(-10).map(record => ({
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        BMI: parseFloat(record.bmi.toFixed(1)),
        'Systolic BP': record.vitals.systolicBP,
        Glucose: record.vitals.bloodGlucose,
        Cholesterol: record.vitals.cholesterol,
    }));
    
    const handlePrint = () => {
        window.print();
    };

    const getVitalColor = (vitalName: keyof Vitals, value: number): string => {
        const ranges = VITAL_RANGES[vitalName as keyof typeof VITAL_RANGES];
        if (!ranges) return 'text-text-primary print:text-black';
        if (value < ranges.normal) return 'text-success';
        if (value < ranges.borderline) return 'text-success';
        if (value < ranges.high) return 'text-warning';
        return 'text-danger';
    };

    const formatRecommendations = (text: string) => {
        const parts = text.split(/(\[DO\].*?\[\/DO\]|\[AVOID\].*?\[\/AVOID\])/g);
        return parts.map((part, index) => {
            if (part.startsWith('[DO]')) {
                return <span key={index} className="text-success print:text-green-600">{part.replace(/\[\/?DO\]/g, '')}</span>;
            }
            if (part.startsWith('[AVOID]')) {
                return <span key={index} className="text-danger print:text-red-600">{part.replace(/\[\/?AVOID\]/g, '')}</span>;
            }
            return part;
        });
    };

    return (
        <div className="report-container space-y-8 animate-fade-in">
             <style>{`
                @media print {
                    body {
                        background-color: #fff !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print { display: none !important; }
                    .report-container { margin: 0; padding: 0; }
                    body * { visibility: hidden; }
                    .printable-area, .printable-area * { visibility: visible; }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print-bg-white { background-color: #fff !important; }
                    .print-text-black { color: #000 !important; }
                    .print-text-gray-700 { color: #4a5568 !important; }
                    .print-border-gray { border-color: #e2e8f0 !important; }
                }
            `}</style>

            <div className="flex justify-between items-start no-print">
                <h1 className="text-3xl font-bold text-text-primary">Health Report</h1>
                <button onClick={handlePrint} className="bg-gradient-theme text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                    Download PDF
                </button>
            </div>

            <div className="printable-area bg-primary print-bg-white p-4 sm:p-6 md:p-8 font-serif">
                {/* Report Header */}
                <div className="flex justify-between items-center border-b-2 pb-4 print-border-gray">
                    <div className="flex items-center gap-4">
                         <div className="w-16 h-16 text-highlight print-text-black">
                            {ICONS.logo}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary print-text-black">AI Health Tracker Report</h1>
                            <p className="text-light print-text-gray-700">Personalized AI-Powered Analysis</p>
                        </div>
                    </div>
                     <div className="text-right">
                        <p className="font-semibold text-text-primary print-text-black">{userProfile.name}</p>
                        <p className="text-sm text-light print-text-gray-700">Generated: {new Date(report.date).toLocaleString()}</p>
                    </div>
                </div>

                {/* Vitals and Risks */}
                 <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
                     <div className="lg:col-span-2 bg-secondary p-6 rounded-lg shadow-lg print:shadow-none print:border print-border-gray">
                        <h2 className="text-xl font-bold text-highlight mb-4 border-b pb-2 print-border-gray">Vitals Overview</h2>
                         <table className="w-full text-left">
                            <tbody>
                                {Object.entries(report.vitals).map(([key, value]) => (
                                    <tr key={key} className="border-b print-border-gray">
                                        <td className="py-2 text-light print-text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                                        <td className={`py-2 font-bold text-lg text-right ${getVitalColor(key as keyof Vitals, value)}`}>{value}</td>
                                    </tr>
                                ))}
                                <tr className="border-b print-border-gray">
                                    <td className="py-2 text-light print-text-gray-700">BMI</td>
                                    <td className="py-2 font-bold text-lg text-right">{report.bmi.toFixed(1)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="lg:col-span-3 bg-secondary p-6 rounded-lg shadow-lg print:shadow-none print:border print-border-gray">
                        <h2 className="text-xl font-bold text-highlight mb-4 border-b pb-2 print-border-gray">Risk Prediction Summary</h2>
                        <div className="space-y-4">
                            {report.riskAnalysis.predictions.map(p => <RiskItem key={p.disease} prediction={p} />)}
                        </div>
                    </div>
                 </div>

                {userProfile.healthNotes && userProfile.healthNotes.length > 0 && (
                     <div className="mt-8 bg-secondary p-6 rounded-lg shadow-lg print:shadow-none print:border print-border-gray">
                         <h2 className="text-xl font-bold text-highlight mb-4 border-b pb-2 print-border-gray">Health Notes</h2>
                         <ul className="list-disc list-inside text-text-primary print-text-black space-y-1 text-light print-text-gray-700">
                             {userProfile.healthNotes.map((note, index) => (
                                 <li key={index}>{note}</li>
                             ))}
                         </ul>
                     </div>
                 )}
                 
                  <div className="mt-8 bg-secondary p-6 rounded-lg shadow-lg print:shadow-none print:border print-border-gray">
                     <h2 className="text-xl font-bold text-highlight mb-4 border-b pb-2 print-border-gray">AI-Powered Analysis & Recommendations</h2>
                     <div className="text-text-primary whitespace-pre-wrap print-text-black prose prose-sm dark:prose-invert max-w-none">
                        {formatRecommendations(report.riskAnalysis.recommendations).map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>)}
                     </div>
                 </div>
                 
                 {healthHistory.length >= 2 && (
                     <div className="mt-8 bg-secondary p-6 rounded-lg shadow-lg no-print">
                         <h2 className="text-xl font-bold text-highlight mb-4">Recent Health Trends</h2>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <TrendChart data={chartData} dataKey="BMI" title="BMI Trend" stroke="var(--color-highlight)" />
                             <TrendChart data={chartData} dataKey="Systolic BP" title="Systolic BP Trend" stroke="var(--color-warning)" />
                         </div>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default HealthReport;