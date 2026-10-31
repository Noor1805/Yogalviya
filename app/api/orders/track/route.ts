import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { checkRateLimit, getClientIp } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit({
      scope: 'order-track',
      key: getClientIp(req),
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { orderNumber, email } = body || {};

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email address are required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const cleanOrderNumber = String(orderNumber).trim().replace(/^#/, '');
    const cleanEmail = String(email).trim().toLowerCase();

    const order = await Order.findOne({
      orderNumber: { $regex: new RegExp(`^#?${cleanOrderNumber}$`, 'i') },
      customerEmail: cleanEmail,
    }).lean() as any;

    if (!order) {
      return NextResponse.json(
        { error: 'We couldn’t find an order with those details. Please check them and try again.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      trackingNumber: order.trackingNumber || null,
      trackingCarrier: order.trackingCarrier || null,
      items: (order.lineItems || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error('[Track Order API]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
