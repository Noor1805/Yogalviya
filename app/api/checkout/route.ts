import { NextRequest, NextResponse } from 'next/server';
import {
  buildCheckoutPricing,
  CheckoutValidationError,
  checkoutPayloadSchema,
} from '@/lib/checkout';
import { auth } from '@/lib/auth';
import { EmailService } from '@/lib/services/email.service';
import Order from '@/lib/models/Order';
import { OrderService, type CreateOrderInput } from '@/lib/services/order.service';
import { PaymentService } from '@/lib/services/payment.service';
import { normalizeCustomerOrderEmail } from '@/lib/utils/customer-order-access';

/**
 * POST /api/checkout
 *
 * Accepts the cart payload + customer info.
 * Creates a pending Order, then creates a Razorpay Order or handles COD.
 *
 * NOTE: We do NOT touch the Customer model here. Orders are linked
 * to customers by email. The Customer document is only created/managed
 * during auth (registration/login), never during checkout.
 */
export async function POST(req: NextRequest) {
  try {
    const requestUrl = new URL(req.url);
    const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const host = forwardedHost || req.headers.get('host') || requestUrl.host;
    const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const protocol = forwardedProto || requestUrl.protocol.replace(/:$/, '');
    const storefrontOrigin = `${protocol}://${host}`.replace(/\/$/, '');
    const body = await req.json();
    const session = await auth();
    const sessionUser = session?.user as
      | { id?: string; email?: string | null; role?: string }
      | undefined;
    const hasCustomerSession =
      sessionUser?.role === 'customer' &&
      typeof sessionUser.id === 'string' &&
      sessionUser.id.trim().length > 0;

    const payloadResult = checkoutPayloadSchema.safeParse(body);

    // ── Validation ──────────────────────────────────────────
    if (!payloadResult.success) {
      return NextResponse.json(
        { error: payloadResult.error.issues[0]?.message || 'Please review your checkout details.' },
        { status: 400 }
      );
    }

    const pricing = await buildCheckoutPricing(payloadResult.data);
    const {
      customerEmail,
      customerName,
      customerPhone,
      lineItems,
      totalInCents,
      currency,
      paymentGateway,
      shippingAddress,
      couponCode,
      couponDiscount,
    } = pricing as CreateOrderInput & { couponCode?: string; couponDiscount?: number };
    const linkedCustomerEmail =
      hasCustomerSession && sessionUser?.email
        ? normalizeCustomerOrderEmail(sessionUser.email)
        : customerEmail;
    const linkedCustomerId = hasCustomerSession ? sessionUser?.id?.trim() : undefined;

    // ── Create pending order ────────────────────────────────
    const order = await OrderService.create({
      customerId: linkedCustomerId,
      customerEmail: linkedCustomerEmail,
      customerName,
      customerPhone,
      storefrontOrigin,
      lineItems,
      totalInCents,
      currency,
      paymentGateway,
      shippingAddress,
      couponCode,
      couponDiscount: couponDiscount || 0,
    });

    const dispatchOrderReceivedEmail = async () => {
      try {
        const sent = await EmailService.sendOrderReceivedEmail(order);

        if (!sent) {
          console.warn(
            `[Checkout API] Failed to dispatch order received email for ${order.orderNumber}.`
          );
        }
      } catch (emailError) {
        console.error('[Checkout API] Order received email failed:', emailError);
      }
    };
    
    if (paymentGateway === 'cod') {
      await dispatchOrderReceivedEmail();

      return NextResponse.json({
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        gateway: 'cod',
        message: 'Order placed successfully with Cash on Delivery',
      });
    }

    const { razorpayOrderId } = await PaymentService.createRazorpayOrder({
      amountInPaise: totalInCents,
      currency: 'INR',
      orderId: String(order._id),
    });

    await Order.findByIdAndUpdate(order._id, { $set: { razorpayOrderId } });
    await dispatchOrderReceivedEmail();

    return NextResponse.json({
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      gateway: 'razorpay',
      razorpayOrderId,
      amountInPaise: totalInCents,
    });
  } catch (error: unknown) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('[Checkout API]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error during checkout' },
      { status: 500 }
    );
  }
}
