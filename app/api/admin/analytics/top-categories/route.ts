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

        const topCategories = await Order.aggregate([
            { $match: { status: { $in: validStatuses } } },
            { $unwind: "$lineItems" },
            {
                // We need to lookup the product to get its category
                $lookup: {
                    from: "products", // The collection name in mongodb is typically lowercase plural
                    let: { prodIdStr: "$lineItems.productId" },
                    pipeline: [
                        { $match: { $expr: { $eq: [ { $toString: "$_id" }, "$$prodIdStr" ] } } },
                        { $project: { category: 1 } }
                    ],
                    as: "productData"
                }
            },
            { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$productData.category", // Group by the category string
                    totalQuantitySold: { $sum: "$lineItems.quantity" },
                    totalRevenueInCents: { 
                        $sum: { $multiply: ["$lineItems.quantity", "$lineItems.priceAtPurchase"] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: { $ifNull: ["$_id", "Uncategorized"] },
                    totalQuantitySold: 1,
                    totalRevenueInCents: 1
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 10 }
        ]);

        return NextResponse.json({
            success: true,
            data: topCategories
        });
    } catch (error) {
        console.error('Analytics Top Categories Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to load top categories' },
            { status: 500 }
        );
    }
}
