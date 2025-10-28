import React from 'react';
import type {
    ScaleDetails,
    FontSizeKey,
    LoadingState,
    SectionKey,
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
    rootNote: string;
    scaleName: string;
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

const EmptyContentPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <Card>
        <div className="p-4 text-center text-sm" style={{ color: COLORS.textSecondary }}>
            No {title.toLowerCase()} were found for this scale.
        </div>
    </Card>
);


const ScaleExplorer: React.FC<ScaleExplorerProps> = ({
    loadingState,
    fontSize,
    onRetrySection,
    rootNote,
    scaleName,
}) => {
    if (loadingState.status === 'idle') {
        return <WelcomeState />;
    }

    const { sections, diagramData, degreeExplanation } = loadingState;

    const renderSection = (
        key: SectionKey,
        title: string,
        ContentComponent: (data: any) => React.ReactNode,
        isList = false
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

        if (state.status === 'success') {
            if (isList && (!state.data || (Array.isArray(state.data) && state.data.length === 0))) {
                 return <EmptyContentPlaceholder title={title} />;
            }
            if (state.data) {
                return ContentComponent(state.data);
            }
            // Handle non-list empty data case if necessary, for now it renders nothing
        }

        return null;
    };


    return (
        <div className="space-y-8">
            {renderSection(
                'overview',
                'Overview',
                (data) => (
                    <Section title="Overview" icon={<BookOpenIcon />}>
                        <OverviewSection
                            overview={data}
                            degreeExplanation={degreeExplanation || ''}
                        />
                    </Section>
                )
            )}

            {diagramData && (
                <Section title="Fretboard Diagrams" icon={<DiagramsIcon />}>
                    <DiagramsSection
                        diagramData={diagramData}
                        fontSize={fontSize}
                        rootNote={rootNote}
                        scaleName={scaleName}
                    />
                </Section>
            )}

            <ResourceSection>
                 {renderSection(
                    'listeningGuide',
                    'Listening Guide',
                    (data) => <ResourceList title="Listening Guide" items={data} icon={<SpotifyIcon />} />,
                    true
                )}
                 {renderSection(
                    'youtubeTutorials',
                    'YouTube Tutorials',
                    (data) => <ResourceList title="YouTube Tutorials" items={data} icon={<YouTubeIcon />} />,
                    true
                )}
                 {renderSection(
                    'creativeApplication',
                    'Creative Application',
                    (data) => <ResourceList title="Creative Application" items={data} icon={<LightbulbIcon />} />,
                    true
                )}
                 {renderSection(
                    'jamTracks',
                    'Jam Tracks',
                    (data) => <ResourceList title="Jam Tracks" items={data} icon={<JamIcon />} />,
                    true
                )}
            </ResourceSection>

            <PracticeSection>
                 {renderSection(
                    'toneAndGear',
                    'Tone & Gear',
                    (data) => <ToneAndGearSection toneAndGear={data} />
                )}
                 {renderSection(
                    'keyChords',
                    'Key Chords & Progressions',
                    (data) => <KeyChordsSection keyChords={data} fontSize={fontSize} />
                )}
                 {renderSection(
                    'licks',
                    'Licks',
                    (data) => data.map((item: any, index: number) => (
                        <Card key={`lick-${index}`}>
                            <TabbedPracticeItem item={item} />
                        </Card>
                    )),
                    true
                )}
                 {renderSection(
                    'advancedHarmonization',
                    'Advanced Harmonization',
                    (data) => data.map((item: any, index: number) => (
                        <Card key={`harm-${index}`}>
                            <TabbedPracticeItem item={item} />
                        </Card>
                    )),
                    true
                )}
                 {renderSection(
                    'etudes',
                    'Etudes',
                    (data) => data.map((item: any, index: number) => (
                        <Card key={`etude-${index}`}>
                            <TabbedPracticeItem item={item} />
                        </Card>
                    )),
                    true
                )}
                 {renderSection(
                    'modeSpotlight',
                    'Mode Spotlight',
                    (data) => <ModeSpotlightSection modeSpotlight={data} />
                )}
            </PracticeSection>
        </div>
    );
};

export default ScaleExplorer;