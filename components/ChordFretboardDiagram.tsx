import React, { useMemo } from 'react';
import type { Chord, DiagramNote, FontSizeKey } from '../types';
import FretboardDiagram from './FretboardDiagram';
import { FONT_SIZES } from '../constants';

interface ChordFretboardDiagramProps {
    chord: Chord;
    fontSize: FontSizeKey;
}

const ChordFretboardDiagram: React.FC<ChordFretboardDiagramProps> = ({
    chord,
    fontSize,
}) => {
    const { name, diagramData } = chord;
    const {
        frets: aiFrets,
        fingers: aiFingers,
        baseFret,
        barres,
    } = diagramData;

    const fontScaleValue = parseFloat(FONT_SIZES[fontSize].replace('rem', ''));

    const fretRange = useMemo((): [number, number] => {
        if (baseFret <= 1) {
            return [0, 4];
        }
        return [baseFret - 1, baseFret + 3];
    }, [baseFret]);

    const notesToRender = useMemo(() => {
        const notes: DiagramNote[] = [];
        const mapAiStringToDiagramString = (aiString: number): number =>
            5 - aiString;

        aiFrets.forEach((fret, aiStringIndex) => {
            if (aiStringIndex >= 0 && aiStringIndex < 6 && fret !== 'x') {
                const fretValue =
                    typeof fret === 'string' ? parseInt(fret, 10) : fret;
                if (!isNaN(fretValue)) {
                    const finger = aiFingers[aiStringIndex];
                    notes.push({
                        string: mapAiStringToDiagramString(aiStringIndex),
                        fret: fretValue,
                        finger:
                            finger &&
                            typeof finger === 'number' &&
                            finger > 0
                                ? String(finger)
                                : undefined,
                    });
                }
            }
        });
        return notes;
    }, [aiFrets, aiFingers]);

    return (
        <FretboardDiagram
            title={name}
            notesToRender={notesToRender}
            tonicChordDegrees={[]}
            characteristicDegrees={[]}
            fretRange={fretRange}
            barres={barres}
            fontScale={fontScaleValue}
            numStrings={6}
        />
    );
};

export default ChordFretboardDiagram;