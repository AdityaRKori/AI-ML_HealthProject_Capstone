
import React, { useState } from 'react';
import type { UserProfile } from '../types';
import HealthCheck from './HealthCheck';
import CommunityView from './CommunityView';
import AICompanion from './AICompanion';
import ProgressView from './ProgressView';
import ImageAnalysis from './ImageAnalysis';
import { ICONS } from '../constants';

// A placeholder for the Methodology component to avoid import errors.
// It will be defined later in a separate file.
const Methodology = () => {
    const [demoQuery, setDemoQuery] = useState('Find validated, open-source datasets for predicting type 2 diabetes, like the PIMA Indians dataset.');
    const [demoResponse, setDemoResponse] = useState('');
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    const handleDemoSearch = () => {
        setIsDemoLoading(true);
        setDemoResponse('');
        // Simulate API call to demonstrate functionality
        setTimeout(() => {
            const cannedResponse = `
Based on my search, here are some highly-cited, open-source datasets for predicting Type 2 Diabetes:

1.  **PIMA Indians Diabetes Database:**
    *   **Source:** National Institute of Diabetes and Digestive and Kidney Diseases. Available on UCI Machine Learning Repository and Kaggle.
    *   **Description:** A classic dataset used for binary classification. It includes variables like age, BMI, insulin level, and glucose concentration.
    *   **Link:** https://archive.ics.uci.edu/ml/datasets/pima+indians+diabetes

2.  **NHANES (National Health and Nutrition Examination Survey):**
    *   **Source:** Centers for Disease Control and Prevention (CDC).
    *   **Description:** A much larger and ongoing survey that contains extensive data on the health and nutritional status of adults and children in the United States. It's excellent for building more complex models.
    *   **Link:** https://www.cdc.gov/nchs/nhanes
        `;
            setDemoResponse(cannedResponse.trim());
            setIsDemoLoading(false);
        }, 1500);
    };

    return (
        <div className="p-6 bg-secondary rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Methodology & Technical Implementation</h2>
            <div className="space-y-4 text-light/80">
                <p><strong>Security:</strong> All sensitive data, including your health records, is stored exclusively on your device's local storage. No data is sent to a server. API communications are secured via HTTPS.</p>
                <p><strong>Live Data APIs:</strong> We integrate with the World Bank Open Data API for real-time population and health statistics, ensuring you get accurate global and regional context.</p>
                <p><strong>AI Integration:</strong> The platform leverages Google's Gemini models for advanced health analysis, personalized recommendations, and conversational AI support. The API key is securely handled within the application's environment.</p>
                <p><strong>Machine Learning Models (Simulated):</strong> To protect your privacy and ensure client-side functionality, we use scientifically-backed, rule-based algorithms to simulate the predictions of complex ML models. These simulations are based on established risk factors from sources like the PIMA Indian Diabetes Dataset, the Framingham Heart Study, and WHO guidelines for various non-communicable diseases.</p>
                
                <div>
                    <h3 className="text-xl font-semibold mt-6 mb-2">Dataset Sourcing & Model Basis</h3>
                    <p className="text-light/80 mb-4">
                        The simulated ML models in this app are based on established risk factors from well-known medical studies. For building real-world, high-fidelity models, it's crucial to use large, validated clinical datasets. An advanced AI like Gemini, equipped with Google Search grounding, can be used to efficiently discover such resources. This ensures that the models are built on a foundation of credible, peer-reviewed data.
                    </p>
                    <div className="bg-accent p-4 rounded-lg">
                        <h4 className="font-bold mb-2">Dataset Discovery Demo</h4>
                        <p className="text-sm text-light/70 mb-2">
                            Ask the AI to find datasets for a specific health condition. This is a simulation to demonstrate the capability.
                        </p>
                        <textarea
                            className="w-full bg-primary p-2 rounded-md text-light mb-2 focus:ring-highlight focus:border-highlight"
                            rows={2}
                            value={demoQuery}
                            onChange={(e) => setDemoQuery(e.target.value)}
                        />
                        <button onClick={handleDemoSearch} disabled={isDemoLoading} className="bg-highlight px-4 py-2 rounded-md hover:bg-blue-500 disabled:bg-gray-500 transition-colors">
                            {isDemoLoading ? 'Searching...' : 'Search with AI'}
                        </button>
                        {isDemoLoading && <div className="mt-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-light"></div></div>}
                        {demoResponse && (
                            <div className="mt-4 p-4 bg-primary rounded-md whitespace-pre-wrap font-mono text-sm">
                                {demoResponse}
                            </div>
                        )}
                    </div>
                </div>

                <p className="mt-6"><strong>Data Sources:</strong> Our models and recommendations are informed by data and guidelines from the World Health Organization (WHO), UCI Machine Learning Repository, and other public clinical datasets.</p>
                <p><strong>Cloud Infrastructure:</strong> This application is a client-side Progressive Web App (PWA). It runs in your browser and is designed for deployment on modern edge platforms like Vercel or Netlify. No backend server is required for its core functionality.</p>
            </div>
        </div>
    );
};


interface DashboardProps {
    userProfile: UserProfile;
    onProfileUpdate: (profile: UserProfile) => void;
}

type Tab = 'healthCheck' | 'imageAnalysis' | 'community' | 'progress' | 'aiCompanion' | 'methodology';

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState<Tab>('healthCheck');

    const renderContent = () => {
        switch (activeTab) {
            case 'healthCheck':
                return <HealthCheck userProfile={userProfile} onProfileUpdate={onProfileUpdate} />;
            case 'imageAnalysis':
                return <ImageAnalysis />;
            case 'community':
                return <CommunityView userProfile={userProfile} />;
            case 'progress':
                return <ProgressView userProfile={userProfile} />;
            case 'aiCompanion':
                return <AICompanion />;
            case 'methodology':
                return <Methodology />;
            default:
                return <HealthCheck userProfile={userProfile} onProfileUpdate={onProfileUpdate} />;
        }
    };

    const NavItem: React.FC<{ tab: Tab; icon: React.ReactNode; label: string }> = ({ tab, icon, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${activeTab === tab ? 'bg-highlight text-white' : 'text-accent hover:bg-secondary'}`}
            title={label}
        >
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-primary">
            <nav className="w-24 bg-secondary p-4 flex flex-col items-center space-y-6">
                 <div className="flex flex-col items-center text-highlight" aria-label="The Oracle Logo">
                    <div className="w-16 h-16">
                        {ICONS.logo}
                    </div>
                </div>
                <NavItem tab="healthCheck" icon={ICONS.dashboard} label="Check-up" />
                <NavItem tab="imageAnalysis" icon={ICONS.imageAnalysis} label="Imaging" />
                <NavItem tab="community" icon={ICONS.community} label="Community" />
                <NavItem tab="progress" icon={ICONS.progress} label="Progress" />
                <NavItem tab="aiCompanion" icon={ICONS.chat} label="AI Companion" />
                <NavItem tab="methodology" icon={ICONS.methodology} label="About" />
                 <div className="mt-auto text-center text-accent">
                    <p className="text-sm font-bold">{userProfile.name}</p>
                    <p className="text-xs">{userProfile.city}</p>
                </div>
            </nav>
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;