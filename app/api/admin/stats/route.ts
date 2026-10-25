import { NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';

// GET â€” Dashboard stats
export async function GET() {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const [products, orders, customers, revenueAgg] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Customer.countDocuments(),
        Order.aggregate([
            { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$totalInCents' } } },
        ]),
    ]);

    const revenue = revenueAgg[0]?.total ? Math.round(revenueAgg[0].total / 100) : 0;

    return NextResponse.json({
        products,
        orders,
        customers,
        revenue,
    });
}
