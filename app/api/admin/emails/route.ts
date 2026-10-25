import { NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import EmailTemplate from '@/lib/models/EmailTemplate';
import { EmailService } from '@/lib/services/email.service';

export async function GET() {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        let templates = await EmailTemplate.find().sort({ type: 1 }).lean();
        
        // Auto-seed if empty
        if (templates.length === 0) {
            await EmailService.seedDefaultTemplates();
            templates = await EmailTemplate.find().sort({ type: 1 }).lean();
        }

        return NextResponse.json({ success: true, templates });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 });
    }
}
