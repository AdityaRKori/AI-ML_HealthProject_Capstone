
import React, { useState, useRef, useEffect } from 'react';
import { getChatCompletion, getImageAnalysis, getSummaryFromChat } from '../services/apiService';
import { ICONS } from '../constants';
import { getBase64, getCoachSettings, saveCoachSettings } from '../utils/helpers';
import type { CoachSettings, UserProfile } from '../types';

type Message = {
    sender: 'user' | 'bot';
    text: string;
    imageUrl?: string;
};

interface AICompanionProps {
    userProfile: UserProfile;
    onProfileUpdate: (profile: UserProfile) => void;
}

const AICompanion: React.FC<AICompanionProps> = ({ userProfile, onProfileUpdate }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: "Hello! I'm your AI Health Companion. If you mention any specific health concerns, I can help you add them to your profile to personalize future analyses." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'chat' | 'image'>('chat');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [chatSummary, setChatSummary] = useState<string | null>(null);

    const [coachSettings, setCoachSettings] = useState<CoachSettings>({
        name: 'Oracle AI',
        personality: 'Empathetic & Encouraging'
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [tempSettings, setTempSettings] = useState<CoachSettings>(coachSettings);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const savedSettings = getCoachSettings();
        if (savedSettings) {
            setCoachSettings(savedSettings);
            setTempSettings(savedSettings);
        }
    }, []);

    const handleSaveSettings = () => {
        setCoachSettings(tempSettings);
        saveCoachSettings(tempSettings);
        setIsSettingsOpen(false);
    };

    const handleSendMessage = async () => {
        if (!input.trim() && !imageFile) return;
        setChatSummary(null);

        const userMessageText = input || (mode === 'image' ? 'Analyze this image.' : '');
        const userMessage: Message = { sender: 'user', text: userMessageText, imageUrl: imagePreview || undefined };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setImageFile(null);
        setImagePreview(null);
        setIsLoading(true);

        try {
            let botResponseText = '';
            if (mode === 'image' && imageFile) {
                const { data: base64Image, mimeType } = await getBase64(imageFile);
                botResponseText = await getImageAnalysis(userMessageText, base64Image, mimeType);
            } else {
                botResponseText = await getChatCompletion(userMessageText, messages.slice(-5), coachSettings);
            }
            const botMessage: Message = { sender: 'bot', text: botResponseText };
            setMessages(prev => [...prev, botMessage]);

            // Memory feature: analyze chat for health notes
            const summary = await getSummaryFromChat([...messages, userMessage, botMessage]);
            if (summary && !userProfile.healthNotes?.includes(summary)) {
                setChatSummary(summary);
            }

        } catch (error) {
            console.error('Error with AI service:', error);
            const errorMessage: Message = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again later.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveNote = () => {
        if (!chatSummary) return;
        const updatedProfile = {
            ...userProfile,
            healthNotes: [...(userProfile.healthNotes || []), chatSummary]
        };
        onProfileUpdate(updatedProfile);
        setChatSummary(null); // Hide prompt after saving
        
        const confirmationMessage: Message = { sender: 'bot', text: `Got it. I've added a note about "${chatSummary}" to your profile for future reference.` };
        setMessages(prev => [...prev, confirmationMessage]);
    };

    const personalities: CoachSettings['personality'][] = [
        'Empathetic & Encouraging',
        'Direct & Data-Driven',
        'Calm & Reassuring',
        'Energetic & Motivational'
    ];

    return (
        <div className="h-full flex flex-col bg-secondary rounded-lg shadow-lg relative">
            {isSettingsOpen && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-secondary rounded-lg shadow-xl p-6 w-full max-w-md border border-accent">
                        <h2 className="text-2xl font-bold mb-6 text-text-primary">Companion Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="coachName" className="block text-sm font-medium text-text-primary">Companion Name</label>
                                <input
                                    type="text"
                                    id="coachName"
                                    value={tempSettings.name}
                                    onChange={(e) => setTempSettings(prev => ({ ...prev, name: e.target.value }))}
                                    className="mt-1 block w-full bg-accent text-text-primary border-transparent rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3"
                                />
                            </div>
                             <div>
                                <label htmlFor="coachPersonality" className="block text-sm font-medium text-text-primary">Personality</label>
                                <select
                                    id="coachPersonality"
                                    value={tempSettings.personality}
                                    onChange={(e) => setTempSettings(prev => ({ ...prev, personality: e.target.value as CoachSettings['personality'] }))}
                                    className="mt-1 block w-full bg-accent text-text-primary border-transparent rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3"
                                >
                                    {personalities.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 rounded-lg text-text-primary hover:bg-accent transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSaveSettings} className="px-4 py-2 rounded-lg bg-primary-action text-primary-action-text font-bold hover:opacity-90 transition-colors">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="p-4 border-b border-accent flex justify-between items-center">
                <h1 className="text-xl font-bold text-text-primary">{coachSettings.name}</h1>
                <div className="flex items-center space-x-1">
                     <button onClick={() => setMode('chat')} className={`px-3 py-1 rounded-md text-sm ${mode === 'chat' ? 'bg-highlight text-white' : 'bg-accent text-light'}`}>Chat</button>
                     <button onClick={() => setMode('image')} className={`px-3 py-1 rounded-md text-sm ${mode === 'image' ? 'bg-highlight text-white' : 'bg-accent text-light'}`}>Image Analysis</button>
                     <button onClick={() => { setTempSettings(coachSettings); setIsSettingsOpen(true); }} className="p-2 rounded-full hover:bg-accent text-light" title="Companion Settings">{ICONS.settings}</button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-highlight text-white flex items-center justify-center flex-shrink-0">{ICONS.bot}</div>}
                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-highlight text-white' : 'bg-accent text-text-primary'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded for analysis" className="mt-2 rounded-lg max-w-xs" />}
                        </div>
                         {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-accent text-text-primary flex items-center justify-center flex-shrink-0">{ICONS.user}</div>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-highlight text-white flex items-center justify-center flex-shrink-0 animate-pulse">{ICONS.bot}</div>
                        <div className="p-3 rounded-lg bg-accent">
                            <div className="h-2 w-4 bg-gray-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-accent">
                {chatSummary && (
                    <div className="mb-2 p-2 bg-primary rounded-lg text-sm text-text-primary flex justify-between items-center gap-2">
                        <p>I noticed you mentioned: <strong className="text-highlight">"{chatSummary}"</strong>. Would you like to save this to your health notes?</p>
                        <button onClick={handleSaveNote} className="bg-primary-action text-primary-action-text px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap">Save Note</button>
                    </div>
                )}
                {mode === 'image' && (
                    <div className="mb-2">
                        {imagePreview ? (
                            <div className="flex items-center gap-2">
                                <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
                                <button onClick={() => {setImageFile(null); setImagePreview(null)}} className="text-danger">Remove</button>
                            </div>
                        ) : (
                             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg hover:bg-highlight/50 text-text-primary">
                                {ICONS.upload} Upload Image
                            </button>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg" className="hidden" />
                    </div>
                )}
                <div className="flex items-center bg-accent rounded-lg p-2">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                        placeholder={mode === 'chat' ? "Ask a health question..." : "Add a comment for the image (optional)..."}
                        className="flex-1 bg-transparent text-text-primary focus:outline-none px-2"
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !imageFile)} className="p-2 rounded-full bg-highlight text-white hover:opacity-90 disabled:bg-gray-500 transition-colors">
                        {ICONS.send}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AICompanion;