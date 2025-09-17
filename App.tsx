
import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from './types';
import { getUserProfile, saveUserProfile } from './utils/helpers';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [appState, setAppState] = useState<'loading' | 'setup' | 'dashboard'>('loading');

    useEffect(() => {
        const profile = getUserProfile();
        if (profile) {
            setUserProfile(profile);
            setAppState('dashboard');
        } else {
            setAppState('setup');
        }
        setIsLoading(false);
    }, []);

    const handleProfileSaved = useCallback((profile: UserProfile) => {
        saveUserProfile(profile);
        setUserProfile(profile);
        setAppState('dashboard');
    }, []);

    const handleEditProfile = useCallback(() => {
        setAppState('setup');
    }, []);


    if (appState === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen bg-primary">
                <div className="text-xl text-text-primary">Loading AI Health Tracker...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary font-sans">
            {appState === 'setup' || !userProfile ? (
                <ProfileSetup onProfileSetup={handleProfileSaved} existingProfile={userProfile} />
            ) : (
                <Dashboard userProfile={userProfile} onEditProfile={handleEditProfile} onProfileUpdate={handleProfileSaved} />
            )}
        </div>
    );
};

export default App;