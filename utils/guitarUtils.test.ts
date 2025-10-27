import { describe, it, expect } from '@jest/globals';
import { generateScaleNotesFromFormula } from './guitarUtils';

describe('guitarUtils', () => {
    describe('generateScaleNotesFromFormula', () => {
        it('should generate a C Major scale correctly', () => {
            const result = generateScaleNotesFromFormula('C', 'Major');
            const noteNames = result?.map((n) => n.noteName);
            expect(noteNames).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
        });

        it('should generate an E Harmonic Minor scale correctly', () => {
            const result = generateScaleNotesFromFormula('E', 'Harmonic Minor');
            const noteNames = result?.map((n) => n.noteName);
            expect(noteNames).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D#']);
        });

        it('should handle scales that wrap around the octave (e.g., A#)', () => {
            const result = generateScaleNotesFromFormula('A#', 'Major');
            const noteNames = result?.map((n) => n.noteName);
            expect(noteNames).toEqual(['A#', 'C', 'D', 'D#', 'F', 'G', 'A']);
        });

        it('should return null for an unknown scale name', () => {
            const result = generateScaleNotesFromFormula('G', 'Super Locrian');
            expect(result).toBeNull();
        });

        it('should correctly assign degrees for a minor scale', () => {
            const result = generateScaleNotesFromFormula('A', 'Natural Minor');
            const degrees = result?.map((n) => n.degree);
            expect(degrees).toEqual(['R', '2', 'b3', '4', '5', 'b6', 'b7']);
        });
    });
});