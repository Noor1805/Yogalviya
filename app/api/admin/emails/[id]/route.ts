import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import EmailTemplate from '@/lib/models/EmailTemplate';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        
        await dbConnect();
        const updated = await EmailTemplate.findByIdAndUpdate(
            id,
            {
                $set: {
                    subject: body.subject,
                    bodyHtml: body.bodyHtml,
                    isActive: body.isActive
                }
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, template: updated });
    } catch {
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}
