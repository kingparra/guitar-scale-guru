
export const TUNING = ['E', 'B', 'G', 'D', 'A', 'E', 'B']; // High to low
export const NUM_STRINGS = 7;
export const NUM_FRETS = 24; // Standard 24-fret guitar has frets 0-24.

export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

export const ALL_NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
export const NOTE_MAP = ALL_NOTES.reduce((acc, note, i) => ({ ...acc, [note]: i }), {} as Record<string, number>);

export const COLORS = {
    // Backgrounds & Base
    bgPrimary: '#0D0B1A', // Deep indigo
    bgCard: 'rgba(23, 21, 40, 0.6)',
    bgInput: 'rgba(23, 21, 40, 0.8)',

    // Text
    textPrimary: '#E0E0E0', // Soft white
    textSecondary: '#A0A0C0', // Muted lavender grey
    textHeader: '#FFFFFF',

    // Accents & Gradients
    accentGold: '#FFD700',
    accentCyan: '#00FFFF',
    accentMagenta: '#FF00FF',
    borderGradientStart: '#FF00FF',
    borderGradientEnd: '#00FFFF',

    // Fretboard Specific
    grid: '#403D58', // Muted purple-grey
    root: '#FFD700', // Gold for roots
    tone: '#00FFFF', // Cyan for other tones
    openString: '#FFC857', // Amber for open strings
    characteristicOutline: '#FF00FF', // Magenta outline
    resolutionArrow: '#9370DB',
};