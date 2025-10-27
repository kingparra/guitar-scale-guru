import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import ChordDiagram from './ChordDiagram';
import type { DisplayableChord } from '../types';

const mockChord: DisplayableChord = {
    name: 'Am7',
    degree: 'i',
    diagramData: {
        frets: [5, 5, 5, 5, 5, 5, 5],
        fingers: [1, 1, 1, 1, 1, 1, 1],
        baseFret: 5,
        barres: [{ fromString: 0, toString: 6, fret: 5 }],
    },
};

describe('ChordDiagram', () => {
    it('renders the title correctly', () => {
        render(<ChordDiagram chord={mockChord} />);
        expect(screen.getByText('Am7')).toBeInTheDocument();
    });

    it('renders without crashing with minimal data', () => {
        const minimalChord: DisplayableChord = {
            name: 'C',
            degree: 'I',
            diagramData: {
                frets: ['x', 3, 2, 0, 1, 0, 'x'],
                fingers: ['', 3, 2, 0, 1, 0, ''],
                baseFret: 1,
                barres: [],
            },
        };
        render(<ChordDiagram chord={minimalChord} />);
        expect(screen.getByText('C')).toBeInTheDocument();
    });
});
