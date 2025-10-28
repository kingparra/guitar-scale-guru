import React, { useState, useMemo } from 'react';
import Card from '../common/Card';
import FretboardDiagram from '../FretboardDiagram';
import DegreePill from '../common/DegreePill';
import DiagramPlaceholder from '../common/DiagramPlaceholder';
import type { Chord, ChordProgression, Voicing } from '../../types';
import { COLORS } from '../../constants';
import { InfoIcon, RightArrowIcon } from '../common/Icons';
import { calculateChordFretRange } from '../../utils/diagramUtils';

interface ChordProgressionCardProps {
    progression: ChordProgression;
}

const VoicingSelector: React.FC<{
    chord: Chord;
    selectedVoicingIndex: number;
    setSelectedVoicingIndex: (index: number) => void;
}> = ({ chord, selectedVoicingIndex, setSelectedVoicingIndex }) => {
    const numVoicings = chord.voicings.length;
    if (numVoicings <= 1) return null;

    const currentVoicing = chord.voicings[selectedVoicingIndex];

    const handlePrev = () => {
        setSelectedVoicingIndex(
            (prev) => (prev - 1 + numVoicings) % numVoicings
        );
    };
    const handleNext = () => {
        setSelectedVoicingIndex((prev) => (prev + 1) % numVoicings);
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-2">
            <button
                onClick={handlePrev}
                className="p-1 rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-gray-300 transition-colors"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>
            <div className="text-center">
                <p
                    className="text-xs font-bold text-gray-300"
                    style={{ color: COLORS.textSecondary }}
                >
                    Voicing {selectedVoicingIndex + 1} / {numVoicings}
                </p>
                <p className="text-xs font-semibold" style={{ color: COLORS.textPrimary }}>
                    ({currentVoicing.name})
                </p>
            </div>
            <button
                onClick={handleNext}
                className="p-1 rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-gray-300 transition-colors"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </div>
    );
};

const ChordProgressionCard: React.FC<ChordProgressionCardProps> = ({
    progression,
}) => {
    // State to track the selected voicing index for each chord in the progression
    const [voicingIndices, setVoicingIndices] = useState<Record<number, number>>(
        {}
    );

    const handleSetVoicingIndex = (chordIndex: number, voicingIndex: number) => {
        setVoicingIndices((prev) => ({ ...prev, [chordIndex]: voicingIndex }));
    };

    return (
        <Card>
            <div className="bg-black/20 p-4 rounded-lg mb-4 border border-purple-400/20 text-center">
                <h4 className="text-2xl font-bold text-gray-100 tracking-wide">
                    {progression.name}
                </h4>
                <p className="text-xl font-mono text-cyan-300 mt-1 tracking-wider">
                    {progression.analysis}
                </p>
            </div>

            <div className="flex flex-wrap justify-center items-start p-4 gap-4">
                {progression.chords.map((chord, index) => {
                    const selectedVoicingIndex = voicingIndices[index] || 0;
                    const hasVoicings = chord.voicings && chord.voicings.length > 0;
                    const currentVoicing = hasVoicings ? chord.voicings[selectedVoicingIndex] : null;

                    return (
                        <React.Fragment key={`${chord.name}-${index}`}>
                            <div className="flex flex-col items-center gap-2">
                                <DegreePill degree={chord.degree} />
                                <div className="w-80">
                                    {currentVoicing ? (
                                        <FretboardDiagram
                                            title={chord.name}
                                            notesToRender={currentVoicing.notes}
                                            barres={currentVoicing.barres}
                                            openStrings={currentVoicing.openStrings}
                                            mutedStrings={currentVoicing.mutedStrings}
                                            tonicChordDegrees={[]}
                                            characteristicDegrees={[]}
                                            fretRange={calculateChordFretRange(currentVoicing.notes)}
                                            fontScale={1.0}
                                            numStrings={7}
                                        />
                                    ) : (
                                        <DiagramPlaceholder
                                            chordName={chord.name}
                                            degree={chord.degree}
                                        />
                                    )}
                                </div>
                                {hasVoicings && (
                                     <VoicingSelector
                                        chord={chord}
                                        selectedVoicingIndex={selectedVoicingIndex}
                                        setSelectedVoicingIndex={(idx) => handleSetVoicingIndex(index, idx)}
                                    />
                                )}
                            </div>
                            {index < progression.chords.length - 1 && (
                                <div className="hidden md:block self-center pt-20 px-4">
                                    <RightArrowIcon />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {progression.harmonicFunctionAnalysis && (
                <div className="mt-4">
                    <h5 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                        <InfoIcon />
                        Musical Justification
                    </h5>
                    <div className="bg-black/20 p-4 rounded-md border-l-4 border-purple-400/50">
                        <p
                            className="text-sm pl-2 leading-relaxed"
                            style={{ color: COLORS.textSecondary }}
                        >
                            {progression.harmonicFunctionAnalysis}
                        </p>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ChordProgressionCard;
