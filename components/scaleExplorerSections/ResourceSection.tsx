import React, { useMemo } from 'react';
import Card from '../common/Card';
import {
    SpotifyIcon,
    YouTubeIcon,
    LightbulbIcon,
    JamIcon,
} from '../common/Icons';
import { COLORS } from '../../constants';
import type { ScaleDetails, DisplayResource } from '../../types';

interface ResourceSectionProps {
    scaleDetails: ScaleDetails;
}

const getIconForType = (type: DisplayResource['type']) => {
    switch (type) {
        case 'spotify':
            return <SpotifyIcon />;
        case 'youtube':
            return <YouTubeIcon />;
        case 'creative':
            return <LightbulbIcon />;
        case 'jam':
            return <JamIcon />;
        default:
            return null;
    }
};

const ResourceList: React.FC<{
    items: DisplayResource[];
}> = ({ items }) => (
    <div className="space-y-3">
        {items.map((item) => (
            <a
                key={`${item.type}-${item.title}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 bg-[#0D0B1A]/50 rounded-md hover:bg-[#0D0B1A]/90 transition-colors group"
            >
                {getIconForType(item.type)}
                <div>
                    <p className="font-semibold text-lg text-gray-200 group-hover:text-white transition-colors">
                        {item.title}
                    </p>
                    <p style={{ color: COLORS.textSecondary }}>
                        by {item.creator}
                    </p>
                </div>
            </a>
        ))}
    </div>
);

const ResourceSection: React.FC<ResourceSectionProps> = React.memo(
    ({ scaleDetails }) => {
        // Refactored to use a single, consolidated mapping logic
        const resourcesByType = useMemo(() => {
            const allResources: Record<string, DisplayResource[]> = {
                spotify: [],
                youtube: [],
                creative: [],
                jam: [],
            };

            scaleDetails.listeningGuide?.forEach((s) =>
                allResources.spotify.push({
                    title: s.title,
                    creator: s.artist,
                    link: s.spotifyLink,
                    type: 'spotify',
                })
            );

            scaleDetails.youtubeTutorials?.forEach((t) =>
                allResources.youtube.push({
                    title: t.title,
                    creator: t.creator,
                    link: t.youtubeLink,
                    type: 'youtube',
                })
            );

            scaleDetails.creativeApplication?.forEach((v) =>
                allResources.creative.push({
                    title: v.title,
                    creator: v.creator,
                    link: v.youtubeLink,
                    type: 'creative',
                })
            );

            scaleDetails.jamTracks?.forEach((t) =>
                allResources.jam.push({
                    title: t.title,
                    creator: t.creator,
                    link: t.youtubeLink,
                    type: 'jam',
                })
            );

            return allResources;
        }, [
            scaleDetails.listeningGuide,
            scaleDetails.youtubeTutorials,
            scaleDetails.creativeApplication,
            scaleDetails.jamTracks,
        ]);

        const {
            spotify: songs,
            youtube: tutorials,
            creative,
            jam: jams,
        } = resourcesByType;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {songs.length > 0 && (
                    <Card fullHeight>
                        <ResourceList items={songs} />
                    </Card>
                )}
                {tutorials.length > 0 && (
                    <Card fullHeight>
                        <ResourceList items={tutorials} />
                    </Card>
                )}
                {creative.length > 0 && (
                    <Card fullHeight>
                        <ResourceList items={creative} />
                    </Card>
                )}
                {jams.length > 0 && (
                    <Card fullHeight>
                        <ResourceList items={jams} />
                    </Card>
                )}
            </div>
        );
    }
);

export default ResourceSection;
