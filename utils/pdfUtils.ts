import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker for pdf.js to render PDFs in the browser
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

export interface ProcessedPdf {
    compositeImageB64: string;
    firstPagePreviewUrl: string;
    mimeType: string;
}

export const processPdf = async (file: File, onProgress: (message: string) => void): Promise<ProcessedPdf> => {
    const fileBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    const numPages = pdf.numPages;
    onProgress(`Processing ${numPages} page${numPages > 1 ? 's' : ''}...`);

    const pageCanvases: HTMLCanvasElement[] = [];
    let totalHeight = 0;
    let maxWidth = 0;

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            pageCanvases.push(canvas);
            totalHeight += canvas.height;
            maxWidth = Math.max(maxWidth, canvas.width);
        }
    }

    if (pageCanvases.length === 0) {
        throw new Error("No pages could be rendered from the PDF.");
    }

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = maxWidth;
    compositeCanvas.height = totalHeight;
    const compositeContext = compositeCanvas.getContext('2d');

    if (!compositeContext) {
        throw new Error("Could not create composite canvas for PDF rendering.");
    }

    compositeContext.fillStyle = 'white';
    compositeContext.fillRect(0, 0, maxWidth, totalHeight);
    let currentY = 0;
    for (const pageCanvas of pageCanvases) {
        compositeContext.drawImage(pageCanvas, 0, currentY);
        currentY += pageCanvas.height;
    }

    const compositeDataUrl = compositeCanvas.toDataURL('image/png');
    const firstPagePreviewUrl = pageCanvases[0].toDataURL('image/png');

    return {
        compositeImageB64: compositeDataUrl.split(',')[1],
        firstPagePreviewUrl,
        mimeType: 'image/png'
    };
};
