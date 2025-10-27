import React from 'react';
import Card from '../common/Card';
import type { ScaleDetails } from '../../types';

interface ModeSpotlightSectionProps {
    modeSpotlight: NonNullable<ScaleDetails['modeSpotlight']>;
}

const ModeSpotlightSection: React.FC<ModeSpotlightSectionProps> = ({
    modeSpotlight,
}) => {
    return (
        <Card>
            <h3 className="text-2xl font-bold mb-4 text-purple-400">
                🌍 Beyond the Scale
            </h3>
            <p className="font-semibold text-lg">{modeSpotlight.name}</p>
            <p className="my-2">{modeSpotlight.explanation}</p>
            <p>{modeSpotlight.soundAndApplication}</p>
        </Card>
    );
};

export default ModeSpotlightSection;