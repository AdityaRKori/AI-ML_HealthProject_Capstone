import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, RegionalHealthData, ThematicData, TrendingDisease, GlobalDiseaseStat, DiseaseFactSheet, RegionalTopicData, CommunityStats } from '../types';
import { getTrendingDiseases, getRegionalHealthData, getThematicMapData, getGlobalDiseaseStats, getDiseaseFactSheet, getRegionalTopicData, getCommunityStats } from '../services/apiService';
import KarnatakaMap from './KarnatakaMap';
import IndiaMap from './IndiaMap';
import AirQualityReport from './AirQualityReport';
import TopicReport from './TopicReport';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ICONS } from '../constants';

interface CommunityViewProps {
    userProfile: UserProfile;
}

// --- Helper Components (moved to top-level) ---

const AnimatedCounter: React.FC<{ targetValue: number }> = ({ targetValue }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const prevValueRef = useRef(0);
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
                setCurrentValue(endValue);
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

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | null; }> = ({ icon, title, value }) => {
    return (
        <div className="bg-accent p-4 rounded-lg flex items-center gap-4">
            <div className="text-highlight">{icon}</div>
            <div>
                <p className="text-sm text-light">{title}</p>
                <p className="text-2xl font-bold text-text-primary">
                    {value !== null ? <AnimatedCounter targetValue={value} /> : 'N/A'}
                </p>
            </div>
        </div>
    );
};


const DiseaseFactSheetViewer: React.FC<{ diseaseName: string }> = ({ diseaseName }) => {
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
                setError("Could not load fact sheet.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFacts();
    }, [diseaseName]);

    if (isLoading) return <div className="text-center p-2 text-xs text-light">Loading facts...</div>;
    if (error) return <div className="text-center p-2 text-xs text-danger">{error}</div>;
    if (!factSheet) return null;

    return (
        <div className="mt-2 p-3 bg-primary rounded-md space-y-2 text-xs animate-fade-in">
            <div><strong className="text-highlight">Cause:</strong> <span className="text-light">{factSheet.cause}</span></div>
            <div><strong className="text-highlight">Prevention:</strong> <span className="text-light">{factSheet.prevention}</span></div>
            <div><strong className="text-highlight">History:</strong> <span className="text-light">{factSheet.historicalContext}</span></div>
            <div><strong className="text-highlight">Statistics:</strong> <span className="text-light">{factSheet.statistics}</span></div>
        </div>
    );
};


const TrendingDiseaseCard: React.FC<{ disease: TrendingDisease }> = ({ disease }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-accent p-4 rounded-lg flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-lg text-text-primary">{disease.name}</h3>
                <p className="text-3xl font-bold text-danger my-2">{disease.cases.toLocaleString()}</p>
                <p className="text-sm text-light">Simulated monthly cases</p>
            </div>
            <div className="mt-4">
                <h4 className="font-semibold text-text-primary">Prevention Tip:</h4>
                <p className="text-sm text-light mb-2">{disease.prevention}</p>
                 <button onClick={() => setIsOpen(!isOpen)} className="text-xs text-highlight hover:underline flex items-center gap-1">
                    {isOpen ? 'Show Less' : 'Learn More'}
                    <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>{ICONS.chevronDown}</span>
                </button>
                {isOpen && <DiseaseFactSheetViewer diseaseName={disease.name} />}
            </div>
        </div>
    );
};


const THEMATIC_TOPICS = [
    { id: 'air_pollution', name: 'Air Pollution (AQI)' },
    { id: 'seasonal_diseases', name: 'Seasonal Diseases' },
    { id: 'water_borne_diseases', name: 'Water-Borne Diseases' },
];

const CommunityView: React.FC<CommunityViewProps> = ({ userProfile }) => {
    const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
    const [trendingDiseases, setTrendingDiseases] = useState<TrendingDisease[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalDiseaseStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [regionalAqiData, setRegionalAqiData] = useState<RegionalHealthData | null>(null);
    const [regionalTopicData, setRegionalTopicData] = useState<RegionalTopicData | null>(null);
    const [isRegionDataLoading, setIsRegionDataLoading] = useState(false);

    const [thematicTopic, setThematicTopic] = useState<(typeof THEMATIC_TOPICS)[number]['id']>(THEMATIC_TOPICS[0].id);
    const [thematicData, setThematicData] = useState<ThematicData | null>(null);
    const [isThematicDataLoading, setIsThematicDataLoading] = useState(false);
    
    const [activeMap, setActiveMap] = useState<'my_region' | 'india'>('my_region');

    const isKarnatakaUser = userProfile.country === 'IN' && userProfile.city === 'Bangalore';
    const mapScope = activeMap === 'my_region' ? (isKarnatakaUser ? 'Karnataka' : 'India') : 'India';
    const regionTypeForApi = mapScope === 'Karnataka' ? 'karnataka_districts' : 'india_states';

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [diseases, stats, commStats] = await Promise.all([
                    getTrendingDiseases(userProfile.country, userProfile.city),
                    getGlobalDiseaseStats(userProfile.country),
                    getCommunityStats(userProfile.country, userProfile.city)
                ]);
                setTrendingDiseases(diseases);
                setGlobalStats(stats);
                setCommunityStats(commStats);
            } catch (err) {
                setError('Failed to fetch community health data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [userProfile.city, userProfile.country]);

    useEffect(() => {
        const fetchThematicData = async () => {
            if (!thematicTopic) return;
            setIsThematicDataLoading(true);
            setSelectedRegion(null);
            setRegionalAqiData(null);
            setRegionalTopicData(null);
            try {
                const data = await getThematicMapData(thematicTopic as any, regionTypeForApi);
                setThematicData(data);
            } catch (err) {
                console.error(`Failed to fetch thematic data for ${thematicTopic}:`, err);
                setThematicData(null);
            } finally {
                setIsThematicDataLoading(false);
            }
        };
        fetchThematicData();
    }, [thematicTopic, regionTypeForApi]);
    
    const handleRegionSelect = async (regionName: string) => {
        setSelectedRegion(regionName);
        setIsRegionDataLoading(true);
        setRegionalAqiData(null);
        setRegionalTopicData(null);
        
        try {
            if (thematicTopic === 'air_pollution') {
                const data = await getRegionalHealthData(regionName);
                setRegionalAqiData(data);
            } else {
                const data = await getRegionalTopicData(regionName, thematicTopic);
                setRegionalTopicData(data);
            }
        } catch (err) {
            console.error("Failed to fetch regional data:", err);
            setError(`Could not load AI analysis for ${regionName}.`);
        } finally {
            setIsRegionDataLoading(false);
        }
    };
    
    const ThematicMapLegend = ({ data }: { data: ThematicData | null }) => {
        if (!data) return null;
        const values = Object.values(data).map(d => d.value);
        if (values.length === 0) return null;
        const min = Math.min(...values);
        const max = Math.max(...values);
        return (
            <div className="p-2 bg-accent rounded-lg text-xs text-light flex items-center justify-center gap-4">
                <span>Low</span>
                <div className="w-24 h-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded"></div>
                <span>High</span>
                <span className="font-mono text-text-primary">({min.toLocaleString()} - {max.toLocaleString()})</span>
            </div>
        );
    };

    if (isLoading) {
        return <div className="text-center p-8"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto"></div> <p className="mt-4 text-text-primary">Fetching community health data...</p></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Community Health Dashboard</h1>
                <p className="text-light">AI-simulated public health data for {userProfile.city}, {userProfile.country}.</p>
            </div>
            
            {error && <div className="text-center p-4 bg-danger/20 text-danger rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={ICONS.world} title="World Population" value={communityStats?.worldPopulation || null} />
                <StatCard icon={ICONS.flag} title={`${userProfile.country} Population`} value={communityStats?.countryPopulation || null} />
                <StatCard icon={ICONS.community} title={`${userProfile.city} Population`} value={communityStats?.cityPopulation || null} />
            </div>

            <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-highlight">Trending Health Topics in {userProfile.city}</h2>
                {trendingDiseases.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {trendingDiseases.map((disease) => <TrendingDiseaseCard key={disease.name} disease={disease} />)}
                    </div>
                ) : !error && (
                    <p className="text-light">Could not load local health trends at this time.</p>
                )}
            </div>
            
             <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-highlight">Global vs. National Disease Burden</h2>
                <p className="text-sm text-light mb-4">Simulated prevalence per 100,000 people.</p>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={globalStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-accent)" />
                        <XAxis dataKey="name" stroke="var(--color-text)" />
                        <YAxis stroke="var(--color-text)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-primary)', border: '1px solid var(--color-accent)' }}/>
                        <Legend />
                        <Bar dataKey="countryCases" fill="var(--color-highlight)" name={userProfile.country} />
                        <Bar dataKey="globalCases" fill="var(--color-danger)" name="Global Average" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-highlight">Interactive Health Map: {mapScope}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-primary p-1 rounded-lg">
                            <button
                                onClick={() => setActiveMap('my_region')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeMap === 'my_region' ? 'bg-highlight text-white' : 'text-light hover:bg-accent'}`}
                            >
                                My Region
                            </button>
                            <button
                                onClick={() => setActiveMap('india')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeMap === 'india' ? 'bg-highlight text-white' : 'text-light hover:bg-accent'}`}
                            >
                                India
                            </button>
                        </div>
                        <select
                            value={thematicTopic}
                            onChange={(e) => setThematicTopic(e.target.value as any)}
                            className="bg-accent text-text-primary border-transparent rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-2 text-sm"
                        >
                            {THEMATIC_TOPICS.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-center mb-4">
                    {isThematicDataLoading ? <p className="text-sm text-light">Loading map data...</p> : <ThematicMapLegend data={thematicData} />}
                </div>

                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                    <div className="lg:col-span-3 w-full h-auto relative">
                        {isThematicDataLoading && <div className="absolute inset-0 bg-secondary/50 flex items-center justify-center rounded-lg"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-highlight"></div></div>}
                        
                        {mapScope === 'Karnataka' ? (
                            <KarnatakaMap onDistrictSelect={handleRegionSelect} selectedDistrict={selectedRegion} thematicData={thematicData} />
                        ) : (
                            <IndiaMap onStateSelect={handleRegionSelect} selectedState={selectedRegion} thematicData={thematicData} />
                        )}
                    </div>
                    <div className="lg:col-span-2">
                        {isRegionDataLoading && (
                            <div className="text-center p-8 bg-accent rounded-lg">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-highlight mx-auto"></div>
                                <p className="mt-4 text-text-primary text-sm">AI is analyzing {selectedRegion}...</p>
                            </div>
                        )}
                        {regionalAqiData && !isRegionDataLoading && (
                           <AirQualityReport data={regionalAqiData} district={selectedRegion!} />
                        )}
                         {regionalTopicData && !isRegionDataLoading && (
                           <TopicReport data={regionalTopicData} district={selectedRegion!} />
                        )}
                        {!selectedRegion && !isRegionDataLoading && (
                            <div className="text-center p-8 bg-accent rounded-lg h-full flex flex-col justify-center">
                                <p className="text-light">Click on a {mapScope === 'Karnataka' ? 'district' : 'state'} to view detailed, AI-powered environmental and health insights.</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default CommunityView;