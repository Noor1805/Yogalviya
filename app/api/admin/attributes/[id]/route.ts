import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Attribute from '@/lib/models/Attribute';

// GET â€” Single attribute by ID
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    try {
        const attribute = await Attribute.findOne({ _id: id, isDeleted: { $ne: true } }).lean();
        if (!attribute) {
            return NextResponse.json({ error: 'Attribute not found' }, { status: 404 });
        }
        return NextResponse.json(attribute);
    } catch {
        return NextResponse.json({ error: 'Invalid attribute ID' }, { status: 400 });
    }
}
