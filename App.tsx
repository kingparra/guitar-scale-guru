import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateScaleMaterials } from './services/geminiService';
import type { ScaleDetails } from './types';
import FretboardDiagram from './components/FretboardDiagram';
import { COLORS } from './constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// --- Custom Themed Icons ---
const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`h-8 w-8 flex items-center justify-center rounded-full ${className}`}>
        {children}
    </div>
);
const SpotifyIcon = () => (<IconWrapper className="bg-[#1DB954] text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.43 17.388c-.22.36-.675.472-1.035.252-2.955-1.808-6.66-2.22-11.04-1.218-.45.105-.9-.18-.99-.63-.105-.45.18-.9.63-.99 4.74-1.08 8.805-.615 12.045 1.41.345.21.45.675.24 1.035v-.135zm1.26-2.955c-.27.45-.825.6-1.275.33-3.24-1.98-8.145-2.58-13.44-1.41-.54.12-.99-.24-.99-.78s.33-1.05.87-.93c5.775-1.26 11.085-.585 14.715 1.635.45.27.6.825.33 1.275zm.12-3.15c-3.84-2.295-10.14-2.505-15.615-1.38-.63.135-1.245-.255-1.38-.885-.135-.63.255-1.245.885-1.38 6.03-1.23 12.915-.96 17.34 1.62.555.33.765.99.435 1.545-.33.555-.99.765-1.545.435z" /></svg></IconWrapper>);
const YouTubeIcon = () => (<IconWrapper className="bg-[#FF0000] text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg></IconWrapper>);
const MusicNoteIcon = () => (<IconWrapper className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l10-3v13m-10 0a2 2 0 100 4 2 2 0 000-4zm10-13a2 2 0 100 4 2 2 0 000-4z" /></svg></IconWrapper>);
const FireIcon = () => (<IconWrapper className="bg-gradient-to-br from-amber-400 to-orange-600 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.39 3.73a1 1 0 00-1.15.53l-3.36 6.72a1 1 0 00-.03.35 1 1 0 001.03.97h2.12a1 1 0 01.97 1.03 1 1 0 01-.35.03l-6.72 3.36a1 1 0 00-.53 1.15 1 1 0 001.68.68l3.36-6.72a1 1 0 00.03-.35 1 1 0 00-1.03-.97H5.9a1 1 0 01-.97-1.03 1 1 0 01.35-.03l6.72-3.36a1 1 0 00.53-1.15 1 1 0 00-1.68-.68z" clipRule="evenodd" /></svg></IconWrapper>);
const BookOpenIcon = () => (<IconWrapper className="bg-gradient-to-br from-orange-400 to-yellow-500 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm.293 2.293A1 1 0 015 4h8a1 1 0 01.707.293l2 2a1 1 0 010 1.414l-2 2A1 1 0 0113 10H5a1 1 0 01-.707-.293l-2-2a1 1 0 010-1.414l2-2z" clipRule="evenodd" /></svg></IconWrapper>);
const SparklesIcon = () => (<IconWrapper className="bg-gradient-to-br from-sky-400 to-indigo-500 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75V4a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.21 5.21a.75.75 0 011.06 0l.707.707a.75.75 0 01-1.06 1.06l-.707-.707a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.25a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm3.21 3.72a.75.75 0 010 1.06l-.707.707a.75.75 0 01-1.06-1.06l.707-.707a.75.75 0 011.06 0zm4.58 3.07a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM14.79 14.79a.75.75 0 01-1.06 0l-.707-.707a.75.75 0 011.06-1.06l.707.707a.75.75 0 010 1.06zm3.21-4.79a.75.75 0 01-.75.75h-1.25a.75.75 0 010-1.5h1.25a.75.75 0 01.75.75zm-3.21-3.72a.75.75 0 010-1.06l.707-.707a.75.75 0 011.06 1.06l-.707.707a.75.75 0 01-1.06 0z" clipRule="evenodd" /></svg></IconWrapper>);
const GlobeIcon = () => (<IconWrapper className="bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.74 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a1 1 0 00-2 0 1.5 1.5 0 01-1.5 1.5c-.256 0-.512-.098-.707-.293l-1.414 1.414c.41.41.92.68 1.464.766A5.003 5.003 0 0010 15a5 5 0 003.182-1.252 6.012 6.012 0 01-1.912-2.706 1.5 1.5 0 01-1.464-.766 1.5 1.5 0 01-1.464.766 1.5 1.5 0 01-1.293-.707z" clipRule="evenodd" /></svg></IconWrapper>);
const LightbulbIcon = () => (<IconWrapper className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM4 10a1 1 0 01-1-1V7a1 1 0 012 0v2a1 1 0 01-1 1zm1 4a1 1 0 100 2h-1a1 1 0 100-2h1zM10 18a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zM8.94 6.553a1 1 0 00-1.88 0l-1.5 4A1 1 0 007 12h6a1 1 0 00.94-1.447l-1.5-4z" /></svg></IconWrapper>);
const JamIcon = () => (<IconWrapper className="bg-gradient-to-br from-red-500 to-pink-500 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></IconWrapper>);
const GearIcon = () => (<IconWrapper className="bg-gradient-to-br from-gray-400 to-gray-600 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg></IconWrapper>);

const FONT_SIZES = {
    'S': '0.75em',
    'M': '0.875em',
    'L': '1em',
};
type FontSizeKey = keyof typeof FONT_SIZES;


const App: React.FC = () => {
    const [rootNote, setRootNote] = useState('E');
    const [scaleName, setScaleName] = useState('Harmonic Minor');
    const [scaleDetails, setScaleDetails] = useState<ScaleDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingPdf, setIsSavingPdf] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isContentLoaded, setIsContentLoaded] = useState(false);
    const [fontSize, setFontSize] = useState<FontSizeKey>('M');
    const contentRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        document.documentElement.style.fontSize = FONT_SIZES[fontSize];
    }, [fontSize]);

    useEffect(() => {
        if (scaleDetails) {
            const timer = setTimeout(() => setIsContentLoaded(true), 100);
            return () => clearTimeout(timer);
        } else {
            setIsContentLoaded(false);
        }
    }, [scaleDetails]);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setScaleDetails(null);
        try {
            const data = await generateScaleMaterials(rootNote, scaleName);
            setScaleDetails(data);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [rootNote, scaleName]);
    
    const handleSaveToPdf = useCallback(async () => {
        if (!contentRef.current || !scaleDetails) return;
        setIsSavingPdf(true);
        try {
            const content = contentRef.current;
            
            // Create a container for the PDF content to add a header
            const pdfContainer = document.createElement('div');
            pdfContainer.style.width = `${content.offsetWidth}px`;
            pdfContainer.style.background = COLORS.bgPrimary;
            pdfContainer.style.fontFamily = 'Poppins, sans-serif';

            // Create and append the header
            const header = document.createElement('div');
            header.style.textAlign = 'center';
            header.style.padding = '40px';
            header.style.color = COLORS.textHeader;
            header.innerHTML = `
                <h1 style="font-size: 32px; font-weight: 700; margin: 0; background: linear-gradient(to right, ${COLORS.accentCyan}, ${COLORS.accentMagenta}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Guitar Scale Guru</h1>
                <h2 style="font-size: 24px; font-weight: 600; margin: 8px 0 0 0; color: ${COLORS.textPrimary};">${scaleDetails.overview.title}</h2>
            `;
            pdfContainer.appendChild(header);

            // Clone the main content into the container
            const contentClone = content.cloneNode(true) as HTMLElement;
            pdfContainer.appendChild(contentClone);

            // Temporarily append to body to ensure correct rendering
            document.body.appendChild(pdfContainer);

            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                backgroundColor: COLORS.bgPrimary,
                useCORS: true,
                logging: false,
            });
            
            // Clean up the temporary element
            document.body.removeChild(pdfContainer);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const scaledCanvasHeight = canvasHeight / ratio;
            const pdfPageHeight = pdf.internal.pageSize.getHeight();

            let position = 0;
            while (position < scaledCanvasHeight) {
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvasWidth;
                const sliceHeight = Math.min(pdfPageHeight * ratio, canvasHeight - (position * ratio));
                pageCanvas.height = sliceHeight;
                
                const context = pageCanvas.getContext('2d');
                if(context){
                     context.drawImage(canvas, 0, position * ratio, canvasWidth, sliceHeight, 0, 0, canvasWidth, sliceHeight);
                }

                if (position > 0) {
                    pdf.addPage();
                }
                pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, sliceHeight / ratio);
                position += pdfPageHeight;
            }
            
            pdf.save(`${rootNote}_${scaleName.replace(' ', '_')}_Scale_Guru.pdf`);
        } catch(e) {
            console.error("Failed to save PDF", e);
            setError("Sorry, there was an issue creating the PDF.");
        } finally {
            setIsSavingPdf(false);
        }
    }, [scaleDetails, rootNote, scaleName]);


    const renderTab = (tab: string) => (
        <pre className="bg-[#0D0B1A]/70 text-gray-300 p-4 rounded-md overflow-x-auto text-base font-mono whitespace-pre leading-relaxed border border-purple-400/20">
            {tab}
        </pre>
    );
    
    const renderMarkdownTable = (markdownString: string) => {
        if (!markdownString || !markdownString.includes('|')) {
            return <p>{markdownString}</p>;
        }
        try {
            const rows = markdownString.trim().split('\n');
            const headerRow = rows[0];
            const dataRows = rows.slice(2); 

            const headers = headerRow.split('|').map(h => h.trim()).filter(Boolean);
            const body = dataRows.map((row, rowIndex) => {
                const cells = row.split('|').map(c => c.trim()).filter(Boolean);
                return (
                    <tr key={rowIndex} className="hover:bg-purple-500/10">
                        {cells.map((cell, cellIndex) => 
                            <td key={cellIndex} className="py-2 px-4 border-b border-purple-400/20">{cell}</td>
                        )}
                    </tr>
                );
            });

            return (
                <div className="overflow-x-auto rounded-lg border border-purple-400/20 mt-2">
                    <table className="w-full text-left">
                        <thead className="bg-[#0D0B1A]/70">
                            <tr>
                                {headers.map((header, index) => 
                                    <th key={index} className="py-2 px-4 text-cyan-400 uppercase tracking-wider font-semibold text-sm border-b-2 border-purple-400/40">{header}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {body}
                        </tbody>
                    </table>
                </div>
            );
        } catch(e) {
            console.error("Failed to parse markdown table:", e);
            return <p>{markdownString}</p>; // Fallback
        }
    };
    
    const Card: React.FC<{ children: React.ReactNode, className?: string, fullHeight?: boolean }> = ({ children, className = '', fullHeight = false }) => (
        <div className={`p-[2px] bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-2xl shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300 ${className}`}>
            <div className={`bg-[#171528]/80 backdrop-blur-lg p-6 rounded-[14px] ${fullHeight ? 'h-full' : ''}`}>
                {children}
            </div>
        </div>
    );
    
    const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; }> = ({ title, icon }) => (
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-4 text-gray-100">
            {icon}
            <span>{title}</span>
        </h2>
    );

    const Footer = () => (
        <footer className="text-center py-8 mt-16 border-t border-purple-400/20">
            <p style={{color: COLORS.textSecondary}}>Crafted by a World-Class Senior Frontend Engineer</p>
            <p className="text-purple-400/50 text-sm">Powered by Gemini API & React</p>
        </footer>
    );
    
    const fontScaleValue = parseFloat(FONT_SIZES[fontSize].replace('em', ''));

    return (
        <div className="min-h-screen text-gray-200 font-['Poppins'] p-4 md:p-8" style={{ background: `radial-gradient(ellipse at top, #2F2C58, ${COLORS.bgPrimary})`}}>
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-md">Guitar Scale Guru</span>
                    </h1>
                    <p className="text-lg max-w-3xl mx-auto" style={{color: COLORS.textSecondary}}>Unlock the fretboard with comprehensive, AI-generated scale materials for the modern 7-string guitarist.</p>
                </header>

                <div className="sticky top-4 z-10 bg-[#171528]/80 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-purple-400/30 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <label htmlFor="root-note" className="font-bold text-lg text-gray-300">Root:</label>
                            <select id="root-note" value={rootNote} onChange={(e) => setRootNote(e.target.value)} className="bg-[#171528]/80 border border-purple-400/30 rounded-md p-2 text-white font-semibold w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition">
                                {['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'].map(note => <option key={note} value={note}>{note}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <label htmlFor="scale-name" className="font-bold text-lg text-gray-300">Scale:</label>
                            <select id="scale-name" value={scaleName} onChange={(e) => setScaleName(e.target.value)} className="bg-[#171528]/80 border border-purple-400/30 rounded-md p-2 text-white font-semibold w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition">
                                <option>Harmonic Minor</option><option>Melodic Minor</option><option>Major</option><option>Phrygian Dominant</option><option>Lydian</option><option>Mixolydian</option><option>Dorian</option><option>Whole Tone</option>
                            </select>
                        </div>
                        <button onClick={handleGenerate} disabled={isLoading || isSavingPdf} className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-fuchsia-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Generate Materials'}
                        </button>
                        {scaleDetails && (
                            <button onClick={handleSaveToPdf} disabled={isSavingPdf || isLoading} className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                {isSavingPdf ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Save to PDF'}
                            </button>
                        )}
                        <div className="flex items-center gap-2 border-l border-purple-400/20 pl-4 ml-2">
                             <span className="font-bold text-lg text-gray-300">Size:</span>
                            {(Object.keys(FONT_SIZES) as FontSizeKey[]).map(key => (
                                <button key={key} onClick={() => setFontSize(key)} className={`w-8 h-8 rounded-md font-bold transition-colors ${fontSize === key ? 'bg-cyan-500 text-white' : 'bg-black/20 text-gray-300 hover:bg-black/40'}`}>{key}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="content-area" ref={contentRef}>
                    {isLoading && <Card><div className="flex flex-col items-center justify-center p-16"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-400"></div><p className="mt-4 text-lg font-semibold" style={{color: COLORS.textPrimary}}>Generating your materials... this may take a moment.</p></div></Card>}
                    {error && <Card><div className="p-4"><h3 className="font-bold text-lg mb-2 text-center text-red-300">An Error Occurred</h3><pre className="text-left whitespace-pre-wrap bg-black/20 p-3 rounded-md text-sm">{error}</pre></div></Card>}
                    {!isLoading && !error && !scaleDetails && (
                        <Card>
                            <div className="p-8 md:p-12">
                                <h2 className="text-3xl font-bold text-gray-100 mb-4 text-center">Welcome to Guitar Scale Guru!</h2>
                                <p className="text-lg max-w-3xl mx-auto mb-6 text-center" style={{color: COLORS.textSecondary}}>Select a root note and a scale from the controls above, then click "Generate Materials" to get a comprehensive, AI-powered breakdown for your 7-string guitar.</p>
                                <div className="max-w-md mx-auto space-y-2 text-gray-300">
                                    <p className="flex items-start"><span className="text-cyan-400 mr-3 font-bold text-xl shrink-0">✓</span><span className="min-w-0">In-depth theory and analysis</span></p>
                                    <p className="flex items-start"><span className="text-cyan-400 mr-3 font-bold text-xl shrink-0">✓</span><span className="min-w-0">Listening guides and video tutorials</span></p>
                                    <p className="flex items-start"><span className="text-cyan-400 mr-3 font-bold text-xl shrink-0">✓</span><span className="min-w-0">Full fretboard & position diagrams</span></p>
                                    <p className="flex items-start"><span className="text-cyan-400 mr-3 font-bold text-xl shrink-0">✓</span><span className="min-w-0">Classic licks and phrases</span></p>
                                    <p className="flex items-start"><span className="text-cyan-400 mr-3 font-bold text-xl shrink-0">✓</span><span className="min-w-0">Chord progressions, exercises, & etudes</span></p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {scaleDetails && (
                        <div className={`space-y-12 transition-opacity duration-700 ease-in-out ${isContentLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <Card>
                                <h2 className="text-3xl font-bold mb-4 border-l-4 pl-4" style={{borderColor: COLORS.accentGold, color: COLORS.textHeader}}>{scaleDetails.overview.title}</h2>
                                <div className="space-y-4 leading-relaxed" style={{color: COLORS.textPrimary}}>
                                    <p><strong style={{color: COLORS.accentGold}}>Character:</strong> {scaleDetails.overview.character}</p>
                                    <p><strong style={{color: COLORS.accentGold}}>Theory:</strong> {scaleDetails.overview.theory}</p>
                                    <p><strong style={{color: COLORS.accentGold}}>Common Usage:</strong> {scaleDetails.overview.usage}</p>
                                    <div>
                                        <strong style={{color: COLORS.accentGold}}>Scale Degrees:</strong>
                                        {renderMarkdownTable(scaleDetails.overview.degreeExplanation)}
                                    </div>
                                </div>
                            </Card>
                            
                            <section>
                                <h2 className="text-3xl font-bold mb-4 border-l-4 border-purple-400/50 pl-4 text-gray-100">Diagrams</h2>
                                <FretboardDiagram title={`${rootNote} ${scaleName}: Full Neck`} scaleData={scaleDetails.diagramData} fretRange={[0, 25]} fontScale={fontScaleValue} />
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                                    <FretboardDiagram title="Position 1" scaleData={scaleDetails.diagramData} fretRange={[0, 5]} fingeringMap={scaleDetails.diagramData.fingering.pos1} fontScale={fontScaleValue} />
                                    <FretboardDiagram title="Position 2" scaleData={scaleDetails.diagramData} fretRange={[6, 12]} fingeringMap={scaleDetails.diagramData.fingering.pos2} fontScale={fontScaleValue} />
                                    <FretboardDiagram title="Position 3" scaleData={scaleDetails.diagramData} fretRange={[11, 17]} fingeringMap={scaleDetails.diagramData.fingering.pos3} fontScale={fontScaleValue} />
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {scaleDetails.listeningGuide?.length > 0 && <Card fullHeight>
                                    <SectionHeader title="Listening Guide" icon={<SpotifyIcon />} />
                                    <div className="space-y-3">{scaleDetails.listeningGuide.map(song => <a key={song.title} href={song.spotifyLink} target="_blank" rel="noopener noreferrer" className="block p-3 bg-[#0D0B1A]/50 rounded-md hover:bg-[#0D0B1A]/90 transition-colors"><p className="font-semibold text-lg text-green-400">{song.title}</p><p style={{color: COLORS.textSecondary}}>{song.artist}</p></a>)}</div>
                                </Card>}
                                {scaleDetails.youtubeTutorials?.length > 0 && <Card fullHeight>
                                    <SectionHeader title="YouTube Tutorials" icon={<YouTubeIcon />} />
                                    <div className="space-y-3">{scaleDetails.youtubeTutorials.map(tutorial => <a key={tutorial.title} href={tutorial.youtubeLink} target="_blank" rel="noopener noreferrer" className="block p-3 bg-[#0D0B1A]/50 rounded-md hover:bg-[#0D0B1A]/90 transition-colors"><p className="font-semibold text-lg text-red-400">{tutorial.title}</p><p style={{color: COLORS.textSecondary}}>{tutorial.creator}</p></a>)}</div>
                                </Card>}
                                {scaleDetails.creativeApplication?.length > 0 && <Card fullHeight>
                                     <SectionHeader title="Creative Application" icon={<LightbulbIcon />} />
                                     <div className="space-y-3">{scaleDetails.creativeApplication.map(video => <a key={video.title} href={video.youtubeLink} target="_blank" rel="noopener noreferrer" className="block p-3 bg-[#0D0B1A]/50 rounded-md hover:bg-[#0D0B1A]/90 transition-colors"><p className="font-semibold text-lg text-yellow-400">{video.title}</p><p style={{color: COLORS.textSecondary}}>{video.creator}</p></a>)}</div>
                                </Card>}
                                {scaleDetails.jamTracks?.length > 0 && <Card fullHeight>
                                     <SectionHeader title="Jam Tracks" icon={<JamIcon />} />
                                     <div className="space-y-3">{scaleDetails.jamTracks.map(track => <a key={track.title} href={track.youtubeLink} target="_blank" rel="noopener noreferrer" className="block p-3 bg-[#0D0B1A]/50 rounded-md hover:bg-[#0D0B1A]/90 transition-colors"><p className="font-semibold text-lg text-red-400">{track.title}</p><p style={{color: COLORS.textSecondary}}>{track.creator}</p></a>)}</div>
                                </Card>}
                                {scaleDetails.toneAndGear && <Card className="md:col-span-2">
                                     <SectionHeader title="Tone & Gear Suggestions" icon={<GearIcon />} />
                                     <div className="space-y-4">
                                        {scaleDetails.toneAndGear.suggestions.map(s => (
                                            <div key={s.setting}><p><strong className="text-amber-400">{s.setting}:</strong> {s.description}</p></div>
                                        ))}
                                        <div><p><strong className="text-amber-400">Famous Artists:</strong> {scaleDetails.toneAndGear.famousArtists}</p></div>
                                     </div>
                                </Card>}
                            </div>

                            {scaleDetails.keyChords && <Card><SectionHeader title="Key Chords & Progressions" icon={<MusicNoteIcon />} /><div className="space-y-6"><p><strong className="text-cyan-400">Diatonic Chord Qualities:</strong> <code className="bg-black/20 text-cyan-300 p-1 rounded-md">{scaleDetails.keyChords.diatonicQualities}</code></p><div>{scaleDetails.keyChords.progressions.map(p => (<div key={p.name} className="mt-4"><p className="font-semibold text-lg">{p.name}</p><p className="text-sm italic mb-2" style={{color: COLORS.textSecondary}}>{p.analysis}</p>{renderTab(p.tab)}</div>))}</div></div></Card>}
                            {scaleDetails.licks?.length > 0 && <Card><SectionHeader title="🔥 Classic Licks & Phrases" icon={<FireIcon />} /><div className="space-y-6">{scaleDetails.licks.map(l => (<div key={l.name}><div className="flex justify-between items-center"><div className="flex-grow"><p className="font-semibold text-lg">{l.name}</p><p className="text-sm italic mb-2" style={{color: COLORS.textSecondary}}>{l.description}</p></div><a href={l.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-4 flex-shrink-0 bg-fuchsia-500/80 hover:bg-fuchsia-500 text-white font-bold py-1 px-3 rounded-md transition-colors">View Source</a></div>{renderTab(l.tab)}</div>))}</div></Card>}
                            {scaleDetails.advancedHarmonization?.length > 0 && <Card><SectionHeader title="Advanced Harmonization" icon={<BookOpenIcon />} /><div className="space-y-6">{scaleDetails.advancedHarmonization.map(h => (<div key={h.name}><p className="font-semibold text-lg">{h.name}</p><p className="text-sm italic mb-2" style={{color: COLORS.textSecondary}}>{h.description}</p>{renderTab(h.tab)}</div>))}</div></Card>}
                            {scaleDetails.etudes?.length > 0 && <Card><SectionHeader title="✨ Comprehensive Etudes" icon={<SparklesIcon />} /><div className="space-y-6">{scaleDetails.etudes.map(e => (<div key={e.name}><p className="font-semibold text-lg">{e.name}</p><p className="text-sm italic mb-2" style={{color: COLORS.textSecondary}}>{e.description}</p>{renderTab(e.tab)}</div>))}</div></Card>}
                            {scaleDetails.modeSpotlight && <Card><SectionHeader title="🌍 Beyond the Scale" icon={<GlobeIcon />} /><p className="font-semibold text-lg">{scaleDetails.modeSpotlight.name}</p><p className="my-2">{scaleDetails.modeSpotlight.explanation}</p><p>{scaleDetails.modeSpotlight.soundAndApplication}</p></Card>}
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    );
};
export default App;
