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
} from '../types';

type ScaleNote = { noteName: string; degree: string };

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
): { pos1: FingeringMap; pos2: FingeringMap; pos3: FingeringMap } => {
    const rootNotes = notesOnFretboard.filter((n) => n.degree === 'R');
    const potentialPositions: FingeringMap[] = [];

    for (const root of rootNotes) {
        if (root.string >= 4 && root.string < NUM_STRINGS) {
            const startFret = root.fret <= 2 ? 1 : root.fret - 1;
            const endFret = startFret + 4;

            const positionNotes = notesOnFretboard.filter(
                (n) => n.fret >= startFret && n.fret <= endFret && n.fret > 0
            );

            if (positionNotes.length > 5) {
                const fingeringMap: FingeringMap = positionNotes.map((note) => {
                    let finger = note.fret - startFret + 1;
                    if (finger < 1) finger = 1;
                    if (finger > 4) finger = 4;
                    return {
                        key: `${note.string}_${note.fret}`,
                        finger: String(finger),
                    };
                });
                if (
                    !potentialPositions.some(
                        (p) => JSON.stringify(p) === JSON.stringify(fingeringMap)
                    )
                ) {
                    potentialPositions.push(fingeringMap);
                }
            }
        }
    }

    potentialPositions.sort((a, b) => {
        const minFretA = Math.min(
            ...a.map((item) => parseInt(item.key.split('_')[1], 10))
        );
        const minFretB = Math.min(
            ...b.map((item) => parseInt(item.key.split('_')[1], 10))
        );
        return minFretA - minFretB;
    });

    return {
        pos1: potentialPositions[0] || [],
        pos2: potentialPositions[1] || [],
        pos3: potentialPositions[2] || [],
    };
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
 * Generates a structured tab for a scale harmonization exercise, constrained to the playable notes
 * within the three main fingering positions. This ensures the tab is musically coherent and practical.
 * @param {object} fingering - An object containing the three main FingeringMap arrays.
 * @param {ScaleNote[]} scaleNotes - The ordered, fundamental notes of the scale.
 * @param {number} interval - The interval to harmonize by (e.g., 2 for thirds, 5 for sixths).
 * @returns {StructuredTab} The generated tablature object.
 */
export const generateHarmonizationTab = (
    fingering: { pos1: FingeringMap; pos2: FingeringMap; pos3: FingeringMap },
    scaleNotes: ScaleNote[],
    interval: number
): StructuredTab => {
    const columns: TabColumn[] = [];
    if (scaleNotes.length < 2) return { columns };

    const allPositions = [fingering.pos1, fingering.pos2, fingering.pos3];
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
                    {
                        string: rootNote.string,
                        fret: String(rootNote.fret),
                    },
                ]);
                columns.push([
                    {
                        string: harmonyNote.string,
                        fret: String(harmonyNote.fret),
                    },
                ]);
            }
        }
        if (columns.length > 0) {
            columns.push(
                Array.from({ length: NUM_STRINGS }, (_, i) => ({
                    string: i,
                    fret: '|',
                }))
            );
        }
    }

    if (columns[columns.length - 1]?.[0]?.fret !== '|') {
        columns.push(
            Array.from({ length: NUM_STRINGS }, (_, i) => ({
                string: i,
                fret: '|',
            }))
        );
    }

    return { columns };
};