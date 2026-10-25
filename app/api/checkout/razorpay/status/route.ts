import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { PaymentService } from '@/lib/services/payment.service';
import { OrderService } from '@/lib/services/order.service';

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId');
    const razorpayOrderId = req.nextUrl.searchParams.get('razorpayOrderId');

    if (!orderId || !razorpayOrderId) {
      return NextResponse.json(
        { error: 'Missing order status lookup fields.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.findOne({
      _id: orderId,
      paymentGateway: 'razorpay',
      razorpayOrderId,
    }).select('orderNumber status paymentStatus razorpayPaymentId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.paymentStatus !== 'paid') {
      const paymentCollection = await PaymentService.fetchRazorpayOrderPayments(razorpayOrderId);
      console.log('[Razorpay Status] Checked gateway payments', {
        orderId,
        razorpayOrderId,
        localPaymentStatus: order.paymentStatus,
        gatewayStatuses: paymentCollection.items.map((payment) => payment.status),
      });
      let settledPayment = paymentCollection.items.find(
        (payment) => payment.status === 'captured'
      );

      if (!settledPayment) {
        const authorizedPayment = paymentCollection.items.find(
          (payment) => payment.status === 'authorized'
        );

        if (authorizedPayment) {
          try {
            const amountInPaise = Number(authorizedPayment.amount);
            const currency = String(authorizedPayment.currency || 'INR');

            if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
              throw new Error('Unable to capture authorized Razorpay payment amount.');
            }

            const capturedPayment = await PaymentService.captureRazorpayPayment(
              authorizedPayment.id,
              amountInPaise,
              currency
            );

            settledPayment = {
              ...authorizedPayment,
              status: capturedPayment.status,
            };
          } catch (captureError) {
            console.error('[Razorpay Status] Failed to capture authorized payment:', captureError);
          }
        }
      }

      if (settledPayment && ['captured', 'authorized'].includes(settledPayment.status)) {
        console.log('[Razorpay Status] Finalizing paid order from gateway state', {
          orderId,
          razorpayOrderId,
          paymentId: settledPayment.id,
          paymentStatus: settledPayment.status,
        });
        await OrderService.markAsPaid(
          String(order._id),
          settledPayment.id,
          `razorpay_${settledPayment.id}`
        );

        const refreshedOrder = await Order.findById(order._id)
          .select('orderNumber status paymentStatus razorpayPaymentId')
          .lean();

        return NextResponse.json({
          orderNumber: refreshedOrder?.orderNumber || order.orderNumber,
          status: refreshedOrder?.status || 'paid',
          paymentStatus: refreshedOrder?.paymentStatus || 'paid',
          paymentId: refreshedOrder?.razorpayPaymentId || settledPayment.id,
        });
      }
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentId: order.razorpayPaymentId || null,
    });
  } catch (error) {
    console.error('[Razorpay Status]', error);
    return NextResponse.json(
      { error: 'Failed to fetch Razorpay order status.' },
      { status: 500 }
    );
  }
}
