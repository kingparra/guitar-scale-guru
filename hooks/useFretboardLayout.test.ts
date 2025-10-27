import { renderHook } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { useFretboardLayout } from './useFretboardLayout';
import type { DiagramNote } from '../types';

const mockMasterNotes: DiagramNote[] = [
    { string: 0, fret: 5, noteName: 'A', degree: '5' },
    { string: 6, fret: 12, noteName: 'B', degree: 'R' },
    { string: 3, fret: 0, noteName: 'D', degree: 'b3' },
];

describe('useFretboardLayout', () => {
    describe('Layout Calculation', () => {
        it('should calculate layout for full neck', () => {
            const { result } = renderHook(() =>
                useFretboardLayout([0, 24], mockMasterNotes, 7)
            );
            expect(result.current.fretWidth).toBe(50);
            expect(result.current.hasOpenColumn).toBe(true);
        });

        it('should calculate layout for positions', () => {
            const { result } = renderHook(() =>
                useFretboardLayout([3, 7], mockMasterNotes, 7)
            );
            expect(result.current.fretWidth).toBe(100);
            expect(result.current.hasOpenColumn).toBe(false);
        });
    });

    describe('Chord Diagram Data Handling', () => {
        const chordNotes: DiagramNote[] = [
            { string: 5, fret: 3, finger: '2' },
            { string: 4, fret: 5, finger: '4' },
            { string: 3, fret: 0 },
        ];

        it('should correctly render all notes for a chord, including open strings', () => {
            const { result } = renderHook(() =>
                useFretboardLayout([0, 5], chordNotes, 6)
            );
            expect(result.current.notesToRender).toHaveLength(3);
        });

        it('should not require a fingeringMap', () => {
            const { result } = renderHook(() =>
                useFretboardLayout([0, 5], chordNotes, 6)
            );
            expect(
                result.current.notesToRender.find((n) => n.fret === 3)?.finger
            ).toBe('2');
            expect(
                result.current.notesToRender.find((n) => n.fret === 0)?.finger
            ).toBeUndefined();
        });
    });
});