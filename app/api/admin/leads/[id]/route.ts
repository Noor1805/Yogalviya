import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Enquiry from '@/lib/models/Enquiry';

// Define RouteParams type to properly handle Dynamic Route Parameters in Next.js App Router Next 15
interface RouteParams {
    params: Promise<{ id: string }>;
}

// DELETE â€” Delete a lead/enquiry
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    try {
        const lead = await Enquiry.findByIdAndDelete(id);
        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Lead deleted' });
    } catch (error) {
        console.error('Delete lead error:', error);
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
}
