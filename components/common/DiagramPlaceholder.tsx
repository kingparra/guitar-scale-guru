import React from 'react';
import DiagramWrapper from './DiagramWrapper';
import DegreePill from './DegreePill';
import { InfoIcon } from './Icons';
import { COLORS } from '../../constants';

interface DiagramPlaceholderProps {
    chordName: string;
    degree: string;
}

const DiagramPlaceholder: React.FC<DiagramPlaceholderProps> = ({
    chordName,
    degree,
}) => (
    <DiagramWrapper title={chordName}>
        <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-4">
            <div className="mb-4">
                <DegreePill degree={degree} />
            </div>
            <div className="w-12 h-12 text-purple-400/40 mb-2">
                <InfoIcon />
            </div>
            <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                Diagram Not Available
            </p>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                This is likely a non-diatonic or complex chord voicing.
            </p>
        </div>
    </DiagramWrapper>
);

export default DiagramPlaceholder;
