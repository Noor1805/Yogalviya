import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    order: z.number().int().optional().default(0),
});

// GET â€” List all categories
export async function GET() {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const categories = await Category.find().sort({ order: 1 }).lean();
    return NextResponse.json(categories);
}

// POST â€” Create category
export async function POST(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await request.json();

        // Zod Validation
        const validation = categorySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload data', details: validation.error.format() },
                { status: 400 }
            );
        }

        const validData = validation.data;

        if (!validData.slug && validData.name) {
            validData.slug = validData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const existing = await Category.findOne({ slug: validData.slug });
        if (existing) {
            return NextResponse.json(
                { error: 'A category with this slug already exists' },
                { status: 400 }
            );
        }

        const category = await Category.create(validData);

        // Instantly refresh live website caches
        revalidatePath('/products');
        revalidatePath('/');

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}

// PUT â€” Update category
export async function PUT(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await request.json();
        const { _id, ...updateData } = body;

        // Zod Validation (Partial for updates)
        const validation = categorySchema.partial().safeParse(updateData);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload data', details: validation.error.format() },
                { status: 400 }
            );
        }

        const category = await Category.findByIdAndUpdate(
            _id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Instantly refresh live website caches
        revalidatePath('/products');
        revalidatePath('/');
        if (category.slug) {
            revalidatePath(`/products/${category.slug}`);
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// DELETE â€” Delete category (only if empty)
export async function DELETE(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const { id } = await request.json();

        const productCount = await Product.countDocuments({ categorySlug: id });
        if (productCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete: ${productCount} products exist in this category. Move or delete them first.` },
                { status: 400 }
            );
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Instantly refresh live website caches
        revalidatePath('/products');
        revalidatePath('/');
        if (category.slug) {
            revalidatePath(`/products/${category.slug}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete category error:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}
