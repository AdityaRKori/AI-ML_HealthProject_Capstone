import React, { useState } from 'react';
import type { BluetoothDeviceState } from '../types';
import { ICONS } from '../constants';

interface BluetoothManagerProps {
    onReceiveReading: (systolic: number, diastolic: number) => void;
}

const BluetoothManager: React.FC<BluetoothManagerProps> = ({ onReceiveReading }) => {
    const [device, setDevice] = useState<BluetoothDeviceState | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [latestVitals, setLatestVitals] = useState({ systolic: 0, diastolic: 0, heartRate: 0 });

    const handleConnect = () => {
        setDevice({ name: 'Accu-BP Monitor', batteryLevel: 0, connectionStatus: 'connecting' });
        // Simulate connection process
        setTimeout(() => {
            setDevice({ name: 'Accu-BP Monitor', batteryLevel: 87, connectionStatus: 'connected' });
        }, 2000);
    };

    const handleSimulateReading = () => {
        setIsSimulating(true);
        // Simulate reading process for 2.5 seconds
        setTimeout(() => {
            // Generate a plausible "normal to elevated" BP reading
            const systolic = Math.floor(Math.random() * (135 - 115 + 1)) + 115;
            const diastolic = Math.floor(Math.random() * (88 - 75 + 1)) + 75;
            const heartRate = Math.floor(Math.random() * (85 - 65 + 1)) + 65;
            
            onReceiveReading(systolic, diastolic);
            setLatestVitals({ systolic, diastolic, heartRate });
            setIsSimulating(false);
        }, 2500);
    };

    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-highlight">Bluetooth Device Sync</h2>
            {!device ? (
                <button onClick={handleConnect} className="w-full bg-highlight text-white font-bold py-3 rounded-lg hover:opacity-90 transition-colors">
                    Connect Device
                </button>
            ) : (
                <div className="space-y-4">
                    {device.connectionStatus === 'connecting' && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-highlight mx-auto"></div>
                            <p className="mt-2 text-sm text-light">Connecting to {device.name}...</p>
                        </div>
                    )}

                    {device.connectionStatus === 'connected' && (
                        <div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-text-primary">{device.name}</span>
                                <div className="flex items-center gap-1 text-success font-semibold">
                                     {ICONS.connected}
                                     <span>Connected</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                 <div className="text-light">{ICONS.battery}</div>
                                <div className="w-full bg-accent rounded-full h-2.5">
                                    <div className="bg-highlight h-2.5 rounded-full" style={{ width: `${device.batteryLevel}%` }}></div>
                                </div>
                                <span className="text-xs text-light">{device.batteryLevel}%</span>
                            </div>
                            
                            {/* Vitals Screen */}
                            <div className="mt-4 bg-primary p-3 rounded-lg text-center">
                                <h4 className="text-sm font-semibold text-light mb-2">Live Vitals</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <p className="text-xs text-light">Systolic</p>
                                        <p className="text-2xl font-bold text-highlight">
                                            {isSimulating ? <span className="animate-pulse">...</span> : latestVitals.systolic}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-light">Diastolic</p>
                                        <p className="text-2xl font-bold text-highlight">
                                            {isSimulating ? <span className="animate-pulse">...</span> : latestVitals.diastolic}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-light">Heart Rate</p>
                                        <p className="text-2xl font-bold text-highlight">
                                            {isSimulating ? <span className="animate-pulse">...</span> : latestVitals.heartRate}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSimulateReading} disabled={isSimulating} className="w-full mt-4 bg-primary-action text-primary-action-text font-bold py-3 rounded-lg hover:opacity-90 disabled:bg-gray-500 transition-colors text-sm">
                                {isSimulating ? 'Measuring...' : 'Simulate BP Reading'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BluetoothManager;