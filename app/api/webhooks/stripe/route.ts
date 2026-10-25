import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { OrderService } from '@/lib/services/order.service';

/**
 * POST /api/webhooks/stripe
 *
 * Stripe sends raw body + signature header.
 * We verify the signature, then idempotently mark the order as paid.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body (Stripe requires the raw string for signature verification)
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    // 2. Verify webhook signature — throws if tampered
    let event;
    try {
      event = PaymentService.verifyStripeWebhook(rawBody, signature);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 3. Handle payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (!orderId) {
        console.error('[Stripe Webhook] No orderId in metadata');
        return NextResponse.json({ error: 'Missing orderId metadata' }, { status: 400 });
      }

      // Idempotent: if this webhook fires twice, the second call is a no-op
      const order = await OrderService.markAsPaid(
        orderId,
        paymentIntent.id,
        `stripe_${paymentIntent.id}` // idempotency key
      );

      if (order) {
        console.log(`[Stripe Webhook] Order ${order.orderNumber} marked as PAID`);
      } else {
        console.log(`[Stripe Webhook] Idempotent skip for orderId: ${orderId}`);
      }
    }

    // Always return 200 to Stripe so it doesn't retry
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Stripe Webhook] Unhandled error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
