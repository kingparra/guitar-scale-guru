import React, { forwardRef } from 'react';
import type { ScaleDetails, FontSizeKey } from '../types';
import { COLORS } from '../constants';

// Import the same section components used by the main UI
import OverviewSection from './scaleExplorerSections/OverviewSection';
import DiagramsSection from './scaleExplorerSections/DiagramsSection';
import ResourceSection from './scaleExplorerSections/ResourceSection';
import PracticeSection from './scaleExplorerSections/PracticeSection';

interface PdfDocumentProps {
    scaleDetails: ScaleDetails;
    fontSize: FontSizeKey;
}

/**
 * This component is designed to be rendered off-screen.
 * It builds a static, print-optimized layout of the scale materials for reliable PDF capture.
 */
const PdfDocument = forwardRef<HTMLDivElement, PdfDocumentProps>(
    ({ scaleDetails, fontSize }, ref) => {
        // These checks are critical because this component will only be rendered
        // when isContentComplete is true, so we can assume these properties exist.
        if (
            !scaleDetails.overview ||
            !scaleDetails.diagramData ||
            !scaleDetails.listeningGuide
        ) {
            return null;
        }

        const wrapperStyles: React.CSSProperties = {
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: '1024px',
            backgroundColor: COLORS.bgPrimary,
            color: COLORS.textPrimary,
            padding: '20px',
            fontFamily: 'Poppins, sans-serif',
            zIndex: -1,
        };

        const headerStyles: React.CSSProperties = {
            textAlign: 'center',
            padding: '20px',
            borderBottom: `1px solid ${COLORS.grid}`,
            marginBottom: '20px',
        };

        const h1Styles: React.CSSProperties = {
            fontSize: '32px',
            fontWeight: 700,
            margin: 0,
            background: `linear-gradient(to right, ${COLORS.accentCyan}, ${COLORS.accentMagenta})`,
            WebkitBackgroundClip: 'text',
            color: 'transparent',
        };

        const h2MainStyles: React.CSSProperties = {
            fontSize: '24px',
            fontWeight: 600,
            margin: '8px 0 0 0',
            color: COLORS.textPrimary,
        };

        const h2SectionStyles: React.CSSProperties = {
            fontSize: '28px',
            fontWeight: 600,
            marginBottom: '16px',
            paddingLeft: '12px',
            borderLeft: `4px solid ${COLORS.accentMagenta}`,
            color: COLORS.textPrimary,
        };

        const sectionWrapperStyles: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            gap: '48px',
        };

        return (
            <div ref={ref} style={wrapperStyles}>
                <div style={headerStyles}>
                    <h1 style={h1Styles}>Guitar Scale Guru</h1>
                    <h2 style={h2MainStyles}>
                        {scaleDetails.overview.title}
                    </h2>
                </div>
                <div style={sectionWrapperStyles}>
                    <section>
                        <h2 style={h2SectionStyles}>Overview</h2>
                        <OverviewSection overview={scaleDetails.overview} />
                    </section>
                    <section>
                        <h2 style={h2SectionStyles}>Diagrams</h2>
                        <DiagramsSection
                            diagramData={scaleDetails.diagramData}
                            fontSize={fontSize}
                        />
                    </section>
                    <section>
                        <h2 style={h2SectionStyles}>Resources</h2>
                        <ResourceSection scaleDetails={scaleDetails} />
                    </section>
                    <section>
                        <h2 style={h2SectionStyles}>Practice Materials</h2>
                        <PracticeSection
                            scaleDetails={scaleDetails}
                            fontSize={fontSize}
                        />
                    </section>
                </div>
            </div>
        );
    }
);

export default PdfDocument;