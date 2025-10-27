import React from 'react';
import Card from '../common/Card';
import { COLORS } from '../../constants';
import type { ScaleDetails } from '../../types';
import { renderMarkdownTable } from '../../utils/markdownUtils';

interface OverviewSectionProps {
    overview: ScaleDetails['overview'];
}

const OverviewSection: React.FC<OverviewSectionProps> = React.memo(
    ({ overview }) => (
        <Card>
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
                    {renderMarkdownTable(overview.degreeExplanation)}
                </div>
            </div>
        </Card>
    )
);

export default OverviewSection;