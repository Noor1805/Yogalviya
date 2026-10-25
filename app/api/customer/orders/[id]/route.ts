import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { buildCustomerOrderOwnershipQuery } from '@/lib/utils/customer-order-access';
import { resolveOrderLineItemImages } from '@/lib/utils/order-line-item-images';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const user = session?.user as { id?: string; email?: string | null; role?: string } | undefined;
    const userRole = user?.role;

    if (!session || !session.user || userRole !== 'customer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = await params;

        const order = await Order.findOne({
            _id: id,
            ...buildCustomerOrderOwnershipQuery(user || {}),
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const hydratedOrder = order.toObject();
        hydratedOrder.lineItems = await resolveOrderLineItemImages(hydratedOrder.lineItems || []);

        return NextResponse.json({ success: true, data: hydratedOrder });
    } catch (error) {
        console.error('Fetch Order Error:', error);
        return NextResponse.json({ error: 'Failed to retrieve order.' }, { status: 500 });
    }
}
