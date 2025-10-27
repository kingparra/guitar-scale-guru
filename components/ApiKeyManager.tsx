import React from 'react';
import Card from './common/Card';
import { COLORS } from '../constants';

interface ApiKeyManagerProps {
    onSelectKey: () => void;
    isCheckingKey: boolean;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
    onSelectKey,
    isCheckingKey,
}) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <Card className="max-w-md w-full animate-fade-in">
                <div className="p-4 text-center">
                    <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                        API Key Required
                    </h2>
                    <p
                        className="mb-6"
                        style={{ color: COLORS.textSecondary }}
                    >
                        To use the AI-powered features of Guitar Scale Guru, you
                        need to select your Google AI Studio API key. Your key
                        is stored securely and is not shared.
                    </p>
                    <button
                        onClick={onSelectKey}
                        disabled={isCheckingKey}
                        className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-fuchsia-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
                    >
                        {isCheckingKey ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            'Select API Key'
                        )}
                    </button>
                    <p className="text-xs mt-4 text-purple-400/60">
                        This app uses generative AI. For information on pricing,
                        please review the{' '}
                        <a
                            href="https://ai.google.dev/gemini-api/docs/billing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-cyan-400"
                        >
                            billing documentation
                        </a>
                        .
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default ApiKeyManager;
