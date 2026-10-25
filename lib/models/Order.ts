import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILineItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  priceAtPurchase: number; // smallest unit (paise/cents)
  image?: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'completed'
  | 'cancel_requested'
  | 'cancel_approved'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded'
  | 'return_requested'
  | 'return_approved'
  | 'return_pickup_scheduled'
  | 'return_picked_up'
  | 'return_received'
  | 'return_qc_passed'
  | 'return_qc_failed'
  | 'returned'
  | 'replace_requested'
  | 'replace_approved'
  | 'replacement_processing'
  | 'replacement_shipped'
  | 'replaced';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'refund_pending'
  | 'partially_refunded'
  | 'refunded';

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed';

export type OrderLifecycleStatus =
  | 'placed'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'closed';

export type CancellationStatus =
  | 'none'
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'refund_pending'
  | 'cancelled';

export type ReturnStatus =
  | 'none'
  | 'requested'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'received'
  | 'qc_passed'
  | 'qc_failed'
  | 'refund_pending'
  | 'refunded'
  | 'closed';

export type ReplacementStatus =
  | 'none'
  | 'requested'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'replacement_processing'
  | 'replacement_shipped'
  | 'replaced'
  | 'closed';

export type RefundStatus =
  | 'none'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type StatusActorType = 'system' | 'admin' | 'customer' | 'payment_gateway';

export interface IOrderNote {
  message: string;
  author: 'system' | 'admin';
  createdAt: Date;
}

export interface IEvidenceItem {
  publicId?: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
}

export interface IStatusHistoryItem {
  type: 'status' | 'payment' | 'fulfillment' | 'cancellation' | 'return' | 'replacement' | 'refund' | 'note';
  from?: string;
  to?: string;
  message: string;
  actorType: StatusActorType;
  actorId?: string;
  createdAt: Date;
}

export interface ICancellationWorkflow {
  status: CancellationStatus;
  reason?: string;
  requestedAt?: Date;
  requestedFromStatus?: OrderStatus;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminDecisionReason?: string;
}

export interface IReturnWorkflow {
  status: ReturnStatus;
  reason?: string;
  requestedAt?: Date;
  evidence: IEvidenceItem[];
  reviewedAt?: Date;
  reviewedBy?: string;
  adminDecisionReason?: string;
  pickupScheduledAt?: Date;
  pickedUpAt?: Date;
  receivedAt?: Date;
  qcStatus?: 'pending' | 'passed' | 'failed';
  qcNote?: string;
}

export interface IReplacementWorkflow {
  status: ReplacementStatus;
  reason?: string;
  requestedAt?: Date;
  evidence: IEvidenceItem[];
  reviewedAt?: Date;
  reviewedBy?: string;
  adminDecisionReason?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface IRefundWorkflow {
  status: RefundStatus;
  gatewayRefundId?: string;
  amount?: number;
  reason?: string;
  initiatedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  storefrontOrigin?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  orderStatus: OrderLifecycleStatus;
  cancellation: ICancellationWorkflow;
  returnRequest: IReturnWorkflow;
  replacement: IReplacementWorkflow;
  refund: IRefundWorkflow;
  statusHistory: IStatusHistoryItem[];
  lineItems: ILineItem[];
  totalInCents: number;
  currency: 'INR' | 'USD';
  paymentGateway: 'stripe' | 'razorpay' | 'cod';
  stripePaymentIntentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  idempotencyKey?: string;
  couponCode?: string;
  couponDiscount?: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  estimatedDeliveryAt?: Date;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  returnReason?: string;
  returnRequestedAt?: Date;
  returnEvidence?: IEvidenceItem[];
  replaceReason?: string;
  replaceRequestedAt?: Date;
  replaceEvidence?: IEvidenceItem[];
  notes: IOrderNote[];
  orderReceivedEmailSentAt?: Date;
  orderConfirmedEmailSentAt?: Date;
  paidAt?: Date;
  acceptedAt?: Date;
  processedAt?: Date;
  packedAt?: Date;
  shippedAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ORDER_STATUS_VALUES: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'delivery_failed',
  'completed',
  'cancel_requested',
  'cancel_approved',
  'cancelled',
  'refund_pending',
  'refunded',
  'return_requested',
  'return_approved',
  'return_pickup_scheduled',
  'return_picked_up',
  'return_received',
  'return_qc_passed',
  'return_qc_failed',
  'returned',
  'replace_requested',
  'replace_approved',
  'replacement_processing',
  'replacement_shipped',
  'replaced',
];

const LineItemSchema = new Schema<ILineItem>(
  {
    productId: { type: String, required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const OrderNoteSchema = new Schema<IOrderNote>(
  {
    message: { type: String, required: true },
    author: { type: String, enum: ['system', 'admin'], default: 'system' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EvidenceItemSchema = new Schema<IEvidenceItem>(
  {
    publicId: { type: String },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    type: { type: String, enum: ['image', 'video'], required: true },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistoryItem>(
  {
    type: {
      type: String,
      enum: ['status', 'payment', 'fulfillment', 'cancellation', 'return', 'replacement', 'refund', 'note'],
      required: true,
    },
    from: { type: String },
    to: { type: String },
    message: { type: String, required: true },
    actorType: {
      type: String,
      enum: ['system', 'admin', 'customer', 'payment_gateway'],
      required: true,
    },
    actorId: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, index: true, sparse: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String },
    storefrontOrigin: { type: String },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'paid', 'failed', 'refund_pending', 'partially_refunded', 'refunded'],
      default: 'pending',
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ['unfulfilled', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'delivery_failed'],
      default: 'unfulfilled',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'accepted', 'completed', 'cancelled', 'closed'],
      default: 'placed',
      index: true,
    },
    cancellation: {
      status: {
        type: String,
        enum: ['none', 'requested', 'approved', 'rejected', 'refund_pending', 'cancelled'],
        default: 'none',
      },
      reason: { type: String },
      requestedAt: { type: Date },
      requestedFromStatus: { type: String, enum: ORDER_STATUS_VALUES },
      reviewedAt: { type: Date },
      reviewedBy: { type: String },
      adminDecisionReason: { type: String },
    },
    returnRequest: {
      status: {
        type: String,
        enum: ['none', 'requested', 'under_review', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'received', 'qc_passed', 'qc_failed', 'refund_pending', 'refunded', 'closed'],
        default: 'none',
      },
      reason: { type: String },
      requestedAt: { type: Date },
      evidence: { type: [EvidenceItemSchema], default: [] },
      reviewedAt: { type: Date },
      reviewedBy: { type: String },
      adminDecisionReason: { type: String },
      pickupScheduledAt: { type: Date },
      pickedUpAt: { type: Date },
      receivedAt: { type: Date },
      qcStatus: { type: String, enum: ['pending', 'passed', 'failed'] },
      qcNote: { type: String },
    },
    replacement: {
      status: {
        type: String,
        enum: ['none', 'requested', 'under_review', 'approved', 'rejected', 'replacement_processing', 'replacement_shipped', 'replaced', 'closed'],
        default: 'none',
      },
      reason: { type: String },
      requestedAt: { type: Date },
      evidence: { type: [EvidenceItemSchema], default: [] },
      reviewedAt: { type: Date },
      reviewedBy: { type: String },
      adminDecisionReason: { type: String },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    refund: {
      status: {
        type: String,
        enum: ['none', 'pending', 'processing', 'completed', 'failed'],
        default: 'none',
      },
      gatewayRefundId: { type: String },
      amount: { type: Number },
      reason: { type: String },
      initiatedAt: { type: Date },
      completedAt: { type: Date },
      failedAt: { type: Date },
      failureReason: { type: String },
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    lineItems: { type: [LineItemSchema], required: true },
    totalInCents: { type: Number, required: true },
    currency: { type: String, enum: ['INR', 'USD'], required: true },
    paymentGateway: { type: String, enum: ['stripe', 'razorpay', 'cod'], required: true },
    stripePaymentIntentId: { type: String, sparse: true },
    razorpayOrderId: { type: String, sparse: true },
    razorpayPaymentId: { type: String },
    idempotencyKey: { type: String, unique: true, sparse: true },
    couponCode: { type: String, sparse: true },
    couponDiscount: { type: Number, default: 0 },
    shippingAddress: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    courierName: { type: String },
    estimatedDeliveryAt: { type: Date },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundReason: { type: String },
    refundedAt: { type: Date },
    returnReason: { type: String },
    returnRequestedAt: { type: Date },
    returnEvidence: { type: [EvidenceItemSchema], default: [] },
    replaceReason: { type: String },
    replaceRequestedAt: { type: Date },
    replaceEvidence: { type: [EvidenceItemSchema], default: [] },
    notes: { type: [OrderNoteSchema], default: [] },
    orderReceivedEmailSentAt: { type: Date },
    orderConfirmedEmailSentAt: { type: Date },
    paidAt: { type: Date },
    acceptedAt: { type: Date },
    processedAt: { type: Date },
    packedAt: { type: Date },
    shippedAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date }
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
