import { useMemo } from 'react';
import type { FretboardDiagramProps } from '../types';
import { NUM_STRINGS } from '../constants';

/**
 * A custom hook to encapsulate all the complex layout and coordinate
 * calculations for the FretboardDiagram component.
 */
export const useFretboardLayout = (
    fretRange: FretboardDiagramProps['fretRange'],
    notesOnFretboard: FretboardDiagramProps['scaleData']['notesOnFretboard']
) => {
    const [startFret, endFret] = fretRange;
    const isFullNeck = startFret === 0 && endFret > 20;

    const fretWidth = isFullNeck ? 50 : 100;
    const fretHeight = 40;
    const hasOpenColumn = startFret === 0;

    const displayedFretCount = endFret - startFret + 1;
    // For position diagrams, add a little extra width for the start fret border.
    const diagramWidth = (hasOpenColumn ? displayedFretCount : displayedFretCount + 1) * fretWidth;
    const diagramHeight = (NUM_STRINGS - 1) * fretHeight + 120; // 60px padding top and bottom

    // Memoize coordinate calculation functions for performance
    const getX = useMemo(() => (fret: number) => {
        if (hasOpenColumn) {
            return (fret + 0.5) * fretWidth;
        }
        // For position view, we shift the coordinates to start near the edge.
        return (fret - startFret + 1) * fretWidth;
    }, [hasOpenColumn, startFret, fretWidth]);

    const getY = useMemo(() => (string: number) => 60 + string * fretHeight, [fretHeight]);

    // Memoize filtered notes and frets to render so they aren't recalculated on every render
    const notesToRender = useMemo(
        () => notesOnFretboard.filter(n => n.fret >= startFret && n.fret <= endFret),
        [notesOnFretboard, startFret, endFret]
    );
    const fretsToRender = useMemo(
        () => Array.from({ length: displayedFretCount }, (_, i) => startFret + i),
        [displayedFretCount, startFret]
    );

    return {
        diagramWidth,
        diagramHeight,
        fretWidth,
        fretHeight,
        hasOpenColumn,
        startFret,
        fretsToRender,
        notesToRender,
        getX,
        getY,
    };
};
