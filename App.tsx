import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from './types';
import { getUserProfile, saveUserProfile } from './utils/helpers';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const profile = getUserProfile();
        setUserProfile(profile);
        setIsLoading(false);
    }, []);

    const handleProfileSetup = useCallback((profile: UserProfile) => {
        saveUserProfile(profile);
        setUserProfile(profile);
    }, []);

    const handleProfileUpdate = useCallback((profile: UserProfile) => {
        saveUserProfile(profile);
        setUserProfile(profile);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-primary">
                <div className="text-xl text-light">Loading The Oracle...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary font-sans">
            {!userProfile ? (
                <ProfileSetup onProfileSetup={handleProfileSetup} />
            ) : (
                <Dashboard userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />
            )}
        </div>
    );
};

export default App;