import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { OrderService } from '@/lib/services/order.service';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';

/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay sends a JSON body + x-razorpay-signature header.
 * We verify the HMAC signature, then idempotently mark the order as paid.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-razorpay-signature header' },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    const isValid = PaymentService.verifyRazorpaySignature(rawBody, signature);
    if (!isValid) {
      console.error('[Razorpay Webhook] Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 3. Parse the verified body
    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    console.log('[Razorpay Webhook] Received event', { eventType });

    if (
      eventType === 'payment.authorized' ||
      eventType === 'payment.captured' ||
      eventType === 'order.paid'
    ) {
      const payment = payload.payload?.payment?.entity;
      const razorpayOrder = payload.payload?.order?.entity;

      if (!payment) {
        return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 });
      }

      let orderId =
        payment.notes?.orderId ||
        razorpayOrder?.notes?.orderId ||
        razorpayOrder?.receipt ||
        payment.receipt;
      const razorpayPaymentId = payment.id;
      const razorpayOrderId = razorpayOrder?.id || payment.order_id;

      let normalizedPaymentId = razorpayPaymentId;

      if (eventType === 'payment.authorized') {
        try {
          const amountInPaise = Number(payment.amount);
          const currency = String(payment.currency || 'INR');

          if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
            throw new Error('Unable to capture authorized Razorpay payment amount.');
          }

          const capturedPayment = await PaymentService.captureRazorpayPayment(
            payment.id,
            amountInPaise,
            currency
          );
          normalizedPaymentId = capturedPayment.id || razorpayPaymentId;
        } catch (captureError) {
          console.error('[Razorpay Webhook] Failed to capture authorized payment:', captureError);
          return NextResponse.json({ error: 'Failed to capture authorized payment' }, { status: 500 });
        }
      }

      if (!orderId && razorpayOrderId) {
        await dbConnect();
        const order = await Order.findOne({ razorpayOrderId }).select('_id orderNumber').lean();
        if (order?._id) {
          orderId = String(order._id);
        }
      }

      if (!orderId) {
        console.error('[Razorpay Webhook] No orderId found in payment');
        return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
      }

      // Idempotent processing
      const order = await OrderService.markAsPaid(
        orderId,
        normalizedPaymentId,
        `razorpay_${normalizedPaymentId}` // idempotency key
      );

      if (order) {
        console.log(`[Razorpay Webhook] Order ${order.orderNumber} marked as PAID`);
      } else {
        console.log(`[Razorpay Webhook] Idempotent skip for orderId: ${orderId}`);
      }
    }

    if (eventType === 'refund.processed') {
      const refund = payload.payload?.refund?.entity;
      if (!refund) {
        return NextResponse.json({ error: 'Invalid refund payload structure' }, { status: 400 });
      }

      await dbConnect();
      const order = await Order.findOne({
        $or: [
          { razorpayPaymentId: refund.payment_id },
          { razorpayOrderId: refund.order_id },
        ],
      })
        .select('_id orderNumber')
        .lean();

      if (!order?._id) {
        console.warn('[Razorpay Webhook] Refund received but no matching order found');
      } else {
        const updated = await OrderService.syncGatewayRefund({
          orderId: String(order._id),
          gatewayRefundId: refund.id,
          amountInCents: typeof refund.amount === 'number' ? refund.amount : undefined,
          reason: refund.notes?.reason || 'Refund processed by Razorpay.',
        });

        if (updated) {
          console.log(`[Razorpay Webhook] Order ${updated.orderNumber} synced as REFUNDED`);
        }
      }
    }

    // Always return 200
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Razorpay Webhook] Unhandled error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
