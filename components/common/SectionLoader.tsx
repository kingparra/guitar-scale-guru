import React, { useState, useEffect } from 'react';
import Card from './Card';
import { COLORS } from '../../constants';

interface SectionLoaderProps {
    title: string;
    status: 'loading' | 'error';
    error: string | null;
    onRetry: () => void;
}

const SectionLoader: React.FC<SectionLoaderProps> = ({
    title,
    status,
    error,
    onRetry,
}) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (status === 'loading') {
            setElapsedTime(0); // Reset timer on new load
            const timer = setInterval(() => {
                setElapsedTime((prev) => prev + 0.1);
            }, 100);
            return () => clearInterval(timer);
        }
    }, [status]);

    const isError = status === 'error';

    return (
        <Card
            className={
                isError ? 'border-red-500/50 shadow-red-500/10' : 'opacity-80'
            }
        >
            <div className="p-4 min-h-[150px] flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-400">{title}</h3>
                </div>
                <div className="flex-grow flex items-center justify-center">
                    {isError ? (
                        <div className="text-center">
                            <p className="text-red-400 font-semibold">
                                Failed to load
                            </p>
                            <p className="text-xs text-red-400/70 mt-1 max-w-xs truncate">
                                {error}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                            <p className="mt-2 text-sm text-cyan-400/80 font-mono">
                                {elapsedTime.toFixed(1)}s
                            </p>
                        </div>
                    )}
                </div>
                <div className="h-8">
                    {isError && (
                        <button
                            onClick={onRetry}
                            className="w-full bg-amber-500/80 hover:bg-amber-500 text-white font-bold py-1 px-4 rounded-md transition-colors text-sm"
                        >
                            Retry
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default SectionLoader;