import { useState, useCallback } from 'react';
import { analyzeMusicNotationImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { processPdf } from '../utils/pdfUtils';
import type { SongAnalysisResult } from '../types';

interface AnalysisPayload {
    data: string;
    mimeType: string;
}

export const useNotationAnalyzer = () => {
    const [analysisResults, setAnalysisResults] = useState<SongAnalysisResult[] | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('Processing file...');
    
    const [analysisPayload, setAnalysisPayload] = useState<AnalysisPayload | null>(null);

    const handleFileChange = useCallback(async (file: File | null) => {
        if (!file) return;

        setIsProcessingFile(true);
        setProcessingMessage('Processing file...');
        setError(null);
        setAnalysisResults(null);
        setAnalysisPayload(null);
        setImagePreview(null);

        try {
            if (file.type === 'application/pdf') {
                const { compositeImageB64, firstPagePreviewUrl, mimeType } = await processPdf(file, setProcessingMessage);
                setImagePreview(firstPagePreviewUrl);
                setAnalysisPayload({ data: compositeImageB64, mimeType });
            } else if (file.type.startsWith('image/')) {
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);
                const base64Data = await fileToBase64(file);
                setAnalysisPayload({ data: base64Data, mimeType: file.type });
            } else {
                throw new Error("Unsupported file type. Please upload a PDF or an image file (PNG, JPG).");
            }
        } catch (err: any) {
            setError(`Failed to process file: ${err.message}`);
            setImagePreview(null);
        } finally {
            setIsProcessingFile(false);
        }
    }, []);

    const analyze = useCallback(async () => {
        if (!analysisPayload) {
            setError("Please select and process a file first.");
            return;
        }
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResults(null);
        try {
            const { data, mimeType } = analysisPayload;
            const results = await analyzeMusicNotationImage(data, mimeType);
            setAnalysisResults(results);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [analysisPayload]);

    return {
        analysisResults,
        isAnalyzing,
        error,
        analyze,
        handleFileChange,
        imagePreview,
        isProcessingFile,
        processingMessage,
        canAnalyze: !!analysisPayload
    };
};
