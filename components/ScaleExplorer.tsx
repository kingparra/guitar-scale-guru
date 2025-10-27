import React from 'react';
import type {
    ScaleDetails,
    FontSizeKey,
    LoadingState,
    SectionKey,
    SectionState,
} from '../types';
import Card from './common/Card';
import Section from './common/Section';
import { COLORS } from '../constants';
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
    BookOpenIcon,
    DiagramsIcon,
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

    const { sections, diagramData, degreeExplanation } = loadingState;
    const allSectionData = Object.entries(sections).reduce(
        (acc, [key, value]) => {
            // FIX: Add type assertion to fix property access on 'unknown' type.
            if ((value as SectionState<any>).data) {
                // FIX: Add type assertion to fix property access on 'unknown' type.
                acc[key as SectionKey] = (value as SectionState<any>).data;
            }
            return acc;
        },
        {} as Partial<ScaleDetails>
    );

    const renderOrLoad = (
        key: SectionKey,
        title: string,
        Content: React.ReactNode
    ) => {
        const state = sections[key];
        if (state.status === 'pending') return null;
        if (state.status === 'loading' || state.status === 'error') {
            return (
                <SectionLoader
                    title={title}
                    status={state.status}
                    error={state.error}
                    onRetry={() => onRetrySection(key)}
                />
            );
        }
        if (state.status === 'success' && state.data) {
            return Content;
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {renderOrLoad(
                'overview',
                'Overview',
                <Section title="Overview" icon={<BookOpenIcon />}>
                    {allSectionData.overview && (
                        <OverviewSection
                            overview={allSectionData.overview}
                            degreeExplanation={degreeExplanation || ''}
                        />
                    )}
                </Section>
            )}

            {diagramData && (
                <Section title="Fretboard Diagrams" icon={<DiagramsIcon />}>
                    <DiagramsSection
                        diagramData={diagramData}
                        fontSize={fontSize}
                    />
                </Section>
            )}

            <ResourceSection>
                {renderOrLoad(
                    'listeningGuide',
                    'Listening Guide',
                    allSectionData.listeningGuide && (
                        <ResourceList
                            title="Listening Guide"
                            items={allSectionData.listeningGuide}
                            icon={<SpotifyIcon />}
                        />
                    )
                )}
                {renderOrLoad(
                    'youtubeTutorials',
                    'YouTube Tutorials',
                    allSectionData.youtubeTutorials && (
                        <ResourceList
                            title="YouTube Tutorials"
                            items={allSectionData.youtubeTutorials}
                            icon={<YouTubeIcon />}
                        />
                    )
                )}
                {renderOrLoad(
                    'creativeApplication',
                    'Creative Application',
                    allSectionData.creativeApplication && (
                        <ResourceList
                            title="Creative Application"
                            items={allSectionData.creativeApplication}
                            icon={<LightbulbIcon />}
                        />
                    )
                )}
                {renderOrLoad(
                    'jamTracks',
                    'Jam Tracks',
                    allSectionData.jamTracks && (
                        <ResourceList
                            title="Jam Tracks"
                            items={allSectionData.jamTracks}
                            icon={<JamIcon />}
                        />
                    )
                )}
            </ResourceSection>

            <PracticeSection>
                {renderOrLoad(
                    'toneAndGear',
                    'Tone & Gear',
                    allSectionData.toneAndGear && (
                        <ToneAndGearSection
                            toneAndGear={allSectionData.toneAndGear}
                        />
                    )
                )}
                {renderOrLoad(
                    'keyChords',
                    'Key Chords & Progressions',
                    allSectionData.keyChords && (
                        <KeyChordsSection
                            keyChords={allSectionData.keyChords}
                            fontSize={fontSize}
                        />
                    )
                )}
                {renderOrLoad(
                    'licks',
                    'Licks',
                    allSectionData.licks &&
                        allSectionData.licks.map((item, index) => (
                            <Card key={`lick-${index}`}>
                                <TabbedPracticeItem item={item} />
                            </Card>
                        ))
                )}
                {renderOrLoad(
                    'advancedHarmonization',
                    'Advanced Harmonization',
                    allSectionData.advancedHarmonization &&
                        allSectionData.advancedHarmonization.map(
                            (item, index) => (
                                <Card key={`harm-${index}`}>
                                    <TabbedPracticeItem item={item} />
                                </Card>
                            )
                        )
                )}
                {renderOrLoad(
                    'etudes',
                    'Etudes',
                    allSectionData.etudes &&
                        allSectionData.etudes.map((item, index) => (
                            <Card key={`etude-${index}`}>
                                <TabbedPracticeItem item={item} />
                            </Card>
                        ))
                )}
                {renderOrLoad(
                    'modeSpotlight',
                    'Mode Spotlight',
                    allSectionData.modeSpotlight && (
                        <ModeSpotlightSection
                            modeSpotlight={allSectionData.modeSpotlight}
                        />
                    )
                )}
            </PracticeSection>
        </div>
    );
};

export default ScaleExplorer;
