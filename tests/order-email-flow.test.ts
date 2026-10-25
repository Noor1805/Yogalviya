import assert from 'node:assert/strict';

import { EmailService } from '../lib/services/email.service.ts';

const baseOrder = {
  _id: '507f1f77bcf86cd799439011',
  orderNumber: 'ORD-20260424-ABCD',
  customerEmail: 'customer@example.com',
  customerName: 'Ada Lovelace',
  lineItems: [
    {
      productId: 'prod_1',
      sku: 'SKU-1',
      name: 'Silk Dress',
      quantity: 2,
      priceAtPurchase: 499900,
    },
  ],
  totalInCents: 999800,
  currency: 'INR' as const,
  createdAt: new Date('2026-04-24T09:30:00.000Z'),
  trackingUrl: 'https://example.com/orders/ORD-20260424-ABCD',
  paymentGateway: 'cod' as const,
};

const runCase = async (
  name: string,
  assertion: () => Promise<void> | void
) => {
  try {
    await assertion();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const withSendOrderEmailOnceStub = async (
  assertion: (captured: { current: any }) => Promise<void> | void
) => {
  const original = EmailService.sendOrderEmailOnce;
  const captured = { current: null as any };

  (EmailService as any).sendOrderEmailOnce = async (params: any) => {
    captured.current = params;
    return true;
  };

  try {
    await assertion(captured);
  } finally {
    (EmailService as any).sendOrderEmailOnce = original;
  }
};

const main = async () => {
  await runCase('sendOrderReceivedEmail uses the received template and sent field', async () => {
    await withSendOrderEmailOnceStub(async (captured) => {
      const sent = await EmailService.sendOrderReceivedEmail(baseOrder as any);

      assert.equal(sent, true);
      assert.equal(captured.current.type, 'order_received');
      assert.equal(captured.current.sentAtField, 'orderReceivedEmailSentAt');
      assert.equal(captured.current.to, baseOrder.customerEmail);
      assert.match(captured.current.variables.paymentHeadline, /Cash on delivery selected/);
    });
  });

  await runCase('COD order-received variables explain cash collection clearly', () => {
    const variables = EmailService.getOrderReceivedVariables(baseOrder as any);

    assert.match(variables.paymentHeadline, /Cash on delivery selected/);
    assert.match(variables.paymentNote, /Payment will be collected at delivery/);
  });

  await runCase('Online order-received variables explain payment verification', () => {
    const variables = EmailService.getOrderReceivedVariables({
      ...baseOrder,
      paymentGateway: 'razorpay',
    } as any);

    assert.match(variables.paymentHeadline, /Payment verification in progress/);
    assert.match(variables.paymentNote, /gateway verifies it/);
  });

  await runCase('sendOrderConfirmationEmail still targets the confirmed template', async () => {
    await withSendOrderEmailOnceStub(async (captured) => {
      const sent = await EmailService.sendOrderConfirmationEmail({
        ...baseOrder,
        paidAt: new Date('2026-04-24T10:00:00.000Z'),
      } as any);

      assert.equal(sent, true);
      assert.equal(captured.current.type, 'order_confirmed');
      assert.equal(captured.current.sentAtField, 'orderConfirmedEmailSentAt');
    });
  });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
