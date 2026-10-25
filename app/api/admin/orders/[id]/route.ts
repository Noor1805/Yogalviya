import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import { OrderService } from '@/lib/services/order.service';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import type { OrderStatus } from '@/lib/models/Order';
import { EmailService } from '@/lib/services/email.service';
import { resolveOrderLineItemImages } from '@/lib/utils/order-line-item-images';

const isMongoObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

async function resolveOrderId(value: string): Promise<string | null> {
  if (isMongoObjectId(value)) return value;

  await dbConnect();
  const order = await Order.findOne({ orderNumber: value }).select('_id').lean();
  return order?._id ? String(order._id) : null;
}

/**
 * GET /api/admin/orders/[id] â€” Get single order details
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const orderId = await resolveOrderId(id);
  if (!orderId) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const order = await OrderService.getById(orderId);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const hydratedOrder = {
    ...order,
    lineItems: await resolveOrderLineItemImages(order.lineItems || []),
  };

  return NextResponse.json(hydratedOrder);
}

/**
 * PATCH /api/admin/orders/[id] â€” Update order status, tracking, add notes
 *
 * Body: {
 *   action: 'updateStatus' | 'addNote' | 'refund',
 *   status?: OrderStatus,
 *   note?: string,
 *   trackingNumber?: string,
 *   trackingUrl?: string,
 *   refundReason?: string,
 *   refundAmount?: number (in cents/paise),
 * }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const orderId = await resolveOrderId(id);
  if (!orderId) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const body = await req.json();
  const { action } = body;

  try {
    switch (action) {
      case 'updateStatus': {
        const { status, note, trackingNumber, trackingUrl, courierName, estimatedDeliveryAt } = body;
        if (!status) {
          return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const order = await OrderService.updateStatus(
          orderId,
          status as OrderStatus,
          note,
          { trackingNumber, trackingUrl, courierName, estimatedDeliveryAt }
        );
        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        return NextResponse.json(order);
      }

      case 'addNote': {
        const { note } = body;
        if (!note) {
          return NextResponse.json({ error: 'Note is required' }, { status: 400 });
        }
        const order = await OrderService.addNote(orderId, note, 'admin');
        return NextResponse.json(order);
      }

      case 'refund': {
        const { refundReason, refundAmount } = body;
        if (!refundReason) {
          return NextResponse.json({ error: 'Refund reason is required' }, { status: 400 });
        }
        const order = await OrderService.processRefund(orderId, refundReason, refundAmount);
        return NextResponse.json(order);
      }

      case 'markPaymentCollected': {
        const { note } = body;
        const order = await OrderService.markPaymentCollected(orderId, note);
        return NextResponse.json(order);
      }

      case 'reviewCancellation': {
        const { approved, note } = body;
        await dbConnect();
        const order = await Order.findById(orderId);
        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        if (!order.cancellation && order.status === 'cancel_requested') {
          order.cancellation = {
            status: 'requested',
            requestedFromStatus: 'paid',
            requestedAt: order.updatedAt || new Date(),
          };
        }
        if (order.cancellation?.status !== 'requested') {
          return NextResponse.json({ error: 'No cancellation request is waiting for review' }, { status: 400 });
        }

        const now = new Date();
        const previousStatus = order.cancellation?.requestedFromStatus || 'paid';

        if (approved) {
          order.status = order.paymentStatus === 'paid' ? 'cancel_approved' : 'cancelled';
          order.cancellation.status = order.paymentStatus === 'paid' ? 'approved' : 'cancelled';
          order.cancellation.reviewedAt = now;
          order.cancellation.reviewedBy = session.user?.email || 'admin';
          order.cancellation.adminDecisionReason = note || 'Cancellation approved';
          if (order.status === 'cancelled') {
            order.orderStatus = 'cancelled';
            order.cancelledAt = now;
          }
          order.notes.push({
            author: 'admin',
            message: note || 'Cancellation request approved.',
            createdAt: now,
          });
          order.statusHistory.push({
            type: 'cancellation',
            from: 'requested',
            to: order.cancellation.status,
            message: order.paymentStatus === 'paid' ? 'Cancellation approved. Refund can now be processed.' : 'Cancellation approved and completed.',
            actorType: 'admin',
            actorId: session.user?.email || undefined,
            createdAt: now,
          });
        } else {
          order.status = previousStatus;
          order.cancellation.status = 'rejected';
          order.cancellation.reviewedAt = now;
          order.cancellation.reviewedBy = session.user?.email || 'admin';
          order.cancellation.adminDecisionReason = note || 'Cancellation rejected';
          order.notes.push({
            author: 'admin',
            message: note || 'Cancellation request rejected.',
            createdAt: now,
          });
          order.statusHistory.push({
            type: 'cancellation',
            from: 'requested',
            to: 'rejected',
            message: 'Cancellation request rejected by admin.',
            actorType: 'admin',
            actorId: session.user?.email || undefined,
            createdAt: now,
          });
        }

        await order.save();
        EmailService.sendTemplatedEmail(
          order.customerEmail,
          approved ? 'cancel_request_approved' : 'cancel_request_rejected',
          {
            ...EmailService.getOrderEmailVariables(order),
            decisionReason: note || (approved ? 'Cancellation approved.' : 'Cancellation rejected.'),
          }
        ).catch((err) => console.error('[Email Trigger Failed] Cancellation review:', err));
        return NextResponse.json(order);
      }

      case 'reviewReturn': {
        const { approved, note } = body;
        await dbConnect();
        const order = await Order.findById(orderId);
        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        if (!order.returnRequest && order.status === 'return_requested') {
          order.returnRequest = {
            status: 'requested',
            reason: order.returnReason || '',
            requestedAt: order.returnRequestedAt || order.updatedAt || new Date(),
            evidence: order.returnEvidence || [],
          };
        }
        if (order.returnRequest?.status !== 'requested') {
          return NextResponse.json({ error: 'No return request is waiting for review' }, { status: 400 });
        }

        const now = new Date();
        order.returnRequest.reviewedAt = now;
        order.returnRequest.reviewedBy = session.user?.email || 'admin';
        order.returnRequest.adminDecisionReason = note || (approved ? 'Return approved' : 'Return rejected');

        if (approved) {
          order.status = 'return_approved';
          order.returnRequest.status = 'approved';
        } else {
          order.status = 'delivered';
          order.returnRequest.status = 'rejected';
        }

        order.notes.push({
          author: 'admin',
          message: note || (approved ? 'Return request approved.' : 'Return request rejected.'),
          createdAt: now,
        });
        order.statusHistory.push({
          type: 'return',
          from: 'requested',
          to: order.returnRequest.status,
          message: approved ? 'Return request approved by admin.' : 'Return request rejected by admin.',
          actorType: 'admin',
          actorId: session.user?.email || undefined,
          createdAt: now,
        });

        await order.save();
        EmailService.sendTemplatedEmail(
          order.customerEmail,
          approved ? 'return_request_approved' : 'return_request_rejected',
          {
            ...EmailService.getOrderEmailVariables(order),
            decisionReason: note || (approved ? 'Return request approved.' : 'Return request rejected.'),
          }
        ).catch((err) => console.error('[Email Trigger Failed] Return review:', err));
        return NextResponse.json(order);
      }

      case 'reviewReplacement': {
        const { approved, note } = body;
        await dbConnect();
        const order = await Order.findById(orderId);
        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        if (!order.replacement && order.status === 'replace_requested') {
          order.replacement = {
            status: 'requested',
            reason: order.replaceReason || '',
            requestedAt: order.replaceRequestedAt || order.updatedAt || new Date(),
            evidence: order.replaceEvidence || [],
          };
        }
        if (order.replacement?.status !== 'requested') {
          return NextResponse.json({ error: 'No replacement request is waiting for review' }, { status: 400 });
        }

        const now = new Date();
        order.replacement.reviewedAt = now;
        order.replacement.reviewedBy = session.user?.email || 'admin';
        order.replacement.adminDecisionReason = note || (approved ? 'Replacement approved' : 'Replacement rejected');

        if (approved) {
          order.status = 'replace_approved';
          order.replacement.status = 'approved';
        } else {
          order.status = 'delivered';
          order.replacement.status = 'rejected';
        }

        order.notes.push({
          author: 'admin',
          message: note || (approved ? 'Replacement request approved.' : 'Replacement request rejected.'),
          createdAt: now,
        });
        order.statusHistory.push({
          type: 'replacement',
          from: 'requested',
          to: order.replacement.status,
          message: approved ? 'Replacement request approved by admin.' : 'Replacement request rejected by admin.',
          actorType: 'admin',
          actorId: session.user?.email || undefined,
          createdAt: now,
        });

        await order.save();
        EmailService.sendTemplatedEmail(
          order.customerEmail,
          approved ? 'replacement_request_approved' : 'replacement_request_rejected',
          {
            ...EmailService.getOrderEmailVariables(order),
            decisionReason: note || (approved ? 'Replacement request approved.' : 'Replacement request rejected.'),
          }
        ).catch((err) => console.error('[Email Trigger Failed] Replacement review:', err));
        return NextResponse.json(order);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Admin Orders PATCH]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/orders/[id] - Move order to recycle bin
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const orderId = await resolveOrderId(id);
  if (!orderId) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  await dbConnect();

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      $push: {
        notes: {
          message: 'Order moved to recycle bin.',
          author: 'admin',
          createdAt: new Date(),
        },
        statusHistory: {
          type: 'note',
          message: 'Order moved to recycle bin.',
          actorType: 'admin',
          actorId: session.user?.email || undefined,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Order moved to recycle bin.' });
}
