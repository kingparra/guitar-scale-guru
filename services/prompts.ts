
import { SCALE_FORMULAS } from '../constants';

const validScales = Object.keys(SCALE_FORMULAS).join(', ');

export const notationAnalysisPrompt = `
You are an expert music theorist specializing in Optical Music Recognition (OMR).
Your task is to analyze the provided image of musical notation and suggest appropriate guitar scales.

**CRITICAL CONSTRAINT:** You MUST choose from the following list of supported scales for your suggestions: ${validScales}.

**Analysis Steps:**
1.  Examine the key signature, accidentals, chord markings, and common melodic/harmonic patterns in the notation.
2.  Determine the primary musical key and mode.
3.  Suggest multiple scales from the provided list only:
    -   **Primary Match:** The single scale from the list that is the most direct and theoretically sound fit.
    -   **Creative Alternatives:** 1-2 other scales from the list that would also work but provide a different mood or flavor.
4.  For each suggestion, provide a detailed musical justification explaining *why* it's a good choice based on the visual evidence.

**Output:**
Return a single, valid JSON array that strictly adheres to the provided schema. The array should contain 2-3 scale suggestion objects. Do not include any introductory text, backticks, or markdown.
`;

const commonPromptHeader = (rootNote: string, scaleName: string) => `
### **Master Prompt for Generating Guitar Scale Materials (Version 14.0 - Per-Card Loading)**

**Request:** Generate a specific section of learning materials for the **${rootNote} ${scaleName}** scale on a seven-string guitar (tuned B E A D G B E, low to high).

**Output Format:** You MUST return a single, valid JSON object that strictly adheres to the provided schema for the requested section. Ensure all string values are properly escaped and that all URLs are functional.

---

#### **1. Core Mission & Purpose**
Your primary goal is to deliver musically useful, instantly readable guitar scale materials for a seven-string guitar. The content should be targeted at an intermediate to advanced player who wants both deep theoretical understanding and practical, challenging application material.

**IMPORTANT CONTEXT:** The client application is now responsible for algorithmically generating ALL diagram data (scale notes, note positions, fingerings, runs, metadata), ALL harmonization exercises, and ALL chord diagrams. Your role is to provide the textual, creative, and theoretical content that the client cannot generate itself.

---
#### **2. Structured Tablature (\`StructuredTab\`) Format**
All linear tablature (for licks, etudes) MUST be provided in the following structured JSON format:
\`\`\`json
{ "columns": [ [ { "string": 5, "fret": "5" } ], [ { "string": 0, "fret": "|" }, ... ] ] }
\`\`\`
*   **columns**: An array of columns, each representing a moment in time.
*   **Column**: An array of \`TabNote\` objects played simultaneously.
*   **Bar Lines**: Represent a bar line with a column where ALL 7 strings have a \`TabNote\` with \`fret: "|" \`.
`;

export const getOverviewPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Overview ONLY**
Generate the JSON content for the 'overview' section. This is a text-only section.
`;

// --- NEW DECOMPOSED PROMPTS ---

export const getListeningGuidePrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Listening Guide ONLY**
Generate the 'listeningGuide' array. Select 2-4 "deeper cuts" or tracks from technical genres. Avoid over-cited examples. Provide valid **search URLs**.
`;

export const getYoutubeTutorialsPrompt = (
    rootNote: string,
    scaleName: string
) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: YouTube Tutorials ONLY**
Generate the 'youtubeTutorials' array. Provide 2-4 links to high-quality lessons.
`;

export const getCreativeApplicationPrompt = (
    rootNote: string,
    scaleName: string
) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Creative Application ONLY**
Generate the 'creativeApplication' array. Find 2-4 videos showcasing the scale in a creative, non-tutorial context (e.g., solos, compositions).
`;

export const getJamTracksPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Jam Tracks ONLY**
Generate the 'jamTracks' array. Find 2-4 high-quality backing tracks on YouTube.
`;

export const getToneAndGearPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Tone & Gear ONLY**
Generate the 'toneAndGear' object. Provide tips for amp settings, effects, and pickups, and list famous artists who use the scale.
`;

export const getKeyChordsPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Key Chords & Progressions ONLY**
Generate the 'keyChords' object.
1.  **diatonicQualities**: Single-line reference (e.g., \`i-ii°-III+-iv-V-VI-vii°\`).
2.  **progressions**: Array of 2 ChordProgression objects. For each chord, provide its simple triad roman numeral \`degree\` (e.g., 'i', 'V', 'IV'). Do not include extensions like '7' or '9' in the degree string; the client will generate diatonic triad diagrams only. **DO NOT** provide \`diagramData\`.
`;

export const getLicksPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Licks ONLY**
Generate the 'licks' array (1-2 licks). Licks should be musically interesting and use \`StructuredTab\`.
`;

export const getAdvancedHarmonizationPrompt = (
    rootNote: string,
    scaleName: string
) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Advanced Harmonization ONLY**
Generate the 'advancedHarmonization' array (1-2 exercises).
**CRITICAL:** Provide ONLY the \`name\` and \`description\`. **DO NOT GENERATE THE \`tab\`**.
`;

export const getEtudesPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Etudes ONLY**
Generate the 'etudes' array (1-2 etudes). Etudes should be comprehensive musical pieces (at least 8 bars) using \`StructuredTab\`.
`;

export const getModeSpotlightPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Mode Spotlight ONLY**
Generate the 'modeSpotlight' object. Pick a mode of the scale and explain its sound and application.
`;
