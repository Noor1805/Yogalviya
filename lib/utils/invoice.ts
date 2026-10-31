import type { IOrder, ILineItem } from '@/lib/models/Order';

type InvoiceOrder = Pick<
  IOrder,
  | '_id'
  | 'orderNumber'
  | 'customerName'
  | 'customerEmail'
  | 'paymentGateway'
  | 'paymentStatus'
  | 'totalInCents'
  | 'currency'
  | 'lineItems'
  | 'shippingAddress'
  | 'createdAt'
  | 'paidAt'
  | 'deliveredAt'
  | 'trackingNumber'
  | 'storefrontOrigin'
>;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const formatInvoiceCurrency = (amountInCents: number, currency: string) => {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amountInCents / 100);
  } catch {
    return `${currency} ${(amountInCents / 100).toFixed(2)}`;
  }
};

export const getAppBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.AUTH_URL ||
  'http://localhost:3000';

export const getCustomerOrderUrl = (orderId: string, baseUrl?: string) =>
  `${(baseUrl || getAppBaseUrl()).replace(/\/$/, '')}/account/orders/${orderId}`;

export const getCustomerInvoiceUrl = (orderId: string, baseUrl?: string) =>
  `${(baseUrl || getAppBaseUrl()).replace(/\/$/, '')}/api/customer/orders/${orderId}/invoice`;

export const isInvoiceAvailable = (
  order: Pick<IOrder, 'status' | 'deliveredAt' | 'completedAt'>
) =>
  Boolean(
    order.deliveredAt ||
      order.completedAt ||
      ['delivered', 'completed', 'returned', 'replaced', 'refunded'].includes(order.status)
  );

const getInvoiceNumber = (orderNumber: string) => `INV-${orderNumber}`;

const buildAddressBlock = (address: InvoiceOrder['shippingAddress']) =>
  [
    address.line1,
    address.line2,
    `${address.city}, ${address.state}`,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .map((line) => `<div>${escapeHtml(line as string)}</div>`)
    .join('');

const buildLineItemRow = (item: ILineItem, currency: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #ece7df; border-radius: 22px; background: #fffdf9; margin-bottom: 14px;">
    <tbody>
      <tr>
        <td class="invoice-item-image" style="width: 96px; padding: 18px 0 18px 18px; vertical-align: top;">
          ${
            item.image
              ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" width="76" height="92" style="display:block; width:76px; height:92px; object-fit:cover; border-radius:18px; background:#f2ede6;" />`
              : `<div style="width:76px; height:92px; border-radius:18px; background:#f2ede6; color:#85796d; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; text-align:center; line-height:92px;">Yoglivya</div>`
          }
        </td>
        <td class="invoice-item-copy" style="padding: 18px; vertical-align: middle;">
          <div style="font-size:17px; font-weight:700; color:#181512;">${escapeHtml(item.name)}</div>
          <div style="margin-top:6px; font-size:12px; color:#85796d; letter-spacing:0.12em; text-transform:uppercase;">SKU ${escapeHtml(item.sku)}</div>
          <div style="margin-top:14px; font-size:13px; color:#6f655b;">Quantity: ${item.quantity}</div>
          <div style="margin-top:6px; font-size:13px; color:#6f655b;">Unit Price: ${formatInvoiceCurrency(item.priceAtPurchase, currency)}</div>
        </td>
        <td class="invoice-item-total" style="padding: 18px 18px 18px 0; vertical-align: middle; text-align: right;">
          <div style="font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#9b8f82;">Line Total</div>
          <div style="margin-top:10px; font-size:18px; font-weight:700; color:#181512;">${formatInvoiceCurrency(item.priceAtPurchase * item.quantity, currency)}</div>
        </td>
      </tr>
    </tbody>
  </table>
`;

export const buildInvoiceHtmlDocument = (order: InvoiceOrder) => {
  const invoiceNumber = getInvoiceNumber(order.orderNumber);
  const createdDate = new Date(order.createdAt).toLocaleDateString();
  const paidDate = order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'Pending';
  const deliveredDate = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleDateString()
    : 'Not delivered yet';
  const orderId = String(order._id);
  const baseUrl = order.storefrontOrigin?.trim()?.replace(/\/$/, '') || getAppBaseUrl();
  const total = formatInvoiceCurrency(order.totalInCents, order.currency);
  const lineItemsHtml = order.lineItems
    .map((item) => buildLineItemRow(item, order.currency))
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(invoiceNumber)}</title>
    <style>
      body { margin: 0; background: #f6f1ea; color: #181512; font-family: Arial, Helvetica, sans-serif; }
      @media only screen and (max-width: 620px) {
        .invoice-shell { padding: 20px 12px !important; }
        .invoice-content { padding: 24px !important; }
        .invoice-card { display: block !important; width: 100% !important; box-sizing: border-box !important; margin-bottom: 14px !important; }
        .invoice-item-image, .invoice-item-copy, .invoice-item-total { display: block !important; width: 100% !important; box-sizing: border-box !important; }
        .invoice-item-image { padding: 18px 18px 0 18px !important; }
        .invoice-item-total { padding: 0 18px 18px 18px !important; text-align: left !important; }
        .invoice-total-card { width: 100% !important; }
      }
    </style>
  </head>
  <body>
    <div class="invoice-shell" style="max-width:860px; margin:0 auto; padding:40px 20px;">
      <div style="background:#ffffff; border:1px solid #e9dfd3; border-radius:28px; overflow:hidden; box-shadow:0 20px 60px rgba(34, 26, 17, 0.08);">
        <div style="padding:32px 36px; background:#161514; color:#f7f2eb;">
          <div style="font-size:12px; letter-spacing:0.35em; text-transform:uppercase; opacity:0.7;">Yoglivya</div>
          <div style="margin-top:14px; font-size:34px; font-weight:700; letter-spacing:-0.04em;">Invoice Slip</div>
          <div style="margin-top:10px; max-width:420px; font-size:15px; line-height:1.7; opacity:0.85;">
            Order ${escapeHtml(order.orderNumber)} for ${escapeHtml(order.customerName)}.
          </div>
        </div>

        <div class="invoice-content" style="padding:36px;">
          <div>
            <div class="invoice-card" style="display:inline-block; width:calc(50% - 14px); vertical-align:top; margin-right:24px; padding:20px; border:1px solid #ece7df; border-radius:20px; background:#fbf8f4;">
              <div style="font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#8a8177;">Invoice Details</div>
              <div style="margin-top:14px; display:grid; gap:10px; font-size:14px; color:#4a433c;">
                <div><strong style="color:#181512;">Invoice No:</strong> ${escapeHtml(invoiceNumber)}</div>
                <div><strong style="color:#181512;">Order No:</strong> ${escapeHtml(order.orderNumber)}</div>
                <div><strong style="color:#181512;">Issued On:</strong> ${escapeHtml(createdDate)}</div>
                <div><strong style="color:#181512;">Paid On:</strong> ${escapeHtml(paidDate)}</div>
                <div><strong style="color:#181512;">Delivered On:</strong> ${escapeHtml(deliveredDate)}</div>
              </div>
            </div>

            <div class="invoice-card" style="display:inline-block; width:calc(50% - 14px); vertical-align:top; padding:20px; border:1px solid #ece7df; border-radius:20px; background:#fbf8f4;">
              <div style="font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#8a8177;">Bill To / Ship To</div>
              <div style="margin-top:14px; font-size:14px; line-height:1.8; color:#4a433c;">
                <div style="font-weight:600; color:#181512;">${escapeHtml(order.customerName)}</div>
                <div>${escapeHtml(order.customerEmail)}</div>
                <div style="margin-top:8px;">${buildAddressBlock(order.shippingAddress)}</div>
              </div>
            </div>
          </div>

          <div style="margin-top:28px;">${lineItemsHtml}</div>

          <div style="margin-top:28px; display:flex; justify-content:flex-end;">
            <div class="invoice-total-card" style="width:320px; border:1px solid #ece7df; border-radius:20px; padding:20px; background:#fbf8f4;">
              <div style="display:flex; justify-content:space-between; font-size:14px; color:#4a433c;">
                <span>Subtotal</span>
                <span>${escapeHtml(total)}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:14px; color:#4a433c;">
                <span>Shipping</span>
                <span>Included</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-top:18px; padding-top:18px; border-top:1px solid #e1d6ca; font-size:18px; font-weight:700; color:#181512;">
                <span>Total Paid</span>
                <span>${escapeHtml(total)}</span>
              </div>
            </div>
          </div>

          <div style="margin-top:28px; padding:20px; border-radius:20px; background:#161514; color:#f7f2eb;">
            <div style="font-size:11px; letter-spacing:0.2em; text-transform:uppercase; opacity:0.7;">Payment & Support</div>
            <div style="margin-top:14px; font-size:14px; line-height:1.8; opacity:0.9;">
              <div><strong>Payment Method:</strong> ${escapeHtml(order.paymentGateway.toUpperCase())}</div>
              <div><strong>Payment Status:</strong> ${escapeHtml((order.paymentStatus || 'pending').replace(/_/g, ' '))}</div>
              <div><strong>Tracking Reference:</strong> ${escapeHtml(order.trackingNumber || 'Will appear when available')}</div>
            </div>
          </div>

          <div style="margin-top:24px; font-size:12px; line-height:1.8; color:#7a7268;">
            This invoice was generated automatically for your records. You can also view the latest order details from your account:
            <a href="${escapeHtml(getCustomerOrderUrl(orderId, baseUrl))}" style="color:#181512; font-weight:600;">${escapeHtml(getCustomerOrderUrl(orderId, baseUrl))}</a>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

export const buildInvoiceAttachment = (order: InvoiceOrder) => ({
  filename: `${getInvoiceNumber(order.orderNumber)}.html`,
  content: Buffer.from(buildInvoiceHtmlDocument(order), 'utf8').toString('base64'),
});
