// Fix: Import Jest globals explicitly to resolve errors about missing test functions.
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

import { renderHook, act } from '@testing-library/react';
import { useScaleGenerator } from './useScaleGenerator';
import { generateScaleMaterials } from '../services/geminiService';
import type { ScaleDetails } from '../types';

// Mock the geminiService
jest.mock('../services/geminiService');

// Fix: Cast to 'any' because Jest's global types are not being recognized.
const mockGenerateScaleMaterials = generateScaleMaterials as any;

const mockScaleDetails: ScaleDetails = {
    overview: { title: 'E Harmonic Minor' },
    // ... other properties filled with mock data
} as any;

describe('useScaleGenerator', () => {
    beforeEach(() => {
        mockGenerateScaleMaterials.mockClear();
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
        mockGenerateScaleMaterials.mockResolvedValue(mockScaleDetails);
        const { result } = renderHook(() => useScaleGenerator());

        // We need 'await act' for async operations that update state
        await act(async () => {
            await result.current.generate('E', 'Harmonic Minor');
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.scaleDetails).toEqual(mockScaleDetails);
        expect(mockGenerateScaleMaterials).toHaveBeenCalledWith('E', 'Harmonic Minor');
    });

    it('should handle errors during data generation', async () => {
        const errorMessage = 'API failed';
        mockGenerateScaleMaterials.mockRejectedValue(new Error(errorMessage));
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
        let resolvePromise: (value: ScaleDetails) => void;
        const promise = new Promise<ScaleDetails>(resolve => {
            resolvePromise = resolve;
        });
        mockGenerateScaleMaterials.mockReturnValue(promise);

        const { result } = renderHook(() => useScaleGenerator());

        let generatePromise: Promise<void>;
        act(() => {
            generatePromise = result.current.generate('G', 'Dorian');
        });

        // Check loading state while promise is pending
        expect(result.current.isLoading).toBe(true);

        await act(async () => {
            resolvePromise(mockScaleDetails);
            await generatePromise;
        });

        // Check state after promise resolves
        expect(result.current.isLoading).toBe(false);
    });
});
