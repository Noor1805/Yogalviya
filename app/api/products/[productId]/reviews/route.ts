import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Review from '@/lib/models/Review';

const reviewPhotoSchema = z.object({
    publicId: z.string().optional(),
    url: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
});

const reviewPayloadSchema = z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().max(120).optional(),
    comment: z.string().trim().min(10).max(2000),
    photos: z.array(reviewPhotoSchema).max(4).optional(),
});

function serializeReview(review: {
    _id?: unknown;
    rating: number;
    title?: string;
    comment: string;
    photos?: Array<{ publicId?: string; url: string; thumbnailUrl?: string }>;
    customerName: string;
    verifiedPurchase: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}) {
    return {
        id: String(review._id ?? ''),
        rating: review.rating,
        title: review.title || '',
        comment: review.comment,
        photos: Array.isArray(review.photos) ? review.photos : [],
        customerName: review.customerName,
        verifiedPurchase: Boolean(review.verifiedPurchase),
        createdAt: new Date(review.createdAt).toISOString(),
        updatedAt: new Date(review.updatedAt).toISOString(),
    };
}

async function getEligibleOrder(productId: string, customerEmail: string) {
    return Order.findOne({
        customerEmail,
        status: { $in: ['delivered', 'completed'] },
        lineItems: { $elemMatch: { productId } },
        isDeleted: { $ne: true },
    })
        .sort({ deliveredAt: -1, completedAt: -1, createdAt: -1 })
        .lean();
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
    const session = await auth();
    const { productId } = await params;

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
        }

        await dbConnect();

        const reviews = await Review.find({
            productId,
            status: 'published',
        })
            .sort({ createdAt: -1 })
            .lean();

        const totalReviews = reviews.length;
        const averageRating = totalReviews
            ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1))
            : 0;
        const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => ({
            rating,
            count: reviews.filter((review) => review.rating === rating).length,
        }));

        let viewer = {
            isLoggedIn: false,
            hasPurchased: false,
            canReview: false,
            existingReview: null as ReturnType<typeof serializeReview> | null,
        };

        if (session?.user?.email && (session.user as { role?: string }).role === 'customer') {
            const customerEmail = session.user.email.toLowerCase().trim();
            const [eligibleOrder, existingReview] = await Promise.all([
                getEligibleOrder(productId, customerEmail),
                Review.findOne({ productId, customerEmail }).lean(),
            ]);

            viewer = {
                isLoggedIn: true,
                hasPurchased: Boolean(eligibleOrder),
                canReview: Boolean(eligibleOrder),
                existingReview: existingReview ? serializeReview(existingReview) : null,
            };
        }

        return NextResponse.json({
            reviews: reviews.map((review) => serializeReview(review)),
            summary: {
                totalReviews,
                averageRating,
                ratingBreakdown,
            },
            viewer,
        });
    } catch (error) {
        console.error('Fetch Reviews Error:', error);
        return NextResponse.json({ error: 'Failed to load reviews.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
    const session = await auth();
    if (!session || !session.user || (session.user as { role?: string }).role !== 'customer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await params;

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
        }

        await dbConnect();

        const body = await request.json();
        const validation = reviewPayloadSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid review payload.' }, { status: 400 });
        }

        const customerEmail = session.user.email?.toLowerCase().trim();
        if (!customerEmail) {
            return NextResponse.json({ error: 'Customer email is required.' }, { status: 400 });
        }

        const [product, eligibleOrder] = await Promise.all([
            Product.findOne({ _id: productId, isDeleted: { $ne: true } }).select('name slug').lean(),
            getEligibleOrder(productId, customerEmail),
        ]);

        if (!product) {
            return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
        }

        if (!eligibleOrder) {
            return NextResponse.json(
                { error: 'Only customers with a delivered purchase can review this product.' },
                { status: 403 }
            );
        }

        const review = await Review.findOneAndUpdate(
            { productId, customerEmail },
            {
                $set: {
                    productId,
                    productSlug: product.slug,
                    productName: product.name,
                    customerId: (session.user as { id?: string }).id,
                    customerName: session.user.name?.trim() || eligibleOrder.customerName,
                    customerEmail,
                    orderId: String(eligibleOrder._id),
                    orderNumber: eligibleOrder.orderNumber,
                    rating: validation.data.rating,
                    title: validation.data.title?.trim() || '',
                    comment: validation.data.comment.trim(),
                    photos: validation.data.photos ?? [],
                    verifiedPurchase: true,
                    status: 'published',
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
                runValidators: true,
            }
        ).lean();

        return NextResponse.json({
            success: true,
            review: review ? serializeReview(review) : null,
        });
    } catch (error) {
        console.error('Save Review Error:', error);
        return NextResponse.json({ error: 'Failed to save review.' }, { status: 500 });
    }
}
