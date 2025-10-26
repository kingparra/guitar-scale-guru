import React, { useState, useEffect } from 'react';
import type { ScaleDetails } from '../types';
import Card from './common/Card';
import { FontSizeKey } from '../App';
import { COLORS } from '../constants';

// Import the new section components
import OverviewSection from './scaleExplorerSections/OverviewSection';
import DiagramsSection from './scaleExplorerSections/DiagramsSection';
import ResourceSection from './scaleExplorerSections/ResourceSection';
import PracticeSection from './scaleExplorerSections/PracticeSection';

interface ScaleExplorerProps {
    isLoading: boolean;
    scaleDetails: ScaleDetails | null;
    fontSize: FontSizeKey;
}

const LoadingState = () => (
    <Card>
        <div className="flex flex-col items-center justify-center p-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-400"></div>
            <p className="mt-4 text-lg font-semibold" style={{ color: COLORS.textPrimary }}>Generating your materials... this may take a moment.</p>
        </div>
    </Card>
);

const WelcomeState = () => (
    <Card>
        <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-100 mb-4 text-center">Welcome to the Scale Explorer!</h2>
            <p className="text-lg max-w-3xl mx-auto mb-6 text-center" style={{ color: COLORS.textSecondary }}>Select a root note and a scale from the controls above, then click "Generate Materials" to get a comprehensive, AI-powered breakdown for your 7-string guitar.</p>
        </div>
    </Card>
);

const ScaleExplorer: React.FC<ScaleExplorerProps> = ({ isLoading, scaleDetails, fontSize }) => {
    const [isContentLoaded, setIsContentLoaded] = useState(false);

    useEffect(() => {
        if (scaleDetails) {
            // Use a short delay to allow for a fade-in animation
            const timer = setTimeout(() => setIsContentLoaded(true), 100);
            return () => clearTimeout(timer);
        } else {
            setIsContentLoaded(false);
        }
    }, [scaleDetails]);

    if (isLoading) {
        return <LoadingState />;
    }

    if (!scaleDetails) {
        return <WelcomeState />;
    }

    return (
        <div className={`space-y-12 transition-opacity duration-700 ease-in-out ${isContentLoaded ? 'opacity-100' : 'opacity-0'}`}>
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
    );
};

export default ScaleExplorer;
