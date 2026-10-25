import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import Order from '@/lib/models/Order';

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const body = await request.json();
        const { code, orderAmount } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Coupon code is required' },
                { status: 400 }
            );
        }

        if (!orderAmount || orderAmount <= 0) {
            return NextResponse.json(
                { error: 'Invalid order amount' },
                { status: 400 }
            );
        }

        // Find coupon
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return NextResponse.json(
                { error: 'Invalid coupon code' },
                { status: 404 }
            );
        }

        // Check if active
        if (!coupon.isActive) {
            return NextResponse.json(
                { error: 'This coupon is no longer active' },
                { status: 400 }
            );
        }

        // Check date validity
        const now = new Date();
        if (now < coupon.startDate) {
            return NextResponse.json(
                { error: `This coupon will be available on ${coupon.startDate.toLocaleDateString()}` },
                { status: 400 }
            );
        }

        if (now > coupon.endDate) {
            return NextResponse.json(
                { error: 'This coupon has expired' },
                { status: 400 }
            );
        }

        // Check usage limits
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json(
                { error: 'This coupon has reached its maximum usage limit' },
                { status: 400 }
            );
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            return NextResponse.json(
                { error: `Minimum order amount is ₹${coupon.minOrderAmount}` },
                { status: 400 }
            );
        }

        // Check category/product restrictions
        if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
            // This will need to be validated with cart items in a more complex implementation
            // For now, we assume it applies to all if no cart items provided
        }

        // Calculate discount
        let discountAmount = 0;

        if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;

            // Apply max discount cap if set
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else {
            // Fixed discount
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed order amount
        discountAmount = Math.min(discountAmount, orderAmount);

        return NextResponse.json({
            valid: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: Math.round(discountAmount * 100) / 100,
            description: coupon.description,
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        return NextResponse.json(
            { error: 'Failed to validate coupon' },
            { status: 500 }
        );
    }
}

// Record coupon usage when order is placed
export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Coupon code is required' },
                { status: 400 }
            );
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return NextResponse.json(
                { error: 'Coupon not found' },
                { status: 404 }
            );
        }

        // Check per-customer limit
        if (coupon.maxUsesPerCustomer) {
            const orderCount = await Order.countDocuments({
                customerEmail: session.user?.email,
                couponCode: coupon.code,
            });

            if (orderCount >= coupon.maxUsesPerCustomer) {
                return NextResponse.json(
                    { error: `You can only use this coupon ${coupon.maxUsesPerCustomer} time(s)` },
                    { status: 400 }
                );
            }
        }

        // Increment usage count
        coupon.usedCount += 1;
        await coupon.save();

        return NextResponse.json({
            success: true,
            usedCount: coupon.usedCount,
        });
    } catch (error) {
        console.error('Record coupon usage error:', error);
        return NextResponse.json(
            { error: 'Failed to record coupon usage' },
            { status: 500 }
        );
    }
}
