import { GoogleGenAI, Type } from "@google/genai";
import type { ScaleDetails } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const cache = new Map<string, ScaleDetails>();

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        overview: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                character: { type: Type.STRING },
                theory: { type: Type.STRING },
                usage: { type: Type.STRING },
                degreeExplanation: { type: Type.STRING },
            },
            required: ['title', 'character', 'theory', 'usage', 'degreeExplanation']
        },
        listeningGuide: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    artist: { type: Type.STRING },
                    spotifyLink: { type: Type.STRING }
                },
                required: ['title', 'artist', 'spotifyLink']
            }
        },
        youtubeTutorials: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    creator: { type: Type.STRING },
                    youtubeLink: { type: Type.STRING }
                },
                required: ['title', 'creator', 'youtubeLink']
            }
        },
        creativeApplication: {
             type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    creator: { type: Type.STRING },
                    youtubeLink: { type: Type.STRING }
                },
                required: ['title', 'creator', 'youtubeLink']
            }
        },
        jamTracks: {
             type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    creator: { type: Type.STRING },
                    youtubeLink: { type: Type.STRING }
                },
                required: ['title', 'creator', 'youtubeLink']
            }
        },
        toneAndGear: {
            type: Type.OBJECT,
            properties: {
                suggestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            setting: { type: Type.STRING, description: "e.g., 'Amp Settings', 'Effects'" },
                            description: { type: Type.STRING }
                        },
                         required: ['setting', 'description']
                    }
                },
                famousArtists: { type: Type.STRING, description: "A sentence listing artists known for this sound." }
            },
            required: ['suggestions', 'famousArtists']
        },
        keyChords: {
            type: Type.OBJECT,
            properties: {
                diatonicQualities: { type: Type.STRING },
                progressions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            analysis: { type: Type.STRING },
                            tab: { type: Type.STRING }
                        },
                        required: ['name', 'analysis', 'tab']
                    }
                }
            },
            required: ['diatonicQualities', 'progressions']
        },
        licks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tab: { type: Type.STRING },
                    sourceUrl: { type: Type.STRING }
                },
                required: ['name', 'description', 'tab', 'sourceUrl']
            }
        },
        advancedHarmonization: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tab: { type: Type.STRING }
                },
                required: ['name', 'description', 'tab']
            }
        },
        etudes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tab: { type: Type.STRING }
                },
                required: ['name', 'description', 'tab']
            }
        },
        modeSpotlight: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                explanation: { type: Type.STRING },
                soundAndApplication: { type: Type.STRING }
            },
            required: ['name', 'explanation', 'soundAndApplication']
        },
        diagramData: {
            type: Type.OBJECT,
            properties: {
                tonicChordDegrees: { type: Type.ARRAY, items: { type: Type.STRING } },
                characteristicDegrees: { type: Type.ARRAY, items: { type: Type.STRING } },
                notesOnFretboard: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            string: { type: Type.NUMBER, description: "String number (0=high E, 6=low B)" },
                            fret: { type: Type.NUMBER },
                            noteName: { type: Type.STRING },
                            degree: { type: Type.STRING, description: "Scale degree (e.g., R, b3, 5)" }
                        },
                        required: ['string', 'fret', 'noteName', 'degree']
                    }
                },
                fingering: {
                    type: Type.OBJECT,
                    properties: {
                        pos1: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    key: { type: Type.STRING, description: "Composite key 'string_fret', e.g., '6_2'" },
                                    finger: { type: Type.STRING, description: "Recommended finger (1, 2, 3, or 4)" }
                                }
                            }
                        },
                        pos2: {
                           type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    key: { type: Type.STRING, description: "Composite key 'string_fret', e.g., '6_2'" },
                                    finger: { type: Type.STRING, description: "Recommended finger (1, 2, 3, or 4)" }
                                }
                            }
                        },
                        pos3: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    key: { type: Type.STRING, description: "Composite key 'string_fret', e.g., '6_2'" },
                                    finger: { type: Type.STRING, description: "Recommended finger (1, 2, 3, or 4)" }
                                }
                            }
                        }
                    },
                    required: ['pos1', 'pos2', 'pos3']
                }
            },
            required: ['tonicChordDegrees', 'characteristicDegrees', 'notesOnFretboard', 'fingering']
        }
    },
    required: ['overview', 'listeningGuide', 'youtubeTutorials', 'keyChords', 'licks', 'advancedHarmonization', 'etudes', 'modeSpotlight', 'diagramData', 'creativeApplication', 'jamTracks', 'toneAndGear']
};


export const generateScaleMaterials = async (rootNote: string, scaleName: string): Promise<ScaleDetails> => {
    const cacheKey = `${rootNote}_${scaleName}`;
    if (cache.has(cacheKey)) {
        console.log("Returning cached data for", cacheKey);
        return cache.get(cacheKey)!;
    }

    console.log("Fetching new data for", cacheKey);
    const prompt = `
    ### **Master Prompt for Generating Guitar Scale Materials (Version 3.1)**

    **Request:** Generate a complete set of learning materials for the **${rootNote} ${scaleName}** scale on a seven-string guitar (tuned B E A D G B E, low to high).

    **Output Format:** You MUST return a single, valid JSON object that strictly adheres to the provided schema. Ensure all string values are properly escaped and that all URLs are functional.

    ---

    #### **1. Core Mission & Purpose**
    Your primary goal is to deliver musically useful, instantly readable guitar scale materials for a seven-string guitar. The experience is staged for learning: begin with deep context, show a clear full-neck diagram, explain the harmonic function, present playable positions, and only then provide advanced exercises and resources.

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
        *   Select "deeper cuts" or tracks from technical, modern, or genre-specific artists.
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
        *   **progressions**: (Array of 2 ChordProgression objects) Provide TAB and analysis for short, idiomatic chord progressions.

    8.  **licks:** (Array of 1-2 Lick objects)
        *   Research a classic, idiomatic guitar lick using the scale.
        *   **tab**: Provide the guitar TAB.
        *   **sourceUrl**: A valid, direct URL to the source page or video.

    9. **advancedHarmonization:** (Array of 1-2 HarmonizationExercise objects)
        *   CRITICAL: These MUST be comprehensive exercises. For example, a TAB of diatonic triads played in sequence, ascending the neck and connecting at least two different fretboard positions. Do NOT provide a simple, single-position exercise. It must demonstrate movement across the fretboard.

    10. **etudes:** (Array of 1-2 Etude objects)
        *   CRITICAL: These MUST be comprehensive musical pieces. For example, a technical etude could be the scale played in sequential 4ths, spanning multiple octaves and positions. The musical etude should be a titled "mini-composition" that is at least 4 bars long and travels across different strings and fretboard regions, telling a small musical story. Do NOT provide simple, single-string patterns.

    11. **modeSpotlight:**
        *   **name**: Spotlight the most useful mode (e.g., "5th Mode: Phrygian Dominant").
        *   **explanation**, **soundAndApplication**.

    12. **diagramData:**
        *   **tonicChordDegrees**: e.g., ["R", "b3", "5"].
        *   **characteristicDegrees**: e.g., ["b6", "7"].
        *   **notesOnFretboard**: Array of ALL notes of the scale from fret 0 to 25 on all 7 strings.
        *   **fingering**: Object with **pos1**, **pos2**, **pos3**. Each is an **ARRAY of objects** with "key" ("string_fret") and "finger" ("1"-"4").

    ---
    **CRITICAL INSTRUCTION:** Generate the entire response as a single, complete JSON object. Do not include any introductory text, backticks, or markdown formatting around the JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more powerful model for consistency with complex schemas
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                temperature: 0.2
            },
        });

        const jsonString = response.text;
        const parsedData = JSON.parse(jsonString);

        cache.set(cacheKey, parsedData);
        return parsedData as ScaleDetails;
    } catch (e: any) {
        let errorMessage = `Error generating scale materials.`;
        try {
           // Try to parse the error for a more specific message
           const errorObj = JSON.parse(e.message);
           errorMessage += `\n${JSON.stringify(errorObj, null, 2)}`;
        } catch {
            errorMessage += `\n${e.message}`;
        }
        console.error("Error generating scale materials:", e);
        throw new Error(errorMessage);
    }
};
