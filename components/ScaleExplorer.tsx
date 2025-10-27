import React from 'react';
import type { ScaleDetails, FontSizeKey } from '../types';
import Card from './common/Card';
import { COLORS } from '../constants';
import OverviewSection from './scaleExplorerSections/OverviewSection';
import DiagramsSection from './scaleExplorerSections/DiagramsSection';
import ResourceSection from './scaleExplorerSections/ResourceSection';
import PracticeSection from './scaleExplorerSections/PracticeSection';
import ScaleExplorerSkeleton from './ScaleExplorerSkeleton';
import SectionPlaceholder from './common/SectionPlaceholder';
import DiagramPlaceholder from './common/DiagramPlaceholder';
import ResourceSectionPlaceholder from './common/ResourceSectionPlaceholder';

interface ScaleExplorerProps {
    isLoading: boolean;
    scaleDetails: ScaleDetails | null;
    fontSize: FontSizeKey;
}

const WelcomeState = () => (
    <Card>
        <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-100 mb-4 text-center">
                Welcome to the Scale Explorer!
            </h2>
            <p
                className="text-lg max-w-3xl mx-auto mb-6 text-center"
                style={{ color: COLORS.textSecondary }}
            >
                Select a root note and a scale from the controls above, then
                click "Generate Materials" to get a comprehensive, AI-powered
                breakdown for your 7-string guitar.
            </p>
        </div>
    </Card>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
}) => (
    <section>
        <h2 className="text-3xl font-bold mb-4 border-l-4 border-purple-400/50 pl-4 text-gray-100">
            {title}
        </h2>
        {children}
    </section>
);

const ScaleExplorer: React.FC<ScaleExplorerProps> = ({
    isLoading,
    scaleDetails,
    fontSize,
}) => {
    if (isLoading && !scaleDetails) {
        return <ScaleExplorerSkeleton />;
    }

    if (!scaleDetails) {
        return <WelcomeState />;
    }

    // A flag to check if any async content has started to arrive.
    // The overview is a good proxy for this.
    const hasAsyncContentStarted = !!scaleDetails.overview;

    return (
        <div className="space-y-12">
            {/* Overview - show placeholder if loading, show content if available */}
            {hasAsyncContentStarted && scaleDetails.degreeExplanation ? (
                <Section title="Overview">
                    <OverviewSection
                        overview={scaleDetails.overview!}
                        degreeExplanation={scaleDetails.degreeExplanation}
                    />
                </Section>
            ) : (
                isLoading && <SectionPlaceholder title="Overview" />
            )}

            {/* Diagrams - show instantly from client-side data */}
            {scaleDetails.diagramData && (
                <Section title="Diagrams">
                    <DiagramsSection
                        diagramData={scaleDetails.diagramData}
                        fontSize={fontSize}
                    />
                </Section>
            )}

            {/* Resources section - show placeholder if loading, show content if available */}
            {hasAsyncContentStarted ? (
                <Section title="Resources">
                    <ResourceSection scaleDetails={scaleDetails} />
                </Section>
            ) : (
                isLoading && <ResourceSectionPlaceholder />
            )}

            {/* Practice section - show placeholder if loading, show content if available */}
            {hasAsyncContentStarted ? (
                <Section title="Practice Materials">
                    <PracticeSection
                        scaleDetails={scaleDetails}
                        fontSize={fontSize}
                    />
                </Section>
            ) : (
                isLoading && <SectionPlaceholder title="Practice" />
            )}
        </div>
    );
};

export default ScaleExplorer;