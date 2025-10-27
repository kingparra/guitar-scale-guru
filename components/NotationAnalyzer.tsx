import React from 'react';
import Card from './common/Card';
import { COLORS } from '../constants';
import type { SongAnalysisResult } from '../types';

interface NotationAnalyzerProps {
    onAnalyze: () => void;
    isAnalyzing: boolean;
    results: SongAnalysisResult[] | null;
    onGenerateFromAnalysis: (result: SongAnalysisResult) => void;
    handleFileChange: (file: File | null) => void;
    imagePreview: string | null;
    isProcessingFile: boolean;
    processingMessage: string;
    canAnalyze: boolean;
}

const NotationAnalyzer: React.FC<NotationAnalyzerProps> = ({
    onAnalyze,
    isAnalyzing,
    results,
    onGenerateFromAnalysis,
    handleFileChange,
    imagePreview,
    isProcessingFile,
    processingMessage,
    canAnalyze,
}) => {
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileChange(file);
        e.target.value = ''; // Allow re-uploading the same file
    };

    return (
        <>
            <Card>
                <div className="p-4">
                    <h2 className="text-3xl font-bold text-gray-100 mb-4 text-center">
                        Notation Analyzer
                    </h2>
                    <p
                        className="text-lg max-w-3xl mx-auto mb-6 text-center"
                        style={{ color: COLORS.textSecondary }}
                    >
                        Upload a multi-page PDF or an image of your score, and
                        the AI will analyze the entire document to suggest the
                        best scale.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <div className="flex-1 w-full">
                            <label
                                htmlFor="notation-upload"
                                className="w-full flex items-center justify-center px-4 py-6 bg-[#0D0B1A]/70 border-2 border-dashed border-purple-400/30 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors"
                            >
                                <div className="text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-500"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-400">
                                        <span className="font-semibold text-cyan-400">
                                            Click to upload
                                        </span>{' '}
                                        or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PDF, PNG, JPG up to 10MB
                                    </p>
                                </div>
                            </label>
                            <input
                                id="notation-upload"
                                type="file"
                                accept="application/pdf, image/png, image/jpeg"
                                onChange={onFileChange}
                                className="hidden"
                            />
                        </div>
                        {isProcessingFile && (
                            <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-400"></div>
                                <p
                                    className="mt-4 text-lg font-semibold"
                                    style={{ color: COLORS.textPrimary }}
                                >
                                    {processingMessage}
                                </p>
                            </div>
                        )}
                        {!isProcessingFile && imagePreview && (
                            <div className="flex-1 w-full flex flex-col items-center gap-4">
                                <img
                                    src={imagePreview}
                                    alt="Notation preview"
                                    className="max-h-48 w-auto object-contain rounded-md border-2 border-purple-400/50"
                                />
                                <button
                                    onClick={onAnalyze}
                                    disabled={isAnalyzing || !canAnalyze}
                                    className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isAnalyzing ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        'Analyze Notation'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {isAnalyzing && (
                <Card>
                    <div className="flex flex-col items-center justify-center p-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-400"></div>
                        <p
                            className="mt-4 text-lg font-semibold"
                            style={{ color: COLORS.textPrimary }}
                        >
                            Analyzing notation... this may take a moment.
                        </p>
                    </div>
                </Card>
            )}

            {results && (
                <Card className="animate-fade-in">
                    <div className="p-4 text-center">
                        <h3 className="text-2xl font-bold mb-6 text-gray-100">
                            Analysis Complete
                        </h3>
                        <div className="space-y-6">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className="bg-black/20 p-6 rounded-lg border border-purple-400/20"
                                >
                                    <p
                                        className={`text-sm font-bold uppercase tracking-widest ${
                                            result.suitability ===
                                            'Primary Match'
                                                ? 'text-amber-400'
                                                : 'text-cyan-400'
                                        }`}
                                    >
                                        {result.suitability}
                                    </p>
                                    <p className="text-4xl font-bold my-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-md">
                                        {result.rootNote} {result.scaleName}
                                    </p>
                                    <p
                                        className="italic max-w-2xl mx-auto my-4"
                                        style={{ color: COLORS.textPrimary }}
                                    >
                                        {result.analysis}
                                    </p>
                                    <button
                                        onClick={() =>
                                            onGenerateFromAnalysis(result)
                                        }
                                        className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        Generate Materials
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
};

export default NotationAnalyzer;