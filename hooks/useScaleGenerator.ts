import { useState, useCallback } from 'react';
import { generateScaleMaterials } from '../services/geminiService';
import type { ScaleDetails } from '../types';

export const useScaleGenerator = () => {
    const [rootNote, setRootNote] = useState('E');
    const [scaleName, setScaleName] = useState('Harmonic Minor');
    const [scaleDetails, setScaleDetails] = useState<ScaleDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(async (note: string, scale: string) => {
        setIsLoading(true);
        setError(null);
        setScaleDetails(null);
        try {
            const data = await generateScaleMaterials(note, scale);
            setScaleDetails(data);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        rootNote,
        setRootNote,
        scaleName,
        setScaleName,
        scaleDetails,
        isLoading,
        error,
        generate,
    };
};
