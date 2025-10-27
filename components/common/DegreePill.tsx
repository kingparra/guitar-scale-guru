import React from 'react';
import { DEGREE_COLORS } from '../../constants';

interface DegreePillProps {
    degree: string;
}

const parseDegree = (
    degree: string
): { numeral: string; quality: string } => {
    let numeral = degree;
    let quality = 'default';

    if (degree.includes('°') || degree.includes('dim')) {
        quality = 'diminished';
    } else if (degree.includes('+') || degree.includes('aug')) {
        quality = 'augmented';
    } else if (degree.toLowerCase() === degree) {
        quality = 'minor';
    } else if (degree.toUpperCase() === degree) {
        quality = 'major';
    }

    // A simple check for dominant chords, often just 'V' or 'VII' but can be specified.
    if (degree.match(/V|VII/)) {
        // This is a simple heuristic; a more complex one might check for a b7 in the chord.
        // For display, we'll assume a plain V is dominant for color-coding.
        quality = 'dominant';
    }

    // If it's major and not dominant, re-classify
    if (quality === 'dominant' && !degree.match(/V|VII/)) {
        quality = 'major';
    }

    return { numeral, quality };
};

const DegreePill: React.FC<DegreePillProps> = ({ degree }) => {
    if (!degree) return null;

    const { numeral, quality } = parseDegree(degree);
    const colorClass = DEGREE_COLORS[quality] || DEGREE_COLORS.default;

    return (
        <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-bold shadow-sm ${colorClass}`}
        >
            {numeral}
        </span>
    );
};

export default DegreePill;