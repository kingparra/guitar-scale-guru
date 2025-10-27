import React from 'react';
import Card from '../common/Card';
import FretboardDiagram from '../FretboardDiagram';
import DegreePill from '../common/DegreePill';
import { COLORS } from '../../constants';
import type {
    ScaleDetails,
    FontSizeKey,
    Chord,
    DiagramNote,
    FretboardDiagramProps,
} from '../../types';
import { RightArrowIcon, InfoIcon } from '../common/Icons';

interface KeyChordsSectionProps {
    keyChords: NonNullable<ScaleDetails['keyChords']>;
    fontSize: FontSizeKey;
}

/**
 * Adapter function to convert client-generated ChordDiagramData into the
 * props needed by the generic FretboardDiagram component.
 */
const convertChordToDiagramProps = (
    chord: Chord
): FretboardDiagramProps => {
    const { name, diagramData } = chord;

    if (!diagramData) {
        // This should not happen if the client-side generation is correct, but it's a safe fallback.
        return {
            title: `${name} (No Diagram)`,
            notesToRender: [],
            fretRange: [1, 5],
            tonicChordDegrees: [],
            characteristicDegrees: [],
            fontScale: 1.0,
            numStrings: 7,
        };
    }

    const { frets, fingers, baseFret, barres } = diagramData;

    // Refactored from map().filter() to a single reduce() for better performance.
    const notesToRender = frets.reduce((acc: DiagramNote[], fret, index) => {
        const stringIndex = 6 - index; // Convert from AI (low B=0) to diagram (high E=0)
        const fretNum = typeof fret === 'number' ? fret : parseInt(fret, 10);

        if (!isNaN(fretNum)) {
            acc.push({
                string: stringIndex,
                fret: fretNum,
                finger:
                    fingers && fingers[index]
                        ? String(fingers[index])
                        : undefined,
            });
        }
        return acc;
    }, []);

    const startFret = baseFret > 1 ? baseFret : 1;
    const fretRange: [number, number] = [startFret, startFret + 4];

    return {
        title: name,
        notesToRender,
        fretRange,
        barres,
        tonicChordDegrees: [], // Not applicable for chord diagrams
        characteristicDegrees: [], // Not applicable for chord diagrams
        fontScale: 1.0,
        numStrings: 7,
    };
};

const KeyChordsSection: React.FC<KeyChordsSectionProps> = ({
    keyChords,
    fontSize,
}) => {
    return (
        <Card>
            <h3 className="text-2xl font-bold mb-4 text-cyan-300">
                Key Chords & Progressions
            </h3>
            <div className="space-y-6">
                <div>
                    <strong className="text-cyan-400">
                        What Are Diatonic Chords?
                    </strong>
                    <p
                        className="text-sm mt-1"
                        style={{ color: COLORS.textSecondary }}
                    >
                        These are the natural chords that can be built using
                        only the notes of the scale. Each degree of the scale
                        has a corresponding chord with a specific quality
                        (major, minor, etc.).
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {keyChords.diatonicQualities.split('-').map((d) => (
                            <DegreePill key={d} degree={d} />
                        ))}
                    </div>
                </div>

                {keyChords.progressions.map((p) => (
                    <div key={p.name} className="mt-4">
                        <div className="bg-black/20 p-4 rounded-lg mb-4 border border-purple-400/20 text-center">
                            <h4 className="text-2xl font-bold text-gray-100 tracking-wide">
                                {p.name}
                            </h4>
                            <p className="text-xl font-mono text-cyan-300 mt-1 tracking-wider">
                                {p.analysis}
                            </p>
                        </div>

                        <div className="flex overflow-x-auto items-center p-4 rounded-md scrollbar-thin scrollbar-thumb-purple-400/50 scrollbar-track-transparent">
                            {p.chords.map((chord, index) => (
                                <React.Fragment key={`${chord.name}-${index}`}>
                                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                        <DegreePill degree={chord.degree} />
                                        <div className="w-80">
                                            <FretboardDiagram
                                                {...convertChordToDiagramProps(
                                                    chord
                                                )}
                                            />
                                        </div>
                                    </div>
                                    {index < p.chords.length - 1 && (
                                        <div className="flex-shrink-0 self-center px-4">
                                            <RightArrowIcon />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {p.harmonicFunctionAnalysis && (
                            <div className="mt-4 bg-black/20 p-4 rounded-md border-l-4 border-purple-400/50">
                                <p className="font-semibold text-purple-300 mb-1 flex items-center gap-2">
                                    <InfoIcon />
                                    Musical Justification
                                </p>
                                <p
                                    className="text-sm pl-7"
                                    style={{ color: COLORS.textPrimary }}
                                >
                                    {p.harmonicFunctionAnalysis}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default KeyChordsSection;