import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cloudinaryService } from '@/lib/services/cloudinary.service';

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session || !session.user || (session.user as { role?: string }).role !== 'customer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        if (!validImageTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF' },
                { status: 400 }
            );
        }

        if (file.size > 8 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 8MB.' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;
        const result = await cloudinaryService.uploadFile(base64, 'customer-reviews');

        return NextResponse.json(result);
    } catch (error) {
        console.error('Review Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
