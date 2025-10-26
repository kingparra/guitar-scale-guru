import React, { useMemo } from 'react';
import type { FretboardDiagramProps } from '../types';
import { NUM_STRINGS, FRET_MARKERS, COLORS } from '../constants';

// Helper function to create a lookup map for fingerings, memoized for performance.
const useFingeringLookup = (fingeringMap?: FretboardDiagramProps['fingeringMap'], diagonalRun?: FretboardDiagramProps['diagonalRun']) => {
    return useMemo(() => {
        const map = new Map<string, string>();
        if (fingeringMap) {
            for (const item of fingeringMap) {
                map.set(item.key, item.finger);
            }
        }
        // The diagonal run's fingering takes precedence
        if (diagonalRun) {
            for (const note of diagonalRun) {
                map.set(`${note.string}_${note.fret}`, note.finger);
            }
        }
        return map;
    }, [fingeringMap, diagonalRun]);
};

// SVG Sub-components for better organization
const SvgStrings: React.FC<{ count: number; getY: (s: number) => number; width: number }> = React.memo(({ count, getY, width }) => (
    <g className="strings">
        {Array.from({ length: count }).map((_, i) => (
            <line key={`string-${i}`} x1={0} y1={getY(i)} x2={width} y2={getY(i)} stroke={COLORS.grid} strokeWidth="1.5" />
        ))}
    </g>
));

const SvgFrets: React.FC<{ frets: number[]; getX: (f: number) => number; getY: (s: number) => number; fretWidth: number; hasOpenColumn: boolean; startFret: number }> = React.memo(({ frets, getX, getY, fretWidth, hasOpenColumn, startFret }) => (
    <g className="frets">
        {frets.map((fret) => {
            const isNut = fret === 0;
            const x = getX(fret) - (isNut && hasOpenColumn ? 0 : fretWidth / 2);
            if (!hasOpenColumn && fret === startFret) {
                return <line key={`fret-border-${fret}`} x1={x} y1={getY(0)} x2={x} y2={getY(NUM_STRINGS - 1)} stroke={COLORS.grid} strokeWidth={4} />
            }
            return <line key={`fret-${fret}`} x1={getX(fret) + fretWidth / 2} y1={getY(0)} x2={getX(fret) + fretWidth / 2} y2={getY(NUM_STRINGS - 1)} stroke={isNut ? COLORS.textPrimary : COLORS.grid} strokeWidth={isNut ? 4 : 2} />
        })}
    </g>
));

const SvgPathLines: React.FC<{ path: FretboardDiagramProps['diagonalRun']; getX: (f: number) => number; getY: (s: number) => number; }> = React.memo(({ path, getX, getY }) => {
    if (!path || path.length < 2) return null;
    return (
        <g className="path-lines" opacity={0.8}>
            {path.slice(1).map((note, index) => {
                const prevNote = path[index]; // `index` is correct here since we sliced
                const x1 = getX(prevNote.fret);
                const y1 = getY(prevNote.string);
                const x2 = getX(note.fret);
                const y2 = getY(note.string);

                return (
                    <line
                        key={`path-line-${index}`}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="url(#line-gradient)"
                        strokeWidth="4"
                        markerEnd="url(#arrowhead)"
                        strokeLinecap="round"
                    />
                );
            })}
        </g>
    );
});

const SvgNotes: React.FC<{ notes: FretboardDiagramProps['scaleData']['notesOnFretboard']; scaleData: FretboardDiagramProps['scaleData']; getX: (f: number) => number; getY: (s: number) => number; fontScale: number; fingeringLookup: Map<string, string>; runNotesLookup?: Set<string> }> = React.memo(({ notes, scaleData, getX, getY, fontScale, fingeringLookup, runNotesLookup }) => {
    const baseMarkerRadius = 20;
    const noteFontSize = 15;
    const degreeFontSize = 14;
    const fingerFontSize = 12;
    
    return (
        <g className="notes">
            {notes.map((note, index) => {
                const { string, fret, noteName, degree } = note;
                const isRoot = degree === 'R';
                const isTonicChordTone = scaleData.tonicChordDegrees.includes(degree);
                const isCharacteristic = scaleData.characteristicDegrees.includes(degree);
                const key = `${string}-${fret}-${index}`;
                const noteX = getX(fret);
                const noteY = getY(string);
                const isInRun = runNotesLookup?.has(`${string}_${fret}`);
                const r = isRoot ? baseMarkerRadius * fontScale : (baseMarkerRadius - 1) * fontScale;

                const finger = fingeringLookup.get(`${string}_${fret}`);
                
                // Dim notes that are not part of the run if the lookup exists
                const opacity = runNotesLookup && !isInRun ? 0.3 : (isTonicChordTone ? 1.0 : 0.7);

                return (
                    <g key={key} opacity={opacity}>
                        {isRoot ? (
                            <path d={`M ${noteX} ${noteY - r} L ${noteX + r * 0.866} ${noteY + r * 0.5} L ${noteX - r * 0.866} ${noteY + r * 0.5} Z`}
                                fill={fret === 0 ? COLORS.openString : COLORS.root} stroke={isCharacteristic ? COLORS.characteristicOutline : 'none'} strokeWidth={3}
                            />
                        ) : (
                            <circle cx={noteX} cy={noteY} r={r} fill={fret === 0 ? COLORS.openString : COLORS.tone} stroke={isCharacteristic ? COLORS.characteristicOutline : 'none'} strokeWidth={3} />
                        )}
                        <text x={noteX} y={noteY + (noteFontSize * fontScale * 0.35)} fontSize={noteFontSize * fontScale} fill={fret === 0 ? '#000' : COLORS.bgPrimary} textAnchor="middle" fontWeight="bold">{noteName}</text>
                        <text x={noteX + (22 * fontScale)} y={noteY - (22 * fontScale)} fontSize={degreeFontSize * fontScale} fill={COLORS.textPrimary} textAnchor="middle" fontWeight="bold">{degree}</text>
                        {finger && <text x={noteX - (20 * fontScale)} y={noteY - (20 * fontScale)} fontSize={fingerFontSize * fontScale} fill={COLORS.textPrimary} textAnchor="middle" fontWeight="bold">{finger}</text>}
                    </g>
                );
            })}
        </g>
    );
});


const FretboardDiagram: React.FC<FretboardDiagramProps> = ({ title, scaleData, fretRange, fingeringMap, diagonalRun, fontScale = 1.0 }) => {
    const [startFret, endFret] = fretRange;
    const isFullNeck = startFret === 0 && endFret > 20;
    const fingeringLookup = useFingeringLookup(fingeringMap, diagonalRun);
    const runNotesLookup = useMemo(() => {
        if (!diagonalRun) return undefined;
        return new Set(diagonalRun.map(n => `${n.string}_${n.fret}`));
    }, [diagonalRun]);

    const fretWidth = isFullNeck ? 50 : 100;
    const fretHeight = 40;
    const hasOpenColumn = startFret === 0;
    const displayedFretCount = endFret - startFret + 1;
    const diagramWidth = (hasOpenColumn ? displayedFretCount : displayedFretCount + 1) * fretWidth;
    const diagramHeight = (NUM_STRINGS - 1) * fretHeight + 120;
    
    // Memoize coordinate calculation functions
    const getX = useMemo(() => (fret: number) => {
        if (hasOpenColumn) return (fret + 0.5) * fretWidth;
        return (fret - startFret + 1.5) * fretWidth - fretWidth / 2;
    }, [hasOpenColumn, startFret, fretWidth]);
    
    const getY = useMemo(() => (string: number) => 60 + string * fretHeight, [fretHeight]);
    
    // Memoize filtered notes and frets to render
    const notesToRender = useMemo(() => scaleData.notesOnFretboard.filter(n => n.fret >= startFret && n.fret <= endFret), [scaleData.notesOnFretboard, startFret, endFret]);
    const fretsToRender = useMemo(() => Array.from({ length: displayedFretCount }, (_, i) => startFret + i), [displayedFretCount, startFret]);

    return (
        <div className="p-[2px] bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-2xl shadow-lg my-4 hover:shadow-cyan-500/20 transition-shadow duration-300">
            <div className="bg-[#171528] p-4 rounded-[14px] overflow-hidden">
                <h3 className="text-xl font-bold text-center mb-4" style={{ color: COLORS.textHeader }}>{title}</h3>
                <svg viewBox={`0 0 ${diagramWidth} ${diagramHeight}`} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" className="block mx-auto max-w-full">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.accentCyan} />
                        </marker>
                        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor: COLORS.accentMagenta, stopOpacity:1}} />
                            <stop offset="100%" style={{stopColor: COLORS.accentCyan, stopOpacity:1}} />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill={COLORS.bgPrimary} />

                    <SvgStrings count={NUM_STRINGS} getY={getY} width={diagramWidth} />
                    <SvgFrets frets={fretsToRender} getX={getX} getY={getY} fretWidth={fretWidth} hasOpenColumn={hasOpenColumn} startFret={startFret} />

                    {/* Fret Numbers and Markers (kept here as they are less complex) */}
                    {fretsToRender.map((fret) => (
                        <text key={`fret-num-${fret}`} x={getX(fret)} y={25} fontSize={18 * fontScale} fill={COLORS.textPrimary} textAnchor="middle" fontWeight="bold">
                            {fret === 0 && hasOpenColumn ? 'OPEN' : fret}
                        </text>
                    ))}
                    {FRET_MARKERS.map(marker => {
                        if (marker >= startFret && marker <= endFret) {
                            const markerX = getX(marker) - fretWidth/2;
                            const isDoubleDot = marker === 12 || marker === 24;
                             if (isDoubleDot) {
                                return <g key={`marker-group-${marker}`}><circle cx={markerX} cy={getY(2) + fretHeight/2} r="5" fill={COLORS.grid} /><circle cx={markerX} cy={getY(3) + fretHeight/2} r="5" fill={COLORS.grid} /></g>
                            }
                            return <circle key={`marker-${marker}`} cx={markerX} cy={getY(3)} r="5" fill={COLORS.grid} />
                        }
                        return null;
                    })}
                    
                    <SvgNotes notes={notesToRender} scaleData={scaleData} getX={getX} getY={getY} fontScale={fontScale} fingeringLookup={fingeringLookup} runNotesLookup={runNotesLookup} />
                    <SvgPathLines path={diagonalRun} getX={getX} getY={getY} />
                </svg>
            </div>
        </div>
    );
};

export default FretboardDiagram;