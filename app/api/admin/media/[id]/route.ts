import { NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Media from '@/lib/models/Media';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getVerifiedAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        await dbConnect();
        
        const media = await Media.findById(id);
        if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

        // We skip Cloudinary hard delete for now (Trash Bin handles permanent delete later)
        await media.updateOne({ isDeleted: true, deletedAt: new Date() });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Media delete error:', error);
        return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
    }
}
