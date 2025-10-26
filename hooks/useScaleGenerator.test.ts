// Fix: Import Jest globals explicitly to resolve errors about missing test functions.
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

import { renderHook, act } from '@testing-library/react';
import { useScaleGenerator } from './useScaleGenerator';
// Fix: Import generateCoreMaterials, generateResources, and generatePractice instead of generateScaleMaterials.
import { generateCoreMaterials, generateResources, generatePractice } from '../services/geminiService';
import type { ScaleDetails } from '../types';

// Mock the geminiService
jest.mock('../services/geminiService');

// Fix: Cast to 'any' because Jest's global types are not being recognized.
// Fix: Mock the new refactored functions.
const mockGenerateCoreMaterials = generateCoreMaterials as any;
const mockGenerateResources = generateResources as any;
const mockGeneratePractice = generatePractice as any;


// Fix: Create detailed mock data for each part of the progressive load.
const mockCoreData: Pick<ScaleDetails, 'overview' | 'diagramData'> = {
    overview: { title: 'E Harmonic Minor', character: 'Dark, exotic', theory: 'Minor scale with a raised 7th', usage: 'Neoclassical metal, flamenco', degreeExplanation: '| Degree | Interval | \n|---|---|\n| R | Root |\n| 2 | Major Second |\n| b3 | Minor Third |\n| 4 | Perfect Fourth |\n| 5 | Perfect Fifth |\n| b6 | Minor Sixth |\n| 7 | Major Seventh |' },
    diagramData: { tonicChordDegrees: ['R', 'b3', '5'], characteristicDegrees: ['b6', '7'], notesOnFretboard: [], fingering: { pos1: [], pos2: [], pos3: [] }, diagonalRun: [] },
};
const mockResourceData: Pick<ScaleDetails, 'listeningGuide' | 'youtubeTutorials' | 'creativeApplication' | 'jamTracks' | 'toneAndGear'> = {
    listeningGuide: [{ title: 'Song', artist: 'Artist', spotifyLink: 'http://spotify.com' }],
    youtubeTutorials: [{ title: 'Tutorial', creator: 'Creator', youtubeLink: 'http://youtube.com' }],
    creativeApplication: [{ title: 'Creative Video', creator: 'Creator', youtubeLink: 'http://youtube.com' }],
    jamTracks: [{ title: 'Jam Track', creator: 'Creator', youtubeLink: 'http://youtube.com' }],
    toneAndGear: { suggestions: [{setting: 'Amp', description: 'High gain'}], famousArtists: 'Yngwie Malmsteen' },
};
const mockPracticeData: Pick<ScaleDetails, 'keyChords' | 'licks' | 'advancedHarmonization' | 'etudes' | 'modeSpotlight'> = {
    keyChords: { diatonicQualities: 'i-ii°-III+-iv-V-VI-vii°', progressions: [] },
    licks: [],
    advancedHarmonization: [],
    etudes: [],
    modeSpotlight: { name: 'Phrygian Dominant', explanation: 'The 5th mode', soundAndApplication: 'Exotic' },
};
const mockScaleDetails: ScaleDetails = {
    ...mockCoreData,
    ...mockResourceData,
    ...mockPracticeData
};


describe('useScaleGenerator', () => {
    beforeEach(() => {
        // Fix: Clear new mocks.
        mockGenerateCoreMaterials.mockClear();
        mockGenerateResources.mockClear();
        mockGeneratePractice.mockClear();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useScaleGenerator());
        expect(result.current.rootNote).toBe('E');
        expect(result.current.scaleName).toBe('Harmonic Minor');
        expect(result.current.scaleDetails).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should update rootNote and scaleName', () => {
        const { result } = renderHook(() => useScaleGenerator());

        act(() => {
            result.current.setRootNote('A');
        });
        expect(result.current.rootNote).toBe('A');
        
        act(() => {
            result.current.setScaleName('Major');
        });
        expect(result.current.scaleName).toBe('Major');
    });

    it('should handle successful data generation', async () => {
        // Fix: Mock the sequence of API calls.
        mockGenerateCoreMaterials.mockResolvedValue(mockCoreData);
        mockGenerateResources.mockResolvedValue(mockResourceData);
        mockGeneratePractice.mockResolvedValue(mockPracticeData);

        const { result } = renderHook(() => useScaleGenerator());

        // We need 'await act' for async operations that update state
        await act(async () => {
            await result.current.generate('E', 'Harmonic Minor');
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.scaleDetails).toEqual(mockScaleDetails);
        // Fix: Assert that all new service functions were called.
        expect(mockGenerateCoreMaterials).toHaveBeenCalledWith('E', 'Harmonic Minor');
        expect(mockGenerateResources).toHaveBeenCalledWith('E', 'Harmonic Minor');
        expect(mockGeneratePractice).toHaveBeenCalledWith('E', 'Harmonic Minor');
    });

    it('should handle errors during data generation', async () => {
        const errorMessage = 'API failed';
        // Fix: Mock the first call to fail.
        mockGenerateCoreMaterials.mockRejectedValue(new Error(errorMessage));
        const { result } = renderHook(() => useScaleGenerator());

        await act(async () => {
            await result.current.generate('F#', 'Lydian');
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.scaleDetails).toBeNull();
        expect(result.current.error).toBe(errorMessage);
    });

    it('should set loading state correctly', async () => {
        // Use a promise that we can resolve manually to check intermediate state
        let resolvePromise: (value: any) => void;
        const promise = new Promise<any>(resolve => {
            resolvePromise = resolve;
        });
        // Fix: Mock the first service call with a controllable promise.
        mockGenerateCoreMaterials.mockReturnValue(promise);
        mockGenerateResources.mockResolvedValue(mockResourceData);
        mockGeneratePractice.mockResolvedValue(mockPracticeData);


        const { result } = renderHook(() => useScaleGenerator());

        let generatePromise: Promise<void>;
        act(() => {
            generatePromise = result.current.generate('G', 'Dorian');
        });

        // Check loading state while promise is pending
        expect(result.current.isLoading).toBe(true);

        await act(async () => {
            resolvePromise(mockCoreData);
            await generatePromise;
        });

        // Check state after promise resolves
        expect(result.current.isLoading).toBe(false);
        expect(result.current.scaleDetails).toEqual(mockScaleDetails);
    });
});