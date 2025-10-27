import React from 'react';
import DiagramWrapper from './DiagramWrapper';
import { COLORS } from '../../constants';

interface DiagramPlaceholderProps {
    isPosition?: boolean;
}

const DiagramPlaceholder: React.FC<DiagramPlaceholderProps> = ({
    isPosition = false,
}) => {
    const viewBox = isPosition ? '0 0 400 200' : '0 0 800 200';

    return (
        <DiagramWrapper title="">
            <div className="animate-pulse">
                <div className="h-6 bg-gray-700/50 rounded w-3/4 mx-auto mb-4"></div>
                <svg viewBox={viewBox} className="block mx-auto max-w-full">
                    <rect width="100%" height="100%" fill={COLORS.bgPrimary} />
                    {/* Pulsing strings and frets */}
                    {Array.from({ length: 7 }).map((_, i) => (
                        <rect
                            key={`str-${i}`}
                            x="0"
                            y={20 + i * 25}
                            width="100%"
                            height="1.5"
                            fill={COLORS.grid}
                            className="opacity-50"
                        />
                    ))}
                    {Array.from({ length: isPosition ? 5 : 15 }).map((_, i) => (
                        <rect
                            key={`frt-${i}`}
                            x={i * (isPosition ? 80 : 53)}
                            y="20"
                            width="2"
                            height="151.5"
                            fill={COLORS.grid}
                            className="opacity-50"
                        />
                    ))}
                </svg>
            </div>
        </DiagramWrapper>
    );
};

export default DiagramPlaceholder;