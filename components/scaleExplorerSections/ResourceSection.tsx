import React from 'react';

interface ResourceSectionProps {
    children: React.ReactNode;
}

const ResourceSection: React.FC<ResourceSectionProps> = ({ children }) => {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{children}</div>;
};

export default ResourceSection;