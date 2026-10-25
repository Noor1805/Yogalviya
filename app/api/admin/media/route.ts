import { NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Media from '@/lib/models/Media';
import { cloudinaryService } from '@/lib/services/cloudinary.service';

// GET media (optional folder filter)
export async function GET(req: Request) {
    const session = await getVerifiedAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder');

    const query: { isDeleted: { $ne: boolean }; folder?: string } = { isDeleted: { $ne: true } };
    if (folder && folder !== 'all') {
        query.folder = folder;
    }

    await dbConnect();
    const items = await Media.find(query).sort({ createdAt: -1 }).lean();

    // Get unique folders for navigation
    const allFolders = await Media.distinct('folder');

    return NextResponse.json({ items, folders: allFolders });
}

// POST upload media
export async function POST(req: Request) {
    const session = await getVerifiedAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await req.json();
        const { base64Data, filename, folder = 'general', isVideo = false } = data;

        if (!base64Data || !filename) {
            return NextResponse.json({ error: 'Missing file data' }, { status: 400 });
        }

        const uploadResult = await cloudinaryService.uploadFile(base64Data, folder, isVideo);

        await dbConnect();
        const media = await Media.create({
            publicId: uploadResult.publicId,
            url: uploadResult.url,
            thumbnailUrl: uploadResult.thumbnailUrl,
            type: uploadResult.type,
            folder: folder.toLowerCase().replace(/\s+/g, '-'),
            filename,
            bytes: uploadResult.bytes || 0,
            width: uploadResult.width || 0,
            height: uploadResult.height || 0,
        });

        return NextResponse.json(media, { status: 201 });
    } catch (error) {
        console.error('Media upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 500 }
        );
    }
}
