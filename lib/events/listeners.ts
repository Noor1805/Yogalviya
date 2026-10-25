/**
 * Register all event listeners here.
 * Import this file ONCE at app startup (e.g. in instrumentation.ts or layout server init).
 */

import { eventBus } from './emitter';
import type { IOrder } from '@/lib/models/Order';
import { sendAdminOrderAlert } from '@/lib/services/admin-mobile-alert.service';
import { EmailService } from '@/lib/services/email.service';
import { buildInvoiceAttachment } from '@/lib/utils/invoice';

// order.created
eventBus.on<IOrder>('order.created', (order) => {
  void sendAdminOrderAlert('order.created', order).catch((err) => {
    console.error('[Admin WhatsApp] order.created failed:', err);
  });
});

// order.paid
eventBus.on<IOrder>('order.paid', async (order) => {
  // 1. Send dynamic confirmation email
  try {
    await EmailService.sendOrderConfirmationEmail(order);
  } catch (err) {
    console.error('[Email] Failed:', err);
  }
});

eventBus.on<IOrder>('order.paid', (order) => {
  void sendAdminOrderAlert('order.paid', order).catch((err) => {
    console.error('[Admin WhatsApp] order.paid failed:', err);
  });
});

eventBus.on<IOrder>('order.paid', async (order) => {
  // 2. Send WhatsApp message to customer
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId || !order.customerPhone) return;

    await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: order.customerPhone,
          type: 'text',
          text: {
            body: `Hi ${order.customerName}! Your order #${order.orderNumber} is confirmed. Total: ${order.currency} ${(order.totalInCents / 100).toFixed(2)}. Thank you for shopping with us!`,
          },
        }),
      }
    );
    console.log(`[WhatsApp] Message sent to ${order.customerPhone}`);
  } catch (err) {
    console.error('[WhatsApp] Failed:', err);
  }
});

// ─── order.shipped ───────────────────────────────────────────
eventBus.on<IOrder>('order.shipped', async (order) => {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (token && phoneNumberId && order.customerPhone) {
      await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: order.customerPhone,
            type: 'text',
            text: {
              body: `Great news ${order.customerName}! Your order #${order.orderNumber} has been shipped! 🚚`,
            },
          }),
        }
      );
    }
  } catch (err) {
    console.error('[WhatsApp] Shipping notification failed:', err);
  }

  // Also send dynamic Shipped email
  try {
    await EmailService.sendTemplatedEmail(
        order.customerEmail,
        'order_shipped',
        {
            ...EmailService.getOrderEmailVariables(order),
            trackingUrl: order.trackingUrl || EmailService.getOrderEmailVariables(order).orderUrl,
        }
    );
  } catch (err) {
    console.error('[Email Shipped] Failed:', err);
  }
});

// ─── order.delivered ─────────────────────────────────────────
eventBus.on<IOrder>('order.delivered', async (order) => {
  try {
    await EmailService.sendTemplatedEmail(
      order.customerEmail,
      'order_delivered',
      {
        ...EmailService.getOrderEmailVariables(order),
        deliveredDate: new Date(order.deliveredAt || new Date()).toLocaleDateString(),
      },
      {
        attachments: [buildInvoiceAttachment(order)],
      }
    );
  } catch (err) {
    console.error('[Email Delivered] Failed:', err);
  }
});

// ─── order.refunded ──────────────────────────────────────────
eventBus.on<IOrder>('order.refunded', async (order) => {
  try {
    await EmailService.sendTemplatedEmail(
      order.customerEmail,
      'refund_processed',
      {
        ...EmailService.getOrderEmailVariables(order),
        refundAmount: EmailService.formatOrderTotal(order.refundAmount || order.totalInCents, order.currency),
      }
    );
  } catch (err) {
    console.error('[Email Refund] Failed:', err);
  }
});
