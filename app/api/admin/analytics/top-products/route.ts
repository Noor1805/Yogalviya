import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { getVerifiedAdminSession } from '@/lib/admin-session';

export async function GET() {
    try {
        const session = await getVerifiedAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Orders that matter for sales volume
        const validStatuses = ['paid', 'processing', 'shipped', 'delivered', 'completed'];

        const topProducts = await Order.aggregate([
            { $match: { status: { $in: validStatuses } } },
            { $unwind: "$lineItems" },
            {
                $group: {
                    _id: "$lineItems.productId",
                    name: { $first: "$lineItems.name" },
                    sku: { $first: "$lineItems.sku" },
                    image: { $first: "$lineItems.image" },
                    totalQuantitySold: { $sum: "$lineItems.quantity" },
                    totalRevenueInCents: { 
                        $sum: { $multiply: ["$lineItems.quantity", "$lineItems.priceAtPurchase"] }
                    }
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 10 }
        ]);

        return NextResponse.json({
            success: true,
            data: topProducts
        });
    } catch (error) {
        console.error('Analytics Top Products Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to load top products' },
            { status: 500 }
        );
    }
}
