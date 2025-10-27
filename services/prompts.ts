export const notationAnalysisPrompt = `
You are an expert music theorist specializing in Optical Music Recognition (OMR).
Your task is to analyze the provided image of musical notation and suggest appropriate guitar scales.

**Analysis Steps:**
1.  Examine the key signature, accidentals, chord markings, and common melodic/harmonic patterns in the notation.
2.  Determine the primary musical key and mode.
3.  Suggest multiple scales:
    -   **Primary Match:** The single scale that is the most direct and theoretically sound fit.
    -   **Creative Alternatives:** 1-2 other scales that would also work but provide a different mood or flavor (e.g., suggesting Harmonic Minor for a piece in A minor).
4.  For each suggestion, provide a detailed musical justification explaining *why* it's a good choice based on the visual evidence.

**Output:**
Return a single, valid JSON array that strictly adheres to the provided schema. The array should contain 2-3 scale suggestion objects. Do not include any introductory text, backticks, or markdown.
`;

const commonPromptHeader = (rootNote: string, scaleName: string) => `
### **Master Prompt for Generating Guitar Scale Materials (Version 13.0 - Client-Side Chords)**

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

// This prompt is now deprecated as scale notes are generated client-side.
// It is kept here for reference but is no longer called by the application.
export const getScaleNotesPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Scale Notes ONLY**
Generate ONLY the 'scaleNotes' array for the requested scale.
`;

export const getOverviewPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Overview ONLY**
Generate the JSON content for the 'overview' section. This is a text-only section.

1.  **overview**:
    *   **DO NOT** include \`scaleNotes\`. This is generated client-side.
    *   **DO NOT** include \`degreeExplanation\`. This is generated client-side.

---
**CRITICAL INSTRUCTION:** Generate only the requested 'overview' section as a single, complete JSON object.
`;

export const getResourcesPrompt = (rootNote: string, scaleName:string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Resources**
Generate the JSON content for the 'listeningGuide', 'youtubeTutorials', 'creativeApplication', 'jamTracks', and 'toneAndGear' sections ONLY.

1.  **listeningGuide / youtubeTutorials / etc.**:
    *   Arrays of 2-4 objects each.
    *   Select "deeper cuts" or tracks from technical genres. Avoid over-cited examples.
    *   Provide valid **search URLs**.
2.  **toneAndGear**:
    *   Provide tips for amp settings, effects, and pickups.

---
**CRITICAL INSTRUCTION:** Generate only the requested resource sections as a single, complete JSON object.
`;

export const getPracticePrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Practice Materials**
Generate the JSON content for 'keyChords', 'licks', 'advancedHarmonization', 'etudes', and 'modeSpotlight'.

1.  **keyChords**:
    *   **diatonicQualities**: Single-line reference (e.g., \`i-ii°-III+-iv-V-VI-vii°\`).
    *   **progressions**: Array of 2 ChordProgression objects. For each chord in a progression, you **MUST** provide its roman numeral analysis in the \`degree\` field (e.g., "I", "V", "vi"). **DO NOT** provide \`diagramData\`.

2.  **licks:** (Array of 1-2 Lick objects)
    *   Create musically interesting licks demonstrating a key characteristic of the scale.
    *   **tab**: Must be a \`StructuredTab\` object.

3. **advancedHarmonization:** (Array of 1-2 HarmonizationExercise objects)
    *   **CRITICAL:** Generate the \`name\` and \`description\` for an exercise (e.g., "Scale in Diatonic Thirds").
    *   **DO NOT GENERATE THE \`tab\`**. The client application will generate it.

4. **etudes:** (Array of 1-2 Etude objects)
    *   Create a comprehensive musical piece (at least 8 bars long).
    *   **tab**: Must be a \`StructuredTab\` object.

---
**CRITICAL INSTRUCTION:** Generate only the requested practice sections as a single, complete JSON object.
`;