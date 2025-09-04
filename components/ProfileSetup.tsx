
import React, { useState, useEffect } from 'react';
import type { UserProfile, GeneticMarker } from '../types';
import { COUNTRIES, ICONS, GENETIC_MARKERS_DATA } from '../constants';

interface ProfileSetupProps {
    onProfileSetup: (profile: UserProfile) => void;
    existingProfile?: UserProfile | null;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileSetup, existingProfile }) => {
    const [step, setStep] = useState(1);

    // Step 1: Basic Info
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [country, setCountry] = useState(COUNTRIES[0].code);
    const [city, setCity] = useState(COUNTRIES[0].cities[0]);
    
    // Step 2: Allergies
    const [allergies, setAllergies] = useState<string[]>([]);
    const [currentAllergy, setCurrentAllergy] = useState('');

    // Step 3: Genetic Info
    const [geneticMarkers, setGeneticMarkers] = useState<GeneticMarker[]>(
        GENETIC_MARKERS_DATA.map(marker => ({...marker, userHas: false }))
    );

    useEffect(() => {
        if (existingProfile) {
            setName(existingProfile.name);
            setAge(String(existingProfile.age));
            setGender(existingProfile.gender);
            setCountry(existingProfile.country);
            setCity(existingProfile.city);
            setAllergies(existingProfile.allergies || []);
            setGeneticMarkers(existingProfile.geneticMarkers || GENETIC_MARKERS_DATA.map(m => ({...m, userHas: false})));
        }
    }, [existingProfile]);


    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCountryCode = e.target.value;
        setCountry(newCountryCode);
        const selectedCountry = COUNTRIES.find(c => c.code === newCountryCode);
        if (selectedCountry && selectedCountry.cities.length > 0) {
            setCity(selectedCountry.cities[0]);
        } else {
            setCity('');
        }
    };
    
    const handleAddAllergy = () => {
        if (currentAllergy && !allergies.includes(currentAllergy)) {
            setAllergies([...allergies, currentAllergy]);
            setCurrentAllergy('');
        }
    };
    
    const handleRemoveAllergy = (allergyToRemove: string) => {
        setAllergies(allergies.filter(a => a !== allergyToRemove));
    };

    const handleGeneticMarkerChange = (markerId: string) => {
        setGeneticMarkers(
            geneticMarkers.map(marker => 
                marker.id === markerId ? { ...marker, userHas: !marker.userHas } : marker
            )
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && age && parseInt(age) > 0) {
            onProfileSetup({
                name,
                age: parseInt(age),
                gender,
                country,
                city,
                healthHistory: existingProfile?.healthHistory || [],
                allergies,
                geneticMarkers,
                healthNotes: existingProfile?.healthNotes || [],
            });
        }
    };

    const selectedCountryData = COUNTRIES.find(c => c.code === country);

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-4">
            <div className="w-full max-w-lg bg-secondary shadow-lg rounded-xl p-8 transition-all duration-500">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 text-highlight" aria-label="The Oracle Logo">
                        {ICONS.logo}
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-center text-text-primary mb-2">
                    {existingProfile ? 'Update Your Profile' : 'Welcome to The Oracle'}
                </h1>
                <p className="text-center text-light mb-8">
                    {existingProfile ? 'Keep your health information up to date.' : "Let's set up your health profile."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1 */}
                    <div className={step === 1 ? 'block' : 'hidden'}>
                        <h2 className="text-xl font-semibold text-highlight mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-text-primary">Full Name</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full bg-accent text-text-primary border-transparent rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-text-primary">Age</label>
                                    <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} required min="1" className="mt-1 block w-full bg-accent text-text-primary border-transparent rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3" />
                                </div>
                                <div>
                                   <label htmlFor="gender" className="block text-sm font-medium text-text-primary">Gender</label>
                                    <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as any)} className="mt-1 block w-full bg-accent text-text-primary border-transparent rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="country" className="block text-sm font-medium text-text-primary">Country</label>
                                <select id="country" value={country} onChange={handleCountryChange} className="mt-1 block w-full bg-accent text-text-primary border-transparent rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3">
                                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="city" className="block text-sm font-medium text-text-primary">City / Region</label>
                                <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full bg-accent text-text-primary border-transparent rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3">
                                    {selectedCountryData?.cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className={step === 2 ? 'block' : 'hidden'}>
                         <h2 className="text-xl font-semibold text-highlight mb-4">Allergies</h2>
                         <p className="text-sm text-light mb-4">List any known allergies to medications, food, or other substances.</p>
                         <div className="flex items-center gap-2">
                             <input type="text" value={currentAllergy} onChange={(e) => setCurrentAllergy(e.target.value)} placeholder="e.g., Penicillin, Peanuts" className="flex-grow bg-accent text-text-primary border-transparent rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3"/>
                             <button type="button" onClick={handleAddAllergy} className="bg-highlight text-white font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity">+</button>
                         </div>
                         <div className="mt-4 flex flex-wrap gap-2">
                             {allergies.map(allergy => (
                                 <span key={allergy} className="bg-accent text-text-primary text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
                                     {allergy}
                                     <button type="button" onClick={() => handleRemoveAllergy(allergy)} className="text-red-500 hover:text-red-400">&times;</button>
                                 </span>
                             ))}
                         </div>
                    </div>

                    {/* Step 3 */}
                    <div className={step === 3 ? 'block' : 'hidden'}>
                        <h2 className="text-xl font-semibold text-highlight mb-4">Genetic Information (Optional)</h2>
                        <p className="text-sm text-light mb-4">Providing this data can help the AI give more personalized insights. This information is stored only on your device.</p>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {geneticMarkers.map(marker => (
                                <div key={marker.id} className="bg-accent p-3 rounded-lg">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={marker.userHas} onChange={() => handleGeneticMarkerChange(marker.id)} className="mt-1 h-5 w-5 rounded text-highlight bg-primary border-gray-500 focus:ring-highlight" />
                                        <div>
                                            <span className="font-semibold text-text-primary">{marker.name}</span>
                                            <p className="text-xs text-light">{marker.description}</p>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 1} className="px-4 py-2 rounded-lg text-text-primary hover:bg-accent disabled:opacity-50 transition-colors">
                            Back
                        </button>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map(s => <div key={s} className={`h-2 w-2 rounded-full ${step === s ? 'bg-highlight' : 'bg-accent'}`}></div>)}
                        </div>
                        {step < 3 ? (
                             <button type="button" onClick={() => setStep(s => s + 1)} className="px-4 py-2 rounded-lg text-text-primary hover:bg-accent transition-colors">
                                Next
                            </button>
                        ) : (
                             <button type="submit" className="bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                                {existingProfile ? 'Save Changes' : 'Create Profile'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;