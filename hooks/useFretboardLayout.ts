import { useMemo } from 'react';
import type { FretboardDiagramProps, DiagramNote } from '../types';

const LABEL_WIDTH = 40; // Space for string tuning labels
const NUT_WIDTH = 30; // Space for open/muted string symbols

/**
 * A custom hook to encapsulate all complex layout and coordinate calculations
 * for the FretboardDiagram component. Its sole responsibility is to translate
 * high-level props (like fret range and notes) into the low-level values
 * (like pixel coordinates, widths, and heights) needed for SVG rendering.
 * This keeps the FretboardDiagram component clean and focused on rendering,
 * while this hook handles the "how-to-draw-it" logic.
 */
export const useFretboardLayout = (
    fretRange: FretboardDiagramProps['fretRange'],
    notesToRender: DiagramNote[],
    numStrings = 7
) => {
    const [startFret, endFret] = fretRange;
    const isFullNeck = startFret === 0 && endFret > 20;

    const fretWidth = isFullNeck ? 50 : 100;
    const fretHeight = 40;
    const hasOpenColumn = startFret === 0;

    const displayedFretCount = endFret - startFret + 1;
    // For position diagrams, add a little extra width for the start fret border.
    const diagramWidth =
        (hasOpenColumn ? displayedFretCount : displayedFretCount + 1) *
            fretWidth +
        LABEL_WIDTH +
        NUT_WIDTH;
    const diagramHeight = (numStrings - 1) * fretHeight + 120; // 60px padding top and bottom

    // Memoize coordinate calculation functions for performance
    const getX = useMemo(
        () => (fret: number) => {
            let base_x;
            if (fret === 0) {
                // Open string notes align with the nut line
                base_x = fretWidth * 0.5;
            } else if (hasOpenColumn) {
                base_x = (fret + 0.5) * fretWidth;
            } else {
                // For position view, we shift the coordinates to start near the edge.
                base_x = (fret - startFret + 1) * fretWidth;
            }
            return base_x + LABEL_WIDTH + NUT_WIDTH;
        },
        [hasOpenColumn, startFret, fretWidth]
    );

    const getY = useMemo(
        () => (string: number) => 60 + string * fretHeight,
        [fretHeight]
    );

    // This is now much simpler: just filter the pre-calculated notes by the fret range.
    const finalNotesToRender = useMemo(() => {
        return notesToRender.filter(
            (n) => n.fret >= startFret && n.fret <= endFret
        );
    }, [notesToRender, startFret, endFret]);

    const fretsToRender = useMemo(
        () =>
            Array.from(
                { length: displayedFretCount },
                (_, i) => startFret + i
            ),
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
        notesToRender: finalNotesToRender,
        getX,
        getY,
        LABEL_WIDTH,
        NUT_WIDTH,
    };
};
