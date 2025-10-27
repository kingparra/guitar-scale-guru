import React from 'react';
import { renderStructuredTab } from '../../utils/markdownUtils';
import { COLORS } from '../../constants';
import type { PracticeMaterial, Lick } from '../../types';

interface TabbedPracticeItemProps {
    item: PracticeMaterial;
}

// Type guard to check if the item is a Lick
const isLick = (item: PracticeMaterial): item is Lick => {
    return 'sourceUrl' in item;
};

const getTitleAndColor = (
    item: PracticeMaterial
): { title: string; color: string } => {
    if (isLick(item)) {
        return { title: '🔥 Classic Lick', color: 'text-fuchsia-400' };
    }
    if ('tab' in item) {
        return { title: '✨ Comprehensive Etude', color: 'text-sky-400' };
    }
    return {
        title: 'Advanced Harmonization',
        color: 'text-orange-400',
    };
};

const TabbedPracticeItem: React.FC<TabbedPracticeItemProps> = ({ item }) => {
    const { title, color } = getTitleAndColor(item);

    return (
        <div>
            <h3 className={`text-2xl font-bold mb-2 ${color}`}>{title}</h3>
            <div className="flex justify-between items-center">
                <div className="flex-grow">
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p
                        className="text-sm italic mb-2"
                        style={{ color: COLORS.textSecondary }}
                    >
                        {item.description}
                    </p>
                </div>
                {isLick(item) && (
                    <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 flex-shrink-0 bg-fuchsia-500/80 hover:bg-fuchsia-500 text-white font-bold py-1 px-3 rounded-md transition-colors"
                    >
                        View Source
                    </a>
                )}
            </div>
            {'tab' in item &&
                item.tab &&
                renderStructuredTab(item.tab)}
        </div>
    );
};

export default TabbedPracticeItem;