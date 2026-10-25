import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// ─── Stripe ──────────────────────────────────────────────────
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// ─── Razorpay ────────────────────────────────────────────────
const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      })
    : null;

export class PaymentService {
  // ═══════════════════════════════════════════════════════════
  //  STRIPE
  // ═══════════════════════════════════════════════════════════

  /**
   * Create a Stripe PaymentIntent.
   */
  static async createStripeIntent(params: {
    amountInCents: number;
    currency: string;
    orderId: string;
    customerEmail: string;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    if (!stripe) throw new Error('Stripe is not configured');

    const intent = await stripe.paymentIntents.create({
      amount: params.amountInCents,
      currency: params.currency.toLowerCase(),
      metadata: { orderId: params.orderId },
      receipt_email: params.customerEmail,
    });

    return {
      clientSecret: intent.client_secret!,
      paymentIntentId: intent.id,
    };
  }

  /**
   * Validate Stripe webhook signature.
   * Returns the verified event or throws.
   */
  static verifyStripeWebhook(rawBody: string | Buffer, signature: string): Stripe.Event {
    if (!stripe) throw new Error('Stripe is not configured');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');

    return stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  }

  // ═══════════════════════════════════════════════════════════
  //  RAZORPAY
  // ═══════════════════════════════════════════════════════════

  /**
   * Create a Razorpay Order.
   */
  static async createRazorpayOrder(params: {
    amountInPaise: number;
    currency: string;
    orderId: string;
  }): Promise<{ razorpayOrderId: string }> {
    if (!razorpay) throw new Error('Razorpay is not configured');

    const order = await razorpay.orders.create({
      amount: params.amountInPaise,
      currency: params.currency,
      receipt: params.orderId,
      notes: { orderId: params.orderId },
    });

    return { razorpayOrderId: order.id };
  }

  /**
   * Validate Razorpay webhook signature using HMAC SHA256.
   * Returns true if valid.
   */
  static verifyRazorpaySignature(
    rawBody: string,
    signature: string
  ): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not set');

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedSignatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
  }

  static verifyRazorpayCheckoutSignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    const secret = process.env.RAZORPAY_SECRET;
    if (!secret) throw new Error('RAZORPAY_SECRET is not set');

    const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const signatureBuffer = Buffer.from(params.razorpaySignature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedSignatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
  }

  // ═══════════════════════════════════════════════════════════
  //  REFUNDS
  // ═══════════════════════════════════════════════════════════

  static async fetchRazorpayPayment(paymentId: string) {
    if (!razorpay) throw new Error('Razorpay is not configured');

    return razorpay.payments.fetch(paymentId);
  }

  static async fetchRazorpayOrderPayments(orderId: string) {
    if (!razorpay) throw new Error('Razorpay is not configured');

    return razorpay.orders.fetchPayments(orderId);
  }

  static async captureRazorpayPayment(
    paymentId: string,
    amountInPaise: number,
    currency: string
  ) {
    if (!razorpay) throw new Error('Razorpay is not configured');

    const paymentsApi = razorpay.payments as unknown as {
      capture: (
        id: string,
        amount: number,
        currency: string
      ) => Promise<{
        id: string;
        status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
        order_id?: string;
      }>;
    };

    return paymentsApi.capture(paymentId, amountInPaise, currency);
  }

  /**
   * Refund a Stripe PaymentIntent (full or partial).
   * Returns the refund ID.
   */
  static async refundStripe(paymentIntentId: string, amountInCents: number): Promise<string> {
    if (!stripe) throw new Error('Stripe is not configured');

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountInCents,
    });

    return refund.id;
  }

  /**
   * Refund a Razorpay payment (full or partial).
   * Returns the refund ID.
   */
  static async refundRazorpay(paymentId: string, amountInPaise: number): Promise<string> {
    if (!razorpay) throw new Error('Razorpay is not configured');

    const paymentsApi = razorpay.payments as unknown as {
      refund: (id: string, payload: { amount: number }) => Promise<{ id: string }>;
    };

    const refund = await paymentsApi.refund(paymentId, {
      amount: amountInPaise,
    });

    return refund.id;
  }
}
