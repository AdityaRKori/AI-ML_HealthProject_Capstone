import React, { useState } from 'react';
import type { UserProfile, HealthRecord } from '../types';
import HealthCheck from './HealthCheck';
import CommunityView from './CommunityView';
import AICompanion from './AICompanion';
import ProgressView from './ProgressView';
import ImageAnalysis from './ImageAnalysis';
import HealthReport from './HealthReport';
import GlobalStatsView from './GlobalStatsView';
import ThemeSwitcher from './ThemeSwitcher';
import { ICONS } from '../constants';

// --- Sub-components moved to top-level to fix React Error #310 ---

const Methodology: React.FC = () => {
    return (
        <div className="p-6 bg-secondary rounded-lg text-text-primary animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Methodology & Technical Implementation</h2>
            <div className="space-y-4 text-light">
                <p><strong>Security:</strong> All sensitive data, including your health records, is stored exclusively on your device's local storage. No data is sent to a server. API communications are secured via HTTPS.</p>
                
                <div>
                    <h3 className="text-xl font-semibold mt-6 mb-2">Simulated Machine Learning Models</h3>
                    <p className="text-light mb-4">
                        To protect your privacy and ensure client-side functionality, we use scientifically-backed, rule-based algorithms to simulate the predictions of complex ML models. The capabilities of these simulated models have been expanded and are conceptually trained on balanced, high-quality datasets to ensure accuracy and reduce bias:
                    </p>
                    <ul className="list-disc list-inside space-y-2 bg-accent p-4 rounded-lg">
                        <li>
                            <strong>Risk Prediction:</strong> Based on established risk factors from sources like the Framingham Heart Study and WHO guidelines for various non-communicable diseases. The model is designed to be more accurate by considering inter-parameter logic.
                        </li>
                        <li>
                            <strong>Chest X-Ray Analysis:</strong> The simulated model is conceptually based on the <strong className="text-highlight">CheXpert dataset</strong>, trained to minimize data loss from imbalances between different disease classes. It analyzes images for multiple conditions including Pneumonia (Bacterial & Viral), Tuberculosis, and Lung Opacity.
                        </li>
                        <li>
                            <strong>Skin Lesion Analysis:</strong> This model is conceptually based on the <strong className="text-highlight">ISIC (International Skin Imaging Collaboration) dataset</strong>. It classifies lesions into categories like Melanoma and Basal Cell Carcinoma, providing more detailed preliminary insights.
                        </li>
                         <li>
                            <strong>Content Validation:</strong> Before analysis, a preliminary AI check verifies that the uploaded image content matches the expected type (e.g., confirming an image is a chest x-ray), preventing analysis of incorrect images.
                        </li>
                    </ul>
                </div>
                
                <p className="mt-6"><strong>Data Sources:</strong> Our models and recommendations are informed by data and guidelines from the World Health Organization (WHO), and conceptual models are based on public clinical datasets like CheXpert and ISIC. The AI leverages Google Search grounding for real-time, culturally relevant information.</p>
            </div>
        </div>
    );
};

interface NavItemProps {
    view: View;
    activeView: View;
    icon: React.ReactNode;
    label: string;
    onClick: (view: View) => void;
}

const NavItem: React.FC<NavItemProps> = ({ view, activeView, icon, label, onClick }) => (
    <button
        onClick={() => onClick(view)}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 w-full ${activeView === view ? 'bg-highlight text-white' : 'text-light hover:bg-accent'}`}
        title={label}
    >
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </button>
);


// --- Main Dashboard Component ---

interface DashboardProps {
    userProfile: UserProfile;
    onProfileUpdate: (profile: UserProfile) => void;
    onEditProfile: () => void;
}

type View = 'healthCheck' | 'imageAnalysis' | 'community' | 'progress' | 'aiCompanion' | 'methodology' | 'healthReport' | 'globalStats';

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onProfileUpdate, onEditProfile }) => {
    const [activeView, setActiveView] = useState<View>('healthCheck');
    const [activeReport, setActiveReport] = useState<HealthRecord | null>(null);

    const handleNavigateToReport = (report: HealthRecord) => {
        setActiveReport(report);
        setActiveView('healthReport');
    };

    const renderContent = () => {
        switch (activeView) {
            case 'healthCheck':
                return <HealthCheck userProfile={userProfile} onProfileUpdate={onProfileUpdate} onViewReport={handleNavigateToReport} />;
            case 'imageAnalysis':
                return <ImageAnalysis />;
            case 'community':
                return <CommunityView userProfile={userProfile} />;
            case 'globalStats':
                return <GlobalStatsView userProfile={userProfile} />;
            case 'progress':
                return <ProgressView userProfile={userProfile} />;
            case 'aiCompanion':
                return <AICompanion userProfile={userProfile} onProfileUpdate={onProfileUpdate} />;
            case 'methodology':
                return <Methodology />;
            case 'healthReport':
                // Use the latest report if none is actively selected
                const reportToShow = activeReport || userProfile.healthHistory[userProfile.healthHistory.length - 1];
                return reportToShow ? <HealthReport report={reportToShow} userProfile={userProfile} /> : <div className="text-text-primary text-center p-8">No health report available. Please complete a check-up first.</div>;
            default:
                return <HealthCheck userProfile={userProfile} onProfileUpdate={onProfileUpdate} onViewReport={handleNavigateToReport} />;
        }
    };

    return (
        <div className="flex h-screen bg-primary">
            <nav className="w-24 bg-secondary p-4 flex flex-col items-center space-y-4">
                 <div className="flex flex-col items-center text-highlight mb-4" aria-label="The Oracle Logo">
                    <div className="w-16 h-16">
                        {ICONS.logo}
                    </div>
                </div>
                <NavItem view="healthCheck" activeView={activeView} onClick={setActiveView} icon={ICONS.dashboard} label="Check-up" />
                <NavItem view="imageAnalysis" activeView={activeView} onClick={setActiveView} icon={ICONS.imageAnalysis} label="Imaging" />
                <NavItem view="community" activeView={activeView} onClick={setActiveView} icon={ICONS.community} label="Community" />
                <NavItem view="globalStats" activeView={activeView} onClick={setActiveView} icon={ICONS.globalStats} label="Global" />
                <NavItem view="progress" activeView={activeView} onClick={setActiveView} icon={ICONS.progress} label="Progress" />
                <NavItem view="aiCompanion" activeView={activeView} onClick={setActiveView} icon={ICONS.chat} label="AI Companion" />
                <NavItem view="methodology" activeView={activeView} onClick={setActiveView} icon={ICONS.methodology} label="About" />
                { userProfile.healthHistory.length > 0 && <NavItem view="healthReport" activeView={activeView} onClick={setActiveView} icon={ICONS.report} label="Report" /> }
                
                <div className="mt-auto w-full space-y-4">
                    <ThemeSwitcher />
                     <div className="text-center text-light">
                        <p className="text-sm font-bold">{userProfile.name}</p>
                        <p className="text-xs">{userProfile.city}</p>
                        <button onClick={onEditProfile} className="text-xs text-highlight hover:underline mt-1">Edit Profile</button>
                    </div>
                </div>
            </nav>
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;