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
    fret: string; // e.g., '5', '12', '5h7', '12b14', 'x', '|'
}

export type TabColumn = TabNote[];

export interface StructuredTab {
    columns: TabColumn[];
}

// New types for visual chord diagrams
export interface ChordDiagramData {
    frets: (number | string)[]; // Array of 6 numbers (frets) or 'x' (muted) or 0 (open), from low E to high E
    fingers: (number | string)[]; // Array of 6 numbers (fingers) or 0/''
    baseFret: number; // The fret number to display at the top of the diagram
    barres: { fromString: number; toString: number; fret: number }[];
}

export interface Chord {
    name: string;
    diagramData?: ChordDiagramData; // Optional: will be generated client-side
    degree: string; // Mandatory for lookup and display
}

export interface ChordProgression {
    name: string;
    analysis: string;
    chords: Chord[];
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
    tab?: StructuredTab; // Tab is optional as it's generated client-side
}

export interface Etude {
    name: string;
    description: string;
    tab: StructuredTab;
}

// Polymorphic base type for all tabbed practice materials
export type PracticeMaterial = Lick | HarmonizationExercise | Etude;

// Polymorphic type for unified resource list rendering
export interface DisplayResource {
    title: string;
    creator: string;
    link: string;
    type: 'spotify' | 'youtube' | 'jam' | 'creative';
}

export interface ModeInfo {
    name: string;
    explanation: string;
    soundAndApplication: string;
}

/**
 * Represents a single note on a fretboard diagram.
 */
export interface DiagramNote {
    string: number;
    fret: number;
    noteName?: string;
    degree?: string;
    finger?: string;
}

export type PathDiagramNote = DiagramNote & { finger: string };

export type FingeringEntry = { key: string; finger: string };
export type FingeringMap = FingeringEntry[];

// This now represents the 100% client-generated diagram data
export interface DiagramData {
    tonicChordDegrees: string[];
    characteristicDegrees: string[];
    notesOnFretboard: DiagramNote[];
    fingering: FingeringMap[];
    diagonalRun: PathDiagramNote[];
}

// Minimal data needed to start client-side generation
export interface ScaleNotesData {
    scaleNotes: { noteName: string; degree: string }[];
}

// Updated ScaleDetails to support progressive loading
export interface ScaleDetails {
    // Generated instantly on the client
    diagramData?: DiagramData;
    degreeExplanation?: string; // Now also generated on client
    // Fetched asynchronously from AI
    overview?: {
        title: string;
        character: string;
        theory: string;
        usage:string;
    };
    listeningGuide?: Song[];
    youtubeTutorials?: Tutorial[];
    creativeApplication?: CreativeVideo[];
    jamTracks?: JamTrack[];
    toneAndGear?: {
        suggestions: ToneSuggestion[];
        famousArtists: string;
    };
    keyChords?: {
        diatonicQualities: string;
        progressions: ChordProgression[];
    };
    licks?: Lick[];
    advancedHarmonization?: HarmonizationExercise[];
    etudes?: Etude[];
    modeSpotlight?: ModeInfo;
}

export interface FretboardDiagramProps {
    title: string;
    notesToRender: DiagramNote[];
    tonicChordDegrees: string[];
    characteristicDegrees: string[];
    fretRange: [number, number];
    diagonalRun?: PathDiagramNote[];
    barres?: ChordDiagramData['barres'];
    fontScale: number;
    numStrings?: number;
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
    sequenceNumber?: number;
    finger?: string;
}

export interface SongAnalysisResult {
    rootNote: string;
    scaleName: string;
    analysis: string;
    suitability: string;
}

export type FontSizeKey = 'S' | 'M' | 'L';