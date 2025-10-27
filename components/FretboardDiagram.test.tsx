import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import FretboardDiagram from './FretboardDiagram';
import type {
    DiagramNote,
    FretboardDiagramProps,
    PathDiagramNote,
} from '../types';

// Mock data for testing
const mockNotes: DiagramNote[] = [
    { string: 4, fret: 5, noteName: 'D', degree: 'R' },
    { string: 4, fret: 7, noteName: 'E', degree: 'b2' },
    { string: 3, fret: 5, noteName: 'G', degree: 'b3' },
];

const mockDiagonalRun: PathDiagramNote[] = [
    { string: 6, fret: 1, noteName: 'C', degree: 'b6', finger: '1' },
    { string: 5, fret: 3, noteName: 'C', degree: 'R', finger: '1' },
    { string: 4, fret: 5, noteName: 'D', degree: 'b2', finger: '3' },
];

const defaultProps: FretboardDiagramProps = {
    title: 'Test Diagram',
    notesToRender: mockNotes,
    tonicChordDegrees: ['R', 'b3', '5'],
    characteristicDegrees: ['b2', '6'],
    fretRange: [0, 8],
    fontScale: 1.0,
};

describe('FretboardDiagram', () => {
    it('renders the title correctly', () => {
        render(<FretboardDiagram {...defaultProps} />);
        expect(screen.getByText('Test Diagram')).toBeInTheDocument();
    });

    it('renders note names on the fretboard', () => {
        render(<FretboardDiagram {...defaultProps} />);
        expect(screen.getByText('D')).toBeInTheDocument();
        expect(screen.getByText('E')).toBeInTheDocument();
        expect(screen.getByText('G')).toBeInTheDocument();
    });

    it('does not render notes outside of the specified fret range', () => {
        // Create a note that is outside the default fretRange
        const allNotes = [
            ...mockNotes,
            { string: 0, fret: 10, noteName: 'Z', degree: 'X' },
        ];
        render(<FretboardDiagram {...defaultProps} notesToRender={allNotes} />);

        expect(screen.getByText('D')).toBeInTheDocument(); // Inside range
        expect(screen.queryByText('Z')).not.toBeInTheDocument(); // Outside range
    });

    describe('Diagonal Run Visualization', () => {
        const runProps: FretboardDiagramProps = {
            ...defaultProps,
            notesToRender: mockDiagonalRun, // for simplicity, only render run notes
            title: 'Diagonal Run Test',
            diagonalRun: mockDiagonalRun,
            fretRange: [0, 24],
        };

        it('renders sequence numbers for each note in the run', () => {
            render(<FretboardDiagram {...runProps} />);
            // The note names C, D are replaced by sequence numbers 1, 2, 3
            expect(screen.queryByText('C')).not.toBeInTheDocument();
            expect(screen.queryByText('D')).not.toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
        });
    });
});