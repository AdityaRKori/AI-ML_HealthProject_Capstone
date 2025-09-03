
import React from 'react';
import type { UserProfile } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ProgressViewProps {
    userProfile: UserProfile;
}

const ProgressView: React.FC<ProgressViewProps> = ({ userProfile }) => {
    const { healthHistory } = userProfile;

    if (healthHistory.length < 2) {
        return (
            <div className="text-center p-8 bg-secondary rounded-lg">
                <h1 className="text-3xl font-bold mb-4">Your Health Journey</h1>
                <p className="text-accent">You need at least two health check-ups to see your progress. Keep tracking to visualize your journey!</p>
            </div>
        );
    }
    
    const chartData = healthHistory.map(record => ({
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        BMI: record.bmi,
        'Systolic BP': record.vitals.systolicBP,
        'Diastolic BP': record.vitals.diastolicBP,
        Glucose: record.vitals.bloodGlucose,
        Cholesterol: record.vitals.cholesterol,
        'Overall Risk': record.riskAnalysis.predictions.reduce((acc, p) => acc + p.score, 0) / record.riskAnalysis.predictions.length * 100
    }));

    const ChartCard: React.FC<{ dataKey: string; stroke: string; title: string; domain: [number, number] }> = ({ dataKey, stroke, title, domain }) => (
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-highlight mb-4">{title}</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#415A77" />
                    <XAxis dataKey="date" stroke="#E0E1DD" />
                    <YAxis stroke="#E0E1DD" domain={domain} />
                    <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: 'none', borderRadius: '0.5rem' }} />
                    <Legend />
                    <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-light">Your Progress Tracker</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard dataKey="Overall Risk" stroke="#EF4444" title="Overall Risk Score Trend" domain={[0, 100]} />
                <ChartCard dataKey="BMI" stroke="#3B82F6" title="BMI Trend" domain={[15, 40]}/>
                <ChartCard dataKey="Systolic BP" stroke="#F59E0B" title="Blood Pressure (Systolic) Trend" domain={[80, 180]} />
                <ChartCard dataKey="Glucose" stroke="#10B981" title="Blood Glucose Trend" domain={[60, 200]} />
            </div>
        </div>
    );
};

export default ProgressView;
