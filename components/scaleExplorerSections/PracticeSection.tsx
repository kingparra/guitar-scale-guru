import React from 'react';

interface PracticeSectionProps {
    children: React.ReactNode;
}

const PracticeSection: React.FC<PracticeSectionProps> = ({ children }) => {
    return <div className="space-y-8">{children}</div>;
};

export default PracticeSection;