import React from 'react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';
import { SpotifyIcon, YouTubeIcon, LightbulbIcon, JamIcon } from '../common/Icons';
import { COLORS } from '../../constants';
import type { ScaleDetails } from '../../types';

interface ResourceSectionProps {
    listeningGuide: ScaleDetails['listeningGuide'];
    youtubeTutorials: ScaleDetails['youtubeTutorials'];
    creativeApplication: ScaleDetails['creativeApplication'];
    jamTracks: ScaleDetails['jamTracks'];
}

const ResourceList: React.FC<{ items: any[], iconColor: string, linkKey: string, titleKey: string, creatorKey?: string }> = ({ items, iconColor, linkKey, titleKey, creatorKey }) => (
    <div className="space-y-3">
        {items.map(item => (
            <a key={item[titleKey]} href={item[linkKey]} target="_blank" rel="noopener noreferrer" className="block p-3 bg-[#0D0B1A]/50 rounded-md hover:bg-[#0D0B1A]/90 transition-colors">
                <p className={`font-semibold text-lg`} style={{color: iconColor}}>{item[titleKey]}</p>
                {creatorKey && <p style={{ color: COLORS.textSecondary }}>{item[creatorKey]}</p>}
            </a>
        ))}
    </div>
);

const ResourceSection: React.FC<ResourceSectionProps> = ({ listeningGuide, youtubeTutorials, creativeApplication, jamTracks }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {listeningGuide?.length > 0 && (
            <Card fullHeight>
                <SectionHeader title="Listening Guide" icon={<SpotifyIcon />} />
                <ResourceList items={listeningGuide} iconColor="#1DB954" linkKey="spotifyLink" titleKey="title" creatorKey="artist" />
            </Card>
        )}
        {youtubeTutorials?.length > 0 && (
            <Card fullHeight>
                <SectionHeader title="YouTube Tutorials" icon={<YouTubeIcon />} />
                <ResourceList items={youtubeTutorials} iconColor="#FF0000" linkKey="youtubeLink" titleKey="title" creatorKey="creator" />
            </Card>
        )}
        {creativeApplication?.length > 0 && (
             <Card fullHeight>
                <SectionHeader title="Creative Application" icon={<LightbulbIcon />} />
                <ResourceList items={creativeApplication} iconColor="#FBBF24" linkKey="youtubeLink" titleKey="title" creatorKey="creator" />
            </Card>
        )}
        {jamTracks?.length > 0 && (
            <Card fullHeight>
                <SectionHeader title="Jam Tracks" icon={<JamIcon />} />
                <ResourceList items={jamTracks} iconColor="#EF4444" linkKey="youtubeLink" titleKey="title" creatorKey="creator" />
            </Card>
        )}
    </div>
);

export default ResourceSection;
