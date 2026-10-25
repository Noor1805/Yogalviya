import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { OrderService } from '@/lib/services/order.service';
import { PaymentService } from '@/lib/services/payment.service';

const buildCheckoutRedirect = (req: NextRequest, path: string, params?: Record<string, string>) => {
  const url = new URL(path, req.url);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  return NextResponse.redirect(url, { status: 303 });
};

export async function POST(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId');

    if (!orderId) {
      return buildCheckoutRedirect(req, '/checkout', {
        payment_error: 'Missing order reference in Razorpay callback.',
      });
    }

    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);

    const razorpayPaymentId = params.get('razorpay_payment_id');
    const razorpayOrderId = params.get('razorpay_order_id');
    const razorpaySignature = params.get('razorpay_signature');
    const failureDescription =
      params.get('error[description]') ||
      params.get('error_description') ||
      params.get('error') ||
      params.get('reason');

    if (failureDescription) {
      return buildCheckoutRedirect(req, '/checkout', {
        payment_error: failureDescription,
      });
    }

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return buildCheckoutRedirect(req, '/checkout', {
        payment_error: 'Razorpay did not return all payment confirmation fields.',
      });
    }

    const isValidSignature = PaymentService.verifyRazorpayCheckoutSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      return buildCheckoutRedirect(req, '/checkout', {
        payment_error: 'Unable to verify Razorpay payment signature.',
      });
    }

    const gatewayPayment = await PaymentService.fetchRazorpayPayment(razorpayPaymentId);
    let gatewayPaymentStatus = gatewayPayment.status;
    console.log('[Razorpay Callback] Gateway payment fetched', {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      gatewayPaymentStatus,
    });

    if (gatewayPayment.order_id !== razorpayOrderId) {
      return buildCheckoutRedirect(req, '/checkout', {
        payment_error: 'Razorpay payment does not match the gateway order reference.',
      });
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      return buildCheckoutRedirect(req, '/checkout', {
        payment_error: 'Order not found while finalizing Razorpay payment.',
      });
    }

    if (order.paymentGateway !== 'razorpay') {
      return buildCheckoutRedirect(req, '/checkout', {
        payment_error: 'This order is not linked to Razorpay.',
      });
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return buildCheckoutRedirect(req, '/checkout', {
        payment_error: 'Razorpay payment does not match the order reference.',
      });
    }

    if (gatewayPaymentStatus === 'authorized') {
      const amountInPaise = Number(gatewayPayment.amount);
      const currency = String(gatewayPayment.currency || 'INR');

      if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
        return buildCheckoutRedirect(req, '/checkout', {
          payment_error: 'Unable to capture authorized Razorpay payment amount.',
        });
      }

      const capturedPayment = await PaymentService.captureRazorpayPayment(
        razorpayPaymentId,
        amountInPaise,
        currency
      );

      gatewayPaymentStatus = capturedPayment.status;
      console.log('[Razorpay Callback] Authorized payment captured', {
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        gatewayPaymentStatus,
      });
    }

    if (gatewayPaymentStatus !== 'captured') {
      return buildCheckoutRedirect(req, '/checkout', {
        payment_error: `Razorpay payment is ${gatewayPaymentStatus}.`,
      });
    }

    let finalizedOrderNumber = order.orderNumber;

    if (order.paymentStatus !== 'paid') {
      const updatedOrder = await OrderService.markAsPaid(
        String(order._id),
        razorpayPaymentId,
        `razorpay_${razorpayPaymentId}`
      );

      if (updatedOrder) {
        finalizedOrderNumber = updatedOrder.orderNumber;
      } else {
        const freshOrder = await Order.findById(order._id);
        if (freshOrder) {
          finalizedOrderNumber = freshOrder.orderNumber;
        }
      }
    }

    return buildCheckoutRedirect(req, '/checkout/success', {
      orderNumber: finalizedOrderNumber,
      gateway: 'razorpay',
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.error('[Razorpay Callback]', error);
    return buildCheckoutRedirect(req, '/checkout', {
      payment_error:
        error instanceof Error
          ? error.message
          : 'Failed to finalize Razorpay payment.',
    });
  }
}
