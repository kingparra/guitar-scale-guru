import React, { useMemo } from 'react';
import type { FretboardDiagramProps } from '../types';
import { FRET_MARKERS, COLORS } from '../constants';
import { useFretboardLayout } from '../hooks/useFretboardLayout';
import FretboardNote from './FretboardNote';
import DiagramWrapper from './common/DiagramWrapper';

// SVG Sub-components for better organization
const SvgStrings: React.FC<{
    count: number;
    getY: (s: number) => number;
    width: number;
}> = React.memo(({ count, getY, width }) => (
    <g className="strings">
        {Array.from({ length: count }).map((_, i) => (
            <line
                key={`string-${i}`}
                x1={0}
                y1={getY(i)}
                x2={width}
                y2={getY(i)}
                stroke={COLORS.grid}
                strokeWidth="1.5"
            />
        ))}
    </g>
));

const SvgFrets: React.FC<{
    numStrings: number;
    frets: number[];
    getX: (f: number) => number;
    getY: (s: number) => number;
    fretWidth: number;
    hasOpenColumn: boolean;
    startFret: number;
}> = React.memo(
    ({
        numStrings,
        frets,
        getX,
        getY,
        fretWidth,
        hasOpenColumn,
        startFret,
    }) => (
        <g className="frets">
            {frets.map((fret) => {
                const isNut = fret === 0 && hasOpenColumn;
                const x = isNut
                    ? getX(0) + fretWidth / 2
                    : getX(fret) - fretWidth / 2;

                if (!hasOpenColumn && fret === startFret) {
                    return (
                        <line
                            key={`fret-border-${fret}`}
                            x1={x}
                            y1={getY(0)}
                            x2={x}
                            y2={getY(numStrings - 1)}
                            stroke={COLORS.grid}
                            strokeWidth={4}
                        />
                    );
                }
                return (
                    <line
                        key={`fret-${fret}`}
                        x1={x}
                        y1={getY(0)}
                        x2={x}
                        y2={getY(numStrings - 1)}
                        stroke={isNut ? COLORS.textPrimary : COLORS.grid}
                        strokeWidth={isNut ? 4 : 2}
                    />
                );
            })}
        </g>
    )
);

const SvgFretMarkers: React.FC<{
    fretsToRender: number[];
    fretRange: [number, number];
    getX: (f: number) => number;
    getY: (s: number) => number;
    fretWidth: number;
    fretHeight: number;
    hasOpenColumn: boolean;
    fontScale: number;
    numStrings: number;
}> = React.memo(
    ({
        fretsToRender,
        fretRange,
        getX,
        getY,
        fretWidth,
        fretHeight,
        hasOpenColumn,
        fontScale,
        numStrings,
    }) => (
        <g className="fret-markers">
            {fretsToRender.map((fret) => (
                <text
                    key={`fret-num-${fret}`}
                    x={getX(fret)}
                    y={25}
                    fontSize={18 * fontScale}
                    fill={COLORS.textPrimary}
                    textAnchor="middle"
                    fontWeight="bold"
                >
                    {fret === 0 && hasOpenColumn ? 'OPEN' : fret}
                </text>
            ))}
            {FRET_MARKERS.map((marker) => {
                if (marker >= fretRange[0] && marker <= fretRange[1]) {
                    const markerX = getX(marker) - fretWidth / 2;
                    const isDoubleDot = marker === 12 || marker === 24;
                    const middleString = numStrings === 7 ? 3 : 2.5;
                    if (isDoubleDot) {
                        return (
                            <g key={`marker-group-${marker}`}>
                                <circle
                                    cx={markerX}
                                    cy={getY(middleString - 1.5)}
                                    r="5"
                                    fill={COLORS.grid}
                                />
                                <circle
                                    cx={markerX}
                                    cy={getY(middleString + 1.5)}
                                    r="5"
                                    fill={COLORS.grid}
                                />
                            </g>
                        );
                    }
                    return (
                        <circle
                            key={`marker-${marker}`}
                            cx={markerX}
                            cy={getY(Math.floor(middleString))}
                            r="5"
                            fill={COLORS.grid}
                        />
                    );
                }
                return null;
            })}
        </g>
    )
);

const SvgBarres: React.FC<{
    barres: FretboardDiagramProps['barres'];
    fretRange: [number, number];
    getX: (f: number) => number;
    getY: (s: number) => number;
    numStrings: number;
}> = React.memo(({ barres, fretRange, getX, getY, numStrings }) => {
    if (!barres || barres.length === 0) return null;
    return (
        <g className="barres">
            {barres.map((barre, index) => {
                if (barre.fret < fretRange[0] || barre.fret > fretRange[1])
                    return null;

                // The AI provides barre data where string 0 is the low B string.
                // Our diagram's y-coordinate system starts with string 0 at the top (high E).
                // This logic maps the AI's 7-string convention to our diagram's coordinate space.
                const fromStringDiagram = (numStrings - 1) - barre.fromString;
                const toStringDiagram = (numStrings - 1) - barre.toString;

                return (
                    <line
                        key={`barre-${index}`}
                        x1={getX(barre.fret)}
                        y1={getY(toStringDiagram)}
                        x2={getX(barre.fret)}
                        y2={getY(fromStringDiagram)}
                        stroke={COLORS.tone}
                        strokeWidth={18}
                        strokeLinecap="round"
                        opacity={0.6}
                    />
                );
            })}
        </g>
    );
});

const FretboardDiagram: React.FC<FretboardDiagramProps> = ({
    title,
    notesToRender,
    tonicChordDegrees,
    characteristicDegrees,
    fretRange,
    diagonalRun,
    barres,
    fontScale = 1.0,
    numStrings = 7,
}) => {
    const layout = useFretboardLayout(fretRange, notesToRender, numStrings);
    const {
        diagramWidth,
        diagramHeight,
        fretWidth,
        fretHeight,
        hasOpenColumn,
        startFret,
        fretsToRender,
        getX,
        getY,
    } = layout;

    const runNotesLookup = useMemo(() => {
        if (!diagonalRun) return undefined;
        return new Set(diagonalRun.map((n) => `${n.string}_${n.fret}`));
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
        <DiagramWrapper title={title}>
            <svg
                viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                className="block mx-auto max-w-full"
            >
                <rect width="100%" height="100%" fill={COLORS.bgPrimary} />

                <SvgStrings
                    count={numStrings}
                    getY={getY}
                    width={diagramWidth}
                />
                <SvgFrets
                    numStrings={numStrings}
                    frets={fretsToRender}
                    getX={getX}
                    getY={getY}
                    fretWidth={fretWidth}
                    hasOpenColumn={hasOpenColumn}
                    startFret={startFret}
                />
                <SvgFretMarkers
                    {...{
                        fretsToRender,
                        fretRange,
                        getX,
                        getY,
                        fretWidth,
                        fretHeight,
                        hasOpenColumn,
                        fontScale,
                        numStrings,
                    }}
                />

                <SvgBarres
                    barres={barres}
                    fretRange={fretRange}
                    getX={getX}
                    getY={getY}
                    numStrings={numStrings}
                />

                <g className="notes">
                    {layout.notesToRender.map((note, index) => {
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
                                isTonicChordTone={tonicChordDegrees.includes(
                                    note.degree ?? ''
                                )}
                                isCharacteristic={characteristicDegrees.includes(
                                    note.degree ?? ''
                                )}
                                isInRun={runNotesLookup?.has(noteKey)}
                                runNotesLookup={runNotesLookup}
                                sequenceNumber={sequenceNumber}
                            />
                        );
                    })}
                </g>
            </svg>
        </DiagramWrapper>
    );
};

export default FretboardDiagram;
