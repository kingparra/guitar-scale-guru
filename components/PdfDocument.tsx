import React, { forwardRef } from 'react';
import type { ScaleDetails, FontSizeKey } from '../../types';
import { COLORS } from '../../constants';

// Import the same section components used by the main UI
import OverviewSection from './scaleExplorerSections/OverviewSection';
import DiagramsSection from './scaleExplorerSections/DiagramsSection';
import ResourceSection from './scaleExplorerSections/ResourceSection';
import PracticeSection from './scaleExplorerSections/PracticeSection';

// Import individual content components for correct rendering
import ResourceList from './scaleExplorerSections/ResourceList';
import DiatonicChordsDisplay from './practiceSections/DiatonicChordsDisplay';
import ChordProgressionCard from './practiceSections/ChordProgressionCard';
import ToneAndGearSection from './practiceSections/ToneAndGearSection';
import TabbedPracticeItem from './practiceSections/TabbedPracticeItem';
import ModeSpotlightSection from './practiceSections/ModeSpotlightSection';
import Card from './common/Card';
import {
    SpotifyIcon,
    YouTubeIcon,
    LightbulbIcon,
    JamIcon,
} from './common/Icons';

interface PdfDocumentProps {
    scaleDetails: ScaleDetails;
    fontSize: FontSizeKey;
    rootNote: string;
    scaleName: string;
}

/**
 * This component is designed to be rendered off-screen.
 * It builds a static, print-optimized layout of the scale materials for reliable PDF capture.
 */
const PdfDocument = forwardRef<HTMLDivElement, PdfDocumentProps>(
    ({ scaleDetails, fontSize, rootNote, scaleName }, ref) => {
        // These checks are critical because this component will only be rendered
        // when isContentComplete is true, so we can assume these properties exist.
        if (!scaleDetails.overview || !scaleDetails.diagramData) {
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
                        <OverviewSection
                            overview={scaleDetails.overview}
                            degreeExplanation={
                                scaleDetails.degreeExplanation || ''
                            }
                        />
                    </section>
                    <section>
                        <h2 style={h2SectionStyles}>Diagrams</h2>
                        <DiagramsSection
                            diagramData={scaleDetails.diagramData}
                            fontSize={fontSize}
                            rootNote={rootNote}
                            scaleName={scaleName}
                        />
                    </section>
                    <section>
                        <h2 style={h2SectionStyles}>Resources</h2>
                        <ResourceSection>
                            {scaleDetails.listeningGuide && (
                                <ResourceList
                                    title="Listening Guide"
                                    items={scaleDetails.listeningGuide}
                                    icon={<SpotifyIcon />}
                                />
                            )}
                            {scaleDetails.youtubeTutorials && (
                                <ResourceList
                                    title="YouTube Tutorials"
                                    items={scaleDetails.youtubeTutorials}
                                    icon={<YouTubeIcon />}
                                />
                            )}
                            {scaleDetails.creativeApplication && (
                                <ResourceList
                                    title="Creative Application"
                                    items={scaleDetails.creativeApplication}
                                    icon={<LightbulbIcon />}
                                />
                            )}
                            {scaleDetails.jamTracks && (
                                <ResourceList
                                    title="Jam Tracks"
                                    items={scaleDetails.jamTracks}
                                    icon={<JamIcon />}
                                />
                            )}
                        </ResourceSection>
                    </section>
                    <section>
                        <h2 style={h2SectionStyles}>Practice Materials</h2>
                        <PracticeSection>
                            {scaleDetails.toneAndGear && (
                                <ToneAndGearSection
                                    toneAndGear={scaleDetails.toneAndGear}
                                />
                            )}
                            {scaleDetails.keyChords && (
                                <>
                                    <DiatonicChordsDisplay
                                        diatonicQualities={
                                            scaleDetails.keyChords
                                                .diatonicQualities
                                        }
                                    />
                                    {scaleDetails.keyChords.progressions.map(
                                        (p, index) => (
                                            <ChordProgressionCard
                                                key={`pdf-prog-${index}`}
                                                progression={p}
                                            />
                                        )
                                    )}
                                </>
                            )}
                            {scaleDetails.licks?.map((item, index) => (
                                <Card key={`lick-${index}`}>
                                    <TabbedPracticeItem item={item} />
                                </Card>
                            ))}
                            {scaleDetails.advancedHarmonization?.map(
                                (item, index) => (
                                    <Card key={`harm-${index}`}>
                                        <TabbedPracticeItem item={item} />
                                    </Card>
                                )
                            )}
                            {scaleDetails.etudes?.map((item, index) => (
                                <Card key={`etude-${index}`}>
                                    <TabbedPracticeItem item={item} />
                                </Card>
                            ))}
                            {scaleDetails.modeSpotlight && (
                                <ModeSpotlightSection
                                    modeSpotlight={scaleDetails.modeSpotlight}
                                />
                            )}
                        </PracticeSection>
                    </section>
                </div>
            </div>
        );
    }
);

export default PdfDocument;
