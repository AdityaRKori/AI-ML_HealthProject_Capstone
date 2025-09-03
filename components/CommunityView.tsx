
import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, CommunityData, WorldPopulation, TrendingDisease, GlobalDiseaseStat } from '../types';
import { getCountryData, getWorldPopulation, getTrendingDiseases, getGlobalTrendingDiseases } from '../services/apiService';
import { COUNTRIES, ICONS } from '../constants';
import { estimateCityPopulation } from '../utils/helpers';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';


interface CommunityViewProps {
    userProfile: UserProfile;
}

const AnimatedCounter: React.FC<{ targetValue: number }> = ({ targetValue }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const prevValueRef = useRef(0);
    // FIX: Initialize useRef with null to prevent "Expected 1 arguments, but got 0" error.
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = prevValueRef.current;
        const endValue = targetValue;
        const duration = 1500; // ms
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const animatedValue = Math.floor(startValue + (endValue - startValue) * percentage);
            setCurrentValue(animatedValue);

            if (progress < duration) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setCurrentValue(endValue); // Ensure it ends exactly on the target
                prevValueRef.current = endValue;
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [targetValue]);

    return <span>{currentValue.toLocaleString()}</span>;
};

const CommunityView: React.FC<CommunityViewProps> = ({ userProfile }) => {
    const [communityData, setCommunityData] = useState<CommunityData | null>(null);
    const [worldPopulation, setWorldPopulation] = useState<WorldPopulation | null>(null);
    const [trendingDiseases, setTrendingDiseases] = useState<TrendingDisease[]>([]);
    const [globalDiseases, setGlobalDiseases] = useState<GlobalDiseaseStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const countryCode = COUNTRIES.find(c => c.name === userProfile.country)?.code || userProfile.country;
                const countryName = COUNTRIES.find(c => c.code === countryCode)?.name || userProfile.country;
                const [countryData, worldPop, diseases, globalStats] = await Promise.all([
                    getCountryData(countryCode),
                    getWorldPopulation(),
                    getTrendingDiseases(userProfile.country, userProfile.city),
                    getGlobalTrendingDiseases(countryName)
                ]);

                const cityPop = countryData.population ? estimateCityPopulation(countryData.population) : null;

                setCommunityData({ ...countryData, cityPopulation: cityPop });
                setWorldPopulation(worldPop);
                setTrendingDiseases(diseases);
                setGlobalDiseases(globalStats);

            } catch (err) {
                setError('Failed to fetch community health data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userProfile.country, userProfile.city]);

    if (isLoading) {
        return <div className="text-center p-8"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto"></div> <p className="mt-4">Fetching live community data...</p></div>;
    }

    if (error) {
        return <div className="text-center p-8 text-danger">{error}</div>;
    }

    const formatPopulation = (value: number | null | undefined, unit: 'B' | 'M' | '' = '') => {
        if (value === null || value === undefined) return 'N/A';
        const num = value || 0;
        if (unit === 'B') return `${(num / 1e9).toFixed(2)} B`;
        if (unit === 'M') return `${(num / 1e6).toFixed(2)} M`;
        return num.toLocaleString();
    }

    const StatCard: React.FC<{ title: string; value: number | null | undefined; description: string, format?: 'B' | 'M' | '' }> = ({ title, value, description, format = '' }) => (
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <h3 className="text-lg text-light/70">{title}</h3>
            <p className="text-4xl font-bold text-highlight">
                {value ? <AnimatedCounter targetValue={value} /> : 'N/A'}
            </p>
            <p className="text-sm text-light/50">{description}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-light">Community Health Dashboard</h1>
            <p className="text-accent">Live public health data for {communityData?.countryName || userProfile.country}.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="World Population"
                    value={worldPopulation?.value}
                    description="Latest estimate from The World Bank."
                />
                <StatCard
                    title={`${communityData?.countryName} Population`}
                    value={communityData?.population}
                    description={`Population of your selected country.`}
                />
                 <StatCard
                    title={`${userProfile.city} Population (Est.)`}
                    value={communityData?.cityPopulation}
                    description={`Estimated population for your city.`}
                />
                <StatCard
                    title="Crude Death Rate"
                    value={communityData?.deathRate ? Math.round(communityData.deathRate * 100) / 100 : null}
                    description={`Per 1,000 people in ${communityData?.countryName}.`}
                />
            </div>

            <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-highlight">Live Local Health Statistics</h2>
                <p className="text-light/70 mb-4">Below are AI-generated statistics on potential health trends in your city for this month, based on public health models. These are simulated figures for informational purposes only.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trendingDiseases.map(disease => (
                         <div key={disease.name} className="bg-accent p-4 rounded-lg flex flex-col">
                           <div className="flex items-center mb-2">
                                <span className="text-warning mr-2">{ICONS.warning}</span>
                                <h3 className="font-bold text-lg text-light">{disease.name}</h3>
                           </div>
                           <p className="text-3xl font-bold text-highlight my-2">
                                <AnimatedCounter targetValue={disease.cases} /> 
                                <span className="text-base font-normal text-light/70 ml-2">simulated cases</span>
                           </p>
                           <div className="mt-auto pt-2 border-t border-primary/50">
                             <p className="text-sm text-light/80"><strong>Safety Tip:</strong> {disease.prevention}</p>
                           </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-highlight">Global Health Trends Comparison</h2>
                <p className="text-light/70 mb-4">
                    This chart compares simulated global cases of trending diseases with estimated cases in your country ({communityData?.countryName}). This provides a perspective on how global trends might relate to your region. All data is AI-generated for illustrative purposes.
                </p>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={globalDiseases}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#415A77" />
                            <XAxis dataKey="name" stroke="#E0E1DD" fontSize={12} />
                            <YAxis stroke="#E0E1DD" fontSize={12} tickFormatter={(value: number) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1B263B', border: 'none', borderRadius: '0.5rem' }}
                                formatter={(value: number) => value.toLocaleString()}
                            />
                            <Legend />
                            <Bar dataKey="globalCases" fill="#415A77" name="Global Cases (Simulated)" />
                            <Bar dataKey="countryCases" fill="#3B82F6" name={`${communityData?.countryName} Cases (Est.)`} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Understanding the Data</h2>
                <p className="text-light/80">
                    This dashboard provides a high-level overview of public health indicators from The World Bank. City population is an estimate derived from country-level data. Local health alerts are generated by AI and are not official government advisories. Always consult official sources and healthcare professionals for health guidance.
                </p>
            </div>
        </div>
    );
};

export default CommunityView;