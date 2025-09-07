
import React, { useState, useRef } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ICONS } from '../constants';
import type { ChestXRayAnalysis, SkinLesionAnalysis, ImageType } from '../types';
import { analyzeChestXRay, analyzeSkinLesion } from '../services/mlService';
import { getImageAnalysis, validateImageType } from '../services/apiService';
import { processMedicalImageFile } from '../utils/helpers';

const ImageAnalysis: React.FC = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">AI-Powered Image Analysis</h1>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Analyzer
                    title="Chest X-Ray Analyzer"
                    description='Upload a chest X-ray to check for signs of common respiratory conditions. This model is conceptually based on datasets like the "CheXpert" collection.'
                    imageType='chest-x-ray'
                    mlAnalyzer={analyzeChestXRay}
                    promptGenerator={(pred) => `This is a chest X-ray. The model's top prediction is "${pred.name}" with a probability of ${(pred.probability * 100).toFixed(1)}%.`}
                    resultRenderer={(res) => <ChestXRayResult result={res as ChestXRayAnalysis} />}
                />
                 <Analyzer
                    title="Skin Lesion Classifier"
                    description='Upload an image of a skin lesion for a preliminary classification. This is inspired by models trained on datasets like ISIC HAM10000.'
                    imageType='skin-lesion'
                    mlAnalyzer={analyzeSkinLesion}
                    promptGenerator={(pred) => `This is an image of a skin lesion. The model's prediction is "${pred.prediction}" with ${Math.round(pred.confidence * 100)}% confidence.`}
                    resultRenderer={(res) => <SkinLesionResult result={res as SkinLesionAnalysis} />}
                />
            </div>
        </div>
    );
};

interface AnalyzerProps {
    title: string;
    description: string;
    imageType: ImageType;
    mlAnalyzer: (file: File) => Promise<any>;
    promptGenerator: (prediction: any) => string;
    resultRenderer: (result: any) => React.ReactNode;
}

const Analyzer: React.FC<AnalyzerProps> = ({ title, description, imageType, mlAnalyzer, promptGenerator, resultRenderer }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            processMedicalImageFile(file).then(({ previewUrl }) => {
                setImagePreview(previewUrl);
            }).catch(() => {
                setError("Unsupported file format.");
            });
            setResult(null);
            setError(null);
        }
    };

    const handleAnalysis = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            // Process file for preview and analysis data
            const { data: base64Image, mimeType } = await processMedicalImageFile(imageFile);

            // AI-powered content validation
            const isValid = await validateImageType(base64Image, mimeType, imageType);
            if (!isValid) {
                throw new Error(`Invalid image content. Please upload a valid ${imageType.replace('-', ' ')}.`);
            }

            // Run ML simulation and get full AI analysis
            const mlResult = await mlAnalyzer(imageFile);
            const prompt = promptGenerator(mlResult.predictions ? mlResult.predictions[0] : mlResult);
            const aiExplanation = await getImageAnalysis(prompt, base64Image, mimeType, imageType);
            
            setResult({ ...mlResult, explanation: aiExplanation });

        } catch (err: any) {
            console.error(`Error during ${title} analysis:`, err);
            setError(err.message || 'An error occurred during analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setImageFile(null);
        setImagePreview(null);
        setResult(null);
        setError(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg flex flex-col">
            <h2 className="text-2xl font-semibold mb-4 text-highlight">{title}</h2>
            <p className="text-sm text-light mb-4">{description}</p>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf, .dcm" className="hidden" />
            
            {!imagePreview && (
                 <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-accent rounded-lg hover:bg-accent/50 transition-colors">
                    {ICONS.upload}
                    <span className="mt-2 text-sm text-text-primary">Click to upload Image, PDF, or DICOM</span>
                </button>
            )}

            {imagePreview && (
                <div className="mb-4 self-center">
                    <img src={imagePreview} alt="Preview" className="rounded-lg max-h-60" />
                </div>
            )}

            <div className="flex gap-2 mt-auto pt-4">
                <button onClick={handleAnalysis} disabled={!imageFile || isLoading} className="w-full bg-highlight text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:bg-gray-500 transition-colors">
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                </button>
                {imageFile && 
                    <button onClick={handleClear} disabled={isLoading} className="w-1/3 bg-danger text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:bg-gray-500 transition-colors">
                        Clear
                    </button>
                }
            </div>
            
            {isLoading && <div className="text-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-highlight mx-auto"></div></div>}
            {error && <div className="text-center p-4 mt-4 bg-danger/20 text-danger rounded-lg text-sm">{error}</div>}
            {result && resultRenderer(result)}
        </div>
    );
};


const ChestXRayResult: React.FC<{result: ChestXRayAnalysis}> = ({result}) => {
    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];
    return (
        <div className="mt-6 animate-fade-in">
            <h3 className="text-xl font-bold mb-2 text-text-primary">Analysis Results</h3>
            {result.predictions.length > 0 && 
            <div className="w-full h-60">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={result.predictions} dataKey="probability" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {result.predictions.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-accent)', borderRadius: '0.5rem' }}/>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            }
            <div className="mt-4 bg-accent p-4 rounded-md">
                <p className="text-text-primary whitespace-pre-wrap prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: result.explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
            </div>
        </div>
    );
};


const SkinLesionResult: React.FC<{result: SkinLesionAnalysis}> = ({result}) => {
    return (
        <div className="mt-6 animate-fade-in">
            <h3 className="text-xl font-bold mb-2 text-text-primary">Analysis Results</h3>
            <div className="bg-accent p-4 rounded-lg text-center">
                <p className="text-lg text-light">Prediction:</p>
                <p className="text-3xl font-bold text-highlight">{result.prediction}</p>
                <p className="text-sm text-light">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
            </div>
             <div className="mt-4 bg-accent p-4 rounded-md">
                <p className="text-text-primary whitespace-pre-wrap prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: result.explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
            </div>
        </div>
    );
};


export default ImageAnalysis;