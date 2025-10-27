import { useState, useCallback, useRef } from 'react';
import * as geminiService from '../services/geminiService';
import type {
    ScaleDetails,
    DiagramData,
    Chord,
    LoadingState,
    SectionKey,
    SectionState,
} from '../types';
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

const ALL_SECTIONS: SectionKey[] = [
    'overview',
    'listeningGuide',
    'youtubeTutorials',
    'creativeApplication',
    'jamTracks',
    'toneAndGear',
    'keyChords',
    'licks',
    'advancedHarmonization',
    'etudes',
    'modeSpotlight',
];

// FIX: Corrected the return type and accumulator type to align with the new LoadingState interface.
const createInitialSectionState = (): LoadingState['sections'] => {
    return ALL_SECTIONS.reduce(
        (acc, key) => {
            acc[key] = { status: 'pending', error: null, data: null };
            return acc;
        },
        {} as LoadingState['sections']
    );
};

const initialLoadingState: LoadingState = {
    isActive: false,
    status: 'idle',
    diagramData: null,
    degreeExplanation: null,
    sections: createInitialSectionState(),
};

// Helper to normalize degree strings for robust matching
const normalizeDegree = (degree: string) =>
    degree.toLowerCase().replace(/°|\+|\s/g, '');

export const useScaleGenerator = () => {
    const [rootNote, setRootNote] = useState('E');
    const [scaleName, setScaleName] = useState('Harmonic Minor');
    const [loadingState, setLoadingState] =
        useState<LoadingState>(initialLoadingState);

    const generationIdRef = useRef(0);

    const generate = useCallback(async (note: string, scale: string) => {
        const cacheKey = `${note}_${scale}`;
        if (scaleCache.has(cacheKey)) {
            const cachedDetails = scaleCache.get(cacheKey)!;
            // FIX: Corrected creation of new section state to match the new type structure.
            const newSectionsState = { ...createInitialSectionState() };
            for (const key of ALL_SECTIONS) {
                if (cachedDetails[key]) {
                    newSectionsState[key] = {
                        status: 'success',
                        error: null,
                        data: cachedDetails[key] as any,
                    };
                }
            }
            setLoadingState({
                isActive: false,
                status: 'success',
                diagramData: cachedDetails.diagramData,
                degreeExplanation: cachedDetails.degreeExplanation,
                sections: newSectionsState,
            });
            return;
        }

        const currentGenerationId = ++generationIdRef.current;
        setLoadingState({
            ...initialLoadingState,
            isActive: true,
            status: 'loading',
        });

        // --- Step 1: Client-side generation (instant) ---
        let clientGeneratedDiagramData: DiagramData;
        let degreeExplanation: string;
        let normalizedDiatonicChordsMap: Map<string, Chord>;
        let scaleNotes: { noteName: string; degree: string }[];
        let fingering: any[];

        try {
            scaleNotes = generateScaleNotesFromFormula(note, scale)!;
            if (!scaleNotes) throw new Error(`Scale formula for "${scale}" not found.`);
            const { tonicChordDegrees, characteristicDegrees } = getDiagramMetadataFromScaleNotes(scaleNotes);
            const notesOnFretboard = generateNotesOnFretboard(scaleNotes);
            fingering = generateFingeringPositions(notesOnFretboard);
            const diagonalRun = generateDiagonalRun(notesOnFretboard);
            const diatonicChordsMap = generateDiatonicChords(scaleNotes);
            degreeExplanation = generateDegreeTableMarkdown(scaleNotes);
            
            // FIX: Create a map with normalized keys for robust matching
            normalizedDiatonicChordsMap = new Map<string, Chord>();
            diatonicChordsMap.forEach((chord, degree) => {
                normalizedDiatonicChordsMap.set(normalizeDegree(degree), chord);
            });

            clientGeneratedDiagramData = {
                notesOnFretboard,
                fingering,
                diagonalRun,
                tonicChordDegrees,
                characteristicDegrees,
            };
            
            // FIX: Immediately update state with client-generated data
            setLoadingState(prev => ({
                ...prev,
                diagramData: clientGeneratedDiagramData,
                degreeExplanation: degreeExplanation,
            }));

        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Client-side generation failed.';
            setLoadingState({
                ...initialLoadingState,
                isActive: false,
                status: 'error',
                sections: {
                    ...createInitialSectionState(),
                    overview: { status: 'error', error: message, data: null },
                },
            });
            return;
        }

        // --- Step 2: Asynchronous AI calls in parallel ---
        const apiCalls: { key: SectionKey; promise: Promise<any> }[] = [
            { key: 'overview', promise: geminiService.generateOverview(note, scale) },
            { key: 'listeningGuide', promise: geminiService.generateListeningGuide(note, scale) },
            { key: 'youtubeTutorials', promise: geminiService.generateYoutubeTutorials(note, scale) },
            { key: 'creativeApplication', promise: geminiService.generateCreativeApplication(note, scale) },
            { key: 'jamTracks', promise: geminiService.generateJamTracks(note, scale) },
            { key: 'toneAndGear', promise: geminiService.generateToneAndGear(note, scale) },
            { key: 'keyChords', promise: geminiService.generateKeyChords(note, scale) },
            { key: 'licks', promise: geminiService.generateLicks(note, scale) },
            { key: 'advancedHarmonization', promise: geminiService.generateAdvancedHarmonization(note, scale) },
            { key: 'etudes', promise: geminiService.generateEtudes(note, scale) },
            { key: 'modeSpotlight', promise: geminiService.generateModeSpotlight(note, scale) },
        ];

        apiCalls.forEach(({ key, promise }) => {
            if (generationIdRef.current !== currentGenerationId) return;
            setLoadingState((prev) => ({
                ...prev,
                sections: {
                    ...prev.sections,
                    [key]: { status: 'loading', error: null, data: null },
                },
            }));

            promise
                .then((data) => {
                    if (generationIdRef.current !== currentGenerationId) return;

                    // FIX: Hydrate data with client-side info as soon as it arrives
                    let hydratedData = data;
                    if (key === 'keyChords' && data?.progressions) {
                        data.progressions.forEach((prog: any) => {
                            prog.chords.forEach((chord: Chord) => {
                                // FIX: Use normalized map for robust matching
                                const clientChord = normalizedDiatonicChordsMap.get(normalizeDegree(chord.degree));
                                if (clientChord) chord.diagramData = clientChord.diagramData;
                            });
                        });
                    }
                    if (key === 'advancedHarmonization' && Array.isArray(data)) {
                        data.forEach((ex: any) => {
                            const interval = ex.description.toLowerCase().includes('third') ? 2 : 5;
                            ex.tab = generateHarmonizationTab(fingering, scaleNotes, interval);
                        });
                    }

                    setLoadingState((prev) => ({
                        ...prev,
                        sections: {
                            ...prev.sections,
                            [key]: { status: 'success', error: null, data: hydratedData },
                        },
                    }));
                })
                .catch((error) => {
                    if (generationIdRef.current !== currentGenerationId) return;
                    setLoadingState((prev) => ({
                        ...prev,
                        sections: {
                            ...prev.sections,
                            [key]: {
                                status: 'error',
                                error: error.message || 'Failed to fetch',
                                data: null,
                            },
                        },
                    }));
                });
        });

        // Wait for all to settle to finalize the state
        Promise.allSettled(apiCalls.map(p => p.promise)).then(() => {
            if (generationIdRef.current !== currentGenerationId) return;
            
            setLoadingState(prev => {
                // FIX: Add type assertion to fix property access on 'unknown' type.
                const hasErrors = Object.values(prev.sections).some(s => (s as SectionState<any>).status === 'error');
                const finalStatus = hasErrors ? 'interrupted' : 'success';
                
                if (finalStatus === 'success') {
                    // Reconstruct final details from state for caching
                    const finalDetailsForCache: Partial<ScaleDetails> = {
                        diagramData: prev.diagramData,
                        degreeExplanation: prev.degreeExplanation,
                    };
                    Object.entries(prev.sections).forEach(([key, sectionState]) => {
                        // FIX: Add type assertion to fix property access on 'unknown' type.
                        if ((sectionState as SectionState<any>).data) {
                            // FIX: Add type assertion to fix property access on 'unknown' type.
                            (finalDetailsForCache as any)[key] = (sectionState as SectionState<any>).data;
                        }
                    });
                    scaleCache.set(cacheKey, finalDetailsForCache as ScaleDetails);
                }

                return {
                    ...prev,
                    isActive: false,
                    status: finalStatus,
                };
            });
        });
    }, []);

    const retrySection = useCallback(async (sectionKey: SectionKey) => {
        const note = rootNote;
        const scale = scaleName;
        const serviceFunction = (geminiService as any)[`generate${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`];
        
        if (!serviceFunction) {
            console.error(`No service function found for section: ${sectionKey}`);
            return;
        }

        setLoadingState(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [sectionKey]: { status: 'loading', error: null, data: null }
            }
        }));

        try {
            const data = await serviceFunction(note, scale);
            // NOTE: Hydration on retry is not yet implemented. This is an edge case.
            // For now, we'll just set the raw data.
            setLoadingState(prev => ({
                ...prev,
                sections: {
                    ...prev.sections,
                    [sectionKey]: { status: 'success', error: null, data }
                }
            }));
        } catch (error: any) {
            setLoadingState(prev => ({
                ...prev,
                sections: {
                    ...prev.sections,
                    [sectionKey]: { status: 'error', error: error.message || 'Failed to refetch', data: null }
                }
            }));
        }

    }, [rootNote, scaleName]);


    return {
        rootNote,
        setRootNote,
        scaleName,
        setScaleName,
        loadingState,
        generate,
        retrySection,
    };
};