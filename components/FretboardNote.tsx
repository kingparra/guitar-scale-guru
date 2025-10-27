import React from 'react';
import type { FretboardNoteProps } from '../types';
import { COLORS } from '../constants';

const FretboardNote: React.FC<FretboardNoteProps> = React.memo(
    ({
        note,
        x,
        y,
        fontScale,
        isRoot,
        isTonicChordTone,
        isCharacteristic,
        isInRun,
        runNotesLookup,
        finger,
        sequenceNumber,
    }) => {
        const baseMarkerRadius = 20;
        const noteFontSize = 15;
        const degreeFontSize = 14;
        const fingerFontSize = 12;

        const { fret, noteName, degree } = note;
        const r = isRoot
            ? baseMarkerRadius * fontScale
            : (baseMarkerRadius - 1) * fontScale;

        // Dim notes that are not part of the run if a run is being displayed
        const opacity =
            runNotesLookup && !isInRun ? 0.3 : isTonicChordTone ? 1.0 : 0.7;
        const fillColor =
            fret === 0 ? COLORS.openString : isRoot ? COLORS.root : COLORS.tone;
        const textColor = fret === 0 ? '#000' : COLORS.bgPrimary;

        return (
            <g
                opacity={opacity}
                style={{ transition: 'opacity 0.3s ease-in-out' }}
            >
                {/* Note Marker (Circle or Triangle for Root) */}
                {isRoot ? (
                    <path
                        d={`M ${x} ${y - r} L ${x + r * 0.866} ${y + r * 0.5} L ${
                            x - r * 0.866
                        } ${y + r * 0.5} Z`}
                        fill={fillColor}
                        stroke={
                            isCharacteristic ? COLORS.characteristicOutline : 'none'
                        }
                        strokeWidth={3}
                    />
                ) : (
                    <circle
                        cx={x}
                        cy={y}
                        r={r}
                        fill={fillColor}
                        stroke={
                            isCharacteristic ? COLORS.characteristicOutline : 'none'
                        }
                        strokeWidth={3}
                    />
                )}

                {/* Note Name or Sequence Number Text (inside the marker) */}
                <text
                    x={x}
                    y={y + noteFontSize * fontScale * 0.35}
                    fontSize={noteFontSize * fontScale}
                    fill={textColor}
                    textAnchor="middle"
                    fontWeight="bold"
                >
                    {/* For chord diagrams, noteName will be undefined. SequenceNumber takes precedence for runs. */}
                    {sequenceNumber ? sequenceNumber : noteName ?? ''}
                </text>

                {/* Degree Text (top right) - only render if degree is provided */}
                {degree && (
                    <text
                        x={x + 22 * fontScale}
                        y={y - 22 * fontScale}
                        fontSize={degreeFontSize * fontScale}
                        fill={COLORS.textPrimary}
                        textAnchor="middle"
                        fontWeight="bold"
                    >
                        {degree}
                    </text>
                )}

                {/* Finger Number (top left) */}
                {finger && (
                    <text
                        x={x - 20 * fontScale}
                        y={y - 20 * fontScale}
                        fontSize={fingerFontSize * fontScale}
                        fill={COLORS.textPrimary}
                        textAnchor="middle"
                        fontWeight="bold"
                    >
                        {finger}
                    </text>
                )}
            </g>
        );
    }
);

export default FretboardNote;