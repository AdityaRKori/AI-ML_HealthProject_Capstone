import React, { useState } from 'react';
import type { BluetoothDeviceState } from '../types';

interface BluetoothManagerProps {
    onReceiveReading: (systolic: number, diastolic: number) => void;
}

const BluetoothManager: React.FC<BluetoothManagerProps> = ({ onReceiveReading }) => {
    const [device, setDevice] = useState<BluetoothDeviceState | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleConnect = () => {
        setDevice({ name: 'Accu-BP Monitor', batteryLevel: 0, connectionStatus: 'connecting' });
        // Simulate connection process
        setTimeout(() => {
            setDevice({ name: 'Accu-BP Monitor', batteryLevel: 87, connectionStatus: 'connected' });
        }, 2000);
    };

    const handleSimulateReading = () => {
        setIsSimulating(true);
        // Simulate reading process
        setTimeout(() => {
            // Generate a plausible "normal to elevated" BP reading
            const systolic = Math.floor(Math.random() * (135 - 115 + 1)) + 115;
            const diastolic = Math.floor(Math.random() * (88 - 75 + 1)) + 75;
            onReceiveReading(systolic, diastolic);
            setIsSimulating(false);
        }, 1500);
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
                            <p className="mt-2 text-sm text-light">Connecting...</p>
                        </div>
                    )}

                    {device.connectionStatus === 'connected' && (
                        <div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-text-primary">{device.name}</span>
                                <span className="text-success font-semibold">Connected</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-full bg-accent rounded-full h-2.5">
                                    <div className="bg-highlight h-2.5 rounded-full" style={{ width: `${device.batteryLevel}%` }}></div>
                                </div>
                                <span className="text-xs text-light">{device.batteryLevel}%</span>
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