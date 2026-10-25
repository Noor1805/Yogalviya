import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Enquiry from '@/lib/models/Enquiry';

// GET â€” List all leads/enquiries
export async function GET(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const type = searchParams.get('type') || '';

    const filter: Record<string, unknown> = {};
    if (type) {
        filter.type = type;
    }

    const [leads, total] = await Promise.all([
        Enquiry.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Enquiry.countDocuments(filter),
    ]);

    return NextResponse.json({
        leads,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
}
