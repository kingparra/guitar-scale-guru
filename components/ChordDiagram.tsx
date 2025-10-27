import React from 'react';
import type { DisplayableChord } from '../types';
import { COLORS } from '../constants';
import DiagramWrapper from './common/DiagramWrapper';

interface ChordDiagramProps {
    chord: DisplayableChord;
}

const ChordDiagram: React.FC<ChordDiagramProps> = ({ chord }) => {
    const { name, diagramData } = chord;
    const { frets, fingers, baseFret, barres } = diagramData;

    const NUM_STRINGS = 7;
    const NUM_FRETS_DISPLAY = 5;
    const FRET_WIDTH = 40;
    const FRET_HEIGHT = 40;
    const PADDING_X = 30;
    const PADDING_Y = 40;
    const DIAGRAM_WIDTH = FRET_WIDTH * (NUM_STRINGS - 1) + PADDING_X * 2;
    const DIAGRAM_HEIGHT = FRET_HEIGHT * NUM_FRETS_DISPLAY + PADDING_Y * 2;
    const NOTE_RADIUS = FRET_HEIGHT / 2.5;

    const getX = (string: number) => PADDING_X + string * FRET_WIDTH;
    const getY = (fret: number) =>
        PADDING_Y + (fret - 0.5) * FRET_HEIGHT - FRET_HEIGHT * (baseFret - 1);

    return (
        <DiagramWrapper title={name}>
            <svg
                viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                className="block mx-auto max-w-full"
            >
                <rect width="100%" height="100%" fill={COLORS.bgPrimary} />

                {/* Base Fret Number */}
                {baseFret > 1 && (
                    <text
                        x={PADDING_X - 15}
                        y={getY(1) + 10}
                        fontSize="24"
                        fill={COLORS.textSecondary}
                        textAnchor="end"
                        fontWeight="bold"
                    >
                        {baseFret}
                    </text>
                )}

                {/* Strings */}
                {Array.from({ length: NUM_STRINGS }).map((_, i) => (
                    <line
                        key={`string-${i}`}
                        x1={getX(i)}
                        y1={PADDING_Y - (baseFret > 1 ? 0 : 5)}
                        x2={getX(i)}
                        y2={PADDING_Y + FRET_HEIGHT * NUM_FRETS_DISPLAY}
                        stroke={COLORS.grid}
                        strokeWidth="1.5"
                    />
                ))}

                {/* Frets */}
                {Array.from({ length: NUM_FRETS_DISPLAY + 1 }).map((_, i) => (
                    <line
                        key={`fret-${i}`}
                        x1={getX(0)}
                        y1={PADDING_Y + i * FRET_HEIGHT}
                        x2={getX(NUM_STRINGS - 1)}
                        y2={PADDING_Y + i * FRET_HEIGHT}
                        stroke={
                            i === 0 && baseFret === 1
                                ? COLORS.textPrimary
                                : COLORS.grid
                        }
                        strokeWidth={i === 0 && baseFret === 1 ? 4 : 2}
                    />
                ))}

                {/* Barre Chords */}
                {barres &&
                    barres.map((barre, index) => {
                        // fromString/toString are low-B=0
                        const fromStringIdx = barre.fromString;
                        const toStringIdx = barre.toString;
                        return (
                            <line
                                key={`barre-${index}`}
                                x1={getX(fromStringIdx)}
                                y1={getY(barre.fret)}
                                x2={getX(toStringIdx)}
                                y2={getY(barre.fret)}
                                stroke={COLORS.tone}
                                strokeWidth={NOTE_RADIUS * 1.5}
                                strokeLinecap="round"
                                opacity={0.6}
                            />
                        );
                    })}

                {/* Notes and Fingers */}
                {frets.map((fret, stringIndex) => {
                    const finger = fingers[stringIndex];

                    if (fret === 'x') {
                        return (
                            <text
                                key={`mute-${stringIndex}`}
                                x={getX(stringIndex)}
                                y={PADDING_Y - 10}
                                fontSize="24"
                                fill={COLORS.textSecondary}
                                textAnchor="middle"
                            >
                                x
                            </text>
                        );
                    }

                    if (fret === 0) {
                        return (
                            <circle
                                key={`open-${stringIndex}`}
                                cx={getX(stringIndex)}
                                cy={PADDING_Y - 12}
                                r={NOTE_RADIUS / 2}
                                stroke={COLORS.openString}
                                strokeWidth="2"
                                fill="none"
                            />
                        );
                    }

                    if (typeof fret === 'number') {
                        return (
                            <g key={`note-${stringIndex}`}>
                                <circle
                                    cx={getX(stringIndex)}
                                    cy={getY(fret)}
                                    r={NOTE_RADIUS}
                                    fill={COLORS.tone}
                                />
                                {finger && (
                                    <text
                                        x={getX(stringIndex)}
                                        y={getY(fret) + 8}
                                        fontSize="24"
                                        fill={COLORS.bgPrimary}
                                        textAnchor="middle"
                                        fontWeight="bold"
                                    >
                                        {finger}
                                    </text>
                                )}
                            </g>
                        );
                    }
                    return null;
                })}
            </svg>
        </DiagramWrapper>
    );
};

export default ChordDiagram;
