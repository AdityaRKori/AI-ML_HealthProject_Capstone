import React from 'react';
import type { RegionalHealthData, AQIPredictionPoint } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Line } from 'recharts';

interface AirQualityReportProps {
    data: RegionalHealthData;
    district: string;
}

const AirQualityReport: React.FC<AirQualityReportProps> = ({ data, district }) => {

    const getAqiColor = (aqi: number) => {
        if (aqi <= 50) return 'bg-success';
        if (aqi <= 100) return 'bg-yellow-500';
        if (aqi <= 150) return 'bg-orange-500';
        if (aqi <= 200) return 'bg-danger';
        if (aqi <= 300) return 'bg-purple-500';
        return 'bg-maroon-500';
    };

    const chartData = data.predictedAQI.map(p => ({
        ...p,
        confidence: [p.yhat_lower, p.yhat_upper]
    }));

    return (
        <div className="bg-accent p-4 rounded-lg animate-fade-in space-y-4">
            <h3 className="text-xl font-bold text-highlight">{district} Report</h3>
            <p className="text-xs text-light italic">{data.disclaimer}</p>
            
            <div className="text-center bg-secondary p-4 rounded-lg">
                <p className="text-light text-sm">Current Air Quality</p>
                <div className="flex items-center justify-center gap-2">
                    <span className={`text-4xl font-bold ${getAqiColor(data.aqiValue).replace('bg-','text-')}`}>{data.aqiValue}</span>
                    <span className={`px-2 py-1 text-sm font-semibold text-white rounded-full ${getAqiColor(data.aqiValue)}`}>{data.airQuality}</span>
                </div>
                 <p className="text-light text-sm mt-1">{data.weather}</p>
            </div>

            <div>
                <h4 className="font-semibold text-text-primary mb-2">Pollutant Details</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {data.pollutants.map(p => (
                        <div key={p.name} className="bg-secondary p-2 rounded">
                            <p className="font-bold">{p.name}</p>
                            <p className="text-light">{p.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                 <h4 className="font-semibold text-text-primary mb-2">24-Hour AQI Forecast (Prophet Model)</h4>
                 <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-secondary)" />
                        <XAxis dataKey="hour" stroke="var(--color-text)" fontSize={10} />
                        <YAxis stroke="var(--color-text)" fontSize={10} domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-accent)', borderRadius: '0.5rem', fontSize: '12px' }}/>
                        <Area type="monotone" dataKey="confidence" stroke="none" fill="var(--color-highlight)" fillOpacity={0.2} name="Confidence Interval" />
                        <Line type="monotone" dataKey="yhat" stroke="var(--color-highlight)" strokeWidth={2} dot={false} name="Predicted AQI" />
                    </AreaChart>
                 </ResponsiveContainer>
            </div>
            
             <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-secondary p-2 rounded">
                    <p className="font-bold">Past Month</p>
                    <p className="text-light">Low: <span className="text-success">{data.historicalAQI.month.low}</span> | High: <span className="text-danger">{data.historicalAQI.month.high}</span></p>
                </div>
                 <div className="bg-secondary p-2 rounded">
                    <p className="font-bold">Past Year</p>
                     <p className="text-light">Low: <span className="text-success">{data.historicalAQI.year.low}</span> | High: <span className="text-danger">{data.historicalAQI.year.high}</span></p>
                </div>
            </div>
             {data.allTimeHigh && data.allTimeLow && (
                 <div className="bg-secondary p-2 rounded text-center text-xs">
                    <p className="font-bold">Historical Records</p>
                    <p className="text-light">
                        All-Time Low: <span className="text-success">{data.allTimeLow.value} ({data.allTimeLow.year})</span> | 
                        All-Time High: <span className="text-danger">{data.allTimeHigh.value} ({data.allTimeHigh.year})</span>
                    </p>
                 </div>
            )}

            <div>
                <h4 className="font-semibold text-text-primary mb-2">AI Correlated Analysis</h4>
                <p className="text-sm text-light">{data.analysis}</p>
            </div>
            
            <div>
                 <h4 className="font-semibold text-text-primary mb-2 text-xs">AQI Index Guide</h4>
                 <div className="grid grid-cols-3 gap-1 text-xs">
                     <div className="bg-success/20 p-1 rounded text-center"><strong>0-50:</strong> Good</div>
                     <div className="bg-yellow-500/20 p-1 rounded text-center"><strong>51-100:</strong> Moderate</div>
                     <div className="bg-orange-500/20 p-1 rounded text-center"><strong>101-150:</strong> Unhealthy (SG)</div>
                 </div>
            </div>
        </div>
    );
};

export default AirQualityReport;