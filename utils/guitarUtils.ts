import {
    TUNING,
    NUM_FRETS,
    ALL_NOTES,
    NOTE_MAP,
    NUM_STRINGS,
    SCALE_FORMULAS,
} from '../constants';
import type {
    DiagramNote,
    FingeringMap,
    PathDiagramNote,
    TabColumn,
    StructuredTab,
    ChordDiagramData,
    Chord,
} from '../types';

type ScaleNote = { noteName: string; degree: string };

// New: Library of common 7-string chord voicings
// Format: { frets: [low B, ..., high E], fingers: [...], baseFret: #, barres: [] }
const CHORD_VOICINGS: Record<string, Partial<ChordDiagramData>[]> = {
    major: [
        {
            frets: ['x', 0, 2, 2, 2, 0, 'x'],
            fingers: ['', 0, 2, 3, 4, 0, ''],
            baseFret: 1,
            barres: [],
        }, // A form
        {
            frets: ['x', 'x', 0, 2, 2, 1, 0],
            fingers: ['', '', 0, 3, 4, 2, 0],
            baseFret: 1,
            barres: [],
        }, // D form
    ],
    minor: [
        {
            frets: ['x', 0, 2, 2, 1, 0, 'x'],
            fingers: ['', 0, 3, 4, 2, 0, ''],
            baseFret: 1,
            barres: [],
        }, // Am form
        {
            frets: ['x', 'x', 0, 2, 3, 1, 'x'],
            fingers: ['', '', 0, 2, 4, 1, ''],
            baseFret: 1,
            barres: [],
        }, // Dm form
    ],
    diminished: [
        {
            frets: ['x', 1, 2, 0, 2, 'x', 'x'],
            fingers: ['', 1, 2, 0, 3, '', ''],
            baseFret: 1,
            barres: [],
        }, // C#dim form
    ],
    augmented: [
        {
            frets: ['x', 'x', 1, 0, 0, 'x', 'x'],
            fingers: ['', '', 2, 1, 1, '', ''],
            baseFret: 1,
            barres: [],
        }, // Caug form
    ],
    dominant: [
        {
            frets: ['x', 0, 2, 0, 2, 0, 'x'],
            fingers: ['', 0, 2, 0, 3, 0, ''],
            baseFret: 1,
            barres: [],
        }, // A7 form
    ],
};

/**
 * Generates the fundamental notes of a scale using a predefined interval formula.
 * This is a purely deterministic, client-side function, removing the need for an AI call.
 * @param {string} rootNote - The starting note of the scale (e.g., 'E', 'F#').
 * @param {string} scaleName - The name of the scale to generate (e.g., 'Harmonic Minor').
 * @returns {ScaleNote[] | null} An array of the scale's notes or null if the formula is not found.
 */
export const generateScaleNotesFromFormula = (
    rootNote: string,
    scaleName: string
): ScaleNote[] | null => {
    const formula = SCALE_FORMULAS[scaleName];
    if (!formula) {
        return null;
    }

    const scaleNotes: ScaleNote[] = [{ noteName: rootNote, degree: 'R' }];
    let currentNoteIndex = NOTE_MAP[rootNote];

    for (const [interval, degree] of formula) {
        currentNoteIndex = (currentNoteIndex + interval) % ALL_NOTES.length;
        scaleNotes.push({
            noteName: ALL_NOTES[currentNoteIndex],
            degree: degree,
        });
    }

    return scaleNotes;
};

/**
 * Determines which notes to highlight in diagrams based on the scale structure.
 * This is a deterministic, client-side function.
 * @param {ScaleNote[]} scaleNotes - The array of fundamental scale notes.
 * @returns An object containing arrays of tonic chord degrees and characteristic degrees.
 */
export const getDiagramMetadataFromScaleNotes = (
    scaleNotes: ScaleNote[]
): { tonicChordDegrees: string[]; characteristicDegrees: string[] } => {
    const degrees = scaleNotes.map((n) => n.degree);
    const has = (d: string) => degrees.includes(d);

    let tonicChordDegrees: string[] = ['R'];
    if (has('3')) tonicChordDegrees.push('3');
    if (has('b3')) tonicChordDegrees.push('b3');
    if (has('5')) tonicChordDegrees.push('5');
    if (has('b5')) tonicChordDegrees.push('b5');

    const characteristicDegrees: string[] = [];
    if (has('b2')) characteristicDegrees.push('b2');
    if (has('#4')) characteristicDegrees.push('#4');
    if (has('b6')) characteristicDegrees.push('b6');
    if (has('7') && has('b6')) characteristicDegrees.push('7');
    if (has('6') && has('b7')) characteristicDegrees.push('6');

    return { tonicChordDegrees, characteristicDegrees };
};

export const generateNotesOnFretboard = (
    scaleNotes: ScaleNote[]
): DiagramNote[] => {
    const notesOnFretboard: DiagramNote[] = [];
    if (!scaleNotes || scaleNotes.length === 0) return notesOnFretboard;

    const scaleNoteMap = new Map(scaleNotes.map((n) => [n.noteName, n.degree]));

    for (let stringIndex = 0; stringIndex < TUNING.length; stringIndex++) {
        const openStringNote = TUNING[stringIndex];
        const openStringNoteIndex = NOTE_MAP[openStringNote];

        if (openStringNoteIndex === undefined) continue;

        for (let fret = 0; fret <= NUM_FRETS; fret++) {
            const currentNoteIndex =
                (openStringNoteIndex + fret) % ALL_NOTES.length;
            const currentNoteName = ALL_NOTES[currentNoteIndex];

            if (scaleNoteMap.has(currentNoteName)) {
                notesOnFretboard.push({
                    string: stringIndex,
                    fret,
                    noteName: currentNoteName,
                    degree: scaleNoteMap.get(currentNoteName)!,
                });
            }
        }
    }
    return notesOnFretboard;
};

export const generateFingeringPositions = (
    notesOnFretboard: DiagramNote[]
): FingeringMap[] => {
    const rootNotes = notesOnFretboard.filter((n) => n.degree === 'R');
    // Using a Map for robust de-duplication based on content
    const potentialPositions = new Map<string, FingeringMap>();

    // No longer restricting root notes to lower strings to find all possible positions
    for (const root of rootNotes) {
        // Define a 5-fret window. If root is on fret 1 or 2, start from 1.
        // Otherwise, start one fret behind the root to center it.
        const startFret = root.fret <= 2 ? 1 : root.fret - 1;
        const endFret = startFret + 4;

        // Collect all notes within this window, excluding open strings for position definition
        const positionNotes = notesOnFretboard.filter(
            (n) => n.fret >= startFret && n.fret <= endFret && n.fret > 0
        );

        // A position is valid if it has a minimum number of notes
        if (positionNotes.length > 5) {
            const fingeringMap: FingeringMap = positionNotes.map((note) => {
                let finger = note.fret - startFret + 1;
                // Clamp finger value between 1 and 4
                if (finger < 1) finger = 1;
                if (finger > 4) finger = 4;
                return {
                    key: `${note.string}_${note.fret}`,
                    finger: String(finger),
                };
            });

            // Use a sorted list of note keys as a canonical key for de-duplication
            const canonicalKey = fingeringMap
                .map((f) => f.key)
                .sort()
                .join(',');

            if (!potentialPositions.has(canonicalKey)) {
                potentialPositions.set(canonicalKey, fingeringMap);
            }
        }
    }

    const uniquePositions = Array.from(potentialPositions.values());

    // Sort positions by their minimum fret number
    uniquePositions.sort((a, b) => {
        const minFretA = Math.min(
            ...a.map((item) => parseInt(item.key.split('_')[1], 10))
        );
        const minFretB = Math.min(
            ...b.map((item) => parseInt(item.key.split('_')[1], 10))
        );
        return minFretA - minFretB;
    });

    // Filter to positions that start at or before the 12th fret
    const finalPositions = uniquePositions.filter((pos) => {
        if (pos.length === 0) return false;
        const minFret = Math.min(
            ...pos.map((item) => parseInt(item.key.split('_')[1], 10))
        );
        return minFret <= 12;
    });

    // The user asked for "about 7". We will cap it at 7 to avoid overwhelming the UI.
    return finalPositions.slice(0, 7);
};

export const generateDiagonalRun = (
    notesOnFretboard: DiagramNote[]
): PathDiagramNote[] => {
    if (notesOnFretboard.length === 0) return [];

    const run: PathDiagramNote[] = [];
    const notesByString = Array.from(
        { length: NUM_STRINGS },
        () => [] as DiagramNote[]
    );
    notesOnFretboard.forEach((n) => notesByString[n.string].push(n));
    notesByString.forEach((s) => s.sort((a, b) => a.fret - b.fret));

    let lastFret = -1;

    for (let s = NUM_STRINGS - 1; s >= 0; s--) {
        const notesOnString = notesByString[s].filter((n) => n.fret > lastFret);
        if (notesOnString.length === 0) continue;

        let stringRun = notesOnString.slice(0, 3);
        if (stringRun.length === 0 && notesOnString.length > 0) {
            stringRun = [notesOnString[0]];
        }

        stringRun.forEach((note) => {
            const fretDiff = note.fret - (stringRun[0]?.fret || 0);
            let finger = '1';
            if (fretDiff > 0 && fretDiff <= 2) finger = '2';
            else if (fretDiff > 2 && fretDiff <= 4) finger = '3';
            else if (fretDiff > 4) finger = '4';
            run.push({ ...note, finger });
        });

        lastFret = stringRun[stringRun.length - 1]?.fret ?? lastFret;
    }

    return run;
};

/**
 * Generates a structured tab for a scale harmonization exercise.
 */
export const generateHarmonizationTab = (
    fingering: FingeringMap[],
    scaleNotes: ScaleNote[],
    interval: number
): StructuredTab => {
    const columns: TabColumn[] = [];
    if (scaleNotes.length < 2) return { columns };

    const allPositions = fingering;
    const scaleNoteNameMap = new Map(
        scaleNotes.map((n, i) => [n.noteName, i])
    );

    for (const position of allPositions) {
        if (position.length === 0) continue;

        const positionNotes: DiagramNote[] = position.map((p) => {
            const [string, fret] = p.key.split('_').map(Number);
            const openStringNoteIndex = NOTE_MAP[TUNING[string]];
            const noteName =
                ALL_NOTES[(openStringNoteIndex + fret) % ALL_NOTES.length];
            return { string, fret, noteName };
        });
        positionNotes.sort((a, b) => b.string - a.string || a.fret - b.fret);

        for (const rootNote of positionNotes) {
            const rootIndex = scaleNoteNameMap.get(rootNote.noteName!);
            if (rootIndex === undefined) continue;

            const harmonyIndex = (rootIndex + interval) % scaleNotes.length;
            const harmonyNoteName = scaleNotes[harmonyIndex].noteName;

            const harmonyNote = positionNotes.find(
                (n) =>
                    n.noteName === harmonyNoteName &&
                    n.string < rootNote.string &&
                    Math.abs(n.fret - rootNote.fret) <= 4
            );

            if (harmonyNote) {
                columns.push([
                    { string: rootNote.string, fret: String(rootNote.fret) },
                ]);
                columns.push([
                    { string: harmonyNote.string, fret: String(harmonyNote.fret) },
                ]);
            }
        }
        if (columns.length > 0) {
            columns.push(
                Array.from({ length: NUM_STRINGS }, (_, i) => ({ string: i, fret: '|' }))
            );
        }
    }

    if (columns[columns.length - 1]?.[0]?.fret !== '|') {
        columns.push(
            Array.from({ length: NUM_STRINGS }, (_, i) => ({ string: i, fret: '|' }))
        );
    }

    return { columns };
};

/**
 * Algorithmically generates all diatonic chords for a given scale.
 */
export const generateDiatonicChords = (
    scaleNotes: ScaleNote[]
): Map<string, Chord> => {
    const chords = new Map<string, Chord>();
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

    for (let i = 0; i < scaleNotes.length; i++) {
        const rootNote = scaleNotes[i];
        const third = scaleNotes[(i + 2) % scaleNotes.length];
        const fifth = scaleNotes[(i + 4) % scaleNotes.length];

        const rootIndex = NOTE_MAP[rootNote.noteName];
        const thirdIndex = NOTE_MAP[third.noteName];
        const fifthIndex = NOTE_MAP[fifth.noteName];

        const interval3 = (thirdIndex - rootIndex + 12) % 12;
        const interval5 = (fifthIndex - rootIndex + 12) % 12;

        let quality: keyof typeof CHORD_VOICINGS = 'major';
        let degree = romanNumerals[i];

        if (interval3 === 3 && interval5 === 7) {
            quality = 'minor';
            degree = degree.toLowerCase();
        } else if (interval3 === 4 && interval5 === 7) {
            quality = 'major';
        } else if (interval3 === 3 && interval5 === 6) {
            quality = 'diminished';
            degree = `${degree.toLowerCase()}°`;
        } else if (interval3 === 4 && interval5 === 8) {
            quality = 'augmented';
            degree = `${degree}+`;
        }

        const voicing = CHORD_VOICINGS[quality]?.[0] || CHORD_VOICINGS.major[0];
        const rootFret = findFret(4, rootNote.noteName); // Find root on the A string

        if (rootFret !== null && voicing) {
            const transposedVoicing: ChordDiagramData = {
                frets: voicing.frets!.map((f) => (typeof f === 'number' ? f + rootFret : f)),
                fingers: voicing.fingers!,
                baseFret: (voicing.baseFret || 1) + rootFret - 1,
                barres: (voicing.barres || []).map(b => ({ ...b, fret: b.fret + rootFret })),
            };

            chords.set(degree, {
                name: `${rootNote.noteName}${quality === 'major' ? '' : quality === 'minor' ? 'm' : 'dim'}`,
                degree: degree,
                diagramData: transposedVoicing,
            });
        }
    }
    return chords;
};

/**
 * Finds the fret number for a given note on a given string.
 */
const findFret = (stringIndex: number, noteName: string): number | null => {
    const openNoteIndex = NOTE_MAP[TUNING[stringIndex]];
    const targetNoteIndex = NOTE_MAP[noteName];
    if (openNoteIndex === undefined || targetNoteIndex === undefined) return null;
    return (targetNoteIndex - openNoteIndex + 12) % 12;
};

/**
 * Generates the markdown table for scale degrees.
 */
export const generateDegreeTableMarkdown = (scaleNotes: ScaleNote[]): string => {
    const headers = '| Degree | Interval | Note |';
    const separator = '|---|---|---|';
    const rows = scaleNotes.map(n => `| ${n.degree} | ${n.degree} | ${n.noteName} |`).join('\n');
    return `${headers}\n${separator}\n${rows}`;
};