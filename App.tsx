import React, { useState, useRef } from 'react';
// FIX: Added import for ScaleDetails
import type { SongAnalysisResult, FontSizeKey, SectionKey, ScaleDetails } from './types';
import { COLORS, FONT_SIZES } from './constants';

import { useScaleGenerator } from './hooks/useScaleGenerator';
import { useNotationAnalyzer } from './hooks/useNotationAnalyzer';
import { usePdfGenerator } from './hooks/usePdfGenerator';

import ControlPanel from './components/ControlPanel';
import NotationAnalyzer from './components/NotationAnalyzer';
import ScaleExplorer from './components/ScaleExplorer';
import PdfDocument from './components/PdfDocument';
import Footer from './components/common/Footer';

const App: React.FC = () => {
    const [fontSize, setFontSize] = useState<FontSizeKey>('M');
    const pdfContentRef = useRef<HTMLDivElement>(null);

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

    const scaleDetails = React.useMemo(() => {
        if (loadingState.status === 'idle' || loadingState.status === 'loading') {
             const partialDetails: any = {};
             Object.entries(loadingState.sections).forEach(([key, sectionState]) => {
                // FIX: Cast sectionState to any to access properties due to type inference issue.
                if((sectionState as any).status === 'success') {
                    // FIX: Cast sectionState to any to access properties due to type inference issue.
                    partialDetails[key] = (sectionState as any).data;
                }
             });
             return partialDetails;
        }
        const finalDetails: any = {};
        Object.entries(loadingState.sections).forEach(([key, sectionState]) => {
            // FIX: Cast sectionState to any to access properties due to type inference issue.
            if ((sectionState as any).data) {
                // FIX: Cast sectionState to any to access properties due to type inference issue.
                finalDetails[key] = (sectionState as any).data;
            }
        });
        return finalDetails as ScaleDetails;
    }, [loadingState]);


    const { isSavingPdf, pdfError, generatePdf } = usePdfGenerator(
        pdfContentRef,
        scaleDetails as ScaleDetails
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
        // FIX: Cast s to any to access properties due to type inference issue.
        Object.values(loadingState.sections).some((s) => (s as any).status === 'success');

    return (
        <div
            className="min-h-screen text-gray-200 font-['Poppins'] p-4 md:p-8"
            style={{
                background: `radial-gradient(ellipse at top, #2F2C58, ${COLORS.bgPrimary})`,
            }}
        >
            <div className="max-w-7xl mx-auto">
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
                        Unlock the fretboard with comprehensive, AI-generated
                        scale materials for the modern 7-string guitarist.
                    </p>
                </header>

                <main className="flex-1 min-w-0">
                    <ControlPanel
                        rootNote={rootNote}
                        scaleName={scaleName}
                        setRootNote={setRootNote}
                        setScaleName={setScaleName}
                        onGenerate={() => handleGenerate(rootNote, scaleName)}
                        onSavePdf={generatePdf}
                        isLoading={isBusy}
                        isSavingPdf={isSavingPdf}
                        hasContent={isContentComplete}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                    />

                    <div className="content-area space-y-8 mt-8">
                        {analysisError && (
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
                            onGenerateFromAnalysis={handleGenerateFromAnalysis}
                            {...notationAnalyzerProps}
                        />

                        <div id="scale-content">
                            <ScaleExplorer
                                loadingState={loadingState}
                                fontSize={fontSize}
                                onRetrySection={handleRetrySection}
                            />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>

            {isContentComplete && scaleDetails && (
                <PdfDocument
                    ref={pdfContentRef}
                    scaleDetails={scaleDetails as ScaleDetails}
                    fontSize={fontSize}
                />
            )}
        </div>
    );
};
export default App;