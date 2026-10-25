import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Contact from '@/lib/models/Contact';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Single contact by ID (admin only)
export async function GET(_request: NextRequest, { params }: RouteParams) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    try {
        const newlyReadContact = await Contact.findOneAndUpdate(
            { _id: id, status: 'new' },
            { status: 'read' },
            { new: true }
        ).lean();

        if (newlyReadContact) {
            return NextResponse.json(newlyReadContact);
        }

        const contact = await Contact.findById(id).lean();
        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json(contact);
    } catch (error) {
        console.error('Get contact error:', error);
        return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }
}

// PATCH - Update contact status (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    try {
        const body = await request.json();
        const { status } = body;

        if (!['new', 'read', 'replied', 'archived'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json(contact);
    } catch (error) {
        console.error('Update contact error:', error);
        return NextResponse.json(
            { error: 'Failed to update contact' },
            { status: 500 }
        );
    }
}

// DELETE - Delete contact (admin only)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    try {
        const contact = await Contact.findByIdAndDelete(id);
        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        console.error('Delete contact error:', error);
        return NextResponse.json(
            { error: 'Failed to delete contact' },
            { status: 500 }
        );
    }
}
