import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { UserProfile, GlobalTrendingStats, CityLiveFeedEvent, SearchedDiseaseStats, LiveDiseaseCase } from '../types';
import { getGlobalTrendingDiseaseStats, getCityLiveFeed, getDiseaseStats, getLiveGlobalCases } from '../services/apiService';
// FIX: Changed to a named import to match the export from GlobalLiveMap.tsx
import { GlobalLiveMap } from './GlobalLiveMap';
import DiseaseInfoModal from './DiseaseInfoModal';

interface GlobalStatsViewProps {
    userProfile: UserProfile;
}

// --- Helper Components ---
const AnimatedCounter: React.FC<{ targetValue: number }> = ({ targetValue }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const prevValueRef = useRef(0);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = prevValueRef.current;
        const endValue = targetValue;
        const duration = 1500;
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

// FIX: Added userProfile to the component's props to resolve the "Cannot find name 'userProfile'" error.
interface UserStatCardProps {
    stats: GlobalTrendingStats | null;
    userProfile: UserProfile;
}

const UserStatCard: React.FC<UserStatCardProps> = ({ stats, userProfile }) => {
    if (!stats) return null;
    return (
        <div className="bg-accent p-4 rounded-lg">
            <h3 className="font-bold text-lg text-text-primary">{stats.userCountryStats ? `${stats.trendingDiseaseName} in ${userProfile.country} / ${userProfile.city}` : 'Loading...'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-center">
                <div>
                    <p className="text-sm text-light">Country Cases</p>
                    <p className="text-2xl font-bold text-highlight"><AnimatedCounter targetValue={stats.userCountryStats?.cases || 0} /></p>
                </div>
                 <div>
                    <p className="text-sm text-light">City Cases</p>
                    <p className="text-2xl font-bold text-highlight"><AnimatedCounter targetValue={stats.userCityStats?.cases || 0} /></p>
                </div>
                <div>
                    <p className="text-sm text-light">Deaths</p>
                    <p className="text-2xl font-bold text-warning"><AnimatedCounter targetValue={stats.userCountryStats?.deaths || 0} /></p>
                </div>
                <div>
                    <p className="text-sm text-light">Cures</p>
                    <p className="text-2xl font-bold text-success"><AnimatedCounter targetValue={stats.userCountryStats?.cures || 0} /></p>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const GlobalStatsView: React.FC<GlobalStatsViewProps> = ({ userProfile }) => {
    const [stats, setStats] = useState<GlobalTrendingStats | null>(null);
    const [liveCases, setLiveCases] = useState<LiveDiseaseCase[]>([]);
    const [cityFeed, setCityFeed] = useState<CityLiveFeedEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchedDisease, setSearchedDisease] = useState<SearchedDiseaseStats | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [modalDisease, setModalDisease] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [trendingStats, cases] = await Promise.all([
                    getGlobalTrendingDiseaseStats(userProfile.country, userProfile.city),
                    getLiveGlobalCases()
                ]);
                setStats(trendingStats);
                setLiveCases(cases);
            } catch (err: any) {
                setError('Failed to fetch global health data');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchLiveCasesPeriodically = async () => {
             try {
                const cases = await getLiveGlobalCases();
                setLiveCases(cases);
            } catch (err) {
                console.error("Failed to refresh live global cases:", err);
            }
        };

        fetchInitialData();
        const interval = setInterval(fetchLiveCasesPeriodically, 120000); // Poll every 2 minutes

        return () => clearInterval(interval);
    }, [userProfile.city, userProfile.country]);

    useEffect(() => {
        const fetchFeed = () => {
            getCityLiveFeed(userProfile.city)
                .then(newFeed => {
                    setCityFeed(prevFeed => {
                        const existingIds = new Set(prevFeed.map(f => f.id));
                        const uniqueNew = newFeed.filter(f => !existingIds.has(f.id));
                        return [...uniqueNew, ...prevFeed].slice(0, 10);
                    });
                })
                .catch(err => console.error("Failed to fetch city live feed:", err));
        };
        
        fetchFeed(); // Fetch immediately on component mount
        const interval = setInterval(fetchFeed, 90000); // Reverted to 90 seconds

        return () => clearInterval(interval);
    }, [userProfile.city]);


    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsSearching(true);
        setSearchedDisease(null);
        try {
            const result = await getDiseaseStats(searchTerm, userProfile.country);
            setSearchedDisease(result);
        } catch (err) {
            console.error(`Failed to fetch stats for ${searchTerm}:`, err);
            setError(`Could not find data for "${searchTerm}". Please check the spelling or try another disease.`);
        } finally {
            setIsSearching(false);
        }
    };

    const sortedCountryBreakdown = useMemo(() => {
        return searchedDisease?.countryBreakdown.sort((a, b) => b.cases - a.cases);
    }, [searchedDisease]);


    if (isLoading) {
        return <div className="text-center p-8"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto"></div> <p className="mt-4 text-text-primary">Fetching global health data...</p></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {modalDisease && <DiseaseInfoModal diseaseName={modalDisease} onClose={() => setModalDisease(null)} />}

            <div>
                <h1 className="text-3xl font-bold text-text-primary">Global Health Statistics</h1>
                <p className="text-light">AI-simulated global health data, updated in near real-time.</p>
            </div>
            
            {error && <div className="text-center p-4 bg-danger/20 text-danger rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlobalLiveMap liveCases={liveCases} />
                 <div className="space-y-4">
                     {stats && (
                        <div className="bg-secondary p-4 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-highlight mb-4">Seasonal Trend Focus: {stats.trendingDiseaseName}</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-accent p-3 rounded-lg">
                                    <p className="text-light">Highest Cases</p>
                                    <p className="font-bold text-text-primary text-lg">{stats.highestCases.country}</p>
                                    <p className="text-danger font-semibold"><AnimatedCounter targetValue={stats.highestCases.value} /></p>
                                </div>
                                <div className="bg-accent p-3 rounded-lg">
                                    <p className="text-light">Lowest Cases</p>
                                    <p className="font-bold text-text-primary text-lg">{stats.lowestCases.country}</p>
                                    <p className="text-success font-semibold"><AnimatedCounter targetValue={stats.lowestCases.value} /></p>
                                </div>
                                 <div className="bg-accent p-3 rounded-lg">
                                    <p className="text-light">Highest Deaths</p>
                                    <p className="font-bold text-text-primary text-lg">{stats.highestDeaths.country}</p>
                                    <p className="text-danger font-semibold"><AnimatedCounter targetValue={stats.highestDeaths.value} /></p>
                                </div>
                                 <div className="bg-accent p-3 rounded-lg">
                                    <p className="text-light">Highest Cures</p>
                                    <p className="font-bold text-text-primary text-lg">{stats.highestCures.country}</p>
                                    <p className="text-success font-semibold"><AnimatedCounter targetValue={stats.highestCures.value} /></p>
                                </div>
                            </div>
                        </div>
                    )}
                    <UserStatCard stats={stats} userProfile={userProfile} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-secondary p-6 rounded-lg shadow-lg">
                     <h2 className="text-2xl font-bold text-highlight mb-4">Global Disease Database</h2>
                     <div className="flex gap-2">
                         <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search for a disease (e.g., Measles)"
                            className="flex-grow bg-accent text-text-primary border-transparent rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3"
                         />
                         <button onClick={handleSearch} disabled={isSearching} className="bg-gradient-theme text-white font-bold py-3 px-5 rounded-lg hover:opacity-90 disabled:opacity-50">
                             {isSearching ? '...' : 'Search'}
                         </button>
                     </div>

                     {isSearching && <div className="text-center p-4">Searching...</div>}

                     {searchedDisease && (
                         <div className="mt-4 animate-fade-in">
                             <h3 className="text-xl font-bold text-text-primary mb-2">Results for: {searchedDisease.diseaseName}</h3>
                             <p className="text-light text-sm mb-4">Total Global Cases: <span className="font-bold text-highlight">{searchedDisease.totalGlobalCases.toLocaleString()}</span></p>
                             
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-accent p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Common Symptoms</h4>
                                    <ul className="list-disc list-inside text-sm text-light space-y-1">
                                        {searchedDisease.symptoms.map(s => <li key={s}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-accent p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Recognized Drugs/Treatments</h4>
                                    <ul className="list-disc list-inside text-sm text-light space-y-1">
                                        {searchedDisease.recognizedDrugs.map(d => <li key={d}>{d}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-accent p-4 rounded-lg md:col-span-2">
                                     <h4 className="font-semibold mb-2">WHO Guidelines</h4>
                                     <div className="flex gap-4 text-sm">
                                        <div className="flex-1">
                                            <strong className="text-success">Prevention:</strong>
                                            <ul className="list-disc list-inside text-light space-y-1 mt-1">
                                                {searchedDisease.whoGuidelines.prevention.map(p => <li key={p}>{p}</li>)}
                                            </ul>
                                        </div>
                                        <div className="flex-1">
                                            <strong className="text-warning">Treatment:</strong>
                                             <ul className="list-disc list-inside text-light space-y-1 mt-1">
                                                {searchedDisease.whoGuidelines.treatment.map(t => <li key={t}>{t}</li>)}
                                            </ul>
                                        </div>
                                     </div>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Country Breakdown (Top 15)</h4>
                                <div className="max-h-60 overflow-y-auto pr-2 text-sm">
                                    {sortedCountryBreakdown?.slice(0, 15).map(c => (
                                        <div key={c.country} className="grid grid-cols-4 gap-2 py-1 border-b border-accent">
                                            <span className="font-bold text-text-primary col-span-2">{c.country}</span>
                                            <span className="text-light">Cases: {c.cases.toLocaleString()}</span>
                                            <span className="text-danger">Deaths: {c.deaths.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         </div>
                     )}
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-highlight mb-4">Live City Feed: {userProfile.city}</h2>
                    <div className="space-y-3">
                        {cityFeed.length > 0 ? cityFeed.map(event => (
                            <div key={event.id} className="text-sm p-2 bg-accent rounded-md animate-fade-in">
                                <div className="flex justify-between">
                                    <p className="font-semibold text-text-primary">{event.disease} Report</p>
                                    <p className="text-xs text-light">{event.time}</p>
                                </div>
                                <p className="text-light">Area: {event.area} | Severity: <span className={event.severity === 'Severe' ? 'text-danger' : 'text-warning'}>{event.severity}</span></p>
                            </div>
                        )) : (
                            <p className="text-sm text-light">No new events in the last hour.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalStatsView;