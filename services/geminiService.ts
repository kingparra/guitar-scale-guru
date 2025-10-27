import { GoogleGenAI, Type } from '@google/genai';
import type {
    ScaleDetails,
    SongAnalysisResult,
    Song,
    Tutorial,
    CreativeVideo,
    JamTrack,
    Lick,
    HarmonizationExercise,
    Etude,
} from '../types';
import {
    getOverviewPrompt,
    getListeningGuidePrompt,
    getYoutubeTutorialsPrompt,
    getCreativeApplicationPrompt,
    getJamTracksPrompt,
    getToneAndGearPrompt,
    getKeyChordsPrompt,
    getLicksPrompt,
    getAdvancedHarmonizationPrompt,
    getEtudesPrompt,
    getModeSpotlightPrompt,
    notationAnalysisPrompt,
} from './prompts';

/**
 * Creates a new GoogleGenAI client instance.
 * This function is called before every API request to ensure the most
 * up-to-date API key from the environment is used.
 */
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const songAnalysisSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            rootNote: { type: Type.STRING },
            scaleName: { type: Type.STRING },
            analysis: { type: Type.STRING },
            suitability: { type: Type.STRING },
        },
        required: ['rootNote', 'scaleName', 'analysis', 'suitability'],
    },
};

export const analyzeMusicNotationImage = async (
    imageData: string,
    mimeType: string
): Promise<SongAnalysisResult[]> => {
    const imagePart = {
        inlineData: { mimeType: mimeType, data: imageData },
    };
    const textPart = { text: notationAnalysisPrompt };

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            // FIX: Correct model name for complex tasks
            model: 'gemini-2.5-pro',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: songAnalysisSchema,
                temperature: 0.1,
            },
        });
        return JSON.parse(response.text) as SongAnalysisResult[];
    } catch (e: unknown) {
        console.error('Error analyzing notation:', e);
        throw e;
    }
};

// --- SCHEMAS ---
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
                        string: { type: Type.NUMBER },
                        fret: { type: Type.STRING },
                    },
                    required: ['string', 'fret'],
                },
            },
        },
    },
    required: ['columns'],
};

const chordSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        degree: { type: Type.STRING },
    },
    required: ['name', 'degree'],
};

// Schemas for Per-Card Loading
const overviewSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        character: { type: Type.STRING },
        theory: { type: Type.STRING },
        usage: { type: Type.STRING },
    },
    required: ['title', 'character', 'theory', 'usage'],
};

const listeningGuideSchema = {
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
};
// Generic schema for YouTube video lists
const youtubeListSchema = {
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
};

const toneAndGearSchema = {
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
};

const keyChordsSchema = {
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
                required: ['name', 'analysis', 'chords', 'harmonicFunctionAnalysis'],
            },
        },
    },
    required: ['diatonicQualities', 'progressions'],
};

const licksSchema = {
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
};

const advancedHarmonizationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
        },
        required: ['name', 'description'],
    },
};

const etudesSchema = {
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
};

const modeSpotlightSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        explanation: { type: Type.STRING },
        soundAndApplication: { type: Type.STRING },
    },
    required: ['name', 'explanation', 'soundAndApplication'],
};

// --- Generic Content Generator ---
const generateContent = async (
    prompt: string,
    schema: any,
    context: string
): Promise<any> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            // FIX: Correct model name for complex tasks
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { [context]: schema },
                },
                temperature: 0.2,
            },
        });
        // The API wraps the result in an object with the context key
        return JSON.parse(response.text)[context];
    } catch (e: unknown) {
        let errorMessage = `Error generating ${context}.`;
        if (e instanceof Error) errorMessage += `\n${e.message}`;
        console.error(`Error generating ${context}:`, e);
        throw new Error(errorMessage);
    }
};

// --- EXPORTED API FUNCTIONS ---
export const generateOverview = (rootNote: string, scaleName: string) =>
    generateContent(getOverviewPrompt(rootNote, scaleName), overviewSchema, 'overview');

export const generateListeningGuide = (rootNote: string, scaleName: string): Promise<Song[]> =>
    generateContent(getListeningGuidePrompt(rootNote, scaleName), listeningGuideSchema, 'listeningGuide');

export const generateYoutubeTutorials = (rootNote: string, scaleName: string): Promise<Tutorial[]> =>
    generateContent(getYoutubeTutorialsPrompt(rootNote, scaleName), youtubeListSchema, 'youtubeTutorials');

export const generateCreativeApplication = (rootNote: string, scaleName: string): Promise<CreativeVideo[]> =>
    generateContent(getCreativeApplicationPrompt(rootNote, scaleName), youtubeListSchema, 'creativeApplication');

export const generateJamTracks = (rootNote: string, scaleName: string): Promise<JamTrack[]> =>
    generateContent(getJamTracksPrompt(rootNote, scaleName), youtubeListSchema, 'jamTracks');

export const generateToneAndGear = (rootNote: string, scaleName: string): Promise<ScaleDetails['toneAndGear']> =>
    generateContent(getToneAndGearPrompt(rootNote, scaleName), toneAndGearSchema, 'toneAndGear');

export const generateKeyChords = (rootNote: string, scaleName: string): Promise<ScaleDetails['keyChords']> =>
    generateContent(getKeyChordsPrompt(rootNote, scaleName), keyChordsSchema, 'keyChords');

export const generateLicks = (rootNote: string, scaleName: string): Promise<Lick[]> =>
    generateContent(getLicksPrompt(rootNote, scaleName), licksSchema, 'licks');

export const generateAdvancedHarmonization = (rootNote: string, scaleName: string): Promise<HarmonizationExercise[]> =>
    generateContent(getAdvancedHarmonizationPrompt(rootNote, scaleName), advancedHarmonizationSchema, 'advancedHarmonization');

export const generateEtudes = (rootNote: string, scaleName: string): Promise<Etude[]> =>
    generateContent(getEtudesPrompt(rootNote, scaleName), etudesSchema, 'etudes');

export const generateModeSpotlight = (rootNote: string, scaleName: string): Promise<ScaleDetails['modeSpotlight']> =>
    generateContent(getModeSpotlightPrompt(rootNote, scaleName), modeSpotlightSchema, 'modeSpotlight');
