import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import KeyChordsSection from './KeyChordsSection';
import type { ScaleDetails, FontSizeKey, ChordProgression } from '../../types';

// Mock the new child components
jest.mock('./DiatonicChordsDisplay', () => {
    return jest.fn(() => <div>Mocked DiatonicChordsDisplay</div>);
});
jest.mock('./ChordProgressionCard', () => {
    return jest.fn(({ progression }: { progression: ChordProgression }) => (
        <div>Mocked ChordProgressionCard: {progression.name}</div>
    ));
});

const mockKeyChords: NonNullable<ScaleDetails['keyChords']> = {
    diatonicQualities: 'i-ii°-III',
    progressions: [
        {
            name: 'Progression 1',
            analysis: 'i - III',
            harmonicFunctionAnalysis: 'Analysis 1',
            // FIX: Added 'voicings' property to satisfy the Chord type.
            chords: [{ name: 'Am', degree: 'i', voicings: [] }],
        },
        {
            name: 'Progression 2',
            analysis: 'ii° - i',
            harmonicFunctionAnalysis: 'Analysis 2',
            // FIX: Added 'voicings' property to satisfy the Chord type.
            chords: [{ name: 'Bdim', degree: 'ii°', voicings: [] }],
        },
    ],
};

const MockedDiatonicChordsDisplay = jest.requireMock(
    './DiatonicChordsDisplay'
) as jest.Mock;
const MockedChordProgressionCard = jest.requireMock(
    './ChordProgressionCard'
) as jest.Mock;

describe('KeyChordsSection', () => {
    const defaultFontSize: FontSizeKey = 'M';

    beforeEach(() => {
        MockedDiatonicChordsDisplay.mockClear();
        MockedChordProgressionCard.mockClear();
    });

    it('renders the DiatonicChordsDisplay and ChordProgressionCard components', () => {
        render(
            <KeyChordsSection
                keyChords={mockKeyChords}
                fontSize={defaultFontSize}
            />
        );

        expect(
            screen.getByText('Mocked DiatonicChordsDisplay')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Mocked ChordProgressionCard: Progression 1')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Mocked ChordProgressionCard: Progression 2')
        ).toBeInTheDocument();

        expect(MockedDiatonicChordsDisplay).toHaveBeenCalledTimes(1);
        expect(MockedChordProgressionCard).toHaveBeenCalledTimes(2);
    });

    it('passes the correct props to child components', () => {
        render(
            <KeyChordsSection
                keyChords={mockKeyChords}
                fontSize={defaultFontSize}
            />
        );

        // Check props for DiatonicChordsDisplay
        expect(MockedDiatonicChordsDisplay).toHaveBeenCalledWith(
            expect.objectContaining({
                diatonicQualities: mockKeyChords.diatonicQualities,
            }),
            {}
        );

        // Check props for ChordProgressionCard
        expect(MockedChordProgressionCard).toHaveBeenCalledWith(
            expect.objectContaining({
                progression: mockKeyChords.progressions[0],
            }),
            {}
        );
        expect(MockedChordProgressionCard).toHaveBeenCalledWith(
            expect.objectContaining({
                progression: mockKeyChords.progressions[1],
            }),
            {}
        );
    });
});