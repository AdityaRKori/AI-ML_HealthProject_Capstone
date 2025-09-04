import React from 'react';
import type { UserProfile } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ProgressViewProps {
    userProfile: UserProfile;
}

// --- Sub-component moved to top-level ---

interface ChartCardProps {
    data: any[];
    dataKey: string;
    stroke: string;
    title: string;
    domain: [number | string, number | string];
}

const ChartCard: React.FC<ChartCardProps> = ({ data, dataKey, stroke, title, domain }) => (
    <div className="bg-secondary p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-highlight mb-4">{title}</h2>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-accent)" />
                <XAxis dataKey="date" stroke="var(--color-text)" />
                <YAxis stroke="var(--color-text)" domain={domain} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-accent)', borderRadius: '0.5rem' }} />
                <Legend />
                <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
            </LineChart>
        </ResponsiveContainer>
    </div>
);


// --- Main ProgressView Component ---

const ProgressView: React.FC<ProgressViewProps> = ({ userProfile }) => {
    const { healthHistory } = userProfile;

    if (healthHistory.length < 2) {
        return (
            <div className="text-center p-8 bg-secondary rounded-lg animate-fade-in">
                <h1 className="text-3xl font-bold mb-4 text-text-primary">Your Health Journey</h1>
                <p className="text-light">You need at least two health check-ups to see your progress. Keep tracking to visualize your journey!</p>
            </div>
        );
    }
    
    const chartData = healthHistory.map(record => ({
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        BMI: parseFloat(record.bmi.toFixed(1)),
        'Systolic BP': record.vitals.systolicBP,
        'Diastolic BP': record.vitals.diastolicBP,
        Glucose: record.vitals.bloodGlucose,
        Cholesterol: record.vitals.cholesterol,
        'Overall Risk': parseFloat((record.riskAnalysis.predictions.reduce((acc, p) => acc + p.score, 0) / record.riskAnalysis.predictions.length * 100).toFixed(1))
    }));

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-text-primary">Your Progress Tracker</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard data={chartData} dataKey="Overall Risk" stroke="var(--color-danger)" title="Overall Risk Score Trend" domain={[0, 100]} />
                <ChartCard data={chartData} dataKey="BMI" stroke="var(--color-highlight)" title="BMI Trend" domain={['dataMin - 2', 'dataMax + 2']}/>
                <ChartCard data={chartData} dataKey="Systolic BP" stroke="var(--color-warning)" title="Blood Pressure (Systolic) Trend" domain={['dataMin - 10', 'dataMax + 10']} />
                <ChartCard data={chartData} dataKey="Glucose" stroke="var(--color-success)" title="Blood Glucose Trend" domain={['dataMin - 10', 'dataMax + 10']} />
            </div>
        </div>
    );
};

export default ProgressView;