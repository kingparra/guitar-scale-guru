import React from 'react';
import Card from './Card';
import SectionHeader from './SectionHeader';
import {
    SpotifyIcon,
    YouTubeIcon,
    LightbulbIcon,
    JamIcon,
} from './Icons';

const PlaceholderCard: React.FC<{ icon: React.ReactNode; title: string }> = ({
    icon,
    title,
}) => (
    <Card fullHeight>
        <SectionHeader title={title} icon={icon} />
        <div className="space-y-3 animate-pulse">
            <div className="p-3 bg-[#0D0B1A]/50 rounded-md">
                <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
            </div>
            <div className="p-3 bg-[#0D0B1A]/50 rounded-md">
                <div className="h-5 bg-gray-700/50 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
            </div>
        </div>
    </Card>
);

const ResourceSectionPlaceholder: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PlaceholderCard icon={<SpotifyIcon />} title="Listening Guide" />
        <PlaceholderCard icon={<YouTubeIcon />} title="YouTube Tutorials" />
        <PlaceholderCard
            icon={<LightbulbIcon />}
            title="Creative Application"
        />
        <PlaceholderCard icon={<JamIcon />} title="Jam Tracks" />
    </div>
);

export default ResourceSectionPlaceholder;