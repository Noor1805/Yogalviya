/**
 * Video MIME type utilities for upload validation
 * Supports common variations and provides fallback validation
 */

// Extended MIME type mappings - includes browser variations
export const MIME_TYPE_MAP: Record<string, string> = {
    // Standard MP4 variations
    'video/mp4': 'mp4',
    'video/x-mp4': 'mp4',
    'video/mpeg4': 'mp4',

    // Standard MOV/QuickTime variations
    'video/quicktime': 'mov',
    'video/x-quicktime': 'mov',
    'video/x-mov': 'mov',

    // Standard WEBM variations
    'video/webm': 'webm',
    'video/x-webm': 'webm',

    // Image types
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
};

// File extension to MIME type mapping
export const EXTENSION_TO_MIME: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
};

// Supported video extensions for validation
export const SUPPORTED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'];
export const SUPPORTED_IMAGE_EXTENSIONS = ['jpeg', 'jpg', 'png', 'webp', 'avif'];
export const SUPPORTED_EXTENSIONS = [...SUPPORTED_VIDEO_EXTENSIONS, ...SUPPORTED_IMAGE_EXTENSIONS];

/**
 * Check if a MIME type is supported
 */
export function isSupportedMimeType(mimeType: string): boolean {
    return mimeType.toLowerCase() in MIME_TYPE_MAP;
}

/**
 * Get file format from MIME type
 */
export function getFormatFromMimeType(mimeType: string): string | null {
    return MIME_TYPE_MAP[mimeType.toLowerCase()] || null;
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string | null {
    const normalized = extension.toLowerCase().startsWith('.') ? extension : `.${extension}`;
    return EXTENSION_TO_MIME[normalized] || null;
}

/**
 * Get user-friendly format description
 */
export function getFormatDescription(format: string): string {
    const descriptions: Record<string, string> = {
        'mp4': 'MP4 video',
        'mov': 'MOV (QuickTime) video',
        'webm': 'WEBM video',
        'jpeg': 'JPEG image',
        'png': 'PNG image',
        'webp': 'WebP image',
        'avif': 'AVIF image',
    };
    return descriptions[format.toLowerCase()] || format.toUpperCase();
}

/**
 * Validate file by extension (fallback when MIME type check fails)
 */
export function validateFileExtension(fileName: string): { valid: boolean; extension: string; format?: string } {
    const parts = fileName.split('.');
    if (parts.length < 2) {
        return { valid: false, extension: '' };
    }

    const extension = parts.pop()!.toLowerCase();
    const isValid = SUPPORTED_EXTENSIONS.includes(extension);

    return {
        valid: isValid,
        extension,
        format: isValid ? getFormatDescription(extension) : undefined,
    };
}

/**
 * Get allowed formats message for error display
 */
export function getAllowedFormatsMessage(type: 'all' | 'video' | 'image'): string {
    if (type === 'video') {
        return 'Allowed video formats: MP4, MOV, WEBM';
    }
    if (type === 'image') {
        return 'Allowed image formats: JPEG, PNG, WebP, AVIF';
    }
    return 'Allowed formats: MP4, MOV, WEBM, JPEG, PNG, WebP, AVIF';
}
