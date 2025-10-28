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
    Chord,
    Voicing,
} from '../types';

type ScaleNote = { noteName: string; degree: string };

// --- Hand Position Modeling ---
interface HandPosition {
    anchorFret: number; // Fret where the index finger rests
    span: number; // Max frets the hand can cover
}

/**
 * Heuristics to determine if a note is reachable from a given hand position.
 * This function models the physical constraints of a guitarist's hand.
 */
const isReachable = (
    note: DiagramNote,
    hand: HandPosition,
    prevNote?: DiagramNote
): { reachable: boolean; cost: number; finger: string } => {
    const fret = note.fret;
    const { anchorFret } = hand;

    // Heuristic #3: Fret-Width Compensation (The "Nut Tax")
    const maxSpan = anchorFret < 5 ? 4 : 5;

    // Base one-finger-per-fret position
    const baseBox = {
        min: anchorFret,
        max: anchorFret + 3,
    };

    // Heuristic #2: Ergonomic Stretches
    const stretchBox = {
        min: anchorFret - 1, // Index finger reach-back
        max: anchorFret + maxSpan, // Pinky reach-forward
    };

    if (fret >= stretchBox.min && fret <= stretchBox.max) {
        let cost = 1;
        let finger = '1';

        const relativeFret = fret - anchorFret;

        switch (relativeFret) {
            case -1: // Index stretch
                finger = '1';
                cost = 2;
                break;
            case 0:
                finger = '1';
                break;
            case 1:
                finger = '2';
                break;
            case 2:
                finger = '3';
                break;
            case 3:
                finger = '4';
                break;
            default: // Pinky stretch
                finger = '4';
                cost = 2;
                break;
        }

        // Heuristic #4: Vertical (Cross-String) Reach Penalty
        if (prevNote) {
            const stringDist = Math.abs(note.string - prevNote.string);
            if (stringDist > 2 && cost > 1) {
                cost += stringDist - 2; // Add extra cost for wide cross-string stretches
            }
        }

        return { reachable: true, cost, finger };
    }

    return { reachable: false, cost: Infinity, finger: '' };
};

/**
 * Finds the most economical path of hand positions to play a sequence of notes.
 */
const findOptimalFingeringPath = (
    notes: DiagramNote[]
): { path: FingeringMap; cost: number } => {
    if (notes.length === 0) return { path: [], cost: 0 };

    let bestPath: FingeringMap = [];
    let minCost = Infinity;

    // Try starting the scale from different comfortable anchor frets
    for (let startAnchor = 1; startAnchor < 12; startAnchor++) {
        let currentHand: HandPosition = { anchorFret: startAnchor, span: 5 };
        let currentPath: FingeringMap = [];
        let totalCost = 0;
        let prevNote: DiagramNote | undefined = undefined;

        for (const note of notes) {
            let reach = isReachable(note, currentHand, prevNote);

            // If not reachable, find the cheapest way to make it reachable
            if (!reach.reachable) {
                let bestShiftCost = Infinity;
                let bestNewHand = currentHand;
                let bestNewReach = reach;

                // Option 1: Full position shift
                // Try anchoring with index finger on the target fret
                const newAnchor = note.fret;
                const newHand = { anchorFret: newAnchor, span: 5 };
                const newReach = isReachable(note, newHand, prevNote);
                if (newReach.reachable) {
                    const shiftCost = 5 + newReach.cost; // Cost of a full position shift
                    if (shiftCost < bestShiftCost) {
                        bestShiftCost = shiftCost;
                        bestNewHand = newHand;
                        bestNewReach = newReach;
                    }
                }
                
                // Option 2: Slide on the same string
                if (prevNote && prevNote.string === note.string) {
                    const slideAnchor = note.fret - (parseInt(bestPath[bestPath.length-1]?.finger || '1', 10) -1)
                    const slideHand = { anchorFret: slideAnchor, span: 5 };
                    const slideReach = isReachable(note, slideHand, prevNote);
                    if (slideReach.reachable) {
                        const slideCost = 3 + slideReach.cost; // Cost of a slide
                        if (slideCost < bestShiftCost) {
                            bestShiftCost = slideCost;
                            bestNewHand = slideHand;
                            bestNewReach = slideReach;
                        }
                    }
                }

                currentHand = bestNewHand;
                reach = bestNewReach;
                totalCost += bestShiftCost;
            }

            totalCost += reach.cost;
            currentPath.push({ key: `${note.string}_${note.fret}`, finger: reach.finger });
            prevNote = note;
        }

        if (totalCost < minCost) {
            minCost = totalCost;
            bestPath = currentPath;
        }
    }
    return { path: bestPath, cost: minCost };
};

/**
 * NEW ALGORITHM: Generates ergonomic fingering positions using a cost-based
 * pathfinding algorithm that models the physical constraints of the human hand.
 */
export const generateFingeringPositions = (
    notesOnFretboard: DiagramNote[]
): FingeringMap[] => {
    const positions: FingeringMap[] = [];

    // Define potential position windows
    const windows = [
        { min: 0, max: 5 }, { min: 2, max: 7 }, { min: 4, max: 9 },
        { min: 6, max: 11 }, { min: 8, max: 13 }, { min: 11, max: 16 },
        { min: 14, max: 19 }
    ];

    for (const window of windows) {
        const notesInWindow = notesOnFretboard.filter(n => n.fret >= window.min && n.fret <= window.max);
        if (notesInWindow.length < 14) continue; // Skip sparse areas

        // Sort notes for a playable path within the window
        notesInWindow.sort((a, b) => b.string - a.string || a.fret - b.fret);
        
        const { path } = findOptimalFingeringPath(notesInWindow);
        
        const stringsCovered = new Set(path.map(p => p.key.split('_')[0])).size;
        if (stringsCovered >= 5 && path.length > 10) {
            positions.push(path);
        }
    }
    
    // De-duplicate positions
    const uniquePositionsMap = new Map<string, FingeringMap>();
    positions.forEach(pos => {
        const key = pos.map(p => p.key).sort().join(',');
        if (!uniquePositionsMap.has(key)) {
            uniquePositionsMap.set(key, pos);
        }
    });

    const uniquePositions = Array.from(uniquePositionsMap.values());
    uniquePositions.sort((a, b) => {
        const minFretA = Math.min(...a.map(item => parseInt(item.key.split('_')[1], 10)));
        const minFretB = Math.min(...b.map(item => parseInt(item.key.split('_')[1], 10)));
        return minFretA - minFretB;
    });

    return uniquePositions.slice(0, 7);
};

/**
 * CORRECTED ALGORITHM: Generates a playable, continuous "3 notes per string" diagonal run
 * with correct, inherited fingerings.
 */
export const generateDiagonalRun = (
    notesOnFretboard: DiagramNote[],
    fingering: FingeringMap[]
): PathDiagramNote[] => {
    if (!fingering || fingering.length === 0) {
        return [];
    }
    // Create a master map of ALL notes with their fingerings from ALL positions
    const fingeringMap = new Map<string, string>();
    fingering.forEach(pos => {
        pos.forEach(note => {
            fingeringMap.set(note.key, note.finger);
        });
    });

    const notesByString = Array.from({ length: NUM_STRINGS }, (): DiagramNote[] => []);
    notesOnFretboard.forEach(note => {
        notesByString[note.string].push(note);
    });
    notesByString.forEach(arr => arr.sort((a, b) => a.fret - b.fret));

    const path: PathDiagramNote[] = [];
    let lastNote: DiagramNote | null = null;

    // Start on the lowest string (index NUM_STRINGS - 1 which is string 6, low B)
    // and go to the highest string (index 0, high E)
    for (let s = NUM_STRINGS - 1; s >= 0; s--) {
        const stringNotes = notesByString[s];
        if (stringNotes.length === 0) continue;

        let notesOnThisString: DiagramNote[] = [];

        if (!lastNote) {
            // This is the first string, start with the first 3 notes
            notesOnThisString = stringNotes.slice(0, Math.min(3, stringNotes.length));
        } else {
            // Find a cluster of 3 notes on this string that is closest to the last note on the previous string
            let bestCluster: DiagramNote[] = [];
            let minAvgDist = Infinity;

            if (stringNotes.length <= 3) {
                 bestCluster = stringNotes;
            } else {
                for (let i = 0; i <= stringNotes.length - 3; i++) {
                    const cluster = stringNotes.slice(i, i + 3);
                    // Find the average fret of the cluster to determine its general position
                    const avgFret = cluster.reduce((sum, n) => sum + n.fret, 0) / 3;
                    const dist = Math.abs(avgFret - lastNote.fret);

                    if (dist < minAvgDist) {
                        minAvgDist = dist;
                        bestCluster = cluster;
                    }
                }
            }
             notesOnThisString = bestCluster;
        }
        
        if (notesOnThisString.length > 0) {
             notesOnThisString.forEach(note => {
                const key = `${note.string}_${note.fret}`;
                const finger = fingeringMap.get(key); // Use the ergonomic finger
                // Only add if we have a finger for it, ensures it's part of a known position
                if (finger) {
                    path.push({ ...note, finger });
                }
            });
            // Update lastNote to be the highest fret note from the ones we just added to the path
            if (notesOnThisString.length > 0) {
                lastNote = notesOnThisString[notesOnThisString.length - 1];
            }
        }
    }
    
    // De-duplicate in case clusters overlap, preserving the first occurrence
    const uniquePath = Array.from(new Map(path.map(p => [`${p.string}_${p.fret}`, p])).values());
    
    // Final sort to ensure playable sequence
    uniquePath.sort((a, b) => b.string - a.string || a.fret - b.fret);

    return uniquePath;
};


// --- Core Helper Functions ---

export const generateScaleNotesFromFormula = (
    rootNote: string,
    scaleName: string
): ScaleNote[] | null => {
    const formula = SCALE_FORMULAS[scaleName];
    if (!formula) return null;
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
            const currentNoteIndex = (openStringNoteIndex + fret) % ALL_NOTES.length;
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

/**
 * ARCHITECTURAL REFACTOR: Replaces programmatic modification with a large, data-driven library
 * of well-known, human-curated 7-string chord voicings.
 */
type VoicingTemplate = Omit<Voicing, 'notes'> & {
    quality: 'maj' | 'min' | 'dim' | 'aug';
    rootNoteName?: string; // For open position chords
    isMovable: boolean;
    root: { string: number; fret: number };
    notes: Omit<DiagramNote, 'noteName' | 'degree'>[];
};

export const CHORD_VOICING_LIBRARY: VoicingTemplate[] = [
    // --- OPEN POSITION ---
    { name: 'Open E Major', quality: 'maj', rootNoteName: 'E', isMovable: false, root: { string: 5, fret: 0 }, notes: [ { string: 5, fret: 0, finger: '0' }, { string: 4, fret: 2, finger: '2' }, { string: 3, fret: 2, finger: '3' }, { string: 2, fret: 1, finger: '1' }, { string: 1, fret: 0, finger: '0' }, { string: 0, fret: 0, finger: '0' } ], openStrings: [6, 5, 1, 0], mutedStrings: [] },
    { name: 'Open E Minor', quality: 'min', rootNoteName: 'E', isMovable: false, root: { string: 5, fret: 0 }, notes: [ { string: 5, fret: 0, finger: '0' }, { string: 4, fret: 2, finger: '2' }, { string: 3, fret: 2, finger: '3' }, { string: 2, fret: 0, finger: '0' }, { string: 1, fret: 0, finger: '0' }, { string: 0, fret: 0, finger: '0' } ], openStrings: [6, 5, 2, 1, 0], mutedStrings: [] },
    { name: 'Open A Major', quality: 'maj', rootNoteName: 'A', isMovable: false, root: { string: 4, fret: 0 }, notes: [ { string: 4, fret: 0, finger: '0' }, { string: 3, fret: 2, finger: '1' }, { string: 2, fret: 2, finger: '2' }, { string: 1, fret: 2, finger: '3' }, { string: 0, fret: 0, finger: '0' } ], openStrings: [5, 4, 0], mutedStrings: [6] },
    { name: 'Open A Minor', quality: 'min', rootNoteName: 'A', isMovable: false, root: { string: 4, fret: 0 }, notes: [ { string: 4, fret: 0, finger: '0' }, { string: 3, fret: 2, finger: '2' }, { string: 2, fret: 2, finger: '3' }, { string: 1, fret: 1, finger: '1' }, { string: 0, fret: 0, finger: '0' } ], openStrings: [5, 4, 0], mutedStrings: [6] },
    { name: 'Open D Major', quality: 'maj', rootNoteName: 'D', isMovable: false, root: { string: 3, fret: 0 }, notes: [ { string: 3, fret: 0, finger: '0' }, { string: 2, fret: 2, finger: '1' }, { string: 1, fret: 3, finger: '3' }, { string: 0, fret: 2, finger: '2' } ], openStrings: [4, 3], mutedStrings: [6, 5] },
    { name: 'Open D Minor', quality: 'min', rootNoteName: 'D', isMovable: false, root: { string: 3, fret: 0 }, notes: [ { string: 3, fret: 0, finger: '0' }, { string: 2, fret: 2, finger: '2' }, { string: 1, fret: 3, finger: '3' }, { string: 0, fret: 1, finger: '1' } ], openStrings: [4, 3], mutedStrings: [6, 5] },
    { name: 'Open G Major', quality: 'maj', rootNoteName: 'G', isMovable: false, root: { string: 2, fret: 0 }, notes: [ { string: 5, fret: 2, finger: '1' }, { string: 4, fret: 0, finger: '0' }, { string: 3, fret: 0, finger: '0' }, { string: 2, fret: 0, finger: '0' }, { string: 1, fret: 3, finger: '3' }, { string: 0, fret: 3, finger: '4' } ], openStrings: [4,3,2], mutedStrings: [6] },
    { name: 'Open C Major', quality: 'maj', rootNoteName: 'C', isMovable: false, root: { string: 4, fret: 3 }, notes: [ { string: 4, fret: 3, finger: '3' }, { string: 3, fret: 2, finger: '2' }, { string: 2, fret: 0, finger: '0' }, { string: 1, fret: 1, finger: '1' }, { string: 0, fret: 0, finger: '0' } ], openStrings: [2,0], mutedStrings: [6, 5] },
    { name: 'Open B Diminished', quality: 'dim', rootNoteName: 'B', isMovable: false, root: { string: 4, fret: 2 }, notes: [ { string: 4, fret: 2, finger: '2' }, { string: 3, fret: 0, finger: '0' }, { string: 2, fret: 2, finger: '3' }, { string: 1, fret: 0, finger: '0' } ], openStrings: [3,1,0], mutedStrings: [6,5] },

    // --- MOVABLE SHAPES ---
    // E-Shape Barre Chords (Root on Low E or B string)
    { name: 'E-Shape Barre', quality: 'maj', isMovable: true, root: { string: 5, fret: 1 }, notes: [ { string: 6, fret: 1, finger: '1' }, { string: 5, fret: 1, finger: '1' }, { string: 4, fret: 3, finger: '3' }, { string: 3, fret: 3, finger: '4' }, { string: 2, fret: 2, finger: '2' }, { string: 1, fret: 1, finger: '1' }, { string: 0, fret: 1, finger: '1' } ], barres: [{ fromString: 0, toString: 6, fret: 1 }] },
    { name: 'E-Shape Barre', quality: 'min', isMovable: true, root: { string: 5, fret: 1 }, notes: [ { string: 6, fret: 1, finger: '1' }, { string: 5, fret: 1, finger: '1' }, { string: 4, fret: 3, finger: '3' }, { string: 3, fret: 3, finger: '4' }, { string: 2, fret: 1, finger: '1' }, { string: 1, fret: 1, finger: '1' }, { string: 0, fret: 1, finger: '1' } ], barres: [{ fromString: 0, toString: 6, fret: 1 }] },
    // A-Shape Barre Chords (Root on A string)
    { name: 'A-Shape Barre', quality: 'maj', isMovable: true, root: { string: 4, fret: 1 }, notes: [ { string: 5, fret: 1, finger: '1' }, { string: 4, fret: 1, finger: '1' }, { string: 3, fret: 3, finger: '2' }, { string: 2, fret: 3, finger: '3' }, { string: 1, fret: 3, finger: '4' }, { string: 0, fret: 1, finger: '1' } ], barres: [{ fromString: 0, toString: 5, fret: 1 }] },
    { name: 'A-Shape Barre', quality: 'min', isMovable: true, root: { string: 4, fret: 1 }, notes: [ { string: 5, fret: 1, finger: '1' }, { string: 4, fret: 1, finger: '1' }, { string: 3, fret: 3, finger: '3' }, { string: 2, fret: 3, finger: '4' }, { string: 1, fret: 2, finger: '2' }, { string: 0, fret: 1, finger: '1' } ], barres: [{ fromString: 0, toString: 5, fret: 1 }] },
];


/**
 * ARCHITECTURAL REFACTOR: Uses the new ergonomic engine to find reachable harmony notes.
 */
export const generateHarmonizationTab = (
    fingering: FingeringMap[],
    scaleNotes: ScaleNote[],
    interval: number
): StructuredTab => {
    const columns: TabColumn[] = [];
    if (scaleNotes.length < 2) return { columns };
    const scaleNoteNameMap = new Map(scaleNotes.map((n, i) => [n.noteName, i]));

    const allNotesInPositions: DiagramNote[] = [];
     fingering.flat().forEach(p => {
        const [string, fret] = p.key.split('_').map(Number);
        const openStringNoteIndex = NOTE_MAP[TUNING[string]];
        const noteName = ALL_NOTES[(openStringNoteIndex + fret) % ALL_NOTES.length];
        allNotesInPositions.push({ string, fret, noteName });
    });

    const sortedNotes = allNotesInPositions.sort((a,b) => b.string - a.string || a.fret - b.fret);
    
    for (const rootNote of sortedNotes) {
        const rootIndex = scaleNoteNameMap.get(rootNote.noteName!);
        if (rootIndex === undefined) continue;
        
        const harmonyIndex = (rootIndex + interval) % scaleNotes.length;
        const harmonyNoteName = scaleNotes[harmonyIndex].noteName;
        
        // Use the ergonomic engine to find a REACHABLE harmony note
        const handPosition: HandPosition = { anchorFret: rootNote.fret > 0 ? rootNote.fret -1 : 1, span: 5 };
        const possibleTargets = sortedNotes.filter(n => n.noteName === harmonyNoteName && n.string !== rootNote.string);
        
        let bestTarget: DiagramNote | null = null;
        let minCost = Infinity;

        for (const target of possibleTargets) {
            const { reachable, cost } = isReachable(target, handPosition, rootNote);
            if(reachable && cost < minCost) {
                minCost = cost;
                bestTarget = target;
            }
        }
        
        if (bestTarget) {
            columns.push([{ string: rootNote.string, fret: String(rootNote.fret) }]);
            columns.push([{ string: bestTarget.string, fret: String(bestTarget.fret) }]);
        }
    }
    
    if (columns.length > 0) {
        columns.push(Array.from({ length: NUM_STRINGS }, (_, i) => ({ string: i, fret: '|' })));
    }
    return { columns };
};

/**
 * ARCHITECTURAL REFACTOR: Dynamically generates diatonic chords by looking up and transposing
 * shapes from the new CHORD_VOICING_LIBRARY.
 */
export const generateDiatonicChords = (
    scaleNotes: ScaleNote[]
): Map<string, Chord> => {
    const chords = new Map<string, Chord>();
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const notesOnFretboard = generateNotesOnFretboard(scaleNotes);

    for (let i = 0; i < scaleNotes.length; i++) {
        const rootScaleNote = scaleNotes[i];
        const third = scaleNotes[(i + 2) % scaleNotes.length];
        const fifth = scaleNotes[(i + 4) % scaleNotes.length];
        
        const rootIndex = NOTE_MAP[rootScaleNote.noteName];
        const thirdIndex = NOTE_MAP[third.noteName];
        const fifthIndex = NOTE_MAP[fifth.noteName];

        const interval3 = (thirdIndex - rootIndex + 12) % 12;
        const interval5 = (fifthIndex - rootIndex + 12) % 12;

        let quality: 'maj' | 'min' | 'dim' | 'aug' = 'maj';
        let degree = romanNumerals[i];

        if (interval3 === 3) {
            quality = 'min';
            degree = degree.toLowerCase();
            if (interval5 === 6) {
                quality = 'dim';
                degree = `${degree}°`;
            }
        } else {
             if(interval5 === 8) {
                quality = 'aug';
                degree = `${degree}+`;
             }
        }

        const voicings: Voicing[] = [];

        // Find matching voicings from the library
        CHORD_VOICING_LIBRARY.filter(v => v.quality === quality).forEach(template => {
            if (template.isMovable) {
                // Find all possible anchor points for this movable shape
                notesOnFretboard
                    .filter(n => n.noteName === rootScaleNote.noteName && n.string === template.root.string && n.fret > 0 && n.fret < 15)
                    .forEach(anchorNote => {
                        const fretDifference = anchorNote.fret - template.root.fret;
                        voicings.push({
                            name: `${template.name} @ ${anchorNote.fret}th fret`,
                            notes: template.notes.map(n => ({ ...n, fret: n.fret + fretDifference })),
                            barres: template.barres?.map(b => ({ ...b, fret: b.fret + fretDifference })),
                            openStrings: [],
                            mutedStrings: template.mutedStrings,
                        });
                    });
            } else {
                // For open position chords, just check if the root note matches
                if (template.rootNoteName === rootScaleNote.noteName) {
                    voicings.push({
                        name: template.name,
                        notes: template.notes.map(n => ({...n})), // Deep copy
                        barres: template.barres,
                        openStrings: template.openStrings,
                        mutedStrings: template.mutedStrings,
                    });
                }
            }
        });
        
        if (voicings.length > 0) {
             chords.set(degree, {
                name: `${rootScaleNote.noteName}${quality === 'maj' ? 'maj' : quality}`,
                degree: degree,
                voicings: voicings,
            });
        }
    }
    return chords;
};

export const generateDegreeTableMarkdown = (scaleNotes: ScaleNote[]): string => {
    const headers = '| Degree | Interval | Note |';
    const separator = '|---|---|---|';
    const rows = scaleNotes.map(n => `| ${n.degree} | ${n.degree} | ${n.noteName} |`).join('\n');
    return `${headers}\n${separator}\n${rows}`;
};