import { useState, useCallback, useRef } from 'react';
import {
    generateOverview,
    generateResources,
    generatePractice,
} from '../services/geminiService';
import type { ScaleDetails, DiagramData, Chord } from '../types';
import {
    generateScaleNotesFromFormula,
    getDiagramMetadataFromScaleNotes,
    generateNotesOnFretboard,
    generateFingeringPositions,
    generateDiagonalRun,
    generateHarmonizationTab,
    generateDiatonicChords,
    generateDegreeTableMarkdown,
} from '../utils/guitarUtils';

const scaleCache = new Map<string, ScaleDetails>();

export const useScaleGenerator = () => {
    const [rootNote, setRootNote] = useState('E');
    const [scaleName, setScaleName] = useState('Harmonic Minor');
    const [scaleDetails, setScaleDetails] = useState<ScaleDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generationIdRef = useRef(0);

    const generate = useCallback(async (note: string, scale: string) => {
        const cacheKey = `${note}_${scale}`;
        if (scaleCache.has(cacheKey)) {
            setScaleDetails(scaleCache.get(cacheKey)!);
            return;
        }

        const currentGenerationId = ++generationIdRef.current;
        setIsLoading(true);
        setError(null);
        setScaleDetails(null);

        try {
            // Step 1: INSTANTLY generate all diagram and theory data on the client.
            const scaleNotes = generateScaleNotesFromFormula(note, scale);
            if (!scaleNotes) {
                throw new Error(`Scale formula for "${scale}" not found.`);
            }

            const { tonicChordDegrees, characteristicDegrees } =
                getDiagramMetadataFromScaleNotes(scaleNotes);
            const notesOnFretboard = generateNotesOnFretboard(scaleNotes);
            const fingering = generateFingeringPositions(notesOnFretboard);
            const diagonalRun = generateDiagonalRun(notesOnFretboard);
            const diatonicChordsMap = generateDiatonicChords(scaleNotes);
            const degreeExplanation = generateDegreeTableMarkdown(scaleNotes);

            const clientGeneratedDiagramData: DiagramData = {
                notesOnFretboard,
                fingering,
                diagonalRun,
                tonicChordDegrees,
                characteristicDegrees,
            };

            // Step 2: IMMEDIATE state update. Diagrams appear instantly.
            const initialDetails: ScaleDetails = {
                diagramData: clientGeneratedDiagramData,
                degreeExplanation: degreeExplanation,
            };
            setScaleDetails(initialDetails);

            // Step 3: Fetch all remaining AI-dependent text content in parallel.
            const [overviewData, resourceData, practiceData] =
                await Promise.all([
                    generateOverview(note, scale),
                    generateResources(note, scale),
                    generatePractice(note, scale),
                ]);

            if (generationIdRef.current !== currentGenerationId) return;

            // Step 4: Process and merge the parallel results, hydrating with client-side data.
            if (practiceData.keyChords?.progressions) {
                practiceData.keyChords.progressions.forEach((prog) => {
                    prog.chords.forEach((chord: Chord) => {
                        const clientChord = diatonicChordsMap.get(chord.degree);
                        if (clientChord) {
                            chord.diagramData = clientChord.diagramData;
                        }
                    });
                });
            }

            if (practiceData.advancedHarmonization) {
                practiceData.advancedHarmonization.forEach((ex) => {
                    const interval = ex.description
                        .toLowerCase()
                        .includes('third')
                        ? 2
                        : 5;
                    ex.tab = generateHarmonizationTab(
                        fingering,
                        scaleNotes,
                        interval
                    );
                });
            }

            // Final state update with all data merged.
            const finalDetails: ScaleDetails = {
                ...initialDetails,
                ...overviewData,
                ...resourceData,
                ...practiceData,
            };
            // The overview from AI does not contain degreeExplanation, so we must preserve it
            if (finalDetails.overview) {
                (finalDetails as any).overview.degreeExplanation =
                    degreeExplanation;
            }


            setScaleDetails(finalDetails);
            scaleCache.set(cacheKey, finalDetails);
        } catch (e: unknown) {
            if (generationIdRef.current === currentGenerationId) {
                const message =
                    e instanceof Error ? e.message : 'An unknown error occurred';
                setError(message);
                setScaleDetails(null);
            }
        } finally {
            if (generationIdRef.current === currentGenerationId) {
                setIsLoading(false);
            }
        }
    }, []);

    return {
        rootNote,
        setRootNote,
        scaleName,
        setScaleName,
        scaleDetails,
        isLoading,
        error,
        generate,
    };
};