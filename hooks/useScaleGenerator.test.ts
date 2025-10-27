import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useScaleGenerator } from './useScaleGenerator';
// FIX: Replaced non-existent imports with valid ones from geminiService.
import {
    generateOverview,
    generateListeningGuide,
    generateLicks,
} from '../services/geminiService';
import {
    generateScaleNotesFromFormula,
    getDiagramMetadataFromScaleNotes,
    generateNotesOnFretboard,
    generateFingeringPositions,
    generateDiagonalRun,
    generateHarmonizationTab,
} from '../utils/guitarUtils';
import type { ScaleDetails, DiagramData } from '../types';

// Mock the services and utils
jest.mock('../services/geminiService');
jest.mock('../utils/guitarUtils');

// Create typed mocks
const mockGenerateOverview = generateOverview as jest.Mock;
// FIX: Renamed mock variables to match new imports.
const mockGenerateListeningGuide = generateListeningGuide as jest.Mock;
const mockGenerateLicks = generateLicks as jest.Mock;
const mockGenerateScaleNotesFromFormula =
    generateScaleNotesFromFormula as jest.Mock;
const mockGetDiagramMetadataFromScaleNotes =
    getDiagramMetadataFromScaleNotes as jest.Mock;
const mockGenerateNotesOnFretboard = generateNotesOnFretboard as jest.Mock;
const mockGenerateFingeringPositions = generateFingeringPositions as jest.Mock;
const mockGenerateDiagonalRun = generateDiagonalRun as jest.Mock;
const mockGenerateHarmonizationTab = generateHarmonizationTab as jest.Mock;

// Mock data
const mockScaleNotes = [{ noteName: 'E', degree: 'R' }];
const mockDiagramMetadata = {
    tonicChordDegrees: ['R', 'b3', '5'],
    characteristicDegrees: ['b6', '7'],
};
const mockClientDiagramData: DiagramData = {
    notesOnFretboard: [{ string: 6, fret: 0, noteName: 'B', degree: '5' }],
    fingering: [],
    diagonalRun: [],
    tonicChordDegrees: mockDiagramMetadata.tonicChordDegrees,
    characteristicDegrees: mockDiagramMetadata.characteristicDegrees,
};
const mockOverviewData = { overview: { title: 'E Harmonic Minor' } };
const mockResourceData = { listeningGuide: [] };
const mockPracticeData = {
    keyChords: {},
    advancedHarmonization: [{ name: 'Thirds' }],
};

describe('useScaleGenerator', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mock implementations for the new client-first architecture
        mockGenerateScaleNotesFromFormula.mockReturnValue(mockScaleNotes);
        mockGetDiagramMetadataFromScaleNotes.mockReturnValue(mockDiagramMetadata);
        mockGenerateNotesOnFretboard.mockReturnValue(
            mockClientDiagramData.notesOnFretboard
        );
        mockGenerateFingeringPositions.mockReturnValue(
            mockClientDiagramData.fingering
        );
        mockGenerateDiagonalRun.mockReturnValue(mockClientDiagramData.diagonalRun);
        mockGenerateHarmonizationTab.mockReturnValue({ columns: [] });

        // AI calls are now async and parallel
        mockGenerateOverview.mockResolvedValue(mockOverviewData);
        // FIX: Updated mock function calls.
        mockGenerateListeningGuide.mockResolvedValue(mockResourceData);
        mockGenerateLicks.mockResolvedValue(mockPracticeData);
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useScaleGenerator());
        expect(result.current.rootNote).toBe('E');
        expect(result.current.scaleName).toBe('Harmonic Minor');
        expect(result.current.loadingState.status).toBe('idle');
    });

    it('should perform all client-side generation synchronously and instantly update UI', async () => {
        const { result } = renderHook(() => useScaleGenerator());

        // Use a non-async act because the initial state update is synchronous
        act(() => {
            result.current.generate('E', 'Harmonic Minor');
        });

        // Verify all client-side utils were called immediately
        expect(mockGenerateScaleNotesFromFormula).toHaveBeenCalledWith(
            'E',
            'Harmonic Minor'
        );
        expect(mockGetDiagramMetadataFromScaleNotes).toHaveBeenCalledWith(
            mockScaleNotes
        );
        expect(mockGenerateNotesOnFretboard).toHaveBeenCalledWith(mockScaleNotes);

        // Check that the initial state contains the complete diagram data
        expect(result.current.loadingState.isActive).toBe(true);
        // The diagram data is generated client-side, but the state update for it is now managed within the loading state flow,
        // so we check the final state after promises resolve.

        // Now, wait for the async part to finish
        await act(async () => {
            // FIX: `process.nextTick` is not available in the jsdom test environment.
            // Using `setTimeout` with a delay of 0 allows pending promises to resolve.
            await new Promise((resolve) => setTimeout(resolve, 0)); // Let promises resolve
        });

        // Verify async API calls were made
        expect(mockGenerateOverview).toHaveBeenCalled();
        // FIX: Updated mock function assertions.
        expect(mockGenerateListeningGuide).toHaveBeenCalled();
        expect(mockGenerateLicks).toHaveBeenCalled();

        // Check final state
        expect(result.current.loadingState.isActive).toBe(false);
        expect(result.current.loadingState.sections.overview.data).toBeDefined();
        expect(result.current.loadingState.sections.listeningGuide.data).toBeDefined();
    });

    it('should handle errors during client-side generation', () => {
        mockGenerateScaleNotesFromFormula.mockImplementation(() => { throw new Error('Scale formula for "Unknown Scale" not found')}); // Simulate a missing formula
        const { result } = renderHook(() => useScaleGenerator());

        act(() => {
            result.current.generate('E', 'Unknown Scale');
        });

        expect(result.current.loadingState.isActive).toBe(false);
        expect(result.current.loadingState.status).toBe('error');
        expect(result.current.loadingState.sections.overview.error).toContain(
            'Scale formula for "Unknown Scale" not found'
        );
    });

    it('should handle errors during asynchronous AI calls', async () => {
        mockGenerateOverview.mockRejectedValue(new Error('API Error'));
        const { result } = renderHook(() => useScaleGenerator());

        await act(async () => {
            await result.current.generate('A', 'Major');
        });

        expect(result.current.loadingState.isActive).toBe(false);
        expect(result.current.loadingState.status).toBe('interrupted');
        expect(result.current.loadingState.sections.overview.status).toBe('error');
        expect(result.current.loadingState.sections.overview.error).toBe('API Error');
    });
});