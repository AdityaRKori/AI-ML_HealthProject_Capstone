import React, { useState, useEffect, useMemo } from 'react';
import type { UserProfile, HealthRecord, AITrendAnalysis } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area } from 'recharts';
// FIX: Changed POPULATION_AVERAGES to GLOBAL_POPULATION_AVERAGES as it is the correct exported constant.
import { GLOBAL_POPULATION_AVERAGES, VITAL_CHART_RANGES } from '../constants';
import { getAITrendAnalysis } from '../services/apiService';

interface ProgressViewProps {
    userProfile: UserProfile;
}

type TimeRange = 'weekly' | 'monthly' | 'yearly';

// --- Sub-component moved to top-level ---

interface VitalTrendChartProps {
    data: any[];
    dataKey: string;
    title: string;
    populationAverage: number;
    healthyRange: { min: number, max: number };
}

const VitalTrendChart: React.FC<VitalTrendChartProps> = ({ data, dataKey, title, populationAverage, healthyRange }) => {
    const chartData = data.map(record => ({
        ...record,
        populationAverage,
        healthyRange: [healthyRange.min, healthyRange.max],
    }));
    
    // Ensure Y-axis domain covers all data points comfortably
    const yValues = data.map(d => d[dataKey]);
    const yMin = Math.min(...yValues, populationAverage, healthyRange.min);
    const yMax = Math.max(...yValues, populationAverage, healthyRange.max);
    const yDomain: [number, number] = [Math.floor(yMin * 0.95), Math.ceil(yMax * 1.05)];

    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-highlight mb-4">{title}</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-accent)" />
                    <XAxis dataKey="date" stroke="var(--color-text)" fontSize={12} />
                    <YAxis stroke="var(--color-text)" fontSize={12} domain={yDomain} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-primary)', border: '1px solid var(--color-accent)', borderRadius: '0.5rem' }} />
                    <Legend wrapperStyle={{fontSize: "12px"}} />
                    <defs>
                        <linearGradient id="healthyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="healthyRange"
                        stroke="var(--color-success)"
                        strokeWidth={0}
                        fill="url(#healthyGradient)"
                        name="Healthy Range"
                    />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke="var(--color-highlight)"
                        strokeWidth={2}
                        dot={{ r: 4, fill: 'var(--color-highlight)' }}
                        activeDot={{ r: 8 }}
                        name="Your Trend"
                    />
                    <Line
                        type="monotone"
                        dataKey="populationAverage"
                        stroke="var(--color-danger)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Population Avg"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Main ProgressView Component ---

const ProgressView: React.FC<ProgressViewProps> = ({ userProfile }) => {
    const { healthHistory } = userProfile;
    const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
    const [analysis, setAnalysis] = useState<AITrendAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const filteredData = useMemo(() => {
        const now = new Date();
        const getStartDate = (range: TimeRange) => {
            const date = new Date(now);
            if (range === 'weekly') date.setDate(now.getDate() - 7);
            else if (range === 'monthly') date.setMonth(now.getMonth() - 1);
            else if (range === 'yearly') date.setFullYear(now.getFullYear() - 1);
            return date;
        };

        const startDate = getStartDate(timeRange);
        return healthHistory
            .filter(record => new Date(record.date) >= startDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [healthHistory, timeRange]);

    useEffect(() => {
        if (filteredData.length >= 2) {
            const fetchAnalysis = async () => {
                setIsLoading(true);
                try {
                    const result = await getAITrendAnalysis(filteredData);
                    setAnalysis(result);
                } catch (error) {
                    console.error("Failed to fetch AI trend analysis:", error);
                    setAnalysis(null);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAnalysis();
        } else {
            setAnalysis(null);
        }
    }, [filteredData]);

    const chartFormattedData = useMemo(() => {
        return filteredData.map(record => ({
            date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            BMI: parseFloat(record.bmi.toFixed(1)),
            systolicBP: record.vitals.systolicBP,
            diastolicBP: record.vitals.diastolicBP,
            Glucose: record.vitals.bloodGlucose,
            Cholesterol: record.vitals.cholesterol,
        }));
    }, [filteredData]);


    if (healthHistory.length < 2) {
        return (
            <div className="text-center p-8 bg-secondary rounded-lg animate-fade-in">
                <h1 className="text-3xl font-bold mb-4 text-text-primary">Your Health Journey</h1>
                <p className="text-light">You need at least two health check-ups to see your progress. Keep tracking to visualize your journey!</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Your Progress Tracker</h1>
                <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg">
                    {(['weekly', 'monthly', 'yearly'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${timeRange === range ? 'bg-highlight text-white' : 'text-light hover:bg-accent'}`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && (
                <div className="text-center p-8 bg-secondary rounded-lg">
                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-highlight mx-auto"></div>
                     <p className="mt-4 text-text-primary text-sm">AI is analyzing your trends...</p>
                </div>
            )}

            {analysis && !isLoading && (
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-highlight mb-4">AI Trend Analysis</h2>
                    <p className="text-light mb-4">{analysis.overallAssessment}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <h3 className="font-semibold text-success mb-2">Positive Trends</h3>
                            <ul className="list-disc list-inside space-y-1 text-light">
                                {analysis.positiveTrends.length > 0 ? analysis.positiveTrends.map((t, i) => <li key={i}>{t}</li>) : <li>No significant improvements noted.</li>}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-warning mb-2">Areas for Improvement</h3>
                            <ul className="list-disc list-inside space-y-1 text-light">
                                 {analysis.areasForImprovement.length > 0 ? analysis.areasForImprovement.map((t, i) => <li key={i}>{t}</li>) : <li>No significant concerns noted.</li>}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-highlight mb-2">Dynamic Recommendations</h3>
                            <ul className="list-disc list-inside space-y-1 text-light">
                                 {analysis.dynamicRecommendations.length > 0 ? analysis.dynamicRecommendations.map((t, i) => <li key={i}>{t}</li>) : <li>Keep up the consistent tracking!</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {chartFormattedData.length < 2 ? (
                 <div className="text-center p-8 bg-secondary rounded-lg">
                    <p className="text-light">Not enough data for the selected time range. Please select a wider range or add more check-ups.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <VitalTrendChart 
                        data={chartFormattedData} 
                        dataKey="systolicBP" 
                        title="Blood Pressure (Systolic) Trend" 
                        // FIX: Changed POPULATION_AVERAGES to GLOBAL_POPULATION_AVERAGES
                        populationAverage={GLOBAL_POPULATION_AVERAGES.systolicBP}
                        healthyRange={VITAL_CHART_RANGES.systolicBP}
                    />
                    <VitalTrendChart 
                        data={chartFormattedData} 
                        dataKey="Glucose" 
                        title="Blood Glucose Trend" 
                        // FIX: Changed POPULATION_AVERAGES to GLOBAL_POPULATION_AVERAGES
                        populationAverage={GLOBAL_POPULATION_AVERAGES.bloodGlucose}
                        healthyRange={VITAL_CHART_RANGES.bloodGlucose}
                    />
                     <VitalTrendChart 
                        data={chartFormattedData} 
                        dataKey="BMI" 
                        title="BMI Trend" 
                        // FIX: Changed POPULATION_AVERAGES to GLOBAL_POPULATION_AVERAGES
                        populationAverage={GLOBAL_POPULATION_AVERAGES.bmi}
                        healthyRange={VITAL_CHART_RANGES.bmi}
                    />
                     <VitalTrendChart 
                        data={chartFormattedData} 
                        dataKey="Cholesterol" 
                        title="Cholesterol Trend" 
                        // FIX: Changed POPULATION_AVERAGES to GLOBAL_POPULATION_AVERAGES
                        populationAverage={GLOBAL_POPULATION_AVERAGES.cholesterol}
                        healthyRange={VITAL_CHART_RANGES.cholesterol}
                    />
                </div>
            )}
        </div>
    );
};

export default ProgressView;