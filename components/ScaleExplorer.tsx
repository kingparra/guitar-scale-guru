import React from 'react';
import type {
    ScaleDetails,
    FontSizeKey,
    LoadingState,
    SectionKey,
} from '../../types';
import Card from './common/Card';
import { COLORS } from '../../constants';
import OverviewSection from './scaleExplorerSections/OverviewSection';
import DiagramsSection from './scaleExplorerSections/DiagramsSection';
import ResourceSection from './scaleExplorerSections/ResourceSection';
import PracticeSection from './scaleExplorerSections/PracticeSection';
import SectionLoader from './common/SectionLoader';

// Import individual content components
import KeyChordsSection from './practiceSections/KeyChordsSection';
import ToneAndGearSection from './practiceSections/ToneAndGearSection';
import TabbedPracticeItem from './practiceSections/TabbedPracticeItem';
import ModeSpotlightSection from './practiceSections/ModeSpotlightSection';
import {
    SpotifyIcon,
    YouTubeIcon,
    LightbulbIcon,
    JamIcon,
} from './common/Icons';
import ResourceList from './scaleExplorerSections/ResourceList';

interface ScaleExplorerProps {
    loadingState: LoadingState;
    fontSize: FontSizeKey;
    onRetrySection: (sectionKey: SectionKey) => void;
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
                Select a root note and a scale, then click "Generate Materials"
                to get a comprehensive, AI-powered breakdown.
            </p>
        </div>
    </Card>
);

const ScaleExplorer: React.FC<ScaleExplorerProps> = ({
    loadingState,
    fontSize,
    onRetrySection,
}) => {
    if (loadingState.status === 'idle') {
        return <WelcomeState />;
    }

    const { sections } = loadingState;
    const allSectionData = Object.entries(sections).reduce(
        (acc, [key, value]) => {
            // FIX: Cast value to any to access properties due to type inference issue.
            if ((value as any).data) {
                // FIX: Cast value to any to access properties due to type inference issue.
                acc[key as SectionKey] = (value as any).data;
            }
            return acc;
        },
        {} as Partial<ScaleDetails>
    );

    const renderSection = (
        key: SectionKey,
        title: string,
        ContentComponent: React.FC<any>
    ) => {
        const sectionState = sections[key];
        if (sectionState.status === 'pending') return null;
        if (
            sectionState.status === 'loading' ||
            sectionState.status === 'error'
        ) {
            return (
                <SectionLoader
                    title={title}
                    status={sectionState.status}
                    error={sectionState.error}
                    onRetry={() => onRetrySection(key)}
                />
            );
        }
        if (sectionState.status === 'success' && sectionState.data) {
            return <ContentComponent {...sectionState.data} />;
        }
        return null;
    };

    return (
        <div className="space-y-12">
            {/* Diagrams - show instantly from client-side data */}
            {allSectionData.diagramData && (
                <section>
                    <h2 className="text-3xl font-bold mb-4 border-l-4 border-purple-400/50 pl-4 text-gray-100">
                        Diagrams
                    </h2>
                    <DiagramsSection
                        diagramData={allSectionData.diagramData}
                        fontSize={fontSize}
                    />
                </section>
            )}

            <section>
                <h2 className="text-3xl font-bold mb-4 border-l-4 border-purple-400/50 pl-4 text-gray-100">
                    Overview
                </h2>
                {renderSection('overview', 'Overview & Theory', (data) => (
                    <OverviewSection
                        overview={data}
                        degreeExplanation={
                            allSectionData.degreeExplanation || ''
                        }
                    />
                ))}
            </section>

            <section>
                <h2 className="text-3xl font-bold mb-4 border-l-4 border-purple-400/50 pl-4 text-gray-100">
                    Resources
                </h2>
                <ResourceSection>
                    {renderSection(
                        'listeningGuide',
                        'Listening Guide',
                        (data) => (
                            <ResourceList items={data} icon={<SpotifyIcon />} />
                        )
                    )}
                    {renderSection(
                        'youtubeTutorials',
                        'YouTube Tutorials',
                        (data) => (
                            <ResourceList items={data} icon={<YouTubeIcon />} />
                        )
                    )}
                    {renderSection(
                        'creativeApplication',
                        'Creative Application',
                        (data) => (
                            <ResourceList
                                items={data}
                                icon={<LightbulbIcon />}
                            />
                        )
                    )}
                    {renderSection('jamTracks', 'Jam Tracks', (data) => (
                        <ResourceList items={data} icon={<JamIcon />} />
                    ))}
                </ResourceSection>
            </section>

            <section>
                <h2 className="text-3xl font-bold mb-4 border-l-4 border-purple-400/50 pl-4 text-gray-100">
                    Practice Materials
                </h2>
                <PracticeSection>
                    {renderSection(
                        'toneAndGear',
                        'Tone & Gear',
                        (data) => <ToneAndGearSection toneAndGear={data} />
                    )}
                    {renderSection(
                        'keyChords',
                        'Key Chords & Progressions',
                        (data) => (
                            <KeyChordsSection
                                keyChords={data}
                                fontSize={fontSize}
                            />
                        )
                    )}
                    {(sections.licks as any)?.data &&
                        (sections.licks as any).data.map(
                            (item: any, index: number) => (
                                <Card key={index}>
                                    <TabbedPracticeItem item={item} />
                                </Card>
                            )
                        )}
                    {(sections.advancedHarmonization as any)?.data &&
                        (sections.advancedHarmonization as any).data.map(
                            (item: any, index: number) => (
                                <Card key={index}>
                                    <TabbedPracticeItem item={item} />
                                </Card>
                            )
                        )}
                    {(sections.etudes as any)?.data &&
                        (sections.etudes as any).data.map(
                            (item: any, index: number) => (
                                <Card key={index}>
                                    <TabbedPracticeItem item={item} />
                                </Card>
                            )
                        )}
                    {renderSection(
                        'modeSpotlight',
                        'Mode Spotlight',
                        (data) => <ModeSpotlightSection modeSpotlight={data} />
                    )}
                </PracticeSection>
            </section>
        </div>
    );
};

export default ScaleExplorer;