
import React, { useState, useEffect } from 'react';
import { getHealthNews } from '../services/apiService';
import type { HealthNewsArticle, GroundingSource } from '../types';
import { ICONS } from '../constants';

const HealthNewsView: React.FC = () => {
    const [news, setNews] = useState<HealthNewsArticle[]>([]);
    const [sources, setSources] = useState<GroundingSource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNews = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { articles, sources } = await getHealthNews();
            setNews(articles);
            setSources(sources);
        } catch (err) {
            setError('Failed to fetch the latest health news. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-8 animate-fade-in">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto"></div>
                    <p className="mt-4 text-text-primary">Scanning global health bulletins...</p>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="text-center p-8 bg-secondary rounded-lg animate-fade-in">
                    <div className="w-16 h-16 text-danger mx-auto">{ICONS.warning}</div>
                    <h2 className="mt-4 text-2xl font-bold text-danger">An Error Occurred</h2>
                    <p className="text-light mt-2">{error}</p>
                </div>
            );
        }

        if (news.length === 0) {
            return (
                <div className="text-center p-8 bg-secondary rounded-lg animate-fade-in">
                    <h2 className="text-2xl font-bold text-text-primary">Ready to Catch Up?</h2>
                    <p className="text-light mt-2">Click the "Refresh" button to fetch the latest global health news.</p>
                </div>
            );
        }

        return (
            <>
                <div className="space-y-6">
                    {news.map((article, index) => (
                        <div key={index} className="bg-secondary p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            {article.imageUrl && (
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            )}
                            <div>
                                <div className="flex justify-between items-start gap-4">
                                    <h2 className="text-xl font-bold text-highlight">{article.title}</h2>
                                    <span className="text-xs text-light flex-shrink-0">{article.publishedAt}</span>
                                </div>
                                <p className="text-sm text-light mt-1">Source: {article.source}</p>
                                <p className="mt-4 text-text-primary">{article.summary}</p>
                                <a 
                                    href={article.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-sm text-highlight font-semibold mt-4 inline-block hover:underline"
                                >
                                    Read Full Article &rarr;
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {sources.length > 0 && (
                    <div className="bg-secondary p-6 rounded-lg shadow-lg mt-8">
                        <h3 className="text-lg font-bold text-text-primary mb-3">AI Verified Sources</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            {sources.map((source, index) => (
                                <li key={index}>
                                    <a 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-light hover:text-highlight hover:underline"
                                        title={source.uri}
                                    >
                                        {source.title || new URL(source.uri).hostname}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-bold text-text-primary">Global Health News Feed</h1>
                    <p className="text-light">Live updates powered by AI and Google Search.</p>
                </div>
                <button onClick={fetchNews} disabled={isLoading} className="bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:bg-gray-500 flex-shrink-0">
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default HealthNewsView;