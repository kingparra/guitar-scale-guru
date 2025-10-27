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
import Card from '../common/Card';

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

        const positionData = useMemo(() => {
            return fingering.map((positionMap) => ({
                notes: prepareNotesForPosition(positionMap, notesOnFretboard),
                range: calculatePlayableFretRange(positionMap),
            }));
        }, [fingering, notesOnFretboard]);

        const rootNoteName =
            notesOnFretboard.find((n) => n.degree === 'R')?.noteName ||
            notesOnFretboard[0]?.noteName;
        const fullNeckTitle = rootNoteName
            ? `${rootNoteName} Scale: Full Neck`
            : 'Full Neck Diagram';

        return (
            <Card>
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
                    {positionData.map((pos, index) => (
                        <FretboardDiagram
                            key={`position-${index + 1}`}
                            title={`Position ${index + 1}`}
                            notesToRender={pos.notes}
                            tonicChordDegrees={tonicChordDegrees}
                            characteristicDegrees={characteristicDegrees}
                            fretRange={pos.range}
                            fontScale={fontScaleValue}
                        />
                    ))}
                </div>
            </Card>
        );
    }
);

export default DiagramsSection;