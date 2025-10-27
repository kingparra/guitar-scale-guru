import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    fullHeight?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    fullHeight = false,
}) => (
    <div
        className={`p-[2px] bg-gradient-to-br from-cyan-400/80 to-fuchsia-500/80 rounded-2xl shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300 ${className}`}
    >
        <div
            className={`bg-[#171528]/80 backdrop-blur-lg p-6 rounded-[14px] ${
                fullHeight ? 'h-full' : ''
            }`}
        >
            {children}
        </div>
    </div>
);

export default Card;