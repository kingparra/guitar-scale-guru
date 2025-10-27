import React from 'react';
import type { ScaleDetails } from '../../types';
import { COLORS } from '../../constants';
import { renderMarkdownTable } from '../../utils/markdownUtils';

interface OverviewSectionProps {
    overview: NonNullable<ScaleDetails['overview']>;
    degreeExplanation: string;
}

const OverviewSection: React.FC<OverviewSectionProps> = React.memo(
    ({ overview, degreeExplanation }) => (
        <>
            <h3
                className="text-2xl font-bold mb-4"
                style={{ color: COLORS.textHeader }}
            >
                {overview.title}
            </h3>
            <div
                className="space-y-4 leading-relaxed"
                style={{ color: COLORS.textPrimary }}
            >
                <p>
                    <strong style={{ color: COLORS.accentGold }}>
                        Character:
                    </strong>{' '}
                    {overview.character}
                </p>
                <p>
                    <strong style={{ color: COLORS.accentGold }}>
                        Theory:
                    </strong>{' '}
                    {overview.theory}
                </p>
                <p>
                    <strong style={{ color: COLORS.accentGold }}>
                        Common Usage:
                    </strong>{' '}
                    {overview.usage}
                </p>
                <div>
                    <strong style={{ color: COLORS.accentGold }}>
                        Scale Degrees:
                    </strong>
                    {renderMarkdownTable(degreeExplanation)}
                </div>
            </div>
        </>
    )
);

export default OverviewSection;