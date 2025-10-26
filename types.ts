export interface Song {
  title: string;
  artist: string;
  spotifyLink: string;
}

export interface Tutorial {
  title: string;
  creator: string;
  youtubeLink: string;
}

export interface CreativeVideo {
    title: string;
    creator: string;
    youtubeLink: string;
}

export interface JamTrack {
    title: string;
    creator: string;
    youtubeLink: string;
}

export interface ToneSuggestion {
    setting: string;
    description: string;
}

export interface ChordProgression {
    name: string;
    analysis: string;
    tab: string;
}

export interface Lick {
    name: string;
    description: string;
    tab: string;
    sourceUrl: string;
}

export interface HarmonizationExercise {
    name: string;
    description: string;
    tab: string;
}

export interface Etude {
    name: string;
    description: string;
    tab: string;
}

export interface ModeInfo {
    name: string;
    explanation: string;
    soundAndApplication: string;
}

export interface DiagramNote {
    string: number;
    fret: number;
    noteName: string;
    degree: string;
}

export type FingeringEntry = { key: string; finger: string; };
export type FingeringMap = FingeringEntry[];

export interface DiagramData {
    tonicChordDegrees: string[];
    characteristicDegrees: string[];
    notesOnFretboard: DiagramNote[];
    fingering: {
        pos1: FingeringMap;
        pos2: FingeringMap;
        pos3: FingeringMap;
    };
}

export interface ScaleDetails {
    overview: {
        title: string;
        character: string;
        theory: string;
        usage: string;
        degreeExplanation: string;
    };
    listeningGuide: Song[];
    youtubeTutorials: Tutorial[];
    creativeApplication: CreativeVideo[];
    jamTracks: JamTrack[];
    toneAndGear: {
        suggestions: ToneSuggestion[];
        famousArtists: string;
    };
    keyChords: {
        diatonicQualities: string;
        progressions: ChordProgression[];
    };
    licks: Lick[];
    advancedHarmonization: HarmonizationExercise[];
    etudes: Etude[];
    modeSpotlight: ModeInfo;
    diagramData: DiagramData;
}

export interface FretboardDiagramProps {
    title: string;
    scaleData: DiagramData;
    fretRange: [number, number];
    fingeringMap?: FingeringMap;
    fontScale: number;
}
