export type AdminOrderAlertEvent = 'order.created' | 'order.paid';

export interface AdminOrderAlertOrder {
  orderNumber: string;
  customerName: string;
  totalInCents: number;
  currency: 'INR' | 'USD';
  paymentGateway: 'stripe' | 'razorpay' | 'cod';
  lineItems: Array<{
    quantity: number;
  }>;
  status?: string;
  orderStatus?: string;
  razorpayPaymentId?: string;
  stripePaymentIntentId?: string;
  razorpayOrderId?: string;
}

const formatOrderTotal = (amountInCents: number, currency: 'INR' | 'USD') =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);

const formatStatusLabel = (value?: string) => {
  if (!value) return 'N/A';
  return value.replace(/_/g, ' ');
};

const getItemCount = (order: AdminOrderAlertOrder) =>
  order.lineItems.reduce((total, item) => total + (item.quantity || 0), 0);

const getPaymentReference = (order: AdminOrderAlertOrder) =>
  order.razorpayPaymentId ||
  order.stripePaymentIntentId ||
  order.razorpayOrderId ||
  'N/A';

export function buildAdminOrderAlertMessage(
  event: AdminOrderAlertEvent,
  order: AdminOrderAlertOrder
) {
  if (event === 'order.created') {
    return [
      'New order placed',
      `Order: #${order.orderNumber}`,
      `Customer: ${order.customerName}`,
      `Total: ${formatOrderTotal(order.totalInCents, order.currency)}`,
      `Gateway: ${order.paymentGateway.toUpperCase()}`,
      `Items: ${getItemCount(order)}`,
      `Status: ${formatStatusLabel(order.orderStatus || 'placed')}`,
    ].join('\n');
  }

  return [
    'Payment confirmed',
    `Order: #${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Total: ${formatOrderTotal(order.totalInCents, order.currency)}`,
    `Gateway: ${order.paymentGateway.toUpperCase()}`,
    `Reference: ${getPaymentReference(order)}`,
    `Status: ${formatStatusLabel(order.status)}`,
  ].join('\n');
}

export function buildAdminOrderAlertPayload(
  event: AdminOrderAlertEvent,
  order: AdminOrderAlertOrder,
  adminPhone: string
) {
  return {
    messaging_product: 'whatsapp',
    to: adminPhone,
    type: 'text',
    text: {
      body: buildAdminOrderAlertMessage(event, order),
    },
  };
}

export async function sendAdminOrderAlert(
  event: AdminOrderAlertEvent,
  order: AdminOrderAlertOrder
) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE;

  if (!token || !phoneNumberId || !adminPhone) {
    return false;
  }

  const res = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        buildAdminOrderAlertPayload(event, order, adminPhone)
      ),
    }
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(
      `Admin WhatsApp alert failed (${res.status}): ${errorText || 'Unknown error'}`
    );
  }

  return true;
}
