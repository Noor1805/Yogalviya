import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { OrderService } from '@/lib/services/order.service';
import { PaymentService } from '@/lib/services/payment.service';
import { checkRateLimit, getClientIp } from '@/lib/security';

/**
 * POST /api/customer/orders/update-payment
 * 
 * Updates an order with the Razorpay payment ID after successful payment.
 * This ensures the payment ID is saved even without webhooks.
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = checkRateLimit({
      scope: 'payment-confirmation',
      key: getClientIp(req),
      limit: 15,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many payment confirmation attempts.' },
        { status: 429 }
      );
    }

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json();

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing payment confirmation fields' },
        { status: 400 }
      );
    }

    const isValidSignature = PaymentService.verifyRazorpayCheckoutSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 401 }
      );
    }

    const gatewayPayment = await PaymentService.fetchRazorpayPayment(razorpayPaymentId);
    let gatewayPaymentStatus = gatewayPayment.status;
    console.log('[Update Payment API] Gateway payment fetched', {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      gatewayPaymentStatus,
    });

    if (gatewayPayment.order_id !== razorpayOrderId) {
      return NextResponse.json(
        { error: 'Gateway payment does not match this Razorpay order' },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (existingOrder.paymentGateway !== 'razorpay') {
      return NextResponse.json(
        { error: 'This order is not awaiting Razorpay confirmation' },
        { status: 400 }
      );
    }

    if (existingOrder.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json(
        { error: 'Payment does not match this order' },
        { status: 400 }
      );
    }

    if (gatewayPaymentStatus === 'authorized') {
      const amountInPaise = Number(gatewayPayment.amount);
      const currency = String(gatewayPayment.currency || 'INR');

      if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
        return NextResponse.json(
          { error: 'Unable to capture authorized Razorpay payment amount.' },
          { status: 500 }
        );
      }

      const capturedPayment = await PaymentService.captureRazorpayPayment(
        razorpayPaymentId,
        amountInPaise,
        currency
      );

      gatewayPaymentStatus = capturedPayment.status;
      console.log('[Update Payment API] Authorized payment captured', {
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        gatewayPaymentStatus,
      });
    }

    if (gatewayPaymentStatus !== 'captured') {
      return NextResponse.json({
        success: true,
        pending: true,
        paymentStatus: gatewayPaymentStatus,
        orderId: String(existingOrder._id),
        orderNumber: existingOrder.orderNumber,
      });
    }

    let order = existingOrder;

    if (existingOrder.paymentStatus !== 'paid') {
      const updatedOrder = await OrderService.markAsPaid(
        String(existingOrder._id),
        razorpayPaymentId,
        `razorpay_${razorpayPaymentId}`
      );

      order =
        (await Order.findById(updatedOrder?._id || existingOrder._id)) ||
        existingOrder;
    }

    console.log(
      `[Update Payment] Order ${order.orderNumber} confirmed with payment ID: ${razorpayPaymentId}`
    );

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
      orderId: String(order._id),
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update payment';
    console.error('[Update Payment API]', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
