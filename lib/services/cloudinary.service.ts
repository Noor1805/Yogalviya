import { v2 as cloudinary } from 'cloudinary';

const isCloudinaryDebugEnabled =
    process.env.NODE_ENV !== 'production' && process.env.CLOUDINARY_DEBUG === '1';

function logCloudinaryDebug(...args: unknown[]) {
    if (isCloudinaryDebugEnabled) {
        console.log(...args);
    }
}

// Initialize Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryUploadResult = {
    public_id: string;
    secure_url: string;
    eager?: Array<{ secure_url: string }>;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
};

function formatUploadResult(result: any, isVideo: boolean) {
    if (!result || !result.secure_url) {
        throw new Error(
            result?.error?.message || 
            result?.message || 
            `Cloudinary error: Expected secure_url, received ${JSON.stringify(result)}`
        );
    }

    return {
        publicId: result.public_id,
        url: result.secure_url,
        thumbnailUrl: isVideo
            ? (result.eager && result.eager.length > 0 && result.eager[0].secure_url
                ? result.eager[0].secure_url
                : result.secure_url.replace(/\.[^/.]+$/, '.jpg'))
            : result.secure_url,
        type: isVideo ? 'video' : 'image',
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
    };
}

export const cloudinaryService = {
    /**
     * Upload a file (image/video) to Cloudinary
     */
    async uploadFile(base64Data: string, folder: string, isVideo = false) {
        try {
            const result: any = await cloudinary.uploader.upload(base64Data, {
                folder: `yoglivya/${folder}`,
                resource_type: 'auto',
                // For videos we can create thumbnails, for images we just upload
                eager: isVideo ? [{ width: 300, crop: 'pad', format: 'jpg' }] : undefined,
                eager_async: isVideo,
            });

            if (result.error) {
                throw new Error(result.error.message || JSON.stringify(result.error));
            }

            return formatUploadResult(result as CloudinaryUploadResult, isVideo);
        } catch (error: any) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    },

    /**
     * Upload a local file path to Cloudinary. Videos use chunked uploads for stability.
     */
    async uploadFileFromPath(filePath: string, folder: string, isVideo = false) {
        try {
            logCloudinaryDebug('[Cloudinary] Starting upload from path:', filePath);
            logCloudinaryDebug('[Cloudinary] Is video:', isVideo);
            logCloudinaryDebug('[Cloudinary] Folder:', folder);

            const commonOptions = {
                folder: `yoglivya/${folder}`,
                resource_type: 'auto' as const,
                eager: isVideo ? [{ width: 300, crop: 'pad', format: 'jpg' }] : undefined,
                eager_async: isVideo,
            };

            const result: any = await new Promise((resolve, reject) => {
                if (isVideo) {
                    logCloudinaryDebug('[Cloudinary] Using upload_large for video');
                    (cloudinary.uploader as any).upload_large(
                        filePath,
                        { ...commonOptions, chunk_size: 6000000 },
                        (error: any, res: any) => {
                            if (error) {
                                console.error('[Cloudinary] upload_large error:', error);
                                reject(error);
                            } else {
                                logCloudinaryDebug('[Cloudinary] upload_large success:', res?.public_id);
                                resolve(res);
                            }
                        }
                    );
                } else {
                    logCloudinaryDebug('[Cloudinary] Using regular upload for image');
                    cloudinary.uploader.upload(
                        filePath,
                        commonOptions,
                        (error, res) => {
                            if (error) {
                                console.error('[Cloudinary] upload error:', error);
                                reject(error);
                            } else {
                                logCloudinaryDebug('[Cloudinary] upload success:', res?.public_id);
                                resolve(res);
                            }
                        }
                    );
                }
            });

            if (result.error) {
                console.error('[Cloudinary] Result contains error:', result.error);
                throw new Error(result.error.message || JSON.stringify(result.error));
            }

            logCloudinaryDebug('[Cloudinary] Upload completed successfully');
            return formatUploadResult(result as CloudinaryUploadResult, isVideo);
        } catch (error: any) {
            console.error('Cloudinary path upload error:', error);
            console.error('Cloudinary error details:', {
                message: error.message,
                name: error.name,
                http_code: error.http_code,
            });
            throw error;
        }
    },

    /**
     * Delete a file from Cloudinary
     */
    async deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image') {
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            return true;
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            throw new Error('Failed to delete from Cloudinary');
        }
    },
};
