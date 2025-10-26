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

// New types for robust, structured tablature data
export interface TabNote {
    string: number; // 0 for high E, 6 for low B
    fret: string;   // e.g., '5', '12', '5h7', '12b14', 'x', '|'
}

export type TabColumn = TabNote[];

export interface StructuredTab {
    columns: TabColumn[];
}

export interface ChordProgression {
    name: string;
    analysis: string;
    tab: StructuredTab;
    harmonicFunctionAnalysis: string;
}

export interface Lick {
    name: string;
    description: string;
    tab: StructuredTab;
    sourceUrl: string;
}

export interface HarmonizationExercise {
    name: string;
    description: string;
    tab: StructuredTab;
}

export interface Etude {
    name: string;
    description: string;
    tab: StructuredTab;
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

export type PathDiagramNote = DiagramNote & { finger: string };

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
    diagonalRun: PathDiagramNote[];
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
    diagonalRun?: PathDiagramNote[];
    fontScale: number;
}

export interface FretboardNoteProps {
    note: DiagramNote;
    x: number;
    y: number;
    fontScale: number;
    isRoot: boolean;
    isTonicChordTone: boolean;
    isCharacteristic: boolean;
    isInRun?: boolean;
    runNotesLookup?: Set<string>;
    finger?: string;
    sequenceNumber?: number;
}


export interface SongAnalysisResult {
    rootNote: string;
    scaleName: string;
    analysis: string;
    suitability: string;
}