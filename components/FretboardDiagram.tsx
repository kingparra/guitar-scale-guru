import React, { useMemo } from 'react';
import type { FretboardDiagramProps } from '../types';
import { NUM_STRINGS, FRET_MARKERS, COLORS } from '../constants';
import { useFretboardLayout } from '../hooks/useFretboardLayout';
import FretboardNote from './FretboardNote';

// Helper function to create a lookup map for fingerings, memoized for performance.
const useFingeringLookup = (fingeringMap?: FretboardDiagramProps['fingeringMap'], diagonalRun?: FretboardDiagramProps['diagonalRun']) => {
    return useMemo(() => {
        const map = new Map<string, string>();
        if (fingeringMap) {
            fingeringMap.forEach(item => map.set(item.key, item.finger));
        }
        // The diagonal run's fingering takes precedence
        if (diagonalRun) {
            diagonalRun.forEach(note => map.set(`${note.string}_${note.fret}`, note.finger));
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
            const isNut = fret === 0 && hasOpenColumn;
            const x = getX(fret) - fretWidth / 2;
            // Draw a thick border on the left of position diagrams
            if (!hasOpenColumn && fret === startFret) {
                return <line key={`fret-border-${fret}`} x1={x} y1={getY(0)} x2={x} y2={getY(NUM_STRINGS - 1)} stroke={COLORS.grid} strokeWidth={4} />
            }
            // Draw regular fret lines (or a thick nut)
            return <line key={`fret-${fret}`} x1={x} y1={getY(0)} x2={x} y2={getY(NUM_STRINGS - 1)} stroke={isNut ? COLORS.textPrimary : COLORS.grid} strokeWidth={isNut ? 4 : 2} />
        })}
    </g>
));

const FretboardDiagram: React.FC<FretboardDiagramProps> = ({ title, scaleData, fretRange, fingeringMap, diagonalRun, fontScale = 1.0 }) => {
    const layout = useFretboardLayout(fretRange, scaleData.notesOnFretboard);
    const { diagramWidth, diagramHeight, fretWidth, fretHeight, hasOpenColumn, startFret, fretsToRender, notesToRender, getX, getY } = layout;

    const fingeringLookup = useFingeringLookup(fingeringMap, diagonalRun);
    
    // Create lookups for the diagonal run to pass down to notes
    const runNotesLookup = useMemo(() => {
        if (!diagonalRun) return undefined;
        return new Set(diagonalRun.map(n => `${n.string}_${n.fret}`));
    }, [diagonalRun]);

    const runSequenceLookup = useMemo(() => {
        if (!diagonalRun) return new Map<string, number>();
        const map = new Map<string, number>();
        diagonalRun.forEach((note, index) => {
            map.set(`${note.string}_${note.fret}`, index + 1);
        });
        return map;
    }, [diagonalRun]);

    return (
        <div className="p-[2px] bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-2xl shadow-lg my-4 hover:shadow-cyan-500/20 transition-shadow duration-300">
            <div className="bg-[#171528] p-4 rounded-[14px] overflow-hidden">
                <h3 className="text-xl font-bold text-center mb-4" style={{ color: COLORS.textHeader }}>{title}</h3>
                <svg viewBox={`0 0 ${diagramWidth} ${diagramHeight}`} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" className="block mx-auto max-w-full">
                    <rect width="100%" height="100%" fill={COLORS.bgPrimary} />

                    <SvgStrings count={NUM_STRINGS} getY={getY} width={diagramWidth} />
                    <SvgFrets frets={fretsToRender} getX={getX} getY={getY} fretWidth={fretWidth} hasOpenColumn={hasOpenColumn} startFret={startFret} />

                    {/* Fret Numbers and Markers */}
                    {fretsToRender.map((fret) => (
                        <text key={`fret-num-${fret}`} x={getX(fret)} y={25} fontSize={18 * fontScale} fill={COLORS.textPrimary} textAnchor="middle" fontWeight="bold">
                            {fret === 0 && hasOpenColumn ? 'OPEN' : fret}
                        </text>
                    ))}
                    {FRET_MARKERS.map(marker => {
                        if (marker >= fretRange[0] && marker <= fretRange[1]) {
                            const markerX = getX(marker) - fretWidth/2;
                            const isDoubleDot = marker === 12 || marker === 24;
                            if (isDoubleDot) {
                                return <g key={`marker-group-${marker}`}><circle cx={markerX} cy={getY(2) + fretHeight/2} r="5" fill={COLORS.grid} /><circle cx={markerX} cy={getY(3) + fretHeight/2} r="5" fill={COLORS.grid} /></g>
                            }
                            return <circle key={`marker-${marker}`} cx={markerX} cy={getY(3)} r="5" fill={COLORS.grid} />
                        }
                        return null;
                    })}
                    
                    {/* Render Notes */}
                    <g className="notes">
                        {notesToRender.map((note, index) => {
                             const { string, fret } = note;
                             const noteKey = `${string}_${fret}`;
                             const sequenceNumber = runSequenceLookup.get(noteKey);
                             return (
                                <FretboardNote
                                    key={`${noteKey}-${index}`}
                                    note={note}
                                    x={getX(fret)}
                                    y={getY(string)}
                                    fontScale={fontScale}
                                    isRoot={note.degree === 'R'}
                                    isTonicChordTone={scaleData.tonicChordDegrees.includes(note.degree)}
                                    isCharacteristic={scaleData.characteristicDegrees.includes(note.degree)}
                                    isInRun={runNotesLookup?.has(noteKey)}
                                    runNotesLookup={runNotesLookup}
                                    finger={fingeringLookup.get(noteKey)}
                                    sequenceNumber={sequenceNumber}
                                />
                            );
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default FretboardDiagram;
