import React from 'react';
import { render, screen } from '@testing-library/react';
// Fix: Import Jest globals to resolve errors about missing test functions.
import { describe, it, expect } from '@jest/globals';
// Fix: Import '@testing-library/jest-dom' to provide custom matchers and fix type resolution error.
import '@testing-library/jest-dom';
import FretboardDiagram from './FretboardDiagram';
import type { ScaleDetails, FretboardDiagramProps } from '../types';

// Mock data for testing
const mockDiagramData: ScaleDetails['diagramData'] = {
    tonicChordDegrees: ['R', 'b3', '5'],
    characteristicDegrees: ['b2', '6'],
    notesOnFretboard: [
        { string: 4, fret: 5, noteName: 'D', degree: 'R' },
        { string: 4, fret: 7, noteName: 'E', degree: 'b2' },
        { string: 3, fret: 5, noteName: 'G', degree: 'b3' },
    ],
    fingering: { pos1: [], pos2: [], pos3: [] },
    diagonalRun: [
        { string: 6, fret: 1, noteName: 'C', degree: 'b6', finger: '1' },
        { string: 5, fret: 3, noteName: 'C', degree: 'R', finger: '1' },
        { string: 4, fret: 5, noteName: 'D', degree: 'b2', finger: '3' },
    ]
};

// Fix: Pass the correct data type (DiagramData) to the scaleData prop.
const defaultProps: FretboardDiagramProps = {
    title: 'Test Diagram',
    scaleData: mockDiagramData,
    fretRange: [0, 5],
    fontScale: 1.0
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
        render(<FretboardDiagram {...defaultProps} fretRange={[6, 10]} />);
        expect(screen.queryByText('D')).not.toBeInTheDocument();
        expect(screen.queryByText('E')).not.toBeInTheDocument();
        expect(screen.queryByText('G')).not.toBeInTheDocument();
    });

    describe('Diagonal Run Visualization', () => {
        const runProps: FretboardDiagramProps = {
            ...defaultProps,
            title: 'Diagonal Run Test',
            diagonalRun: mockDiagramData.diagonalRun,
            fretRange: [0, 24]
        };

        it('renders sequence numbers for each note in the run', () => {
            render(<FretboardDiagram {...runProps} />);
            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
        });

        it('does NOT render path lines or arrowheads', () => {
            const { container } = render(<FretboardDiagram {...runProps} />);
            // The path line group was removed entirely in the refactor
            const pathLines = container.querySelector('.path-lines');
            expect(pathLines).toBeNull();
            // The arrowhead definition was removed
            const arrowhead = container.querySelector('#arrowhead');
            expect(arrowhead).toBeNull();
        });
    });
});