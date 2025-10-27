import React from 'react';
import SectionPlaceholder from './common/SectionPlaceholder';
import DiagramPlaceholder from './common/DiagramPlaceholder';

const ScaleExplorerSkeleton: React.FC = () => (
    <div className="space-y-12">
        <SectionPlaceholder title="Overview" />

        <section>
            <h2 className="text-3xl font-bold mb-4 border-l-4 border-purple-400/50 pl-4 text-gray-500">
                Diagrams
            </h2>
            <div className="animate-pulse">
                <div className="p-4 rounded-lg bg-black/20 border border-purple-400/20 mb-8">
                    <div className="h-6 bg-gray-700/50 rounded w-1/3 mx-auto mb-3"></div>
                    <div className="flex justify-around">
                        <div className="h-10 bg-gray-700/50 rounded w-1/5"></div>
                        <div className="h-10 bg-gray-700/50 rounded w-1/5"></div>
                        <div className="h-10 bg-gray-700/50 rounded w-1/5"></div>
                        <div className="h-10 bg-gray-700/50 rounded w-1/5"></div>
                    </div>
                </div>
            </div>
            <DiagramPlaceholder />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <DiagramPlaceholder isPosition />
                <DiagramPlaceholder isPosition />
                <DiagramPlaceholder isPosition />
            </div>
        </section>

        <SectionPlaceholder title="Resources" />
        <SectionPlaceholder title="Practice Materials" />
    </div>
);

export default ScaleExplorerSkeleton;