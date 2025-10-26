import React, { useMemo } from 'react';
import type { FretboardDiagramProps } from '../types';
import { NUM_STRINGS, FRET_MARKERS, COLORS } from '../constants';

const FretboardDiagram: React.FC<FretboardDiagramProps> = ({ title, scaleData, fretRange, fingeringMap, fontScale = 1.0 }) => {
    const [startFret, endFret] = fretRange;
    const isFullNeck = startFret === 0 && endFret > 20;

    const fingeringLookup = useMemo(() => {
        if (!fingeringMap) return new Map<string, string>();
        return new Map(fingeringMap.map(item => [item.key, item.finger]));
    }, [fingeringMap]);

    const fretWidth = isFullNeck ? 50 : 100;
    const fretHeight = 40;
    const hasOpenColumn = startFret === 0;

    const displayedFretCount = endFret - startFret + 1;
    const diagramWidth = (hasOpenColumn ? displayedFretCount : displayedFretCount + 1) * fretWidth;
    const diagramHeight = (NUM_STRINGS - 1) * fretHeight + 120;

    const getX = (fret: number) => {
        if (hasOpenColumn) {
            return (fret + 0.5) * fretWidth;
        }
        return (fret - startFret + 1.5) * fretWidth - fretWidth / 2;
    };
    
    const getY = (string: number) => 60 + string * fretHeight;

    const notesToRender = scaleData.notesOnFretboard.filter(n => n.fret >= startFret && n.fret <= endFret);
    const fretsToRender = Array.from({ length: displayedFretCount }, (_, i) => startFret + i);

    const rootPositions = notesToRender.filter(n => n.degree === 'R').map(n => ({ x: getX(n.fret), y: getY(n.string) }));
    const seventhPositions = notesToRender.filter(n => n.degree === '7').map(n => ({ x: getX(n.fret), y: getY(n.string) }));
    
    // Scale sizes based on prop
    const baseFontSize = 18;
    const noteFontSize = 15;
    const degreeFontSize = 14;
    const fingerFontSize = 12;
    const baseMarkerRadius = 20;

    return (
        <div className="p-[2px] bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-2xl shadow-lg my-4 hover:shadow-cyan-500/20 transition-shadow duration-300">
            <div className="bg-[#171528] p-4 rounded-[14px] overflow-hidden">
                <h3 className="text-xl font-bold text-center mb-4" style={{ color: COLORS.textHeader }}>{title}</h3>
                <svg
                    viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg"
                    className="block mx-auto max-w-full"
                >
                    <rect width="100%" height="100%" fill={COLORS.bgPrimary} />

                    {/* Strings */}
                    {Array.from({ length: NUM_STRINGS }).map((_, i) => (
                        <line key={`string-${i}`}
                            x1={0} y1={getY(i)}
                            x2={diagramWidth} y2={getY(i)}
                            stroke={COLORS.grid} strokeWidth="1.5" />
                    ))}

                    {/* Fret Wires */}
                    {fretsToRender.map((fret) => {
                        const isNut = fret === 0;
                        const x = getX(fret) - (isNut && hasOpenColumn ? 0 : fretWidth / 2);
                         if (!hasOpenColumn && fret === startFret) {
                           return (
                             <line key={`fret-border-${fret}`}
                                  x1={x} y1={getY(0)}
                                  x2={x} y2={getY(NUM_STRINGS - 1)}
                                  stroke={COLORS.grid}
                                  strokeWidth={4} />
                           )
                         }
                        return (
                            <line key={`fret-${fret}`}
                                  x1={getX(fret) + fretWidth / 2} y1={getY(0)}
                                  x2={getX(fret) + fretWidth / 2} y2={getY(NUM_STRINGS - 1)}
                                  stroke={isNut ? COLORS.textPrimary : COLORS.grid} 
                                  strokeWidth={isNut ? 4 : 2} />
                        );
                    })}

                    {/* Fret Numbers */}
                    {fretsToRender.map((fret) => {
                         if(fret === 0 && hasOpenColumn) return (
                             <text key={`fret-num-open`}
                                x={getX(0)} y={25}
                                fontSize={baseFontSize * fontScale} fill={COLORS.textPrimary} textAnchor="middle" fontWeight="bold">
                                OPEN
                             </text>
                         )
                        return (
                            <text key={`fret-num-${fret}`}
                                x={getX(fret)} y={25}
                                fontSize={baseFontSize * fontScale} fill={COLORS.textPrimary} textAnchor="middle" fontWeight="bold">
                                {fret}
                            </text>
                        )
                    })}

                    {/* Fret Markers */}
                    {FRET_MARKERS.map(marker => {
                        if (marker >= startFret && marker <= endFret) {
                            const markerX = getX(marker) - fretWidth/2;
                            const isDoubleDot = marker === 12 || marker === 24;
                             const yPos = isDoubleDot ? getY(2) + fretHeight/2 : getY(3);
                            
                             if (isDoubleDot) {
                                return (
                                    <g key={`marker-group-${marker}`}>
                                        <circle cx={markerX} cy={yPos} r="5" fill={COLORS.grid} />
                                        <circle cx={markerX} cy={getY(3) + fretHeight/2} r="5" fill={COLORS.grid} />
                                    </g>
                                )
                            }
                            return <circle key={`marker-${marker}`} cx={markerX} cy={yPos} r="5" fill={COLORS.grid} />
                        }
                        return null;
                    })}
                    
                    {/* Resolution Arrows */}
                    {seventhPositions.map((p7, idx) => {
                        if (rootPositions.length === 0) return null;
                        const closestRoot = rootPositions.reduce((prev, curr) => {
                            const distPrev = Math.hypot(p7.x - prev.x, p7.y - prev.y);
                            const distCurr = Math.hypot(p7.x - curr.x, p7.y - curr.y);
                            return distPrev < distCurr ? prev : curr;
                        });

                        const dx = closestRoot.x - p7.x;
                        const dy = closestRoot.y - p7.y;
                        const controlPointX = p7.x + dx * 0.5 + dy * 0.3;
                        const controlPointY = p7.y + dy * 0.5 - dx * 0.3;

                        return (
                            <path
                                key={`arrow-${idx}`}
                                d={`M ${p7.x} ${p7.y} Q ${controlPointX} ${controlPointY} ${closestRoot.x} ${closestRoot.y}`}
                                stroke={COLORS.resolutionArrow}
                                strokeWidth="2"
                                fill="none"
                                markerEnd="url(#arrowhead)"
                            />
                        );
                    })}
                    <defs>
                        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill={COLORS.resolutionArrow} />
                        </marker>
                    </defs>

                    {/* Notes */}
                    {notesToRender.map((note, index) => {
                        const { string, fret, noteName, degree } = note;
                        const isRoot = degree === 'R';
                        const isTonicChordTone = scaleData.tonicChordDegrees.includes(degree);
                        const isCharacteristic = scaleData.characteristicDegrees.includes(degree);
                        const key = `${string}-${fret}-${index}`;
                        
                        const noteX = getX(fret);
                        const noteY = getY(string);

                        const markerProps = {
                            cx: noteX,
                            cy: noteY,
                            r: isRoot ? baseMarkerRadius * fontScale : (baseMarkerRadius - 1) * fontScale,
                            fill: fret === 0 ? COLORS.openString : (isRoot ? COLORS.root : COLORS.tone),
                            stroke: isCharacteristic ? COLORS.characteristicOutline : 'none',
                            strokeWidth: 3,
                            opacity: isTonicChordTone ? 1.0 : 0.7
                        };

                        const finger = fingeringLookup.get(`${string}_${fret}`);
                        const textOffset = 20 * fontScale; // Reduced for better spacing
                        const degreeOffset = 22 * fontScale;

                        return (
                            <g key={key}>
                                {isRoot ? (
                                    <path d={`M ${markerProps.cx} ${markerProps.cy - markerProps.r} L ${markerProps.cx + markerProps.r * 0.866} ${markerProps.cy + markerProps.r * 0.5} L ${markerProps.cx - markerProps.r * 0.866} ${markerProps.cy + markerProps.r * 0.5} Z`}
                                        fill={markerProps.fill} stroke={markerProps.stroke} strokeWidth={markerProps.strokeWidth} opacity={markerProps.opacity}
                                    />
                                ) : (
                                    <circle {...markerProps} />
                                )}
                                <text x={noteX} y={noteY + (noteFontSize * fontScale * 0.35)} fontSize={noteFontSize * fontScale} fill={fret === 0 ? '#000' : COLORS.bgPrimary} textAnchor="middle" fontWeight="bold">{noteName}</text>
                                <text x={noteX + degreeOffset} y={noteY - degreeOffset} fontSize={degreeFontSize * fontScale} fill={COLORS.textPrimary} textAnchor="middle" fontWeight="bold">{degree}</text>
                                {finger && <text x={noteX - textOffset} y={noteY - textOffset} fontSize={fingerFontSize * fontScale} fill={COLORS.textPrimary} textAnchor="middle" fontWeight="bold">{finger}</text>}
                            </g>
                        );
                    })}

                </svg>
            </div>
        </div>
    );
};

export default FretboardDiagram;
