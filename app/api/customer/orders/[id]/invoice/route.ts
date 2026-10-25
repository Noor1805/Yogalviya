import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { buildInvoiceHtmlDocument, isInvoiceAvailable } from '@/lib/utils/invoice';
import { buildCustomerOrderOwnershipQuery } from '@/lib/utils/customer-order-access';
import { resolveOrderLineItemImages } from '@/lib/utils/order-line-item-images';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!isInvoiceAvailable(order)) {
      return NextResponse.json(
        { error: 'Invoice becomes available after delivery.' },
        { status: 400 }
      );
    }

    const hydratedOrder = order.toObject();
    hydratedOrder.lineItems = await resolveOrderLineItemImages(hydratedOrder.lineItems || []);

    const html = buildInvoiceHtmlDocument(hydratedOrder);
    const shouldDownload = request.nextUrl.searchParams.get('download') === '1';

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': shouldDownload
          ? `attachment; filename="INV-${order.orderNumber}.html"`
          : 'inline',
      },
    });
  } catch (error) {
    console.error('[Customer Invoice GET]', error);
    return NextResponse.json({ error: 'Failed to load invoice.' }, { status: 500 });
  }
}
