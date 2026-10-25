import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { OrderService } from '@/lib/services/order.service';

/**
 * GET /api/orders?email=customer@example.com
 * Returns all orders for a given customer email.
 *
 * GET /api/orders?id=<orderId>
 * Returns a single order by ID.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as { email?: string | null; role?: string } | undefined;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');
    const normalizedSessionEmail = user?.email?.toLowerCase().trim();
    const isAdmin = user?.role === 'admin';

    if (id) {
      const order = await OrderService.getById(id);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (!isAdmin && order.customerEmail !== normalizedSessionEmail) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(order);
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (!isAdmin && normalizedEmail !== normalizedSessionEmail) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const orders = await OrderService.getByCustomerEmail(normalizedEmail);
      return NextResponse.json(orders);
    }

    return NextResponse.json(
      { error: 'Provide either "email" or "id" query parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Orders API]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
