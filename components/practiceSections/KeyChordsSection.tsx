import React from 'react';
import type { ScaleDetails, FontSizeKey } from '../../types';
import DiatonicChordsDisplay from './DiatonicChordsDisplay';
import ChordProgressionCard from './ChordProgressionCard';

interface KeyChordsSectionProps {
    keyChords: NonNullable<ScaleDetails['keyChords']>;
    fontSize: FontSizeKey; // Keep fontSize prop in case it's needed in the future
}

const KeyChordsSection: React.FC<KeyChordsSectionProps> = ({ keyChords }) => {
    return (
        <div className="space-y-8">
            <DiatonicChordsDisplay
                diatonicQualities={keyChords.diatonicQualities}
            />

            {keyChords.progressions.map((p, index) => (
                <ChordProgressionCard
                    key={`${p.name}-${index}`}
                    progression={p}
                />
            ))}
        </div>
    );
};

export default KeyChordsSection;