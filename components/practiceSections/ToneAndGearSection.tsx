import React from 'react';
import Card from '../common/Card';
import type { ScaleDetails } from '../../types';

interface ToneAndGearSectionProps {
    toneAndGear: NonNullable<ScaleDetails['toneAndGear']>;
}

const ToneAndGearSection: React.FC<ToneAndGearSectionProps> = ({
    toneAndGear,
}) => {
    return (
        <Card>
            <h3 className="text-2xl font-bold mb-4 text-amber-300">
                Tone & Gear Suggestions
            </h3>
            <div className="space-y-4">
                {toneAndGear.suggestions.map((s) => (
                    <div key={s.setting}>
                        <p>
                            <strong className="text-amber-400">
                                {s.setting}:
                            </strong>{' '}
                            {s.description}
                        </p>
                    </div>
                ))}
                <div>
                    <p>
                        <strong className="text-amber-400">
                            Famous Artists:
                        </strong>{' '}
                        {toneAndGear.famousArtists}
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default ToneAndGearSection;