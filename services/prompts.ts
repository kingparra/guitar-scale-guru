
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
### **Master Prompt for Generating Guitar Scale Materials (Version 8.0 - Progressive Loading)**

**Request:** Generate a specific section of learning materials for the **${rootNote} ${scaleName}** scale on a seven-string guitar (tuned B E A D G B E, low to high).

**Output Format:** You MUST return a single, valid JSON object that strictly adheres to the provided schema for the requested section. Ensure all string values are properly escaped and that all URLs are functional.

---

#### **1. Core Mission & Purpose**
Your primary goal is to deliver musically useful, instantly readable guitar scale materials for a seven-string guitar. The content should be targeted at an intermediate to advanced player who wants both deep theoretical understanding and practical, challenging application material.

---
#### **2. Structured Tablature (\`StructuredTab\`) Format**
**CRITICAL:** All linear tablature (for licks, exercises, etudes) MUST be provided in the following structured JSON format. **DO NOT** generate pre-formatted text tabs.

\`\`\`json
{
  "tab": {
    "columns": [
      [ { "string": 5, "fret": "5" } ],
      [ { "string": 5, "fret": "7h8p7" } ],
      [ { "string": 0, "fret": "|" }, { "string": 1, "fret": "|" }, { "string": 2, "fret": "|" }, { "string": 3, "fret": "|" }, { "string": 4, "fret": "|" }, { "string": 5, "fret": "|" }, { "string": 6, "fret": "|" } ]
    ]
  }
}
\`\`\`
*   **columns**: An array of columns. Each column represents a moment in time.
*   **Column**: An array of \`TabNote\` objects played simultaneously.
*   **TabNote**: An object with \`"string"\` (0=high E, 6=low B) and \`"fret"\`.
*   **fret (string)**: The fret number or technique. Use standard notation: 'h', 'p', '/', '\\', 'b', 'r', '~'.
*   **Bar Lines**: Represent a bar line with a column where ALL 7 strings have a \`TabNote\` with \`fret: "|" \`.

---
#### **3. Structured Chord Diagram (\`ChordDiagramData\`) Format**
**CRITICAL:** For chord progressions, you must provide data to render a standard 6-string chord diagram for each chord. The string numbering convention for ALL fields below is 0-indexed where the **low E string is 0** and the high E string is 5.

\`\`\`json
{
  "diagramData": {
    "frets": ["x", 0, 2, 2, 1, 0],
    "fingers": ["", 0, 2, 3, 1, 0],
    "baseFret": 1,
    "barres": [
      { "fromString": 0, "toString": 5, "fret": 5 }
    ]
  }
}
\`\`\`
*   **frets**: Array of 6 values for strings EADGBe (low to high). Index 0 is low E. Use fret number, 'x' (muted), or 0 (open).
*   **fingers**: Array of 6 values for the finger used. Index 0 is low E. Use finger number or 0/"" (unfingered).
*   **baseFret**: The fret number for the diagram's top fret line (usually 1).
*   **barres**: An array of barre objects.
    *   \`fromString\`: The index of the lowest-pitched string in the barre (e.g., 0 for low E).
    *   \`toString\`: The index of the highest-pitched string in the barre (e.g., 5 for high E).
    *   The 'fret' property specifies the fret the barre is on.
    *   An empty array, [], means no barres.
`;

export const getCoreMaterialsPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Core Materials**
Generate the JSON content for the 'overview' and 'diagramData' sections ONLY.

1.  **overview**:
    *   **degreeExplanation**: A string containing a simple markdown-style table explaining each scale degree.

2.  **diagramData:**
    *   **notesOnFretboard**: CRITICAL: This array **must** include every single occurrence of every scale note on all seven strings, from the open string (fret 0) up to and including the 24th fret.
    *   **fingering**: CRITICAL: Each position (\`pos1\`, \`pos2\`, \`pos3\`) **must be confined to a playable 4-5 fret span**. These should represent standard, ergonomic "box" patterns.
    *   **diagonalRun**: A continuous, playable path from lowest to highest note, prioritizing **three-note-per-string** patterns.

---
**CRITICAL INSTRUCTION:** Generate only the requested 'overview' and 'diagramData' sections as a single, complete JSON object. Do not include any introductory text, backticks, or markdown formatting around the JSON.
`;

export const getResourcesPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Resources**
Generate the JSON content for the 'listeningGuide', 'youtubeTutorials', 'creativeApplication', 'jamTracks', and 'toneAndGear' sections ONLY.

1.  **listeningGuide / youtubeTutorials / creativeApplication / jamTracks**:
    *   Arrays of 2-4 objects each.
    *   For listening guide, select "deeper cuts" or tracks from technical genres. Avoid over-cited examples.
    *   Provide valid **search URLs**.

2.  **toneAndGear**:
    *   Provide tips for amp settings, effects, and pickups.
    *   List famous artists associated with the sound.

---
**CRITICAL INSTRUCTION:** Generate only the requested resource sections as a single, complete JSON object. Do not include any introductory text, backticks, or markdown formatting around the JSON.
`;

export const getPracticePrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### **SECTION TO GENERATE: Practice Materials**
Generate the JSON content for the 'keyChords', 'licks', 'advancedHarmonization', 'etudes', and 'modeSpotlight' sections ONLY.

1.  **keyChords**:
    *   **diatonicQualities**: Single-line reference (e.g., \`i-ii°-III+-iv-V-VI-vii°\`).
    *   **progressions**: (Array of 2 ChordProgression objects) For each progression:
        *   **chords**: An array of \`Chord\` objects. For each chord, provide its \`name\` and the \`diagramData\` in the structured format defined above.
        *   **harmonicFunctionAnalysis**: A brief explanation of the progression's harmonic function.

2.  **licks:** (Array of 1-2 Lick objects)
    *   Create musically interesting licks that **demonstrate a key characteristic of the scale**.
    *   The licks should be technically idiomatic for guitar, combining multiple techniques (e.g., a slide into a bend). They should be highly characteristic of a genre where this scale is prominent.
    *   **tab**: Must be a \`StructuredTab\` object, incorporating techniques like bends, slides, and vibrato.

3. **advancedHarmonization:** (Array of 1-2 HarmonizationExercise objects)
    *   CRITICAL: Create a comprehensive harmonization exercise. The goal is to demonstrate the sound of the scale's diatonic intervals. Generate a tab that plays the scale in **diatonic thirds** or **diatonic sixths**.
    *   **ARPEGGIATION RULE:** The tablature **MUST** represent these as arpeggiated, one note at a time, not as block chords. Each column in the StructuredTab should contain only one note, unless it's a bar line.
    *   This exercise **must be exhaustive**, methodically covering every scale degree in at least two different octaves across the fretboard.
    *   The result should be a musically useful exercise for learning the scale's harmony all over the neck.
    *   **tab**: Must be a \`StructuredTab\` object.

4. **etudes:** (Array of 1-2 Etude objects)
    *   Create a comprehensive musical piece (at least 8 bars long) that serves as a technical study.
    *   The etude must have a clear musical structure, for example, using a specific melodic pattern (like a sequence of 4 notes) to ascend and descend.
    *   It must force the player to travel across different strings and fretboard positions, covering a significant portion of the neck.
    *   **tab**: Must be a \`StructuredTab\` object with clear bar lines.

5. **modeSpotlight:**
    *   Spotlight the most useful mode of the scale.

---
**CRITICAL INSTRUCTION:** Generate only the requested practice sections as a single, complete JSON object. Do not include any introductory text, backticks, or markdown formatting around the JSON.
`;
