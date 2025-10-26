// Fix: Import Jest globals explicitly to resolve errors about missing test functions.
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Fix: Import generateCoreMaterials instead of generateScaleMaterials.
import { generateCoreMaterials, analyzeMusicNotationImage } from './geminiService';
import { GoogleGenAI } from "@google/genai";
// Fix: Import getCoreMaterialsPrompt instead of getScaleMaterialsPrompt.
import { notationAnalysisPrompt, getCoreMaterialsPrompt } from './prompts';

// Mock the entire @google/genai module
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: {
            generateContent: jest.fn(),
        },
    })),
    Type: { OBJECT: 'OBJECT', STRING: 'STRING', ARRAY: 'ARRAY', NUMBER: 'NUMBER' },
}));

// Mock the prompts module
jest.mock('./prompts', () => ({
    notationAnalysisPrompt: 'mocked-notation-prompt',
    // Fix: Mock getCoreMaterialsPrompt.
    getCoreMaterialsPrompt: jest.fn().mockReturnValue('mocked-scale-prompt'),
}));

// Create typed mocks
const mockGenerateContent = jest.fn();
// Fix: Cast to 'any' because Jest's global types are not being recognized.
// Fix: Use getCoreMaterialsPrompt for the mock variable.
const mockGetCoreMaterialsPrompt = getCoreMaterialsPrompt as any;

// Reset mocks before each test
beforeEach(() => {
    // Fix: Cast to 'any' because Jest's global types are not being recognized.
    (GoogleGenAI as any).mockImplementation(() => ({
        models: {
            generateContent: mockGenerateContent,
        },
    }));
    mockGenerateContent.mockClear();
    // Fix: Clear the correct prompt mock.
    mockGetCoreMaterialsPrompt.mockClear();
});

describe('geminiService', () => {
    // Fix: Update describe block to test generateCoreMaterials.
    describe('generateCoreMaterials', () => {
        it('should call the prompt generator and the Gemini API with the correct arguments', async () => {
            mockGenerateContent.mockResolvedValue({ text: JSON.stringify({}) });

            // Fix: Call generateCoreMaterials.
            await generateCoreMaterials('E', 'Harmonic Minor');

            // Fix: Expect the correct prompt mock to be called.
            expect(mockGetCoreMaterialsPrompt).toHaveBeenCalledWith('E', 'Harmonic Minor');
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
            
            const callArgs = mockGenerateContent.mock.calls[0][0];
            expect(callArgs.contents).toBe('mocked-scale-prompt');
            expect(callArgs.model).toBe('gemini-2.5-pro');
            expect(callArgs.config.responseMimeType).toBe('application/json');
        });

        it('should return parsed JSON data on success', async () => {
            const mockResponse = { overview: { title: 'C# Lydian' } };
            mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockResponse) });

            // Fix: Call generateCoreMaterials.
            const result = await generateCoreMaterials('C#', 'Lydian');
            expect(result).toEqual(mockResponse);
        });

        it('should throw an error if the API call fails', async () => {
            mockGenerateContent.mockRejectedValue(new Error('API Error'));
            // Fix: Call generateCoreMaterials and expect the correct error message.
            await expect(generateCoreMaterials('A', 'Major')).rejects.toThrow('Error generating core materials.');
        });
    });

    describe('analyzeMusicNotationImage', () => {
        it('should call the multimodal API with the correct prompt and image data', async () => {
            mockGenerateContent.mockResolvedValue({ text: JSON.stringify([]) });
            
            const imageData = 'fake-base64-data';
            const mimeType = 'image/png';
            await analyzeMusicNotationImage(imageData, mimeType);

            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
            const callArgs = mockGenerateContent.mock.calls[0][0];

            expect(callArgs.contents.parts).toHaveLength(2);
            expect(callArgs.contents.parts[0].text).toBe('mocked-notation-prompt');
            expect(callArgs.contents.parts[1].inlineData.data).toBe(imageData);
            expect(callArgs.contents.parts[1].inlineData.mimeType).toBe(mimeType);
            expect(callArgs.model).toBe('gemini-2.5-pro');
        });

        it('should return parsed JSON array on success', async () => {
            const mockResponse = [{ rootNote: 'G', scaleName: 'Major' }];
            mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockResponse) });

            const result = await analyzeMusicNotationImage('dummyData', 'image/jpeg');
            expect(result).toEqual(mockResponse);
        });
    });
});