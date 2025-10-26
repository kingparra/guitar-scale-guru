
import React, { useMemo } from 'react';
import type { Chord, DiagramData, DiagramNote, FingeringMap } from '../types';
import FretboardDiagram from './FretboardDiagram';

interface ChordFretboardDiagramProps {
    chord: Chord;
}

/**
 * An "adapter" component that translates AI-generated chord data into the props 
 * required by our generic `FretboardDiagram` component.
 * This architectural pattern ensures perfect visual and stylistic consistency 
 * between scale diagrams and chord diagrams by reusing the same core rendering logic.
 * @param {ChordFretboardDiagramProps} props The props object.
 * @param {Chord} props.chord The chord data object from the AI.
 * @returns {React.ReactElement} A fully rendered FretboardDiagram for the given chord.
 */
const ChordFretboardDiagram: React.FC<ChordFretboardDiagramProps> = ({ chord }) => {
    const { name, diagramData } = chord;
    const { frets: aiFrets, fingers: aiFingers, baseFret } = diagramData;

    /**
     * Memoized calculation of the optimal 5-fret window to display for the chord.
     * For open chords (baseFret=1), it shows the first few frets (0-4).
     * For barre chords, it centers the view around the chord's position.
     */
    const fretRange = useMemo((): [number, number] => {
        if (baseFret <= 1) {
            return [0, 4]; // Standard open position view
        }
        // For chords higher up, show a 5-fret window that contains the chord.
        return [baseFret - 1, baseFret + 3];
    }, [baseFret]);

    /**
     * Memoized transformation of the AI's chord data into the `scaleData` and `fingeringMap`
     * props that the `FretboardDiagram` component understands. This makes the types "honest"
     * by not providing placeholder values for `noteName` or `degree`.
     */
    const transformedProps = useMemo(() => {
        const notesOnFretboard: DiagramNote[] = [];
        const fingeringMap: FingeringMap = [];

        // The AI provides 6-string chord data where low E string is index 0.
        // Our 7-string FretboardDiagram component expects high E string to be index 0.
        // This function maps the AI's string index to our component's string index.
        const mapAiStringToRenderString = (aiString: number): number => 5 - aiString;

        aiFrets.forEach((fret, aiStringIndex) => {
            // Only process notes for a standard 6-string guitar (indices 0-5)
            if (aiStringIndex >= 0 && aiStringIndex < 6) {
                const renderStringIndex = mapAiStringToRenderString(aiStringIndex);
                
                if (typeof fret === 'number') {
                    // This is a fretted note or an open string (fret=0).
                    // The noteName and degree are intentionally omitted as they are not
                    // relevant for chord diagrams and the types are now optional.
                    notesOnFretboard.push({
                        string: renderStringIndex,
                        fret: fret,
                    });

                    // Add fingering information if available.
                    const finger = aiFingers[aiStringIndex];
                    if (finger && typeof finger === 'number' && finger > 0) {
                        fingeringMap.push({
                            key: `${renderStringIndex}_${fret}`,
                            finger: String(finger)
                        });
                    }
                }
                // Muted strings (represented by 'x') are implicitly handled by not adding a note.
            }
        });

        // Construct the minimal `DiagramData` object required by FretboardDiagram.
        const scaleData: DiagramData = {
            notesOnFretboard,
            tonicChordDegrees: [], // No tonic highlighting needed for chords.
            characteristicDegrees: [], // No characteristic highlighting needed.
            fingering: { pos1: [], pos2: [], pos3: [] },
            diagonalRun: []
        };

        return { scaleData, fingeringMap };
    }, [aiFrets, aiFingers]);

    return (
        <FretboardDiagram
            title={name}
            scaleData={transformedProps.scaleData}
            fingeringMap={transformedProps.fingeringMap}
            fretRange={fretRange}
            fontScale={1.0}
        />
    );
};

export default ChordFretboardDiagram;
