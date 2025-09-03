
import React, { useState, useRef } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ICONS } from '../constants';
import type { ChestXRayAnalysis, SkinLesionAnalysis } from '../types';
import { analyzeChestXRay, analyzeSkinLesion } from '../services/mlService';
import { getImageAnalysis } from '../services/apiService';
import { getBase64 } from '../utils/helpers';

const ImageAnalysis: React.FC = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-light">AI-Powered Image Analysis</h1>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChestXRayAnalyzer />
                <SkinLesionAnalyzer />
            </div>
        </div>
    );
};

const ChestXRayAnalyzer: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ChestXRayAnalysis | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setResult(null);
        }
    };

    const handleAnalysis = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setResult(null);
        try {
            const [mlResult, { data: base64Image, mimeType }] = await Promise.all([
                analyzeChestXRay(imageFile),
                getBase64(imageFile),
            ]);
            
            const topPrediction = mlResult.predictions[0].name;
            const prompt = `This is a chest X-ray. The model's top prediction is "${topPrediction}" with a probability of ${(mlResult.predictions[0].probability * 100).toFixed(1)}%. Based on this, provide a brief explanation of what this means and some general preventative or informational tips.`;

            const aiExplanation = await getImageAnalysis(prompt, base64Image, mimeType);
            
            setResult({ ...mlResult, explanation: aiExplanation });

        } catch (error) {
            console.error("Error during X-Ray analysis:", error);
            setResult({
                predictions: [],
                explanation: 'An error occurred during analysis. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8884d8'];

    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-highlight">Chest X-Ray Analyzer</h2>
            <p className="text-sm text-light/70 mb-4">Upload a chest X-ray to check for signs of common respiratory conditions. This model is conceptually based on datasets like the "Chest X-Ray Images (Pneumonia)" collection from Kaggle.</p>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
            
            {!imagePreview && (
                 <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-accent rounded-lg hover:bg-accent/50 transition-colors">
                    {ICONS.upload}
                    <span className="mt-2 text-sm">Click to upload X-Ray</span>
                </button>
            )}

            {imagePreview && (
                <div className="mb-4">
                    <img src={imagePreview} alt="X-Ray Preview" className="rounded-lg max-h-60 mx-auto" />
                </div>
            )}

            <div className="flex gap-2">
                <button onClick={handleAnalysis} disabled={!imageFile || isLoading} className="w-full mt-4 bg-highlight text-white font-bold py-3 rounded-lg hover:bg-blue-500 disabled:bg-gray-500 transition-colors">
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                </button>
                {imageFile && 
                    <button onClick={() => {setImageFile(null); setImagePreview(null); setResult(null);}} disabled={isLoading} className="w-1/3 mt-4 bg-danger text-white font-bold py-3 rounded-lg hover:bg-red-500 disabled:bg-gray-500 transition-colors">
                        Clear
                    </button>
                }
            </div>
            
            {isLoading && <div className="text-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-highlight mx-auto"></div></div>}

            {result && result.predictions.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-xl font-bold mb-2">Analysis Results</h3>
                    <div className="w-full h-60">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={result.predictions} dataKey="probability" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {result.predictions.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: 'none', borderRadius: '0.5rem' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 bg-accent p-4 rounded-md">
                        <p className="text-light/90 whitespace-pre-wrap">{result.explanation}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const SkinLesionAnalyzer: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SkinLesionAnalysis | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setResult(null);
        }
    };
    
    const handleAnalysis = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setResult(null);
        try {
            const [mlResult, { data: base64Image, mimeType }] = await Promise.all([
                analyzeSkinLesion(imageFile),
                getBase64(imageFile),
            ]);
            
            const prompt = `This is an image of a skin lesion. The model's prediction is "${mlResult.prediction}" with ${Math.round(mlResult.confidence * 100)}% confidence. Describe the visual characteristics that might lead to such a classification and offer general, safe skincare advice.`;
            
            const aiExplanation = await getImageAnalysis(prompt, base64Image, mimeType);
            
            setResult({ ...mlResult, explanation: aiExplanation });

        } catch (error) {
            console.error("Error during Skin Lesion analysis:", error);
             setResult({
                prediction: 'Acne', // Placeholder
                confidence: 0,
                explanation: 'An error occurred during analysis. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-highlight">Skin Lesion Classifier</h2>
            <p className="text-sm text-light/70 mb-4">Upload an image of a skin lesion for a preliminary classification. This is inspired by models trained on datasets like HAM10000.</p>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />

            {!imagePreview && (
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-accent rounded-lg hover:bg-accent/50 transition-colors">
                    {ICONS.upload}
                    <span className="mt-2 text-sm">Click to upload Skin Image</span>
                </button>
            )}

            {imagePreview && (
                <div className="mb-4">
                    <img src={imagePreview} alt="Skin Lesion Preview" className="rounded-lg max-h-60 mx-auto" />
                </div>
            )}
             <div className="flex gap-2">
                <button onClick={handleAnalysis} disabled={!imageFile || isLoading} className="w-full mt-4 bg-highlight text-white font-bold py-3 rounded-lg hover:bg-blue-500 disabled:bg-gray-500 transition-colors">
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                </button>
                 {imageFile && 
                    <button onClick={() => {setImageFile(null); setImagePreview(null); setResult(null);}} disabled={isLoading} className="w-1/3 mt-4 bg-danger text-white font-bold py-3 rounded-lg hover:bg-red-500 disabled:bg-gray-500 transition-colors">
                        Clear
                    </button>
                }
            </div>

            {isLoading && <div className="text-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-highlight mx-auto"></div></div>}

            {result && (
                <div className="mt-6">
                    <h3 className="text-xl font-bold mb-2">Analysis Results</h3>
                    <div className="bg-accent p-4 rounded-lg text-center">
                        <p className="text-lg">Prediction:</p>
                        <p className="text-3xl font-bold text-highlight">{result.prediction}</p>
                        <p className="text-sm text-light/70">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                    </div>
                     <div className="mt-4 bg-accent p-4 rounded-md">
                        <p className="text-light/90 whitespace-pre-wrap">{result.explanation}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ImageAnalysis;
