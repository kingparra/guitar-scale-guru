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

export const getScaleMaterialsPrompt = (rootNote: string, scaleName: string) => `
### **Master Prompt for Generating Guitar Scale Materials (Version 5.1 - Diagram Constraints)**

**Request:** Generate a complete set of learning materials for the **${rootNote} ${scaleName}** scale on a seven-string guitar (tuned B E A D G B E, low to high).

**Output Format:** You MUST return a single, valid JSON object that strictly adheres to the provided schema. Ensure all string values are properly escaped and that all URLs are functional.

---

#### **1. Core Mission & Purpose**
Your primary goal is to deliver musically useful, instantly readable guitar scale materials for a seven-string guitar. The content should be targeted at an intermediate to advanced player who wants both deep theoretical understanding and practical, challenging application material.

---
#### **2. Structured Tablature (\`StructuredTab\`) Format**
**CRITICAL:** All tablature MUST be provided in the following structured JSON format. **DO NOT** generate pre-formatted text tabs.

\`\`\`json
{
  "tab": {
    "columns": [
      [ { "string": 5, "fret": "5" } ],
      [ { "string": 5, "fret": "7" } ],
      [ { "string": 5, "fret": "8" } ],
      [ { "string": 5, "fret": "7h8p7" } ],
      [ { "string": 4, "fret": "5" } ],
      [ { "string": 0, "fret": "|" }, { "string": 1, "fret": "|" }, { "string": 2, "fret": "|" }, { "string": 3, "fret": "|" }, { "string": 4, "fret": "|" }, { "string": 5, "fret": "|" }, { "string": 6, "fret": "|" } ],
      [ { "string": 3, "fret": "12b14" } ],
      [ { "string": 2, "fret": "~10~" } ]
    ]
  }
}
\`\`\`
*   **columns**: An array of columns. Each column represents a moment in time.
*   **Column**: An array of \`TabNote\` objects played simultaneously.
*   **TabNote**: An object with \`"string"\` (0=high E, 6=low B) and \`"fret"\`.
*   **fret (string)**: The fret number or technique.
    *   **Techniques**: MUST be included where musically appropriate. Use standard notation: 'h' (hammer-on), 'p' (pull-off), '/' (slide up), '\\' (slide down), 'b' (bend), 'r' (release), '~' (vibrato).
    *   **Bar Lines**: Represent a bar line with a column where ALL 7 strings have a \`TabNote\` with \`fret: "|" \`.
    *   **Rests**: A column with an empty array \`[]\` represents a rest.

---
#### **3. JSON Content & Structure Requirements**
A new scale request **must** return a single JSON object containing all of the following top-level keys.

1.  **overview**:
    *   **degreeExplanation**: A string containing a simple markdown-style table explaining each scale degree for **${rootNote} ${scaleName}**. Columns: "Degree", "Note", "Function/Character".

2.  **listeningGuide:** (Array of 3-4 Song objects)
    *   CRITICAL: Select "deeper cuts" or tracks from technical, modern, or genre-specific artists.
    *   **Avoid extremely popular, over-cited examples**.
    *   **spotifyLink**: A valid Spotify **search URL**.

3.  **youtubeTutorials / creativeApplication / jamTracks:** (Arrays of 2-3 objects each)
    *   Select high-quality videos.
    *   **youtubeLink**: A valid YouTube **search URL**.

4.  **toneAndGear:**
    *   Provide tips for amp settings, effects, and pickups.
    *   List famous artists associated with the sound.

5.  **keyChords:**
    *   **diatonicQualities**: Single-line reference (e.g., \`i-ii°-III+-iv-V-VI-vii°\`).
    *   **progressions**: (Array of 2 ChordProgression objects) For each progression:
        *   **tab**: Must be a \`StructuredTab\` object. Can be used for arpeggiated patterns or chord strums.
        *   **harmonicFunctionAnalysis**: A brief explanation of the progression's harmonic function (e.g., tonic, pre-dominant, dominant).

6.  **licks:** (Array of 1-2 Lick objects)
    *   Create musically interesting licks that **demonstrate a key characteristic of the scale**. For example, for Phrygian Dominant, create a lick highlighting the b2 to R resolution.
    *   **tab**: Must be a \`StructuredTab\` object, incorporating techniques like bends, slides, and vibrato.

7. **advancedHarmonization:** (Array of 1-2 HarmonizationExercise objects)
    *   Create comprehensive exercises that cover a significant portion of the fretboard, **spanning a minimum of 12 frets** and connecting multiple positions.
    *   **tab**: Must be a \`StructuredTab\` object.

8. **etudes:** (Array of 1-2 Etude objects)
    *   Create comprehensive musical pieces (at least 4 bars) that travel across different strings and fretboard regions.
    *   **tab**: Must be a \`StructuredTab\` object with clear bar lines.

9. **modeSpotlight:**
    *   Spotlight the most useful mode of the scale.

10. **diagramData:**
    *   **tonicChordDegrees**, **characteristicDegrees**.
    *   **notesOnFretboard**: CRITICAL: This array **must** include every single occurrence of every scale note on all seven strings, from the open string (fret 0) up to and including the 24th fret.
    *   **fingering**: CRITICAL: Each position (\`pos1\`, \`pos2\`, \`pos3\`) **must be confined to a playable 4-5 fret span**. Do not include notes outside this small window for a single position. These should represent standard, ergonomic "box" patterns.
    *   **diagonalRun**: A continuous, playable path from lowest to highest note, prioritizing **three-note-per-string** patterns.

---
**CRITICAL INSTRUCTION:** Generate the entire response as a single, complete JSON object. Do not include any introductory text, backticks, or markdown formatting around the JSON.
`;