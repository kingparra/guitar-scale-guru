
import { useState, useCallback, useRef } from 'react';
import { generateCoreMaterials, generateResources, generatePractice } from '../services/geminiService';
import type { ScaleDetails } from '../types';

// Cache is now managed by the hook that orchestrates the full data generation.
const scaleCache = new Map<string, ScaleDetails>();

export const useScaleGenerator = () => {
    const [rootNote, setRootNote] = useState('E');
    const [scaleName, setScaleName] = useState('Harmonic Minor');
    const [scaleDetails, setScaleDetails] = useState<ScaleDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Use a ref to track the current generation request to prevent race conditions
    const generationIdRef = useRef(0);

    const generate = useCallback(async (note: string, scale: string) => {
        const cacheKey = `${note}_${scale}`;
        if (scaleCache.has(cacheKey)) {
            console.log("Returning cached data for", cacheKey);
            setScaleDetails(scaleCache.get(cacheKey)!);
            return;
        }

        const currentGenerationId = ++generationIdRef.current;

        setIsLoading(true);
        setError(null);
        setScaleDetails(null); // Clear previous results immediately

        try {
            // Step 1: Fetch core materials (overview and diagrams)
            const coreData = await generateCoreMaterials(note, scale);
            if (generationIdRef.current !== currentGenerationId) return; // A new request has started
            setScaleDetails(coreData);

            // Step 2: Fetch resources (links, tone, etc.)
            const resourceData = await generateResources(note, scale);
            if (generationIdRef.current !== currentGenerationId) return;
            setScaleDetails(prev => ({ ...prev, ...resourceData }));

            // Step 3: Fetch practice materials (chords, licks, etc.)
            const practiceData = await generatePractice(note, scale);
            if (generationIdRef.current !== currentGenerationId) return;

            // Final update and cache the complete object
            let finalDetails: ScaleDetails | null = null;
            setScaleDetails(prev => {
                // The previous state 'prev' might be null if the request was very fast
                // or if a part of it was cancelled. We combine all fetched parts.
                finalDetails = { ...coreData, ...resourceData, ...practiceData };
                return finalDetails;
            });

            if (finalDetails) {
                 scaleCache.set(cacheKey, finalDetails);
            }

        } catch (err: any) {
            if (generationIdRef.current === currentGenerationId) {
                setError(err.message || 'An unknown error occurred.');
                setScaleDetails(null); // Clear partial results on error
            }
        } finally {
            if (generationIdRef.current === currentGenerationId) {
                setIsLoading(false);
            }
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