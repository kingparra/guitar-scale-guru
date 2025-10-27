import React from 'react';
import { COLORS } from '../../constants';

interface DiagramWrapperProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const DiagramWrapper: React.FC<DiagramWrapperProps> = ({
    title,
    children,
    className = '',
}) => (
    <div
        className={`p-[2px] bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-2xl shadow-lg my-4 hover:shadow-cyan-500/20 transition-shadow duration-300 ${className}`}
    >
        <div className="bg-[#171528] p-4 rounded-[14px] overflow-hidden">
            <h3
                className="text-xl font-bold text-center mb-4"
                style={{ color: COLORS.textHeader }}
            >
                {title}
            </h3>
            {children}
        </div>
    </div>
);

export default DiagramWrapper;