import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import KeyChordsSection from './KeyChordsSection';
import type { ScaleDetails, FontSizeKey } from '../../types';

// Mock the new ChordDiagram component
jest.mock('../ChordDiagram', () => {
    const MockChordDiagram = jest.fn(({ chord }) => (
        <div>Mocked ChordDiagram: {chord.name}</div>
    ));
    return MockChordDiagram;
});

// Mock the new DiagramPlaceholder component
jest.mock('../common/DiagramPlaceholder', () => {
    const MockDiagramPlaceholder = jest.fn(({ chordName }) => (
        <div>Mocked Placeholder: {chordName}</div>
    ));
    return MockDiagramPlaceholder;
});

const mockKeyChords: NonNullable<ScaleDetails['keyChords']> = {
    diatonicQualities: 'i-ii°-III+-iv-V-VI-vii°',
    progressions: [
        {
            name: 'Classic Minor Progression',
            analysis: 'i - iv - V',
            harmonicFunctionAnalysis: 'Tonic to Subdominant to Dominant.',
            chords: [
                {
                    name: 'Am',
                    degree: 'i',
                    diagramData: {
                        frets: ['x', 'x', '7', '5', '5', '5', 'x'],
                        fingers: ['', '', '3', '1', '1', '1', ''],
                        baseFret: 5,
                        barres: [{ fromString: 3, toString: 5, fret: 5 }],
                    },
                },
                {
                    name: 'Dm',
                    degree: 'iv',
                    diagramData: {
                        frets: ['x', '5', '7', '7', '6', '5', 'x'],
                        fingers: ['', '1', '3', '4', '2', '1', ''],
                        baseFret: 5,
                        barres: [{ fromString: 1, toString: 5, fret: 5 }],
                    },
                },
                {
                    name: 'E',
                    degree: 'V',
                    // This chord intentionally lacks diagramData to test filtering
                },
            ],
        },
    ],
};

// Typed mock for inspection
const MockedChordDiagram = jest.requireMock('../ChordDiagram') as jest.Mock;
const MockedDiagramPlaceholder = jest.requireMock(
    '../common/DiagramPlaceholder'
) as jest.Mock;

describe('KeyChordsSection', () => {
    const defaultFontSize: FontSizeKey = 'M';

    beforeEach(() => {
        MockedChordDiagram.mockClear();
        MockedDiagramPlaceholder.mockClear();
    });

    it('renders the main title and diatonic qualities', () => {
        render(
            <KeyChordsSection
                keyChords={mockKeyChords}
                fontSize={defaultFontSize}
            />
        );
        expect(
            screen.getByText('Key Chords & Progressions')
        ).toBeInTheDocument();
        expect(screen.getByText('i')).toBeInTheDocument();
        expect(screen.getByText('V')).toBeInTheDocument();
    });

    it('renders ChordDiagram for valid chords and DiagramPlaceholder for chords without data', () => {
        render(
            <KeyChordsSection
                keyChords={mockKeyChords}
                fontSize={defaultFontSize}
            />
        );

        // ChordDiagram should be called for the 2 chords WITH data
        expect(MockedChordDiagram).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Mocked ChordDiagram: Am')).toBeInTheDocument();
        expect(screen.getByText('Mocked ChordDiagram: Dm')).toBeInTheDocument();

        // DiagramPlaceholder should be called for the 1 chord WITHOUT data
        expect(MockedDiagramPlaceholder).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Mocked Placeholder: E')).toBeInTheDocument();
    });

    it('calls the ChordDiagram and DiagramPlaceholder components with the correct props', () => {
        render(
            <KeyChordsSection
                keyChords={mockKeyChords}
                fontSize={defaultFontSize}
            />
        );

        // Check props for ChordDiagram
        const firstDiagramCallProps = MockedChordDiagram.mock.calls[0][0];
        expect(firstDiagramCallProps.chord.name).toBe('Am');
        expect(firstDiagramCallProps.chord.degree).toBe('i');
        expect(firstDiagramCallProps.chord.diagramData).toBeDefined();

        // Check props for DiagramPlaceholder
        const placeholderCallProps = MockedDiagramPlaceholder.mock.calls[0][0];
        expect(placeholderCallProps.chordName).toBe('E');
        expect(placeholderCallProps.degree).toBe('V');
    });
});
