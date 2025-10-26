
import React from 'react';
import FretboardDiagram from '../FretboardDiagram';
import type { ScaleDetails, FontSizeKey } from '../../types';
import { FONT_SIZES } from '../../constants';
import { NUM_FRETS } from '../../constants';
import { calculatePlayableFretRange } from '../../utils/diagramUtils';

interface DiagramsSectionProps {
    title: string;
    diagramData: ScaleDetails['diagramData'];
    fontSize: FontSizeKey;
}

const DiagramsSection: React.FC<DiagramsSectionProps> = ({ title, diagramData, fontSize }) => {
    const fontScaleValue = parseFloat(FONT_SIZES[fontSize].replace('rem', ''));

    // Dynamically calculate the range for each position using the centralized helper
    const pos1Range = calculatePlayableFretRange(diagramData.fingering.pos1);
    const pos2Range = calculatePlayableFretRange(diagramData.fingering.pos2);
    const pos3Range = calculatePlayableFretRange(diagramData.fingering.pos3);
    
    return (
        <section>
            <h2 className="text-3xl font-bold mb-4 border-l-4 border-purple-400/50 pl-4 text-gray-100">Diagrams</h2>
            <FretboardDiagram
                title={`${title}: Full Neck`}
                scaleData={diagramData}
                fretRange={[0, NUM_FRETS]}
                fontScale={fontScaleValue * 0.9}
            />
            
            {diagramData.diagonalRun && diagramData.diagonalRun.length > 0 && (
                <FretboardDiagram
                    title={`${title}: Ascending Diagonal Run`}
                    scaleData={diagramData}
                    fretRange={[0, NUM_FRETS]}
                    diagonalRun={diagramData.diagonalRun}
                    fontScale={fontScaleValue * 0.9}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <FretboardDiagram
                    title="Position 1"
                    scaleData={diagramData}
                    fretRange={pos1Range}
                    fingeringMap={diagramData.fingering.pos1}
                    fontScale={fontScaleValue}
                />
                <FretboardDiagram
                    title="Position 2"
                    scaleData={diagramData}
                    fretRange={pos2Range}
                    fingeringMap={diagramData.fingering.pos2}
                    fontScale={fontScaleValue}
                />
                <FretboardDiagram
                    title="Position 3"
                    scaleData={diagramData}
                    fretRange={pos3Range}
                    fingeringMap={diagramData.fingering.pos3}
                    fontScale={fontScaleValue}
                />
            </div>
        </section>
    );
};

export default DiagramsSection;
