import { renderHook } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { useFretboardLayout } from './useFretboardLayout';
import type { DiagramNote } from '../types';

const mockNotes: DiagramNote[] = [
    { string: 0, fret: 5 },
    { string: 6, fret: 12 },
    { string: 3, fret: 0 },
];

describe('useFretboardLayout', () => {

    describe('Full Neck Layout (0-24 frets)', () => {
        const { result } = renderHook(() => useFretboardLayout([0, 24], mockNotes));

        it('should identify as full neck and use smaller fret widths', () => {
            expect(result.current.fretWidth).toBe(50);
        });

        it('should include an "OPEN" column', () => {
            expect(result.current.hasOpenColumn).toBe(true);
        });
        
        it('should calculate the correct diagram width', () => {
            const expectedWidth = (24 - 0 + 1) * 50; // 25 columns * 50 width
            expect(result.current.diagramWidth).toBe(expectedWidth);
        });
        
        it('should correctly filter notes within the full range', () => {
            expect(result.current.notesToRender).toHaveLength(3); // All mock notes are within 0-24
        });
        
        it('should provide correct X coordinate for a fret', () => {
            // With an OPEN column, fret 5 is the 6th column. Center of 6th column = 5.5 * width
            expect(result.current.getX(5)).toBe(5.5 * 50);
        });
    });

    describe('Position-Based Layout (e.g., frets 3-7)', () => {
        const { result } = renderHook(() => useFretboardLayout([3, 7], mockNotes));

        it('should use larger fret widths for positions', () => {
            expect(result.current.fretWidth).toBe(100);
        });

        it('should NOT include an "OPEN" column', () => {
            expect(result.current.hasOpenColumn).toBe(false);
        });

        it('should calculate the correct diagram width for a position', () => {
            const displayedFretCount = 7 - 3 + 1; // 5 frets
            // An extra column of width is added for the start fret border
            const expectedWidth = (displayedFretCount + 1) * 100;
            expect(result.current.diagramWidth).toBe(expectedWidth);
        });

        it('should filter out notes outside the fret range', () => {
            // Only the note at fret 5 should be included
            expect(result.current.notesToRender).toHaveLength(1);
            expect(result.current.notesToRender[0].fret).toBe(5);
        });

        it('should provide correct X coordinate for a fret in a position view', () => {
            // In position view, coordinates are shifted. Fret 3 is the first column, center is 1 * width.
            expect(result.current.getX(3)).toBe(1 * 100);
            expect(result.current.getX(5)).toBe(3 * 100);
        });
    });
});
