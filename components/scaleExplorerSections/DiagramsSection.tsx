import React, { useMemo } from 'react';
import FretboardDiagram from '../FretboardDiagram';
import type {
    ScaleDetails,
    FontSizeKey,
    DiagramNote,
    FingeringMap,
} from '../../types';
import { FONT_SIZES, NUM_FRETS } from '../../constants';
import { calculatePlayableFretRange } from '../../utils/diagramUtils';
import DiagramLegend from '../common/DiagramLegend';

interface DiagramsSectionProps {
    diagramData: ScaleDetails['diagramData'];
    fontSize: FontSizeKey;
}

const prepareNotesForPosition = (
    positionMap: FingeringMap,
    notesOnFretboard: DiagramNote[]
): DiagramNote[] => {
    const masterNotesMap = new Map(
        notesOnFretboard.map((n) => [`${n.string}_${n.fret}`, n])
    );

    return positionMap.map((posEntry) => {
        const masterNote = masterNotesMap.get(posEntry.key);
        const [string, fret] = posEntry.key.split('_').map(Number);

        if (masterNote && typeof masterNote === 'object') {
            return { ...masterNote, finger: posEntry.finger };
        } else {
            return { string, fret, finger: posEntry.finger };
        }
    });
};

const DiagramsSection: React.FC<DiagramsSectionProps> = React.memo(
    ({ diagramData, fontSize }) => {
        const fontScaleValue = parseFloat(
            FONT_SIZES[fontSize].replace('rem', '')
        );

        const {
            notesOnFretboard,
            fingering,
            diagonalRun,
            tonicChordDegrees,
            characteristicDegrees,
        } = diagramData;

        const pos1Notes = useMemo(
            () => prepareNotesForPosition(fingering.pos1, notesOnFretboard),
            [fingering.pos1, notesOnFretboard]
        );
        const pos2Notes = useMemo(
            () => prepareNotesForPosition(fingering.pos2, notesOnFretboard),
            [fingering.pos2, notesOnFretboard]
        );
        const pos3Notes = useMemo(
            () => prepareNotesForPosition(fingering.pos3, notesOnFretboard),
            [fingering.pos3, notesOnFretboard]
        );

        const pos1Range = calculatePlayableFretRange(fingering.pos1);
        const pos2Range = calculatePlayableFretRange(fingering.pos2);
        const pos3Range = calculatePlayableFretRange(fingering.pos3);

        const rootNoteName =
            notesOnFretboard.find((n) => n.degree === 'R')?.noteName ||
            notesOnFretboard[0]?.noteName;
        const fullNeckTitle = rootNoteName
            ? `${rootNoteName} Scale: Full Neck`
            : 'Full Neck Diagram';

        return (
            <>
                <DiagramLegend />
                <FretboardDiagram
                    title={fullNeckTitle}
                    notesToRender={notesOnFretboard}
                    tonicChordDegrees={tonicChordDegrees}
                    characteristicDegrees={characteristicDegrees}
                    fretRange={[0, NUM_FRETS]}
                    fontScale={fontScaleValue * 0.9}
                />

                {diagonalRun && diagonalRun.length > 0 && (
                    <FretboardDiagram
                        title={`Ascending Diagonal Run`}
                        notesToRender={notesOnFretboard}
                        tonicChordDegrees={tonicChordDegrees}
                        characteristicDegrees={characteristicDegrees}
                        fretRange={[0, NUM_FRETS]}
                        diagonalRun={diagonalRun}
                        fontScale={fontScaleValue * 0.9}
                    />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <FretboardDiagram
                        title="Position 1"
                        notesToRender={pos1Notes}
                        tonicChordDegrees={tonicChordDegrees}
                        characteristicDegrees={characteristicDegrees}
                        fretRange={pos1Range}
                        fontScale={fontScaleValue}
                    />
                    <FretboardDiagram
                        title="Position 2"
                        notesToRender={pos2Notes}
                        tonicChordDegrees={tonicChordDegrees}
                        characteristicDegrees={characteristicDegrees}
                        fretRange={pos2Range}
                        fontScale={fontScaleValue}
                    />
                    <FretboardDiagram
                        title="Position 3"
                        notesToRender={pos3Notes}
                        tonicChordDegrees={tonicChordDegrees}
                        characteristicDegrees={characteristicDegrees}
                        fretRange={pos3Range}
                        fontScale={fontScaleValue}
                    />
                </div>
            </>
        );
    }
);

export default DiagramsSection;