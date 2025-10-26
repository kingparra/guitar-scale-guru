import React from 'react';

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => (
    <h2 className="text-3xl font-bold mb-6 flex items-center gap-4 text-gray-100">
        {icon}
        <span>{title}</span>
    </h2>
);

export default SectionHeader;
