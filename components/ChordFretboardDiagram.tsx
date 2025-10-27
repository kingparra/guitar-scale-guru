import React from 'react';

/**
 * DEPRECATED: This component is no longer in use.
 * It was an adapter that incorrectly used the complex `FretboardDiagram` to render simple chord boxes,
 * leading to significant rendering bugs.
 * It has been replaced by the new, purpose-built `ChordDiagram` component.
 * This file is kept to prevent breaking imports in older states but should be removed in the future.
 */
const ChordFretboardDiagram: React.FC = () => {
    return null;
};

export default ChordFretboardDiagram;
