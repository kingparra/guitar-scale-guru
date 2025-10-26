import React, { forwardRef } from 'react';
import type { ScaleDetails } from '../types';
import { COLORS } from '../constants';
import { FontSizeKey } from '../App';

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
const PdfDocument = forwardRef<HTMLDivElement, PdfDocumentProps>(({ scaleDetails, fontSize }, ref) => {
    
    // Inline styles are used here to ensure they are captured by html2canvas
    const wrapperStyles: React.CSSProperties = {
        position: 'absolute',
        left: '-9999px', // Render off-screen
        top: 0,
        width: '1024px', // A fixed width for consistent PDF layout
        backgroundColor: COLORS.bgPrimary,
        color: COLORS.textPrimary,
        padding: '20px',
        fontFamily: 'Poppins, sans-serif',
        zIndex: -1, // Ensure it's not accidentally visible or interactive
    };

    const headerStyles: React.CSSProperties = {
        textAlign: 'center',
        padding: '20px',
        borderBottom: `1px solid ${COLORS.grid}`,
        marginBottom: '20px'
    };
    
    const h1Styles: React.CSSProperties = {
        fontSize: '32px', 
        fontWeight: 700, 
        margin: 0, 
        background: `linear-gradient(to right, ${COLORS.accentCyan}, ${COLORS.accentMagenta})`,
        WebkitBackgroundClip: 'text',
        color: 'transparent',
    };

    const h2Styles: React.CSSProperties = {
        fontSize: '24px', 
        fontWeight: 600, 
        margin: '8px 0 0 0', 
        color: COLORS.textPrimary
    };

    // Note: The child components will not have access to Tailwind classes here.
    // However, since they mostly use inline styles or basic tags styled by the wrapper, it works.
    // For more complex styling, we might need a different approach.
    const sectionsWrapperStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '48px',
    };

    return (
        <div ref={ref} style={wrapperStyles}>
            <div style={headerStyles}>
                <h1 style={h1Styles}>Guitar Scale Guru</h1>
                <h2 style={h2Styles}>{scaleDetails.overview.title}</h2>
            </div>
             {/* We compose the same section components directly for a clean layout */}
            <div style={sectionsWrapperStyles}>
                <OverviewSection overview={scaleDetails.overview} />
                <DiagramsSection title={scaleDetails.overview.title} diagramData={scaleDetails.diagramData} fontSize={fontSize} />
                <ResourceSection 
                    listeningGuide={scaleDetails.listeningGuide}
                    youtubeTutorials={scaleDetails.youtubeTutorials}
                    creativeApplication={scaleDetails.creativeApplication}
                    jamTracks={scaleDetails.jamTracks}
                />
                <PracticeSection scaleDetails={scaleDetails} />
            </div>
        </div>
    );
});

export default PdfDocument;