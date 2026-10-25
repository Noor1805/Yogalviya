import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import { z } from 'zod';

const couponSchema = z.object({
    code: z.string().min(1, 'Code is required').transform(val => val.toUpperCase()),
    description: z.string().optional().default(''),
    discountType: z.enum(['percentage', 'fixed'], {
        message: 'Discount type must be either "percentage" or "fixed"',
    }),
    discountValue: z.number().min(0, 'Discount value must be 0 or greater'),
    maxUses: z.number().min(0).nullable().optional(),
    maxUsesPerCustomer: z.number().min(1, 'Max uses per customer must be at least 1').optional().default(1),
    minOrderAmount: z.number().min(0, 'Min order amount must be 0 or greater').optional().default(0),
    maxDiscountAmount: z.number().min(0).nullable().optional(),
    applicableCategories: z.array(z.string()).optional().default([]),
    applicableProducts: z.array(z.string()).optional().default([]),
    startDate: z.string().refine(val => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, 'Invalid start date'),
    endDate: z.string().refine(val => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, 'Invalid end date'),
    isActive: z.boolean().optional().default(true),
}).refine((data) => {
    // Only validate dates if both are present
    if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (end <= start) {
            return {
                success: false,
                error: {
                    issues: [{ path: ['endDate'], message: 'End date must be after start date' }],
                },
            };
        }
    }
    return { success: true };
}, { message: 'Date validation failed' });

// Separate schema for updates - all fields optional, no refinements
const couponUpdateSchema = z.object({
    code: z.string().min(1, 'Code is required').transform(val => val.toUpperCase()).optional(),
    description: z.string().optional(),
    discountType: z.enum(['percentage', 'fixed']).optional(),
    discountValue: z.number().min(0).optional(),
    maxUses: z.number().min(0).nullable().optional(),
    maxUsesPerCustomer: z.number().min(1).optional(),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).nullable().optional(),
    applicableCategories: z.array(z.string()).optional(),
    applicableProducts: z.array(z.string()).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().optional(),
});

// GET â€” List all coupons
export async function GET() {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(coupons);
}

// POST â€” Create coupon
export async function POST(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await request.json();

        // Zod Validation
        const validation = couponSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid coupon data', details: validation.error.format() },
                { status: 400 }
            );
        }

        const validData = validation.data;

        // Check for duplicate code
        const existing = await Coupon.findOne({ code: validData.code });
        if (existing) {
            return NextResponse.json(
                { error: 'A coupon with this code already exists' },
                { status: 400 }
            );
        }

        const coupon = await Coupon.create(validData);

        return NextResponse.json(coupon, { status: 201 });
    } catch (error) {
        console.error('Create coupon error:', error);
        return NextResponse.json(
            { error: 'Failed to create coupon' },
            { status: 500 }
        );
    }
}

// PUT â€” Update coupon
export async function PUT(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await request.json();
        const { _id, ...updateData } = body;

        // Use separate update schema (all fields optional)
        const validation = couponUpdateSchema.safeParse(updateData);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid coupon data', details: validation.error.format() },
                { status: 400 }
            );
        }

        // Transform code to uppercase if present
        const dataToUpdate = { ...validation.data };
        if (dataToUpdate.code) {
            dataToUpdate.code = dataToUpdate.code.toUpperCase();
        }

        // Validate dates if both are provided
        if (dataToUpdate.startDate && dataToUpdate.endDate) {
            const start = new Date(dataToUpdate.startDate);
            const end = new Date(dataToUpdate.endDate);
            if (end <= start) {
                return NextResponse.json(
                    { error: 'End date must be after start date' },
                    { status: 400 }
                );
            }
        }

        const coupon = await Coupon.findByIdAndUpdate(
            _id,
            { $set: dataToUpdate },
            { new: true, runValidators: true }
        );

        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json(coupon);
    } catch (error) {
        console.error('Update coupon error:', error);
        return NextResponse.json(
            { error: 'Failed to update coupon' },
            { status: 500 }
        );
    }
}

// DELETE â€” Delete coupon
export async function DELETE(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const { id } = await request.json();

        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete coupon error:', error);
        return NextResponse.json(
            { error: 'Failed to delete coupon' },
            { status: 500 }
        );
    }
}
