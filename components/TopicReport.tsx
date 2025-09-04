import React from 'react';
import type { RegionalTopicData } from '../types';

interface TopicReportProps {
    data: RegionalTopicData;
    district: string;
}

const TopicReport: React.FC<TopicReportProps> = ({ data, district }) => {
    return (
        <div className="bg-accent p-4 rounded-lg animate-fade-in space-y-4">
            <h3 className="text-xl font-bold text-highlight">{data.title}</h3>
            <p className="text-xs text-light italic">{data.disclaimer}</p>
            
            <div className="bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">Key Statistics for {district}</h4>
                <div className="space-y-2 text-sm">
                    {data.keyStats.map(stat => (
                        <div key={stat.label} className="flex justify-between">
                            <span className="text-light">{stat.label}:</span>
                            <span className="font-bold text-text-primary">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-text-primary mb-2">AI Analysis</h4>
                <p className="text-sm text-light">{data.analysis}</p>
            </div>
        </div>
    );
};

export default TopicReport;