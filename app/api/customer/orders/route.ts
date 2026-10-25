import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { buildCustomerOrderOwnershipQuery } from '@/lib/utils/customer-order-access';
import { resolveOrderLineItemImages } from '@/lib/utils/order-line-item-images';

export async function GET() {
    const session = await auth();
    const user = session?.user as { id?: string; email?: string | null; role?: string } | undefined;

    if (!session || user?.role !== 'customer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        const orders = await Order.find(buildCustomerOrderOwnershipQuery(user))
            .sort({ createdAt: -1 })
            .lean();

        const hydratedOrders = await Promise.all(
            orders.map(async (order) => ({
                ...order,
                lineItems: await resolveOrderLineItemImages(order.lineItems || []),
            }))
        );

        return NextResponse.json({ success: true, data: hydratedOrders });
    } catch (error: unknown) {
        console.error('Fetch Orders Error:', error);
        return NextResponse.json({ error: 'Failed to retrieve orders.' }, { status: 500 });
    }
}
