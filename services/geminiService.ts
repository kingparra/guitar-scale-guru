import { GoogleGenAI, Type } from '@google/genai';
import type { ScaleDetails, SongAnalysisResult, ScaleNotesData } from '../types';
import {
    getOverviewPrompt,
    getResourcesPrompt,
    getPracticePrompt,
    getScaleNotesPrompt,
    notationAnalysisPrompt,
} from './prompts';

if (!process.env.API_KEY) {
    throw new Error('API_KEY environment variable not set');
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const songAnalysisSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            rootNote: {
                type: Type.STRING,
                description:
                    "The root note of the suggested scale (e.g., 'E', 'F#').",
            },
            scaleName: {
                type: Type.STRING,
                description:
                    "The name of the suggested scale (e.g., 'Harmonic Minor', 'Lydian').",
            },
            analysis: {
                type: Type.STRING,
                description:
                    'A detailed justification for the scale choice, explaining the musical reasoning based on the provided notation (key signature, accidentals, common phrases).',
            },
            suitability: {
                type: Type.STRING,
                description:
                    "A category for the suggestion, such as 'Primary Match' for the most direct fit, or 'Creative Alternative' for a different flavor.",
            },
        },
        required: ['rootNote', 'scaleName', 'analysis', 'suitability'],
    },
};

export const analyzeMusicNotationImage = async (
    imageData: string,
    mimeType: string
): Promise<SongAnalysisResult[]> => {
    const imagePart = {
        inlineData: {
            mimeType: mimeType,
            data: imageData,
        },
    };

    const textPart = {
        text: notationAnalysisPrompt,
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
        return JSON.parse(jsonString) as SongAnalysisResult[];
    } catch (e: unknown) {
        let errorMessage = 'Error analyzing notation image.';
        if (e instanceof Error) {
            errorMessage += `\n${e.message}`;
        }
        console.error('Error analyzing notation:', e);
        throw new Error(errorMessage);
    }
};

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
                        string: {
                            type: Type.NUMBER,
                            description: 'String number (0=high E, 6=low B)',
                        },
                        fret: {
                            type: Type.STRING,
                            description:
                                "Fret number as a string, can include techniques (e.g., '5', '12', '5h7', '|')",
                        },
                    },
                    required: ['string', 'fret'],
                },
            },
        },
    },
    required: ['columns'],
};

const chordDiagramDataSchema = {
    type: Type.OBJECT,
    properties: {
        frets: { type: Type.ARRAY, items: { type: Type.STRING } },
        fingers: { type: Type.ARRAY, items: { type: Type.STRING } },
        baseFret: { type: Type.NUMBER },
        barres: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    fromString: { type: Type.NUMBER },
                    toString: { type: Type.NUMBER },
                    fret: { type: Type.NUMBER },
                },
                required: ['fromString', 'toString', 'fret'],
            },
        },
    },
    required: ['frets', 'fingers', 'baseFret', 'barres'],
};

const chordSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        diagramData: chordDiagramDataSchema,
        degree: { type: Type.STRING },
    },
    required: ['name', 'diagramData', 'degree'],
};

// Schemas for Progressive Loading
const scaleNotesSchema = {
    type: Type.OBJECT,
    properties: {
        scaleNotes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    noteName: { type: Type.STRING },
                    degree: { type: Type.STRING },
                },
                required: ['noteName', 'degree'],
            },
        },
    },
    required: ['scaleNotes'],
};

const overviewSchema = {
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
            required: [
                'title',
                'character',
                'theory',
                'usage',
                'degreeExplanation',
            ],
        },
    },
    required: ['overview'],
};

const resourcesSchema = {
    type: Type.OBJECT,
    properties: {
        listeningGuide: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    artist: { type: Type.STRING },
                    spotifyLink: { type: Type.STRING },
                },
                required: ['title', 'artist', 'spotifyLink'],
            },
        },
        youtubeTutorials: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    creator: { type: Type.STRING },
                    youtubeLink: { type: Type.STRING },
                },
                required: ['title', 'creator', 'youtubeLink'],
            },
        },
        creativeApplication: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    creator: { type: Type.STRING },
                    youtubeLink: { type: Type.STRING },
                },
                required: ['title', 'creator', 'youtubeLink'],
            },
        },
        jamTracks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    creator: { type: Type.STRING },
                    youtubeLink: { type: Type.STRING },
                },
                required: ['title', 'creator', 'youtubeLink'],
            },
        },
        toneAndGear: {
            type: Type.OBJECT,
            properties: {
                suggestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            setting: { type: Type.STRING },
                            description: { type: Type.STRING },
                        },
                        required: ['setting', 'description'],
                    },
                },
                famousArtists: { type: Type.STRING },
            },
            required: ['suggestions', 'famousArtists'],
        },
    },
    required: [
        'listeningGuide',
        'youtubeTutorials',
        'creativeApplication',
        'jamTracks',
        'toneAndGear',
    ],
};

const practiceSchema = {
    type: Type.OBJECT,
    properties: {
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
                            chords: { type: Type.ARRAY, items: chordSchema },
                            harmonicFunctionAnalysis: { type: Type.STRING },
                        },
                        required: [
                            'name',
                            'analysis',
                            'chords',
                            'harmonicFunctionAnalysis',
                        ],
                    },
                },
            },
            required: ['diatonicQualities', 'progressions'],
        },
        licks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tab: structuredTabSchema,
                    sourceUrl: { type: Type.STRING },
                },
                required: ['name', 'description', 'tab', 'sourceUrl'],
            },
        },
        advancedHarmonization: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ['name', 'description'],
            },
        },
        etudes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tab: structuredTabSchema,
                },
                required: ['name', 'description', 'tab'],
            },
        },
        modeSpotlight: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                explanation: { type: Type.STRING },
                soundAndApplication: { type: Type.STRING },
            },
            required: ['name', 'explanation', 'soundAndApplication'],
        },
    },
    required: [
        'keyChords',
        'licks',
        'advancedHarmonization',
        'etudes',
        'modeSpotlight',
    ],
};

const generateContent = async (
    prompt: string,
    schema: any,
    context: string
): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
                temperature: 0.2,
            },
        });
        return JSON.parse(response.text);
    } catch (e: unknown) {
        let errorMessage = `Error generating ${context}.`;
        if (e instanceof Error) {
            errorMessage += `\n${e.message}`;
        }
        console.error(`Error generating ${context}:`, e);
        throw new Error(errorMessage);
    }
};

// DEPRECATED in favor of client-side generation
// export const generateScaleNotes = async (
//     rootNote: string,
//     scaleName: string
// ): Promise<ScaleNotesData> => {
//     const prompt = getScaleNotesPrompt(rootNote, scaleName);
//     return generateContent(prompt, scaleNotesSchema, 'scale notes');
// };

export const generateOverview = async (
    rootNote: string,
    scaleName: string
): Promise<Pick<ScaleDetails, 'overview'>> => {
    const prompt = getOverviewPrompt(rootNote, scaleName);
    return generateContent(prompt, overviewSchema, 'overview');
};

export const generateResources = async (
    rootNote: string,
    scaleName: string
): Promise<
    Pick<
        ScaleDetails,
        | 'listeningGuide'
        | 'youtubeTutorials'
        | 'creativeApplication'
        | 'jamTracks'
        | 'toneAndGear'
    >
> => {
    const prompt = getResourcesPrompt(rootNote, scaleName);
    return generateContent(prompt, resourcesSchema, 'resources');
};

export const generatePractice = async (
    rootNote: string,
    scaleName: string
): Promise<
    Pick<
        ScaleDetails,
        | 'keyChords'
        | 'licks'
        | 'advancedHarmonization'
        | 'etudes'
        | 'modeSpotlight'
    >
> => {
    const prompt = getPracticePrompt(rootNote, scaleName);
    return generateContent(prompt, practiceSchema, 'practice materials');
};