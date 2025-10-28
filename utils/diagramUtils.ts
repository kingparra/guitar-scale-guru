import type { FingeringMap, DiagramNote } from '../types';

/**
 * Calculates a playable 5-fret window for a given fingering position.
 * It finds the lowest fretted note and uses that to determine the starting fret for the view.
 * @param {FingeringMap} fingeringMap - An array of fingering entries for a specific position.
 * @returns {[number, number]} A tuple representing the start and end frets for the diagram.
 */
export const calculatePlayableFretRange = (
    fingeringMap: FingeringMap
): [number, number] => {
    if (!fingeringMap || fingeringMap.length === 0) {
        return [1, 5]; // Default fallback, starting at 1 for position diagrams
    }
    // Extract fret numbers from 'string_fret' key
    const frets = fingeringMap.map((item) =>
        parseInt(item.key.split('_')[1], 10)
    );
    // Ignore open strings (fret 0) when determining the minimum fret for a position's range.
    const minFret = Math.min(...frets.filter((f) => f > 0));
    // If the lowest fret is far up the neck, start the diagram there. Otherwise, start at fret 1.
    const startFret = minFret > 1 ? minFret : 1;
    return [startFret, startFret + 4];
};

/**
 * Calculates a compact 5-fret window specifically for a chord diagram.
 * It finds the lowest fretted note (excluding open strings) and creates a view around it.
 * @param {DiagramNote[]} notes - The notes that make up the chord voicing.
 * @returns {[number, number]} A tuple representing the start and end frets.
 */
export const calculateChordFretRange = (
    notes: DiagramNote[]
): [number, number] => {
    if (!notes || notes.length === 0) {
        return [1, 5];
    }
    const frettedNotes = notes.filter((n) => n.fret > 0).map((n) => n.fret);
    if (frettedNotes.length === 0) {
        return [0, 4]; // Case for chords with only open strings
    }
    const minFret = Math.min(...frettedNotes);
    const startFret = minFret > 1 ? minFret : 1;
    return [startFret, startFret + 4];
};
