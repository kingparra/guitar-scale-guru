import React, { useState, useRef, useEffect } from 'react';
import type {
    SongAnalysisResult,
    FontSizeKey,
    SectionKey,
    ScaleDetails,
    LoadingState,
    SectionState,
} from './types';
import { COLORS, FONT_SIZES } from './constants';

import { useScaleGenerator } from './hooks/useScaleGenerator';
import { useNotationAnalyzer } from './hooks/useNotationAnalyzer';
import { usePdfGenerator } from './hooks/usePdfGenerator';

import ControlPanel from './components/ControlPanel';
import NotationAnalyzer from './components/NotationAnalyzer';
import ScaleExplorer from './components/ScaleExplorer';
import PdfDocument from './components/PdfDocument';
import Footer from './components/common/Footer';
import ApiKeyManager from './components/ApiKeyManager';

const App: React.FC = () => {
    const [fontSize, setFontSize] = useState<FontSizeKey>('M');
    const pdfContentRef = useRef<HTMLDivElement>(null);

    const [isKeySelected, setIsKeySelected] = useState(false);
    const [isCheckingKey, setIsCheckingKey] = useState(true);

    // Check for API key on initial load
    useEffect(() => {
        const checkApiKey = async () => {
            setIsCheckingKey(true);
            if ((window as any).aistudio) {
                const hasKey =
                    await (window as any).aistudio.hasSelectedApiKey();
                setIsKeySelected(hasKey);
            }
            setIsCheckingKey(false);
        };
        checkApiKey();
    }, []);

    React.useEffect(() => {
        // Set base font size for rem units
        document.documentElement.style.fontSize = FONT_SIZES[fontSize];
    }, [fontSize]);

    const {
        rootNote,
        scaleName,
        setRootNote,
        setScaleName,
        loadingState,
        generate,
        retrySection,
    } = useScaleGenerator();

    const {
        analysisResults,
        isAnalyzing,
        error: analysisError,
        analyze,
        ...notationAnalyzerProps
    } = useNotationAnalyzer();

    // Watch for invalid key errors from hooks
    useEffect(() => {
        const checkError = (error: string | null) => {
            if (
                error &&
                (error.includes('Requested entity was not found.') ||
                    error.includes('user has exceeded quota'))
            ) {
                setIsKeySelected(false);
            }
        };

        checkError(analysisError);
        for (const sectionState of Object.values(loadingState.sections)) {
            // FIX: Add type assertion to fix property access on 'unknown' type.
            checkError((sectionState as SectionState<any>).error);
        }
    }, [analysisError, loadingState.sections]);

    const handleSelectKey = async () => {
        try {
            await (window as any).aistudio.openSelectKey();
            // Assume success after the dialog closes, as per guidelines
            setIsKeySelected(true);
        } catch (e) {
            console.error('Error opening API key selection:', e);
        }
    };

    const scaleDetails = React.useMemo(() => {
        if (loadingState.status === 'idle') {
            return null;
        }

        const finalDetails: Partial<ScaleDetails> = {};

        // Add client-generated data first, as it's available immediately
        if (loadingState.diagramData) {
            finalDetails.diagramData = loadingState.diagramData;
        }
        if (loadingState.degreeExplanation) {
            finalDetails.degreeExplanation = loadingState.degreeExplanation;
        }

        // Add successfully fetched async data
        Object.entries(loadingState.sections).forEach(([key, sectionState]) => {
            const state = sectionState as SectionState<any>;
            if (state.status === 'success' && state.data) {
                finalDetails[key as SectionKey] = state.data;
            }
        });

        return finalDetails as ScaleDetails;
    }, [loadingState]);

    const { isSavingPdf, pdfError, generatePdf } = usePdfGenerator(
        pdfContentRef,
        scaleDetails as ScaleDetails | null
    );

    const handleGenerate = async (note: string, scale: string) => {
        await generate(note, scale);
    };

    const handleRetrySection = async (sectionKey: SectionKey) => {
        await retrySection(sectionKey);
    };

    const handleGenerateFromAnalysis = (result: SongAnalysisResult) => {
        setRootNote(result.rootNote);
        setScaleName(result.scaleName);
        handleGenerate(result.rootNote, result.scaleName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isBusy = loadingState.isActive || isAnalyzing || isSavingPdf;
    const isContentComplete =
        !loadingState.isActive &&
        (!!loadingState.diagramData ||
            // FIX: Add type assertion to fix property access on 'unknown' type.
            Object.values(loadingState.sections).some(
                (s) => (s as SectionState<any>).status === 'success'
            ));

    return (
        <div
            className="min-h-screen text-gray-200 font-['Poppins'] p-4 md:p-8"
            style={{
                background: `radial-gradient(ellipse at top, #2F2C58, ${COLORS.bgPrimary})`,
            }}
        >
            {!isKeySelected && (
                <ApiKeyManager
                    onSelectKey={handleSelectKey}
                    isCheckingKey={isCheckingKey}
                />
            )}

            {isKeySelected && (
                <div className="max-w-7xl mx-auto animate-fade-in">
                    <header className="text-center mb-10">
                        <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-md">
                                Guitar Scale Guru
                            </span>
                        </h1>
                        <p
                            className="text-lg max-w-3xl mx-auto"
                            style={{ color: COLORS.textSecondary }}
                        >
                            Unlock the fretboard with comprehensive,
                            AI-generated scale materials for the modern 7-string
                            guitarist.
                        </p>
                    </header>

                    <main className="flex-1 min-w-0">
                        <ControlPanel
                            rootNote={rootNote}
                            scaleName={scaleName}
                            setRootNote={setRootNote}
                            setScaleName={setScaleName}
                            onGenerate={() =>
                                handleGenerate(rootNote, scaleName)
                            }
                            onSavePdf={generatePdf}
                            isLoading={isBusy}
                            isSavingPdf={isSavingPdf}
                            hasContent={isContentComplete}
                            fontSize={fontSize}
                            setFontSize={setFontSize}
                        />

                        <div className="content-area space-y-8 mt-8">
                            {analysisError &&
                                !analysisError.includes(
                                    'Requested entity was not found.'
                                ) && (
                                    <div className="p-[2px] bg-gradient-to-br from-red-500/80 to-orange-500/80 rounded-2xl shadow-lg">
                                        <div className="bg-[#171528]/80 backdrop-blur-lg p-6 rounded-[14px]">
                                            <h3 className="font-bold text-lg mb-2 text-center text-red-300">
                                                Analysis Error
                                            </h3>
                                            <pre className="text-left whitespace-pre-wrap bg-black/20 p-3 rounded-md text-sm">
                                                {analysisError}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                            <NotationAnalyzer
                                onAnalyze={analyze}
                                isAnalyzing={isAnalyzing}
                                results={analysisResults}
                                onGenerateFromAnalysis={
                                    handleGenerateFromAnalysis
                                }
                                {...notationAnalyzerProps}
                            />

                            <div id="scale-content">
                                <ScaleExplorer
                                    loadingState={loadingState}
                                    fontSize={fontSize}
                                    onRetrySection={handleRetrySection}
                                    rootNote={rootNote}
                                    scaleName={scaleName}
                                />
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            )}

            {isContentComplete && scaleDetails && (
                <PdfDocument
                    ref={pdfContentRef}
                    scaleDetails={scaleDetails as ScaleDetails}
                    fontSize={fontSize}
                    rootNote={rootNote}
                    scaleName={scaleName}
                />
            )}
        </div>
    );
};
export default App;