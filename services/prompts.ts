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
### **Master Prompt for Generating Guitar Scale Materials (Version 4.3)**

**Request:** Generate a complete set of learning materials for the **${rootNote} ${scaleName}** scale on a seven-string guitar (tuned B E A D G B E, low to high).

**Output Format:** You MUST return a single, valid JSON object that strictly adheres to the provided schema. Ensure all string values are properly escaped and that all URLs are functional.

---

#### **1. Core Mission & Purpose**
Your primary goal is to deliver musically useful, instantly readable guitar scale materials for a seven-string guitar. The content should be targeted at an intermediate to advanced player who wants both deep theoretical understanding and practical, challenging application material.

---
#### **2. JSON Content & Structure Requirements**
A new scale request **must** return a single JSON object containing all of the following top-level keys: "overview", "listeningGuide", "youtubeTutorials", "creativeApplication", "jamTracks", "toneAndGear", "keyChords", "licks", "advancedHarmonization", "etudes", "modeSpotlight", "diagramData".

1.  **overview**:
    *   **title**: The full name, e.g., "${rootNote} ${scaleName}".
    *   **character**: A detailed, engaging description of the scale's emotional character (mood, feel, common descriptors).
    *   **theory**: Explain the theoretical function and history, focusing on the hallmark intervals and purpose.
    *   **usage**: Describe its common usage in various modern and classic genres.
    *   **degreeExplanation**: A string containing a simple markdown-style table explaining each scale degree for **${rootNote} ${scaleName}**. Columns: "Degree", "Note", "Function/Character". Example: "| Degree | Note | Function/Character |\\n|---|---|---|\\n| R | E | The Root/Tonic. The 'home' note. |"

2.  **listeningGuide:** (Array of 3-4 Song objects)
    *   CRITICAL: Select "deeper cuts" or tracks from technical, modern, or genre-specific artists that truly showcase the scale's unique character.
    *   **Avoid extremely popular, over-cited examples** (e.g., avoid 'Stairway to Heaven' for A minor, or 'Crazy Train' for F# minor). Instead, focus on songs where the scale is a defining characteristic of a key riff, solo, or melody.
    *   Consider examples from progressive metal, jazz fusion, film scores, or technical death metal where appropriate for the scale.
    *   **spotifyLink**: A valid Spotify **search URL**: \`https://open.spotify.com/search/SONG_TITLE%20ARTIST\`.

3.  **youtubeTutorials:** (Array of 2-3 Tutorial objects)
    *   Select high-quality videos on practical application or theory.
    *   **youtubeLink**: A valid YouTube **search URL**: \`https://www.youtube.com/results?search_query=TUTORIAL_TITLE\`.

4.  **creativeApplication:** (Array of 2-3 CreativeVideo objects)
    *   Find YouTube videos showcasing the scale in a real musical context (improvisation, composition, song breakdown).
    *   **youtubeLink**: A valid YouTube **search URL**.

5.  **jamTracks:** (Array of 2-3 JamTrack objects)
    *   Find high-quality jam tracks on YouTube in the key of **${rootNote}** that fit the scale's mood.
    *   **title**: e.g., "Sad Ballad Backing Track in D Minor".
    *   **youtubeLink**: A valid YouTube **search URL**.

6.  **toneAndGear:**
    *   **suggestions**: (Array of ToneSuggestion objects) Provide tips for amp settings, effects (delay, reverb, overdrive), and pickup selection.
    *   **famousArtists**: A brief sentence listing famous guitarists associated with the scale's sound and their typical gear.

7.  **keyChords:**
    *   **diatonicQualities**: Single-line reference (e.g., \`i-ii°-III+-iv-V-VI-vii°\`).
    *   **progressions**: (Array of 2 ChordProgression objects) For each progression:
        *   Provide the TAB and a brief analysis.
        *   **harmonicFunctionAnalysis**: A brief (1-2 sentence) explanation of the progression's harmonic function, describing the role of each chord (e.g., tonic, pre-dominant, dominant) and the overall tension and release.

8.  **licks:** (Array of 1-2 Lick objects)
    *   Research a classic, idiomatic guitar lick using the scale.
    *   **tab**: Provide the guitar TAB.
    *   **sourceUrl**: A valid, direct URL to the source page or video.

9. **advancedHarmonization:** (Array of 1-2 HarmonizationExercise objects)
    *   CRITICAL: These MUST be comprehensive exercises that cover a significant portion of the fretboard. For example, a TAB of diatonic triads played in sequence, ascending the neck and connecting at least two different fretboard positions.
    *   The exercise **must span a minimum of 12 frets** (e.g., from fret 2 to fret 14).
    *   **Do NOT provide a simple, single-position exercise** confined to a 5-fret box. It must demonstrate practical position shifting.

10. **etudes:** (Array of 1-2 Etude objects)
    *   CRITICAL: These MUST be comprehensive musical pieces that are both technically and musically valuable.
    *   A technical etude should explore a pattern (like sequential 4ths or arpeggios) across **multiple octaves and fretboard positions**.
    *   A musical etude should be a titled "mini-composition" (at least 4 bars) that **travels across different strings and fretboard regions**, telling a small musical story and demonstrating how to connect scale shapes fluidly.
    *   **Avoid simple, repetitive patterns that stay in one place.** The goal is to teach movement across the entire neck.

11. **modeSpotlight:**
    *   **name**: Spotlight the most useful mode (e.g., "5th Mode: Phrygian Dominant").
    *   **explanation**, **soundAndApplication**.

12. **diagramData:**
    *   **tonicChordDegrees**: e.g., ["R", "b3", "5"].
    *   **characteristicDegrees**: e.g., ["b6", "7"].
    *   **notesOnFretboard**: Array of ALL notes of the scale from fret 0 to 25 on all 7 strings.
    *   **fingering**: Object with **pos1**, **pos2**, **pos3**. Each is an **ARRAY of objects** with "key" ("string_fret") and "finger" ("1"-"4"). Each position **must be confined to a playable 4-5 fret span**.
    *   **diagonalRun**: An array of objects representing a single, continuous, playable path of notes from the lowest possible note of the scale to the highest. This should prioritize **three-note-per-string** patterns for a fluid, modern feel. Each note in the array must include its string, fret, noteName, degree, and the recommended finger ('1'-'4').

---
**CRITICAL INSTRUCTION:** Generate the entire response as a single, complete JSON object. Do not include any introductory text, backticks, or markdown formatting around the JSON.
`;