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

const createInitialSectionState = (): Record<SectionKey, SectionState> => {
    return ALL_SECTIONS.reduce((acc, key) => {
        acc[key] = { status: 'pending', error: null, data: null };
        return acc;
    }, {} as Record<SectionKey, SectionState>);
};

const initialLoadingState: LoadingState = {
    isActive: false,
    status: 'idle',
    sections: createInitialSectionState(),
};

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
            const newSectionsState = { ...createInitialSectionState() };
            for (const key of ALL_SECTIONS) {
                if (cachedDetails[key]) {
                    newSectionsState[key] = {
                        status: 'success',
                        error: null,
                        data: cachedDetails[key],
                    };
                }
            }
            setLoadingState({
                isActive: false,
                status: 'success',
                sections: newSectionsState,
            });
            return;
        }

        const currentGenerationId = ++generationIdRef.current;
        setLoadingState({
            isActive: true,
            status: 'loading',
            sections: createInitialSectionState(),
        });

        // --- Step 1: Client-side generation (instant) ---
        let clientGeneratedDiagramData: DiagramData;
        let degreeExplanation: string;
        let diatonicChordsMap: Map<string, Chord>;
        let scaleNotes: { noteName: string; degree: string }[];
        let fingering: any[];

        try {
            scaleNotes = generateScaleNotesFromFormula(note, scale)!;
            if (!scaleNotes) throw new Error(`Scale formula for "${scale}" not found.`);
            const { tonicChordDegrees, characteristicDegrees } = getDiagramMetadataFromScaleNotes(scaleNotes);
            const notesOnFretboard = generateNotesOnFretboard(scaleNotes);
            fingering = generateFingeringPositions(notesOnFretboard);
            const diagonalRun = generateDiagonalRun(notesOnFretboard);
            diatonicChordsMap = generateDiatonicChords(scaleNotes);
            degreeExplanation = generateDegreeTableMarkdown(scaleNotes);

            clientGeneratedDiagramData = {
                notesOnFretboard,
                fingering,
                diagonalRun,
                tonicChordDegrees,
                characteristicDegrees,
            };
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Client-side generation failed.';
            setLoadingState({
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
                    setLoadingState((prev) => ({
                        ...prev,
                        sections: {
                            ...prev.sections,
                            [key]: { status: 'success', error: null, data },
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
        Promise.allSettled(apiCalls.map(p => p.promise)).then(results => {
            if (generationIdRef.current !== currentGenerationId) return;

            const finalDetails: ScaleDetails = {
                diagramData: clientGeneratedDiagramData,
                degreeExplanation: degreeExplanation,
            };

            results.forEach((result, index) => {
                const key = apiCalls[index].key;
                if (result.status === 'fulfilled') {
                    (finalDetails as any)[key] = result.value;
                }
            });
            
            // Hydrate data post-fetch
            if (finalDetails.keyChords?.progressions) {
                finalDetails.keyChords.progressions.forEach(prog => {
                    prog.chords.forEach((chord: Chord) => {
                        const clientChord = diatonicChordsMap.get(chord.degree);
                        if (clientChord) chord.diagramData = clientChord.diagramData;
                    });
                });
            }
            if (finalDetails.advancedHarmonization) {
                 finalDetails.advancedHarmonization.forEach(ex => {
                    const interval = ex.description.toLowerCase().includes('third') ? 2 : 5;
                    ex.tab = generateHarmonizationTab(fingering, scaleNotes, interval);
                });
            }

            // FIX: Cast s to any to access properties due to type inference issue.
            const hasErrors = Object.values(loadingState.sections).some(s => (s as any).status === 'error');
            setLoadingState(prev => ({
                ...prev,
                isActive: false,
                status: hasErrors ? 'interrupted' : 'success',
            }));
            
            if (!hasErrors) {
                scaleCache.set(cacheKey, finalDetails);
            }
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