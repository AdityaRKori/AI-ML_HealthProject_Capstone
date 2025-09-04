import React from 'react';
import type { UserProfile, HealthRecord, RiskPrediction } from '../types';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

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
        <div className="bg-accent p-4 rounded-lg print-bg-secondary">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-text-primary print-text-black">{prediction.disease}</span>
                <span className={`font-bold ${getRiskColor(prediction.riskLevel)}`}>{prediction.riskLevel}</span>
            </div>
             <p className="text-sm text-light mt-2 print-text-black"><strong>Contributing Factors:</strong> {prediction.factors.join(', ')}</p>
        </div>
    )
}

const TrendChart: React.FC<{ data: any[], dataKey: string, title: string, stroke: string }> = ({ data, dataKey, title, stroke }) => (
    <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2 print-text-black">{title}</h3>
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-accent)" />
                <XAxis dataKey="date" stroke="var(--color-text)" fontSize={12} />
                <YAxis stroke="var(--color-text)" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-accent)', borderRadius: '0.5rem' }} />
                <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
            </LineChart>
        </ResponsiveContainer>
    </div>
);


// --- Main HealthReport Component ---

const HealthReport: React.FC<HealthReportProps> = ({ report, userProfile }) => {
    const { healthHistory } = userProfile;
    const chartData = healthHistory.slice(-10).map(record => ({ // Show last 10 records
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        BMI: parseFloat(record.bmi.toFixed(1)),
        'Systolic BP': record.vitals.systolicBP,
        Glucose: record.vitals.bloodGlucose,
        Cholesterol: record.vitals.cholesterol,
    }));
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="report-container space-y-8 animate-fade-in">
            <style>{`
                @media print {
                    body, html {
                        background: #fff !important;
                    }
                    .report-container {
                        padding: 0;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        color: #000 !important;
                        background: #fff !important;
                    }
                    .no-print { display: none !important; }
                    .print-bg-secondary { background-color: #f3f4f6 !important; }
                    .print-text-black { color: #000 !important; }
                }
            `}</style>

            <div className="printable-area p-4 md:p-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary print-text-black">Health Report</h1>
                        <p className="text-light print-text-black">Generated for {userProfile.name} on {new Date(report.date).toLocaleString()}</p>
                    </div>
                     <button onClick={handlePrint} className="no-print bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                        Download PDF
                    </button>
                </div>

                <div className="mt-8 bg-secondary p-6 rounded-lg shadow-lg print-bg-secondary">
                    <h2 className="text-xl font-bold text-highlight mb-4">Patient Information</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-text-primary print-text-black">
                        <div><strong>Name:</strong> {userProfile.name}</div>
                        <div><strong>Age:</strong> {userProfile.age}</div>
                        <div><strong>Gender:</strong> {userProfile.gender}</div>
                        <div><strong>Location:</strong> {userProfile.city}, {userProfile.country}</div>
                    </div>
                </div>

                 <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-secondary p-6 rounded-lg shadow-lg print-bg-secondary">
                        <h2 className="text-xl font-bold text-highlight mb-4">Vitals at Time of Test</h2>
                        <div className="grid grid-cols-2 gap-4 text-text-primary print-text-black">
                            <div><strong>Systolic BP:</strong> {report.vitals.systolicBP} mmHg</div>
                            <div><strong>Diastolic BP:</strong> {report.vitals.diastolicBP} mmHg</div>
                            <div><strong>Glucose:</strong> {report.vitals.bloodGlucose} mg/dL</div>
                            <div><strong>Cholesterol:</strong> {report.vitals.cholesterol} mg/dL</div>
                            <div><strong>Height:</strong> {report.vitals.height} cm</div>
                            <div><strong>Weight:</strong> {report.vitals.weight} kg</div>
                            <div className="col-span-2"><strong>BMI:</strong> {report.bmi.toFixed(1)}</div>
                        </div>
                    </div>
                    <div className="bg-secondary p-6 rounded-lg shadow-lg print-bg-secondary">
                        <h2 className="text-xl font-bold text-highlight mb-4">Risk Prediction Overview</h2>
                        <div className="space-y-2">
                            {report.riskAnalysis.predictions.map(p => <RiskItem key={p.disease} prediction={p} />)}
                        </div>
                    </div>
                 </div>

                {userProfile.healthNotes && userProfile.healthNotes.length > 0 && (
                     <div className="mt-8 bg-secondary p-6 rounded-lg shadow-lg print-bg-secondary">
                         <h2 className="text-xl font-bold text-highlight mb-4">Health Notes from AI Companion</h2>
                         <ul className="list-disc list-inside text-text-primary print-text-black space-y-1">
                             {userProfile.healthNotes.map((note, index) => (
                                 <li key={index}>{note}</li>
                             ))}
                         </ul>
                         <p className="text-xs text-light mt-2 print-text-black">These are notes captured from your conversations with the AI Companion and are used to provide more personalized analysis.</p>
                     </div>
                 )}
                 
                  <div className="mt-8 bg-secondary p-6 rounded-lg shadow-lg print-bg-secondary">
                     <h2 className="text-xl font-bold text-highlight mb-4">AI-Powered Analysis & Recommendations</h2>
                     <div className="text-text-primary whitespace-pre-wrap print-text-black prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: report.riskAnalysis.recommendations.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></div>
                 </div>
                 
                 {healthHistory.length >= 2 && (
                     <div className="mt-8 bg-secondary p-6 rounded-lg shadow-lg print-bg-secondary">
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