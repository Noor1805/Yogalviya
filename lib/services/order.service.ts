import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order, { type IOrder, type OrderStatus } from '@/lib/models/Order';
import { ProductService } from './product.service';
import { PaymentService } from './payment.service';
import { EmailService } from './email.service';
import { eventBus } from '@/lib/events/emitter';
import { normalizeCustomerOrderEmail } from '@/lib/utils/customer-order-access';

// Ensure listeners are registered
import '@/lib/events/listeners';

// ─── Valid status transitions (state machine) ────────────────
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'processing', 'packed', 'shipped', 'cancel_requested', 'cancelled'],
  paid: ['processing', 'packed', 'shipped', 'cancel_requested', 'refund_pending', 'refunded'],
  processing: ['packed', 'shipped', 'cancel_requested', 'refund_pending', 'refunded'],
  packed: ['shipped', 'cancel_requested', 'refund_pending', 'refunded'],
  shipped: ['out_for_delivery', 'delivered', 'refund_pending', 'refunded'],
  out_for_delivery: ['delivered', 'delivery_failed'],
  delivery_failed: ['out_for_delivery', 'delivered', 'refund_pending'],
  delivered: ['completed', 'return_requested', 'replace_requested', 'refund_pending', 'refunded'],
  completed: ['return_requested', 'replace_requested', 'refund_pending', 'refunded'],
  cancel_requested: ['cancel_approved', 'cancelled'],
  cancel_approved: ['cancelled', 'refund_pending'],
  refund_pending: ['refunded'],
  return_requested: ['return_approved', 'return_qc_failed'],
  return_approved: ['return_pickup_scheduled', 'return_picked_up', 'return_received'],
  return_pickup_scheduled: ['return_picked_up'],
  return_picked_up: ['return_received'],
  return_received: ['return_qc_passed', 'return_qc_failed'],
  return_qc_passed: ['returned', 'refund_pending', 'refunded'],
  return_qc_failed: ['delivered'],
  returned: ['refund_pending', 'refunded'],
  replace_requested: ['replace_approved'],
  replace_approved: ['replacement_processing', 'replacement_shipped'],
  replacement_processing: ['replacement_shipped'],
  replacement_shipped: ['replaced'],
  replaced: [],
  cancelled: [],
  refunded: [],
};

export interface CreateOrderInput {
  customerId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  storefrontOrigin?: string;
  lineItems: {
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    priceAtPurchase: number;
    image?: string;
  }[];
  totalInCents: number;
  currency: 'INR' | 'USD';
  paymentGateway: 'stripe' | 'razorpay' | 'cod';
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  couponCode?: string;
  couponDiscount?: number;
}

type StatusHistoryInput = {
  type: 'status' | 'payment' | 'fulfillment' | 'cancellation' | 'return' | 'replacement' | 'refund' | 'note';
  from?: string;
  to?: string;
  message: string;
  actorType: 'system' | 'admin' | 'customer' | 'payment_gateway';
  actorId?: string;
};

const note = (message: string, author: 'system' | 'admin' = 'system') => ({
  message,
  author,
  createdAt: new Date(),
});

const history = (input: StatusHistoryInput) => ({
  ...input,
  createdAt: new Date(),
});

const normalizeOrigin = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : undefined;
};

export class OrderService {
  /**
   * Generate a unique order number.
   */
  private static generateOrderNumber(): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Validate a status transition.
   */
  static isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * Create a new order in "pending" status.
   */
  static async create(input: CreateOrderInput): Promise<IOrder> {
    await dbConnect();

    const order = await Order.create({
      orderNumber: this.generateOrderNumber(),
      customerId: input.customerId?.trim() || undefined,
      customerEmail: normalizeCustomerOrderEmail(input.customerEmail),
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      storefrontOrigin: normalizeOrigin(input.storefrontOrigin),
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      orderStatus: 'placed',
      cancellation: { status: 'none' },
      returnRequest: { status: 'none', evidence: [] },
      replacement: { status: 'none', evidence: [] },
      refund: { status: 'none' },
      lineItems: input.lineItems,
      totalInCents: input.totalInCents,
      currency: input.currency,
      paymentGateway: input.paymentGateway,
      shippingAddress: input.shippingAddress,
      couponCode: input.couponCode || undefined,
      couponDiscount: input.couponDiscount || 0,
      notes: [note('Order created')],
      statusHistory: [
        history({
          type: 'status',
          to: 'pending',
          message: 'Order created and awaiting payment confirmation.',
          actorType: 'system',
        }),
      ],
    });

    void eventBus.emit('order.created', order);

    return order;
  }

  /**
   * Mark order as paid — called from webhook ONLY.
   * Idempotent via unique idempotencyKey.
   */
  static async markAsPaid(
    orderId: string,
    paymentId: string,
    idempotencyKey: string
  ): Promise<IOrder | null> {
    await dbConnect();

    const existing = await Order.findById(orderId);
    if (!existing) {
      console.warn(`[OrderService] Missing order while marking paid: ${orderId}`);
      return null;
    }

    if (existing.idempotencyKey === idempotencyKey || existing.paymentStatus === 'paid') {
      console.warn(`[OrderService] Idempotent paid skip: ${orderId}`);
      return null;
    }

    const now = new Date();
    const paymentIdField =
      existing.paymentGateway === 'razorpay'
        ? { razorpayPaymentId: paymentId }
        : { stripePaymentIntentId: paymentId };

    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        paymentStatus: { $ne: 'paid' },
        $or: [{ idempotencyKey: { $exists: false } }, { idempotencyKey: null }],
      },
      {
        $set: {
          status: 'paid',
          paymentStatus: 'paid',
          orderStatus: 'accepted',
          fulfillmentStatus: 'confirmed',
          idempotencyKey,
          paidAt: now,
          acceptedAt: now,
          ...paymentIdField,
        },
        $push: {
          notes: note(`Payment confirmed (${paymentId}). Order automatically accepted.`),
          statusHistory: {
            $each: [
              history({
                type: 'payment',
                from: existing.paymentStatus || 'pending',
                to: 'paid',
                message: `Payment confirmed by ${existing.paymentGateway}.`,
                actorType: 'payment_gateway',
              }),
              history({
                type: 'fulfillment',
                from: existing.fulfillmentStatus || 'unfulfilled',
                to: 'confirmed',
                message: 'Online paid order automatically accepted for fulfillment.',
                actorType: 'system',
              }),
            ],
          },
        },
      },
      { new: true }
    );

    if (!order) {
      console.warn(`[OrderService] Idempotent skip or missing: ${orderId}`);
      return null;
    }

    // Atomic inventory decrement
    for (const item of order.lineItems) {
      const success = await ProductService.decrementStock(
        item.productId,
        item.sku,
        item.quantity
      );
      if (!success) {
        console.error(`[OrderService] CRITICAL: Stock decrement failed for ${item.productId}`);
      }
    }

    await eventBus.emit('order.paid', order);
    return order;
  }

  /**
   * Update order status with validation + timestamp + notes.
   */
  static async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminNote?: string,
    extra?: { trackingNumber?: string; trackingUrl?: string; courierName?: string; estimatedDeliveryAt?: string }
  ): Promise<IOrder | null> {
    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) return null;

    const fulfillmentStatuses: OrderStatus[] = ['processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'completed'];
    if (
      order.paymentGateway !== 'cod' &&
      order.paymentStatus !== 'paid' &&
      fulfillmentStatuses.includes(newStatus)
    ) {
      throw new Error('Online payment orders must be marked paid before fulfillment can start.');
    }

    if (!this.isValidTransition(order.status, newStatus)) {
      throw new Error(
        `Invalid transition: ${order.status} → ${newStatus}`
      );
    }

    const now = new Date();
    const updateData: Record<string, unknown> = { status: newStatus };

    if (newStatus === 'paid') {
      updateData.paymentStatus = 'paid';
      updateData.orderStatus = 'accepted';
      updateData.fulfillmentStatus = 'confirmed';
      updateData.paidAt = order.paidAt || now;
      updateData.acceptedAt = order.acceptedAt || now;
    }
    if (newStatus === 'processing') {
      updateData.orderStatus = 'accepted';
      updateData.fulfillmentStatus = 'processing';
      updateData.processedAt = now;
    }
    if (newStatus === 'packed') {
      updateData.orderStatus = 'accepted';
      updateData.fulfillmentStatus = 'packed';
      updateData.packedAt = now;
    }
    if (newStatus === 'shipped') {
      updateData.orderStatus = 'accepted';
      updateData.fulfillmentStatus = 'shipped';
      updateData.shippedAt = now;
    }
    if (newStatus === 'out_for_delivery') {
      updateData.fulfillmentStatus = 'out_for_delivery';
      updateData.outForDeliveryAt = now;
    }
    if (newStatus === 'delivery_failed') {
      updateData.fulfillmentStatus = 'delivery_failed';
    }
    if (newStatus === 'delivered') {
      updateData.fulfillmentStatus = 'delivered';
      updateData.deliveredAt = now;
    }
    if (newStatus === 'completed') {
      updateData.orderStatus = 'completed';
      updateData.completedAt = now;
    }
    if (newStatus === 'cancel_approved') {
      updateData['cancellation.status'] = 'approved';
      updateData['cancellation.reviewedAt'] = now;
      updateData.cancelledAt = undefined;
    }
    if (newStatus === 'cancelled') {
      updateData.orderStatus = 'cancelled';
      updateData['cancellation.status'] = 'cancelled';
      updateData.cancelledAt = now;
    }
    if (newStatus === 'refund_pending') {
      updateData.paymentStatus = 'refund_pending';
      updateData['refund.status'] = 'pending';
      updateData['refund.reason'] = adminNote || order.refundReason || 'Refund pending';
      updateData['refund.initiatedAt'] = now;
    }
    if (newStatus === 'refunded') {
      updateData.paymentStatus = 'refunded';
      updateData['refund.status'] = 'completed';
      updateData['refund.completedAt'] = now;
      updateData.refundedAt = now;
    }
    if (newStatus === 'return_approved') {
      updateData['returnRequest.status'] = 'approved';
      updateData['returnRequest.reviewedAt'] = now;
    }
    if (newStatus === 'return_pickup_scheduled') {
      updateData['returnRequest.status'] = 'pickup_scheduled';
      updateData['returnRequest.pickupScheduledAt'] = now;
    }
    if (newStatus === 'return_picked_up') {
      updateData['returnRequest.status'] = 'picked_up';
      updateData['returnRequest.pickedUpAt'] = now;
    }
    if (newStatus === 'return_received') {
      updateData['returnRequest.status'] = 'received';
      updateData['returnRequest.receivedAt'] = now;
    }
    if (newStatus === 'return_qc_passed') {
      updateData['returnRequest.status'] = 'qc_passed';
      updateData['returnRequest.qcStatus'] = 'passed';
    }
    if (newStatus === 'return_qc_failed') {
      updateData['returnRequest.status'] = 'qc_failed';
      updateData['returnRequest.qcStatus'] = 'failed';
    }
    if (newStatus === 'returned') {
      updateData['returnRequest.status'] = 'closed';
    }
    if (newStatus === 'replace_approved') {
      updateData['replacement.status'] = 'approved';
      updateData['replacement.reviewedAt'] = now;
    }
    if (newStatus === 'replacement_processing') {
      updateData['replacement.status'] = 'replacement_processing';
    }
    if (newStatus === 'replacement_shipped') {
      updateData['replacement.status'] = 'replacement_shipped';
      updateData['replacement.shippedAt'] = now;
    }
    if (newStatus === 'replaced') {
      updateData['replacement.status'] = 'replaced';
      updateData['replacement.deliveredAt'] = now;
    }

    if (extra?.trackingNumber) updateData.trackingNumber = extra.trackingNumber;
    if (extra?.trackingUrl) updateData.trackingUrl = extra.trackingUrl;
    if (extra?.courierName) updateData.courierName = extra.courierName;
    if (extra?.estimatedDeliveryAt) updateData.estimatedDeliveryAt = new Date(extra.estimatedDeliveryAt);

    const noteMessage = adminNote || `Status changed to ${newStatus}`;

    const updated = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: updateData,
        $push: {
          notes: note(noteMessage, 'admin'),
          statusHistory: history({
            type: 'status',
            from: order.status,
            to: newStatus,
            message: noteMessage,
            actorType: 'admin',
          }),
        },
      },
      { new: true }
    );

    // Fire events
    if (updated && newStatus === 'shipped') {
      await eventBus.emit('order.shipped', updated);
    }
    if (updated && newStatus === 'delivered') {
      await eventBus.emit('order.delivered', updated);
    }
    if (updated && newStatus === 'refunded') {
      await eventBus.emit('order.refunded', updated);
    }
    if (updated && newStatus === 'cancel_approved') {
      try {
        await EmailService.sendTemplatedEmail(updated.customerEmail, 'cancel_request_approved', {
          ...EmailService.getOrderEmailVariables(updated),
          decisionReason: adminNote || 'Cancellation approved.',
        });
      } catch (error) {
        console.error('[OrderService] Failed to send cancellation approval email:', error);
      }
    }
    if (updated && newStatus === 'cancelled') {
      try {
        await EmailService.sendOrderCancelledEmail(
          updated,
          adminNote || order.cancellation?.adminDecisionReason || 'Your order has been cancelled.'
        );
      } catch (error) {
        console.error('[OrderService] Failed to send order cancelled email:', error);
      }
    }

    if (updated && newStatus === 'cancelled' && order.status !== 'pending') {
      for (const item of order.lineItems) {
        await ProductService.incrementStock(
          item.productId,
          item.sku,
          item.quantity
        );
      }
    }

    return updated;
  }

  static async markPaymentCollected(orderId: string, adminNote?: string): Promise<IOrder | null> {
    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    if (order.paymentGateway !== 'cod') {
      throw new Error('Cash collection is only available for COD orders.');
    }

    if (order.paymentStatus === 'paid') {
      return order;
    }

    if (!['delivered', 'completed'].includes(order.status)) {
      throw new Error('COD payment should be collected after the order is delivered.');
    }

    const now = new Date();

    await Order.findByIdAndUpdate(orderId, {
      $set: {
        paymentStatus: 'paid',
        paidAt: now,
      },
      $push: {
        notes: note(adminNote || 'Cash on delivery payment collected by admin.', 'admin'),
        statusHistory: history({
          type: 'payment',
          from: order.paymentStatus || 'pending',
          to: 'paid',
          message: 'Cash on delivery payment collected.',
          actorType: 'admin',
        }),
      },
    });

    return Order.findById(orderId);
  }

  /**
   * Process a refund via Stripe or Razorpay.
   */
  static async processRefund(
    orderId: string,
    reason: string,
    amountInCents?: number
  ): Promise<IOrder | null> {
    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    if (!['paid', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'completed', 'cancel_approved', 'refund_pending', 'return_qc_passed', 'returned'].includes(order.status)) {
      throw new Error(`Cannot refund order with status: ${order.status}`);
    }

    const refundAmount = amountInCents || order.totalInCents;
    let refundId = '';

    // Process refund via the payment gateway
    if (order.paymentGateway === 'stripe' && order.stripePaymentIntentId) {
      refundId = await PaymentService.refundStripe(order.stripePaymentIntentId, refundAmount);
    } else if (order.paymentGateway === 'razorpay' && order.razorpayPaymentId) {
      refundId = await PaymentService.refundRazorpay(order.razorpayPaymentId, refundAmount);
    } else {
      throw new Error('No payment ID found for refund');
    }

    const now = new Date();
    const updated = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: 'refunded',
          orderStatus: order.cancellation?.status === 'approved' || order.cancellation?.status === 'refund_pending' ? 'cancelled' : order.orderStatus,
          paymentStatus: 'refunded',
          'refund.status': 'completed',
          'refund.gatewayRefundId': refundId,
          'refund.amount': refundAmount,
          'refund.reason': reason,
          'refund.completedAt': now,
          'cancellation.status': order.cancellation?.status === 'approved' || order.cancellation?.status === 'refund_pending' ? 'cancelled' : order.cancellation?.status,
          'returnRequest.status': order.returnRequest?.status === 'qc_passed' || order.returnRequest?.status === 'refund_pending' ? 'refunded' : order.returnRequest?.status,
          refundId,
          refundAmount: refundAmount,
          refundReason: reason,
          refundedAt: now,
          cancelledAt: order.cancellation?.status === 'approved' || order.cancellation?.status === 'refund_pending' ? now : order.cancelledAt,
        },
        $push: {
          notes: {
            message: `Refund processed: ${(refundAmount / 100).toFixed(2)} ${order.currency} — ${reason} (ID: ${refundId})`,
            author: 'admin',
            createdAt: new Date(),
          },
          statusHistory: history({
            type: 'refund',
            from: order.paymentStatus || order.status,
            to: 'refunded',
            message: `Refund completed through ${order.paymentGateway}.`,
            actorType: 'admin',
          }),
        },
      },
      { new: true }
    );

    // Restore inventory
    if (updated) {
      for (const item of order.lineItems) {
        await ProductService.incrementStock(
          item.productId,
          item.sku,
          item.quantity
        );
      }
      await eventBus.emit('order.refunded', updated);
    }

    return updated;
  }

  static async syncGatewayRefund(params: {
    orderId: string;
    gatewayRefundId: string;
    amountInCents?: number;
    reason?: string;
  }): Promise<IOrder | null> {
    await dbConnect();

    const order = await Order.findById(params.orderId);
    if (!order) {
      return null;
    }

    if (
      order.paymentStatus === 'refunded' &&
      (order.refundId === params.gatewayRefundId ||
        order.refund?.gatewayRefundId === params.gatewayRefundId)
    ) {
      return order;
    }

    const refundAmount = params.amountInCents || order.totalInCents;
    const now = new Date();

    const updated = await Order.findByIdAndUpdate(
      params.orderId,
      {
        $set: {
          status: 'refunded',
          orderStatus:
            order.cancellation?.status === 'approved' || order.cancellation?.status === 'refund_pending'
              ? 'cancelled'
              : order.orderStatus,
          paymentStatus: 'refunded',
          'refund.status': 'completed',
          'refund.gatewayRefundId': params.gatewayRefundId,
          'refund.amount': refundAmount,
          'refund.reason': params.reason || order.refundReason || 'Refund processed by Razorpay.',
          'refund.completedAt': now,
          'cancellation.status':
            order.cancellation?.status === 'approved' || order.cancellation?.status === 'refund_pending'
              ? 'cancelled'
              : order.cancellation?.status,
          'returnRequest.status':
            order.returnRequest?.status === 'qc_passed' || order.returnRequest?.status === 'refund_pending'
              ? 'refunded'
              : order.returnRequest?.status,
          refundId: params.gatewayRefundId,
          refundAmount,
          refundReason: params.reason || order.refundReason || 'Refund processed by Razorpay.',
          refundedAt: now,
          cancelledAt:
            order.cancellation?.status === 'approved' || order.cancellation?.status === 'refund_pending'
              ? now
              : order.cancelledAt,
        },
        $push: {
          notes: {
            message: `Refund synced from Razorpay (ID: ${params.gatewayRefundId}).`,
            author: 'admin',
            createdAt: now,
          },
          statusHistory: history({
            type: 'refund',
            from: order.paymentStatus || order.status,
            to: 'refunded',
            message: 'Refund processed by Razorpay webhook.',
            actorType: 'payment_gateway',
          }),
        },
      },
      { new: true }
    );

    if (!updated) {
      return null;
    }

    if (order.paymentStatus !== 'refunded') {
      for (const item of order.lineItems) {
        await ProductService.incrementStock(
          item.productId,
          item.sku,
          item.quantity
        );
      }

      await eventBus.emit('order.refunded', updated);
    }

    return updated;
  }

  // ─── Queries ───────────────────────────────────────────────

  static async getById(orderId: string): Promise<IOrder | null> {
    await dbConnect();
    return Order.findById(orderId).lean();
  }

  static async getAll(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: IOrder[]; total: number }> {
    await dbConnect();
    const query: Record<string, unknown> = { isDeleted: { $ne: true } };

    if (filters?.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    if (filters?.search) {
      query.$or = [
        { orderNumber: { $regex: filters.search, $options: 'i' } },
        { customerName: { $regex: filters.search, $options: 'i' } },
        { customerEmail: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return { orders, total };
  }

  static async getByCustomerEmail(email: string): Promise<IOrder[]> {
    await dbConnect();
    return Order.find({
      customerEmail: normalizeCustomerOrderEmail(email),
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async addNote(orderId: string, message: string, author: 'admin' | 'system' = 'admin'): Promise<IOrder | null> {
    await dbConnect();
    return Order.findByIdAndUpdate(
      orderId,
      {
        $push: {
          notes: note(message, author),
          statusHistory: history({
            type: 'note',
            message,
            actorType: author,
          }),
        },
      },
      { new: true }
    );
  }
}
