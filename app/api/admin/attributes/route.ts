import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Attribute from '@/lib/models/Attribute';
import { attributeSchema } from '@/lib/validations/attribute';

// GET â€” List all attributes
export async function GET(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    try {
        const filter: Record<string, unknown> = { isDeleted: { $ne: true } };

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        if (isActive !== null) {
            filter.isActive = isActive === 'true';
        }

        const attributes = await Attribute.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .lean();

        return NextResponse.json(attributes);
    } catch (error) {
        console.error('List attributes error:', error);
        return NextResponse.json({ error: 'Failed to fetch attributes' }, { status: 500 });
    }
}

// POST â€” Create attribute
export async function POST(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await request.json();
        const validation = attributeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload', details: validation.error.format() },
                { status: 400 }
            );
        }

        const validData = validation.data;

        // Auto-generate slug
        if (!validData.slug && validData.name) {
            validData.slug = validData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        // Check uniqueness
        const existing = await Attribute.findOne({
            slug: validData.slug,
            isDeleted: { $ne: true },
        });
        if (existing) {
            return NextResponse.json(
                { error: 'An attribute with this name already exists' },
                { status: 400 }
            );
        }

        const attribute = await Attribute.create(validData);
        return NextResponse.json(attribute, { status: 201 });
    } catch (error) {
        console.error('Create attribute error:', error);
        return NextResponse.json({ error: 'Failed to create attribute' }, { status: 500 });
    }
}

// PUT â€” Update attribute
export async function PUT(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await request.json();
        const { _id, ...updateData } = body;

        const validation = attributeSchema.partial().safeParse(updateData);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload', details: validation.error.format() },
                { status: 400 }
            );
        }

        const attribute = await Attribute.findByIdAndUpdate(
            _id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        if (!attribute) {
            return NextResponse.json({ error: 'Attribute not found' }, { status: 404 });
        }

        return NextResponse.json(attribute);
    } catch (error) {
        console.error('Update attribute error:', error);
        return NextResponse.json({ error: 'Failed to update attribute' }, { status: 500 });
    }
}

// DELETE â€” Soft delete attribute
export async function DELETE(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const { id } = await request.json();

        const attribute = await Attribute.findByIdAndUpdate(
            id,
            { $set: { isDeleted: true, deletedAt: new Date() } },
            { new: true }
        );

        if (!attribute) {
            return NextResponse.json({ error: 'Attribute not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete attribute error:', error);
        return NextResponse.json({ error: 'Failed to delete attribute' }, { status: 500 });
    }
}
