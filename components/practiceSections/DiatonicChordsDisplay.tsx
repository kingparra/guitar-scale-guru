import React from 'react';
import Card from '../common/Card';
import DegreePill from '../common/DegreePill';
import { COLORS } from '../../constants';
import SectionHeader from '../common/SectionHeader';
import { SparklesIcon } from '../common/Icons';

interface DiatonicChordsDisplayProps {
    diatonicQualities: string;
}

const DiatonicChordsDisplay: React.FC<DiatonicChordsDisplayProps> = ({
    diatonicQualities,
}) => {
    return (
        <Card>
            <SectionHeader
                title="Diatonic Chord Reference"
                icon={<SparklesIcon />}
            />
            <strong className="text-cyan-400">
                What Are Diatonic Chords?
            </strong>
            <p
                className="text-sm mt-1 mb-3"
                style={{ color: COLORS.textSecondary }}
            >
                These are the natural chords that can be built using only the
                notes of the scale. Each degree of the scale has a
                corresponding chord with a specific quality (major, minor,
                etc.).
            </p>
            <div className="flex flex-wrap gap-2">
                {diatonicQualities.split('-').map((d) => (
                    <DegreePill key={d} degree={d} />
                ))}
            </div>
        </Card>
    );
};

export default DiatonicChordsDisplay;