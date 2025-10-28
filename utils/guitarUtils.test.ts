import { describe, it, expect } from '@jest/globals';
import {
    generateScaleNotesFromFormula,
    generateDiatonicChords,
    CHORD_VOICING_LIBRARY,
} from './guitarUtils';

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

    describe('CHORD_VOICING_LIBRARY Playability', () => {
        it('should ensure all defined voicings use four or fewer unique fingers', () => {
            CHORD_VOICING_LIBRARY.forEach((voicing) => {
                const fingers = new Set(voicing.notes.map((note) => note.finger));
                const fingerCount = fingers.size;
                // Assert that the number of unique fingers is 4 or less.
                expect(fingerCount).toBeLessThanOrEqual(4);
            });
        });
    });

    describe('generateDiatonicChords', () => {
        it('should generate the correct diatonic chords for C Major', () => {
            const scaleNotes = generateScaleNotesFromFormula('C', 'Major');
            const chords = generateDiatonicChords(scaleNotes!);

            expect(chords.get('I')?.name).toBe('Cmaj');
            expect(chords.get('ii')?.name).toBe('Dmin');
            expect(chords.get('iii')?.name).toBe('Emin');
            expect(chords.get('IV')?.name).toBe('Fmaj');
            expect(chords.get('V')?.name).toBe('Gmaj');
            expect(chords.get('vi')?.name).toBe('Amin');
            expect(chords.get('vii°')?.name).toBe('Bdim');

            // Check that voicings have been found
            expect(chords.get('I')?.voicings.length).toBeGreaterThan(0);
            expect(chords.get('ii')?.voicings.length).toBeGreaterThan(0);
        });

        it('should generate the correct diatonic chords for A Natural Minor', () => {
            const scaleNotes = generateScaleNotesFromFormula(
                'A',
                'Natural Minor'
            );
            const chords = generateDiatonicChords(scaleNotes!);

            expect(chords.get('i')?.name).toBe('Amin');
            expect(chords.get('ii°')?.name).toBe('Bdim');
            expect(chords.get('III')?.name).toBe('Cmaj');
            expect(chords.get('iv')?.name).toBe('Dmin');
            expect(chords.get('v')?.name).toBe('Emin');
            expect(chords.get('VI')?.name).toBe('Fmaj');
            expect(chords.get('VII')?.name).toBe('Gmaj');
        });
    });
});
