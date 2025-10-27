import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import KeyChordsSection from './KeyChordsSection';
import type { ScaleDetails, FontSizeKey } from '../../types';

// Mock the FretboardDiagram component as it is now being reused for chords
jest.mock('../FretboardDiagram', () => {
    const MockFretboardDiagram = jest.fn(() => (
        <div>Mocked Fretboard Diagram</div>
    ));
    return MockFretboardDiagram;
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
                        // 7-string voicing
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
            ],
        },
    ],
};

// Typed mock for inspection
const MockedFretboardDiagram = jest.requireMock(
    '../FretboardDiagram'
) as jest.Mock;

describe('KeyChordsSection', () => {
    const defaultFontSize: FontSizeKey = 'M';

    beforeEach(() => {
        MockedFretboardDiagram.mockClear();
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

    it('renders the progression name and analysis', () => {
        render(
            <KeyChordsSection
                keyChords={mockKeyChords}
                fontSize={defaultFontSize}
            />
        );
        expect(
            screen.getByText('Classic Minor Progression')
        ).toBeInTheDocument();
        expect(screen.getByText('i - iv - V')).toBeInTheDocument();
    });

    it('calls the reused FretboardDiagram component with correctly transformed props', () => {
        render(
            <KeyChordsSection
                keyChords={mockKeyChords}
                fontSize={defaultFontSize}
            />
        );

        // Check that FretboardDiagram was called twice
        expect(MockedFretboardDiagram).toHaveBeenCalledTimes(2);

        // Check the props for the first chord (Am)
        const firstCallProps = MockedFretboardDiagram.mock.calls[0][0];
        expect(firstCallProps.title).toBe('Am');
        expect(firstCallProps.numStrings).toBe(7);
        // Base fret 5 means range is [5, 9]
        expect(firstCallProps.fretRange).toEqual([5, 9]);
        expect(firstCallProps.notesToRender).toEqual(
            expect.arrayContaining([
                // High B string (string 1) on fret 5
                expect.objectContaining({ string: 1, fret: 5 }),
                // Low A string (string 4) on fret 5
                expect.objectContaining({ string: 4, fret: 5 }),
            ])
        );
        expect(firstCallProps.notesToRender.length).toBe(4); // 4 non-'x' notes
    });
});
