import assert from 'node:assert/strict';

import {
  buildAdminNotificationsSummary,
  formatAdminAttentionCount,
} from '../lib/utils/admin-notifications.ts';
import {
  buildAdminOrderAlertMessage,
  buildAdminOrderAlertPayload,
} from '../lib/services/admin-mobile-alert.service.ts';

const sampleOrder = {
  orderNumber: 'ORD-12345',
  customerName: 'Ada Lovelace',
  totalInCents: 259900,
  currency: 'INR' as const,
  paymentGateway: 'razorpay' as const,
  lineItems: [{ quantity: 1 }, { quantity: 2 }],
  status: 'paid',
  orderStatus: 'accepted',
  razorpayPaymentId: 'pay_123',
};

const runCase = (name: string, assertion: () => void) => {
  try {
    assertion();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

runCase('summary builder returns the expected totals and breakdown', () => {
  const summary = buildAdminNotificationsSummary({
    ordersNewCount: 4,
    contactsNewCount: 3,
    recycledProductsCount: 2,
    recycledOrdersCount: 1,
    recycledMediaCount: 5,
  });

  assert.equal(summary.orders.newCount, 4);
  assert.equal(summary.contacts.newCount, 3);
  assert.equal(summary.recycleBin.totalCount, 8);
  assert.deepEqual(summary.recycleBin.breakdown, {
    products: 2,
    orders: 1,
    media: 5,
  });
});

runCase('badge formatter caps high counts at 99+', () => {
  assert.equal(formatAdminAttentionCount(0), '0');
  assert.equal(formatAdminAttentionCount(14), '14');
  assert.equal(formatAdminAttentionCount(150), '99+');
});

runCase('created alert message includes queue details for admins', () => {
  const message = buildAdminOrderAlertMessage('order.created', sampleOrder);

  assert.match(message, /New order placed/);
  assert.match(message, /Order: #ORD-12345/);
  assert.match(message, /Gateway: RAZORPAY/);
  assert.match(message, /Items: 3/);
  assert.match(message, /Status: accepted/);
});

runCase('paid alert message includes the payment reference', () => {
  const message = buildAdminOrderAlertMessage('order.paid', sampleOrder);

  assert.match(message, /Payment confirmed/);
  assert.match(message, /Reference: pay_123/);
  assert.match(message, /Status: paid/);
});

runCase('whatsapp payload targets the configured admin phone number', () => {
  const payload = buildAdminOrderAlertPayload(
    'order.paid',
    sampleOrder,
    '15551234567'
  );

  assert.equal(payload.messaging_product, 'whatsapp');
  assert.equal(payload.to, '15551234567');
  assert.equal(payload.type, 'text');
  assert.match(payload.text.body, /Payment confirmed/);
});
