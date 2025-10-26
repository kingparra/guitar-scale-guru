import { GoogleGenAI, Type } from "@google/genai";
import type { ScaleDetails, SongAnalysisResult } from '../types';
import { notationAnalysisPrompt, getScaleMaterialsPrompt } from './prompts';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const scaleCache = new Map<string, ScaleDetails>();

const songAnalysisSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            rootNote: { type: Type.STRING, description: "The root note of the suggested scale (e.g., 'E', 'F#')." },
            scaleName: { type: Type.STRING, description: "The name of the suggested scale (e.g., 'Harmonic Minor', 'Lydian')." },
            analysis: { type: Type.STRING, description: "A detailed justification for the scale choice, explaining the musical reasoning based on the provided notation (key signature, accidentals, common phrases)." },
            suitability: { type: Type.STRING, description: "A category for the suggestion, such as 'Primary Match' for the most direct fit, or 'Creative Alternative' for a different flavor." }
        },
        required: ['rootNote', 'scaleName', 'analysis', 'suitability']
    }
};

export const analyzeMusicNotationImage = async (imageData: string, mimeType: string): Promise<SongAnalysisResult[]> => {
    console.log("Analyzing notation image...");
    
    const imagePart = {
        inlineData: {
            mimeType: mimeType,
            data: imageData,
        },
    };

    const textPart = {
        text: notationAnalysisPrompt
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: songAnalysisSchema,
                temperature: 0.1,
            },
        });

        const jsonString = response.text;
        const parsedData = JSON.parse(jsonString);

        return parsedData as SongAnalysisResult[];

    } catch (e: any) {
        let errorMessage = `Error analyzing notation image.`;
        // Attempt to parse a structured error from Gemini if available
        try {
           const errorObj = JSON.parse(e.message);
           errorMessage += `\n${JSON.stringify(errorObj, null, 2)}`;
        } catch {
            errorMessage += `\n${e.message}`;
        }
        console.error("Error analyzing notation:", e);
        throw new Error(errorMessage);
    }
};

// Reusable schema for structured tablature data
const structuredTabSchema = {
    type: Type.OBJECT,
    properties: {
        columns: {
            type: Type.ARRAY,
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        string: { type: Type.NUMBER, description: "String number (0=high E, 6=low B)" },
                        fret: { type: Type.STRING, description: "Fret number as a string, can include techniques (e.g., '5', '12', '5h7', '|')" }
                    },
                    required: ['string', 'fret']
                }
            }
        }
    },
    required: ['columns']
};

const scaleDetailsSchema = {
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
                            tab: structuredTabSchema,
                            harmonicFunctionAnalysis: { type: Type.STRING }
                        },
                        required: ['name', 'analysis', 'tab', 'harmonicFunctionAnalysis']
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
                    tab: structuredTabSchema,
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
                    tab: structuredTabSchema
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
                    tab: structuredTabSchema
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
                },
                diagonalRun: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            string: { type: Type.NUMBER },
                            fret: { type: Type.NUMBER },
                            noteName: { type: Type.STRING },
                            degree: { type: Type.STRING },
                            finger: { type: Type.STRING }
                        },
                        required: ['string', 'fret', 'noteName', 'degree', 'finger']
                    }
                }
            },
            required: ['tonicChordDegrees', 'characteristicDegrees', 'notesOnFretboard', 'fingering', 'diagonalRun']
        }
    },
    required: ['overview', 'listeningGuide', 'youtubeTutorials', 'keyChords', 'licks', 'advancedHarmonization', 'etudes', 'modeSpotlight', 'diagramData', 'creativeApplication', 'jamTracks', 'toneAndGear']
};

export const generateScaleMaterials = async (rootNote: string, scaleName: string): Promise<ScaleDetails> => {
    const cacheKey = `${rootNote}_${scaleName}`;
    if (scaleCache.has(cacheKey)) {
        console.log("Returning cached data for", cacheKey);
        return scaleCache.get(cacheKey)!;
    }

    console.log("Fetching new data for", cacheKey);
    const prompt = getScaleMaterialsPrompt(rootNote, scaleName);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: scaleDetailsSchema,
                temperature: 0.2
            },
        });

        const jsonString = response.text;
        const parsedData = JSON.parse(jsonString);

        scaleCache.set(cacheKey, parsedData);
        return parsedData as ScaleDetails;
    } catch (e: any) {
        let errorMessage = `Error generating scale materials.`;
        try {
           const errorObj = JSON.parse(e.message);
           errorMessage += `\n${JSON.stringify(errorObj, null, 2)}`;
        } catch {
            errorMessage += `\n${e.message}`;
        }
        console.error("Error generating scale materials:", e);
        throw new Error(errorMessage);
    }
};