import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate Cloudinary signed upload parameters
 * This is the industry-standard approach: server signs the upload, client uploads directly to Cloudinary
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { fileType, fileName } = body;

        if (!fileType || !fileName) {
            return NextResponse.json(
                { error: 'fileType and fileName are required' },
                { status: 400 }
            );
        }

        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];

        const isImage = validImageTypes.includes(fileType);
        const isVideo = validVideoTypes.includes(fileType);

        if (!isImage && !isVideo) {
            return NextResponse.json(
                {
                    error: 'Invalid file type',
                    details: 'Allowed formats: JPEG, PNG, WebP, AVIF, MP4, MOV, WEBM',
                },
                { status: 400 }
            );
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            console.error('Cloudinary credentials not configured');
            return NextResponse.json(
                { error: 'Cloudinary configuration error' },
                { status: 500 }
            );
        }

        // Generate timestamp
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = `ecommerce/customer-evidence/${session.user.id}`;
        
        // Parameters to sign - must match exactly what will be sent to Cloudinary
        const paramsToSign: Record<string, string | number | boolean> = {
            timestamp,
            folder,
        };

        // Add eager transformations for videos
        if (isVideo) {
            paramsToSign.eager = 'w_300,c_pad,fl_attachment,jpg';
            paramsToSign.eager_async = true;
        }

        // Use Cloudinary's built-in signature function (more reliable)
        const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

        return NextResponse.json({
            cloudName,
            apiKey,
            timestamp,
            signature,
            folder,
            eager: isVideo ? 'w_300,c_pad,fl_attachment,jpg' : undefined,
            eagerAsync: isVideo ? true : undefined,
            uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`,
        });
    } catch (error: unknown) {
        console.error('Error generating upload signature:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload signature' },
            { status: 500 }
        );
    }
}
