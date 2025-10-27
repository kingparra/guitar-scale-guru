import React from 'react';
import Card from './Card';
import SectionHeader from './SectionHeader';

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => {
    return (
        <Card>
            <SectionHeader title={title} icon={icon} />
            {children}
        </Card>
    );
};

export default Section;
