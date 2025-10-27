import React from 'react';
import Card from './Card';

interface SectionPlaceholderProps {
    title: string;
}

const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({ title }) => (
    <Card>
        <h2 className="text-3xl font-bold mb-6 border-l-4 border-purple-400/50 pl-4 text-gray-500">
            {title}
        </h2>
        <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-700/50 rounded w-full"></div>
            <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700/50 rounded w-full"></div>
        </div>
    </Card>
);

export default SectionPlaceholder;