import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { COUNTRIES, ICONS } from '../constants';

interface ProfileSetupProps {
    onProfileSetup: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileSetup }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [country, setCountry] = useState(COUNTRIES[0].code);
    const [city, setCity] = useState(COUNTRIES[0].cities[0]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && age && parseInt(age) > 0) {
            onProfileSetup({
                name,
                age: parseInt(age),
                gender,
                country,
                city,
                healthHistory: [],
            });
        }
    };

    const selectedCountryData = COUNTRIES.find(c => c.code === country);

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-4">
            <div className="w-full max-w-md bg-secondary shadow-lg rounded-xl p-8">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 text-highlight" aria-label="The Oracle Logo">
                        {ICONS.logo}
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-center text-light mb-2">Welcome to The Oracle</h1>
                <p className="text-center text-accent mb-8">Let's set up your health profile.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-light">Full Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full bg-accent text-light border-gray-600 rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-light">Age</label>
                            <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} required min="1" className="mt-1 block w-full bg-accent text-light border-gray-600 rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3" />
                        </div>
                        <div>
                           <label htmlFor="gender" className="block text-sm font-medium text-light">Gender</label>
                            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as any)} className="mt-1 block w-full bg-accent text-light border-gray-600 rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="country" className="block text-sm font-medium text-light">Country</label>
                        <select id="country" value={country} onChange={handleCountryChange} className="mt-1 block w-full bg-accent text-light border-gray-600 rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3">
                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="city" className="block text-sm font-medium text-light">City / Region</label>
                        <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full bg-accent text-light border-gray-600 rounded-md shadow-sm focus:ring-highlight focus:border-highlight p-3">
                            {selectedCountryData?.cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-highlight text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors duration-300">
                        Create Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;