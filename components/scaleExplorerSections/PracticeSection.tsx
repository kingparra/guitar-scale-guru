import React from 'react';
import type { ScaleDetails, FontSizeKey, PracticeMaterial } from '../../types';
import TabbedPracticeItem from '../practiceSections/TabbedPracticeItem';
import KeyChordsSection from '../practiceSections/KeyChordsSection';
import ToneAndGearSection from '../practiceSections/ToneAndGearSection';
import ModeSpotlightSection from '../practiceSections/ModeSpotlightSection';
import Card from '../common/Card';

interface PracticeSectionProps {
    scaleDetails: ScaleDetails;
    fontSize: FontSizeKey;
}

const PracticeSection: React.FC<PracticeSectionProps> = React.memo(
    ({ scaleDetails, fontSize }) => {
        const {
            keyChords,
            licks,
            advancedHarmonization,
            etudes,
            modeSpotlight,
            toneAndGear,
        } = scaleDetails;

        const allTabbedMaterials: PracticeMaterial[] = [
            ...(licks || []),
            ...(advancedHarmonization || []),
            ...(etudes || []),
        ];

        return (
            <div className="space-y-8">
                {toneAndGear && <ToneAndGearSection toneAndGear={toneAndGear} />}
                {keyChords && (
                    <KeyChordsSection
                        keyChords={keyChords}
                        fontSize={fontSize}
                    />
                )}

                {allTabbedMaterials.length > 0 && (
                    <Card>
                        <div className="space-y-6">
                            {allTabbedMaterials.map((item, index) => (
                                <TabbedPracticeItem
                                    key={`${item.name}-${index}`}
                                    item={item}
                                />
                            ))}
                        </div>
                    </Card>
                )}

                {modeSpotlight && (
                    <ModeSpotlightSection modeSpotlight={modeSpotlight} />
                )}
            </div>
        );
    }
);

export default PracticeSection;