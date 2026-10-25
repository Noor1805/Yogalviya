import { NextRequest, NextResponse } from 'next/server';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { createWriteStream } from 'fs';
import { auth } from '@/lib/auth';
import { cloudinaryService } from '@/lib/services/cloudinary.service';
import { tmpdir } from 'os';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import {
    isSupportedMimeType,
    getFormatFromMimeType,
    getMimeTypeFromExtension,
    validateFileExtension,
    getFormatDescription,
    getAllowedFormatsMessage,
} from '@/lib/utils/video-mime-types';

// Extended MIME type mappings - includes browser variations
const MIME_TYPE_MAP: Record<string, string> = {
    // MP4 variations
    'video/mp4': '.mp4',
    'video/x-mp4': '.mp4',
    'video/mpeg4': '.mp4',
    // MOV/QuickTime variations
    'video/quicktime': '.mov',
    'video/x-quicktime': '.mov',
    'video/x-mov': '.mov',
    // WEBM variations
    'video/webm': '.webm',
    'video/x-webm': '.webm',
    // Image types
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/avif': '.avif',
};

function getExtensionForType(mimeType: string): string {
    return MIME_TYPE_MAP[mimeType] || '';
}

// Check if debug mode is enabled
const isDebugMode = (url: string) => {
    try {
        const searchParams = new URL(url).searchParams;
        return searchParams.has('debug');
    } catch {
        return false;
    }
};

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session || !session.user || (session.user as any)?.role !== 'customer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const debug = isDebugMode(request.url);

    try {
        // Read file type and name from headers (avoids FormData parsing issues in Next.js App Router)
        const mimeType = request.headers.get('content-type') || '';
        const rawFileName = request.headers.get('x-file-name');
        const fileName = rawFileName ? decodeURIComponent(rawFileName) : 'upload';
        const declaredSize = Number(request.headers.get('content-length') || '0');

        if (debug) {
            console.log('[Upload Debug] MIME type:', mimeType);
            console.log('[Upload Debug] File name:', fileName);
            console.log('[Upload Debug] Content-Length:', request.headers.get('content-length'));
        }

        // Validate MIME type with fallback to file extension
        let isImage = false;
        let isVideo = false;
        let detectedFormat: string | null = null;

        // Primary validation: Check MIME type
        if (isSupportedMimeType(mimeType)) {
            detectedFormat = getFormatFromMimeType(mimeType);
            const imageFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif'];
            isImage = detectedFormat ? imageFormats.includes(detectedFormat) : false;
            isVideo = !isImage && detectedFormat !== null;
        } else if (rawFileName) {
            // Fallback validation: Check file extension
            const extensionValidation = validateFileExtension(fileName);
            if (extensionValidation.valid) {
                detectedFormat = extensionValidation.extension;
                const imageExtensions = ['jpeg', 'jpg', 'png', 'webp', 'avif'];
                isImage = imageExtensions.includes(detectedFormat);
                isVideo = !isImage;

                if (debug) {
                    console.log('[Upload Debug] MIME type not recognized, using extension fallback:', detectedFormat);
                }
            }
        }

        if (!isImage && !isVideo) {
            const detectedInfo = mimeType || (rawFileName ? fileName : 'unknown');
            return NextResponse.json(
                {
                    error: `Unsupported video format or file. Detected: ${detectedInfo}`,
                    details: getAllowedFormatsMessage('all'),
                },
                { status: 400 }
            );
        }

        if (debug) {
            console.log('[Upload Debug] Validated as:', isVideo ? 'video' : 'image', 'format:', detectedFormat);
        }

        const maxSize = isVideo ? 200 * 1024 * 1024 : 10 * 1024 * 1024;

        if (declaredSize > maxSize) {
            return NextResponse.json({ error: 'File too large.' }, { status: 400 });
        }

        // Images → base64 upload
        if (isImage) {
            const bytes = await request.arrayBuffer();
            const fileBuffer = Buffer.from(bytes);
            if (fileBuffer.length === 0) {
                return NextResponse.json({ error: 'Empty file received' }, { status: 400 });
            }
            if (fileBuffer.length > maxSize) {
                return NextResponse.json({ error: 'File too large.' }, { status: 400 });
            }
            const base64 = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
            const result = await cloudinaryService.uploadFile(base64, 'customer-evidence', false);
            return NextResponse.json(result);
        }

        // Videos → direct stream to temp file to avoid Next.js RAM truncation!
        const extension = path.extname(fileName) || getExtensionForType(mimeType);
        const tempDirectory = await mkdtemp(path.join(tmpdir(), 'customer-evidence-'));
        const tempFilePath = path.join(tempDirectory, `upload${extension}`);

        try {
            if (!request.body) {
                throw new Error('No request body stream found');
            }
            
            // We stream the raw raw binary directly to disk
            const nodeStream = Readable.fromWeb(request.body as any);
            const writeStream = createWriteStream(tempFilePath);
            
            await pipeline(nodeStream, writeStream);
            
            // Verify it was actually written
            const { stat } = await import('fs/promises');
            const fileStats = await stat(tempFilePath);
            if (fileStats.size === 0) {
                throw new Error('Streamed file is empty. Next.js might be blocking the payload.');
            }
            if (fileStats.size > maxSize) {
                throw new Error(`Video too large: ${Math.round(fileStats.size / 1024 / 1024)}MB`);
            }

            const result = await cloudinaryService.uploadFileFromPath(tempFilePath, 'customer-evidence', true);
            return NextResponse.json(result);

        } finally {
            await rm(tempDirectory, { recursive: true, force: true });
        }
    } catch (error: unknown) {
        console.error('Customer Upload Error:', error);

        let errorDetails = 'Upload failed';
        if (error instanceof Error) {
            errorDetails = error.message;
        } else if (typeof error === 'object' && error !== null) {
            errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error));
        } else if (typeof error === 'string') {
            errorDetails = error;
        }

        // Provide more helpful error message
        const isVideoError = errorDetails.toLowerCase().includes('video') ||
                           errorDetails.toLowerCase().includes('upload_large');

        return NextResponse.json(
            {
                error: isVideoError ? `Video upload failed: ${errorDetails}` : errorDetails,
                details: 'Please check file format and size, then try again',
            },
            { status: typeof error === 'object' && error !== null && 'http_code' in error ? Number((error as { http_code?: number }).http_code) || 500 : 500 }
        );
    }
}
