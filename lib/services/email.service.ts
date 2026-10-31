import { Resend } from 'resend';
import dbConnect from '@/lib/db';
import EmailTemplate, { EmailType } from '@/lib/models/EmailTemplate';
import Order from '@/lib/models/Order';
import type { ILineItem, IOrder } from '@/lib/models/Order';
import { getCustomerInvoiceUrl, getCustomerOrderUrl } from '@/lib/utils/invoice';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_fallback');
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'orders@yourdomain.com';
const SENDER_NAME = process.env.SENDER_NAME?.trim() || 'YOGLIVYA';
const FROM_EMAIL = `${SENDER_NAME} <${SENDER_EMAIL}>`;
const TEST_RECIPIENT = process.env.RESEND_TEST_EMAIL_TO?.trim();

type EmailAttachment = {
    filename: string;
    content: string;
};

type OrderEmailSentField = 'orderReceivedEmailSentAt' | 'orderConfirmedEmailSentAt';
type OrderEmailBase = Pick<
    IOrder,
    | '_id'
    | 'orderNumber'
    | 'customerEmail'
    | 'customerName'
    | 'lineItems'
    | 'totalInCents'
    | 'currency'
    | 'createdAt'
    | 'trackingUrl'
    | 'storefrontOrigin'
>;
type OrderReceivedEmailOrder = OrderEmailBase &
    Pick<IOrder, 'paymentGateway'>;
type OrderConfirmationEmailOrder = OrderEmailBase &
    Pick<IOrder, 'paidAt'>;
type OrderCancelledEmailOrder = Pick<
    IOrder,
    | '_id'
    | 'orderNumber'
    | 'customerEmail'
    | 'customerName'
    | 'lineItems'
    | 'totalInCents'
    | 'currency'
    | 'createdAt'
    | 'trackingUrl'
    | 'cancelledAt'
>;
type ContactNotificationInput = {
    contactId?: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    submittedAt?: Date | string;
};

export class EmailService {
    static async sendOrderEmailOnce(params: {
        orderId: string;
        to: string;
        type: EmailType;
        variables: Record<string, string>;
        sentAtField: OrderEmailSentField;
        options?: { attachments?: EmailAttachment[] };
    }) {
        await dbConnect();

        const reservedOrder = await Order.findOneAndUpdate(
            {
                _id: params.orderId,
                $or: [
                    { [params.sentAtField]: { $exists: false } },
                    { [params.sentAtField]: null },
                ],
            },
            {
                $set: {
                    [params.sentAtField]: new Date(),
                },
            },
            { new: true }
        );

        if (!reservedOrder) {
            console.log(
                `[EmailService] Skip duplicate ${params.type} email for order ${params.orderId}.`
            );
            return false;
        }

        const sent = await this.sendTemplatedEmail(
            params.to,
            params.type,
            params.variables,
            params.options
        );

        if (!sent) {
            await Order.findByIdAndUpdate(params.orderId, {
                $unset: { [params.sentAtField]: 1 },
            });
        }

        return sent;
    }

    static escapeHtml(value: string) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    static formatOrderTotal(totalInCents: number, currency: string) {
        try {
            return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
                style: 'currency',
                currency,
            }).format(totalInCents / 100);
        } catch {
            return `${currency} ${(totalInCents / 100).toFixed(2)}`;
        }
    }

    static buildLineItemsHtml(lineItems: ILineItem[], currency: string) {
        if (!lineItems.length) {
            return '<p style="margin: 0; color: #6f655b;">No items were attached to this order.</p>';
        }

        return `
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: separate; border-spacing: 0 14px; margin: 24px 0;">
                <tbody>
                    ${lineItems
                        .map(
                            (item) => `
                                <tr>
                                    <td style="padding: 0;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #eadfce; border-radius: 22px; overflow: hidden; background: #fffdf9;">
                                            <tbody>
                                                <tr>
                                                    <td class="mobile-stack" style="width: 92px; padding: 18px 0 18px 18px; vertical-align: top;">
                                                        ${
                                                            item.image
                                                                ? `<img src="${this.escapeHtml(item.image)}" alt="${this.escapeHtml(item.name)}" width="74" height="92" style="display:block; width:74px; height:92px; object-fit:cover; border-radius:18px; background:#f2ede6;" />`
                                                                : `<div style="width:74px; height:92px; border-radius:18px; background:#f2ede6; color:#85796d; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; text-align:center; line-height:92px;">Yoglivya</div>`
                                                        }
                                                    </td>
                                                    <td class="mobile-stack" style="padding: 18px; vertical-align: middle;">
                                                        <div style="font-size: 17px; font-weight: 700; color: #181512;">${this.escapeHtml(item.name)}</div>
                                                        <div style="margin-top: 6px; font-size: 12px; color: #85796d; letter-spacing: 0.12em; text-transform: uppercase;">SKU ${this.escapeHtml(item.sku)}</div>
                                                        <div style="margin-top: 14px; font-size: 13px; color: #6f655b;">Quantity: ${item.quantity}</div>
                                                        <div style="margin-top: 6px; font-size: 13px; color: #6f655b;">Unit Price: ${this.formatOrderTotal(item.priceAtPurchase, currency)}</div>
                                                    </td>
                                                    <td class="mobile-stack mobile-center" style="padding: 18px 18px 18px 0; vertical-align: middle; text-align: right;">
                                                        <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #9b8f82;">Line Total</div>
                                                        <div style="margin-top: 10px; font-size: 18px; font-weight: 700; color: #181512;">
                                                            ${this.formatOrderTotal(item.priceAtPurchase * item.quantity, currency)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            `
                        )
                        .join('')}
                </tbody>
            </table>
        `;
    }

    static buildEmailShell({
        preheader,
        eyebrow,
        title,
        lead,
        bodyHtml,
        primaryCtaLabel,
        primaryCtaUrl,
        secondaryCtaLabel,
        secondaryCtaUrl,
        footerNote,
        headerTagline,
    }: {
        preheader: string;
        eyebrow: string;
        title: string;
        lead: string;
        bodyHtml: string;
        primaryCtaLabel?: string;
        primaryCtaUrl?: string;
        secondaryCtaLabel?: string;
        secondaryCtaUrl?: string;
        footerNote?: string;
        headerTagline?: string;
    }) {
        const primaryCta =
            primaryCtaLabel && primaryCtaUrl
                ? `<a href="${primaryCtaUrl}" class="mobile-cta" style="display:inline-block; background:#181512; color:#fff8f0; text-decoration:none; padding:14px 22px; border-radius:999px; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">${primaryCtaLabel}</a>`
                : '';
        const secondaryCta =
            secondaryCtaLabel && secondaryCtaUrl
                ? `<a href="${secondaryCtaUrl}" class="mobile-cta-secondary" style="display:inline-block; margin-left:12px; border:1px solid #181512; color:#181512; text-decoration:none; padding:14px 22px; border-radius:999px; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">${secondaryCtaLabel}</a>`
                : '';

        return `
            <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>
            <style>
                @media only screen and (max-width: 620px) {
                    .email-shell { width: 100% !important; }
                    .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
                    .mobile-stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
                    .mobile-center { text-align: left !important; }
                    .mobile-cta, .mobile-cta-secondary { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; margin: 0 0 12px 0 !important; }
                    .hero-title { font-size: 32px !important; line-height: 1.1 !important; }
                }
            </style>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #f5efe7; width: 100%;">
                <tbody>
                    <tr>
                        <td align="center" style="padding: 32px 14px;">
                            <table role="presentation" width="640" cellspacing="0" cellpadding="0" class="email-shell" style="width: 640px; max-width: 640px; border-collapse: collapse;">
                                <tbody>
                                    <tr>
                                        <td class="mobile-pad" style="padding: 0 28px 16px;">
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                                                <tbody>
                                                    <tr>
                                                        <td style="font-size: 13px; letter-spacing: 0.38em; text-transform: uppercase; color: #181512; font-weight: 700;">YOGLIVYA</td>
                                                        <td align="right" style="font-size: 12px; color: #6f655b;">${headerTagline || 'Mindful yoga essentials, thoughtfully delivered.'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="mobile-pad" style="padding: 0 28px;">
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #fffaf4; border: 1px solid #eadfce; border-radius: 32px; overflow: hidden;">
                                                <tbody>
                                                    <tr>
                                                        <td style="padding: 34px 34px 28px; background: linear-gradient(135deg, #1b1713 0%, #54483b 100%);">
                                                            <div style="display:inline-block; padding: 8px 14px; border: 1px solid rgba(255,255,255,0.18); border-radius: 999px; color: rgba(255,248,240,0.86); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;">${eyebrow}</div>
                                                            <div class="hero-title" style="margin-top: 18px; font-size: 42px; line-height: 1; font-weight: 800; letter-spacing: -0.04em; color: #fff8f0;">${title}</div>
                                                            <div style="margin-top: 16px; max-width: 470px; font-size: 16px; line-height: 1.8; color: rgba(255,248,240,0.82);">${lead}</div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 30px 34px 34px;">
                                                            ${bodyHtml}
                                                            ${
                                                                primaryCta || secondaryCta
                                                                    ? `<div style="margin-top: 28px;">${primaryCta}${secondaryCta}</div>`
                                                                    : ''
                                                            }
                                                            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #eadfce; font-size: 12px; line-height: 1.8; color: #7f7366;">
                                                                ${footerNote || 'Need help with your order? Reply to this email and our care team will step in.'}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    static getOrderEmailVariables(order: Pick<IOrder, '_id' | 'orderNumber' | 'customerName' | 'lineItems' | 'totalInCents' | 'currency' | 'createdAt' | 'trackingUrl' | 'storefrontOrigin'>) {
        const orderId = String(order._id);
        const baseUrl = order.storefrontOrigin?.trim()?.replace(/\/$/, '') || this.getAppBaseUrl();
        return {
            orderNumber: order.orderNumber,
            customerName: order.customerName || 'Customer',
            totalAmount: this.formatOrderTotal(order.totalInCents, order.currency || 'USD'),
            currency: order.currency || 'USD',
            orderDate: new Date(order.createdAt).toLocaleDateString(),
            itemsHtml: this.buildLineItemsHtml(order.lineItems || [], order.currency || 'USD'),
            orderUrl: getCustomerOrderUrl(orderId, baseUrl),
            invoiceUrl: getCustomerInvoiceUrl(orderId, baseUrl),
            trackingUrl: order.trackingUrl || getCustomerOrderUrl(orderId, baseUrl),
        };
    }

    static getOrderReceivedVariables(
        order: Pick<IOrder, '_id' | 'orderNumber' | 'customerName' | 'lineItems' | 'totalInCents' | 'currency' | 'createdAt' | 'trackingUrl' | 'paymentGateway'>
    ) {
        const isCod = order.paymentGateway === 'cod';

        return {
            ...this.getOrderEmailVariables(order),
            paymentHeadline: isCod ? 'Cash on delivery selected' : 'Payment verification in progress',
            paymentNote: isCod
                ? 'Your order is placed successfully. Payment will be collected at delivery.'
                : 'Your order is created successfully. We will confirm the payment and send the next update as soon as the gateway verifies it.',
        };
    }

    static async sendOrderReceivedEmail(order: OrderReceivedEmailOrder) {
        return this.sendOrderEmailOnce({
            orderId: String(order._id),
            to: order.customerEmail,
            type: 'order_received',
            sentAtField: 'orderReceivedEmailSentAt',
            variables: this.getOrderReceivedVariables(order),
        });
    }

    static async sendOrderConfirmationEmail(order: OrderConfirmationEmailOrder) {
        return this.sendOrderEmailOnce({
            orderId: String(order._id),
            to: order.customerEmail,
            type: 'order_confirmed',
            sentAtField: 'orderConfirmedEmailSentAt',
            variables: {
                ...this.getOrderEmailVariables(order),
                orderDate: new Date(order.paidAt || order.createdAt).toLocaleDateString(),
            },
        });
    }

    static getAppBaseUrl() {
        return (
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            process.env.AUTH_URL ||
            'http://localhost:3000'
        ).replace(/\/$/, '');
    }

    static getContactNotificationRecipient() {
        return (
            process.env.CONTACT_NOTIFICATION_EMAIL?.trim() ||
            process.env.ADMIN_EMAIL?.trim() ||
            process.env.SENDER_EMAIL?.trim() ||
            ''
        );
    }

    static async sendOrderCancelledEmail(
        order: OrderCancelledEmailOrder,
        cancellationReason?: string
    ) {
        return this.sendTemplatedEmail(order.customerEmail, 'order_cancelled', {
            ...this.getOrderEmailVariables(order),
            cancelledDate: new Date(order.cancelledAt || new Date()).toLocaleDateString(),
            cancellationReason: cancellationReason || 'Your order has been cancelled.',
        });
    }

    static async sendContactNotificationEmail(contact: ContactNotificationInput) {
        const recipient = this.getContactNotificationRecipient();

        if (!recipient) {
            console.warn('[EmailService] No contact notification recipient configured.');
            return false;
        }

        const adminContactsUrl = contact.contactId
            ? `${this.getAppBaseUrl()}/admin/contacts/${contact.contactId}`
            : `${this.getAppBaseUrl()}/admin/contacts`;

        return this.sendTemplatedEmail(recipient, 'contact_admin_notification', {
            customerName: this.escapeHtml(contact.name),
            customerEmail: this.escapeHtml(contact.email),
            customerPhone: this.escapeHtml(contact.phone || 'Not provided'),
            contactSubject: this.escapeHtml(contact.subject),
            contactMessage: this.escapeHtml(contact.message).replace(/\r?\n/g, '<br />'),
            submittedAt: new Date(contact.submittedAt || new Date()).toLocaleString(),
            adminContactsUrl,
        });
    }

    /**
     * Seeds default templates into the database if they don't exist.
     * This ensures the admin panel is prepopulated with working templates.
     */
    static async seedDefaultTemplates() {
        await dbConnect();
        const DEFAULTS = [
            {
                type: 'order_received',
                name: 'Order Received',
                subject: 'We received your order {{orderNumber}}',
                description: 'Variables: orderNumber, customerName, totalAmount, orderDate, itemsHtml, orderUrl, paymentHeadline, paymentNote',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your order has been placed successfully.',
                    eyebrow: 'Order Received',
                    title: 'We received your order.',
                    lead: `Your order <strong>#{{orderNumber}}</strong> was placed on {{orderDate}}. This email is sent immediately after checkout succeeds so the customer gets instant reassurance.`,
                    bodyHtml: `
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                            <tbody>
                                <tr>
                                    <td class="mobile-stack" style="width: 50%; padding-right: 8px; vertical-align: top;">
                                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4;">
                                            <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c7e6f;">Order Total</div>
                                            <div style="margin-top: 10px; font-size: 18px; font-weight: 700; color: #181512;">{{totalAmount}}</div>
                                        </div>
                                    </td>
                                    <td class="mobile-stack" style="width: 50%; padding-left: 8px; vertical-align: top;">
                                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4;">
                                            <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c7e6f;">Status</div>
                                            <div style="margin-top: 10px; font-size: 18px; font-weight: 700; color: #181512;">{{paymentHeadline}}</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="margin-top: 24px; padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            {{paymentNote}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'View Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'order_confirmed',
                name: 'Order Confirmation',
                subject: 'Confirmed: Your Order {{orderNumber}}',
                description: 'Variables: orderNumber, customerName, totalAmount, orderDate, itemsHtml, orderUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your order is confirmed and we are preparing it now.',
                    eyebrow: 'Order Confirmed',
                    title: 'Thank you for your order.',
                    lead: `We’ve received order <strong>#{{orderNumber}}</strong> placed on {{orderDate}}. Everything below is captured the way a premium ecommerce brand should present it.`,
                    bodyHtml: `
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                            <tbody>
                                <tr>
                                    <td class="mobile-stack" style="width: 50%; padding-right: 8px; vertical-align: top;">
                                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4;">
                                            <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c7e6f;">Customer</div>
                                            <div style="margin-top: 10px; font-size: 18px; font-weight: 700; color: #181512;">{{customerName}}</div>
                                        </div>
                                    </td>
                                    <td class="mobile-stack" style="width: 50%; padding-left: 8px; vertical-align: top;">
                                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4;">
                                            <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c7e6f;">Order Total</div>
                                            <div style="margin-top: 10px; font-size: 18px; font-weight: 700; color: #181512;">{{totalAmount}}</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="margin-top: 24px; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            We’ll notify you again the moment it ships. Until then, here’s the full visual summary of your order.
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'View Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'order_shipped',
                name: 'Order Shipped',
                subject: 'Shipped: Your Order {{orderNumber}} is on the way!',
                description: 'Variables: orderNumber, customerName, trackingUrl, itemsHtml, orderUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your order has been shipped and tracking is ready.',
                    eyebrow: 'Order Shipped',
                    title: 'Your parcel is on the way.',
                    lead: `Tracking is now active for order <strong>#{{orderNumber}}</strong>. We’ve kept the product imagery and clean presentation intact here too.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4;">
                            <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c7e6f;">Tracking Ready</div>
                            <div style="margin-top: 10px; font-size: 15px; line-height: 1.8; color: #5d5348;">Use the button below to view the latest movement on your shipment at any time.</div>
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'Track Package',
                    primaryCtaUrl: '{{trackingUrl}}',
                    secondaryCtaLabel: 'Order Details',
                    secondaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'order_delivered',
                name: 'Order Delivered',
                subject: 'Delivered: Your Order {{orderNumber}} has arrived',
                description: 'Variables: orderNumber, customerName, totalAmount, itemsHtml, orderUrl, invoiceUrl, deliveredDate',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your delivery is complete and your invoice is ready.',
                    eyebrow: 'Delivered',
                    title: 'Your order has arrived.',
                    lead: `Order <strong>#{{orderNumber}}</strong> was delivered on {{deliveredDate}}. The invoice slip is attached and can also be opened from your dashboard.`,
                    bodyHtml: `
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                            <tbody>
                                <tr>
                                    <td class="mobile-stack" style="width: 50%; padding-right: 8px; vertical-align: top;">
                                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4;">
                                            <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c7e6f;">Delivered On</div>
                                            <div style="margin-top: 10px; font-size: 18px; font-weight: 700; color: #181512;">{{deliveredDate}}</div>
                                        </div>
                                    </td>
                                    <td class="mobile-stack" style="width: 50%; padding-left: 8px; vertical-align: top;">
                                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4;">
                                            <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c7e6f;">Total Paid</div>
                                            <div style="margin-top: 10px; font-size: 18px; font-weight: 700; color: #181512;">{{totalAmount}}</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {{itemsHtml}}
                        <div style="margin-top: 12px; font-size: 14px; line-height: 1.8; color: #5d5348;">
                            Keep this email for your records. A responsive invoice slip is attached and the same document is also available in your account.
                        </div>
                    `,
                    primaryCtaLabel: 'View Invoice',
                    primaryCtaUrl: '{{invoiceUrl}}',
                    secondaryCtaLabel: 'Open Order',
                    secondaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'order_cancelled',
                name: 'Order Cancelled',
                subject: 'Cancelled: Your Order {{orderNumber}}',
                description: 'Variables: customerName, orderNumber, totalAmount, cancellationReason, cancelledDate, itemsHtml, orderUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your order has been cancelled.',
                    eyebrow: 'Order Cancelled',
                    title: 'Your order has been cancelled.',
                    lead: `Order <strong>#{{orderNumber}}</strong> was cancelled on {{cancelledDate}}. The cancelled items are still shown below so the customer has a full record of what was affected.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Cancellation note:</strong> {{cancellationReason}}<br />
                            <strong style="color:#181512;">Order total:</strong> {{totalAmount}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'Open Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'account_created',
                name: 'Welcome Email',
                subject: 'Welcome to our Store, {{customerName}}!',
                description: 'Variables: customerName, loginUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your Yoglivya account is ready.',
                    eyebrow: 'Welcome',
                    title: 'Your account is ready.',
                    lead: 'You can now manage orders, track deliveries, access invoices, and submit post-delivery support requests from one place.',
                    headerTagline: 'Welcome to your Yoglivya account.',
                    bodyHtml: `
                        <div style="padding: 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">{{customerName}}</strong>, your profile has been created successfully. This first-touch email is now designed to feel as premium as the storefront.
                        </div>
                    `,
                    primaryCtaLabel: 'Sign In',
                    primaryCtaUrl: '{{loginUrl}}',
                }),
            },
            {
                type: 'password_reset',
                name: 'Password Reset',
                subject: 'Reset your password',
                description: 'Variables: customerName, resetUrl, expiryHours, supportEmail',
                bodyHtml: this.buildEmailShell({
                    preheader: 'A secure link is ready for your password reset.',
                    eyebrow: 'Account Security',
                    title: 'Reset your password.',
                    lead: 'We received a request to reset your password. Use the secure link below to choose a new one and regain access to your account.',
                    headerTagline: 'Password reset and security update.',
                    bodyHtml: `
                        <div style="padding: 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">{{customerName}}</strong>, this reset link stays active for {{expiryHours}} hour(s). If you did not request this, you can ignore this email and your password will stay unchanged.
                        </div>
                        <div style="margin-top: 18px; padding: 20px; border-radius: 22px; background: #fffdf9; border: 1px solid #eadfce; font-size: 14px; line-height: 1.8; color: #5d5348;">
                            For extra safety, only use the button below and avoid forwarding this email. If you need help, contact {{supportEmail}}.
                        </div>
                    `,
                    primaryCtaLabel: 'Reset Password',
                    primaryCtaUrl: '{{resetUrl}}',
                }),
            },
            {
                type: 'password_changed',
                name: 'Password Changed Confirmation',
                subject: 'Your password was changed',
                description: 'Variables: customerName, loginUrl, supportEmail',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your password has been updated successfully.',
                    eyebrow: 'Account Security',
                    title: 'Your password was updated.',
                    lead: 'This is a confirmation that your account password has just been changed successfully.',
                    headerTagline: 'Account security confirmation.',
                    bodyHtml: `
                        <div style="padding: 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">{{customerName}}</strong>, if this was you, no further action is required.
                        </div>
                        <div style="margin-top: 18px; padding: 20px; border-radius: 22px; background: #fffdf9; border: 1px solid #eadfce; font-size: 14px; line-height: 1.8; color: #5d5348;">
                            If you did not make this change, contact {{supportEmail}} immediately and reset your password again.
                        </div>
                    `,
                    primaryCtaLabel: 'Sign In',
                    primaryCtaUrl: '{{loginUrl}}',
                }),
            },
            {
                type: 'cancel_request_received',
                name: 'Cancellation Request Received',
                subject: 'We received your cancellation request for Order {{orderNumber}}',
                description: 'Variables: customerName, orderNumber, totalAmount, orderDate, cancellationReason, itemsHtml',
                bodyHtml: this.buildEmailShell({
                    preheader: 'We received your cancellation request.',
                    eyebrow: 'Cancellation Request',
                    title: 'Your request is under review.',
                    lead: `We received your request to cancel <strong>#{{orderNumber}}</strong>. The exact products connected to that request are shown below.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Reason shared:</strong> {{cancellationReason}}<br />
                            <strong style="color:#181512;">Order total:</strong> {{totalAmount}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'View Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'cancel_request_approved',
                name: 'Cancellation Approved',
                subject: 'Cancellation approved for Order {{orderNumber}}',
                description: 'Variables: customerName, orderNumber, totalAmount, decisionReason, itemsHtml',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your cancellation request has been approved.',
                    eyebrow: 'Cancellation Approved',
                    title: 'Your cancellation has been approved.',
                    lead: `The cancellation request for <strong>#{{orderNumber}}</strong> is now approved. Customers see the exact items affected, not just a plain status line.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Team note:</strong> {{decisionReason}}<br />
                            <strong style="color:#181512;">Order total:</strong> {{totalAmount}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'Open Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'cancel_request_rejected',
                name: 'Cancellation Rejected',
                subject: 'Update on your cancellation request for Order {{orderNumber}}',
                description: 'Variables: customerName, orderNumber, decisionReason, itemsHtml',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your cancellation request has been reviewed.',
                    eyebrow: 'Cancellation Update',
                    title: 'Your cancellation could not be completed.',
                    lead: `We reviewed your request for <strong>#{{orderNumber}}</strong>. The email stays polished and transparent, with the exact products and team note included.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Team note:</strong> {{decisionReason}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'Open Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'return_request_received',
                name: 'Return Request Received',
                subject: 'We received your return request for Order {{orderNumber}}',
                description: 'Variables: customerName, orderNumber, requestReason, itemsHtml, orderUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your return request is now under review.',
                    eyebrow: 'Return Request',
                    title: 'Return request received.',
                    lead: `We’ve logged your return request for <strong>#{{orderNumber}}</strong> and attached the products involved below.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Reason shared:</strong> {{requestReason}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'Open Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'return_request_approved',
                name: 'Return Request Approved',
                subject: 'Return approved for Order {{orderNumber}}',
                description: 'Variables: customerName, orderNumber, decisionReason, itemsHtml, orderUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your return request has been approved.',
                    eyebrow: 'Return Approved',
                    title: 'Your return has been approved.',
                    lead: `The return request for <strong>#{{orderNumber}}</strong> is approved. The customer email keeps the order context and product imagery front and center.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Team note:</strong> {{decisionReason}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'Open Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'return_request_rejected',
                name: 'Return Request Rejected',
                subject: 'Update on your return request for Order {{orderNumber}}',
                description: 'Variables: customerName, orderNumber, decisionReason, itemsHtml, orderUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your return request has been reviewed.',
                    eyebrow: 'Return Update',
                    title: 'Your return request was reviewed.',
                    lead: `We’ve completed the review for <strong>#{{orderNumber}}</strong> and included the affected items below.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Team note:</strong> {{decisionReason}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'Open Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'replacement_request_received',
                name: 'Replacement Request Received',
                subject: 'We received your replacement request for Order {{orderNumber}}',
                description: 'Variables: customerName, orderNumber, requestReason, itemsHtml, orderUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your replacement request is now under review.',
                    eyebrow: 'Replacement Request',
                    title: 'Replacement request received.',
                    lead: `We’ve logged your replacement request for <strong>#{{orderNumber}}</strong> and preserved the exact product details below.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Reason shared:</strong> {{requestReason}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'Open Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'replacement_request_approved',
                name: 'Replacement Request Approved',
                subject: 'Replacement approved for Order {{orderNumber}}',
                description: 'Variables: customerName, orderNumber, decisionReason, itemsHtml, orderUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your replacement request has been approved.',
                    eyebrow: 'Replacement Approved',
                    title: 'Your replacement is approved.',
                    lead: `The replacement flow for <strong>#{{orderNumber}}</strong> is now moving ahead. Product cards stay visible so the email still feels grounded and premium.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Team note:</strong> {{decisionReason}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'Open Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'replacement_request_rejected',
                name: 'Replacement Request Rejected',
                subject: 'Update on your replacement request for Order {{orderNumber}}',
                description: 'Variables: customerName, orderNumber, decisionReason, itemsHtml, orderUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your replacement request has been reviewed.',
                    eyebrow: 'Replacement Update',
                    title: 'Your replacement request was reviewed.',
                    lead: `We’ve completed the review for <strong>#{{orderNumber}}</strong> and included the product details below for clarity.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Team note:</strong> {{decisionReason}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'Open Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'refund_processed',
                name: 'Refund Processed',
                subject: 'Your refund for Order {{orderNumber}} has been processed',
                description: 'Variables: customerName, orderNumber, refundAmount, itemsHtml, orderUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'Your refund has been processed.',
                    eyebrow: 'Refund Complete',
                    title: 'Your refund has been processed.',
                    lead: `We’ve completed the refund for <strong>#{{orderNumber}}</strong>. The refunded products are still shown below so the email reads like a finished customer record, not a raw system alert.`,
                    bodyHtml: `
                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Refund amount:</strong> {{refundAmount}}
                        </div>
                        {{itemsHtml}}
                    `,
                    primaryCtaLabel: 'View Order',
                    primaryCtaUrl: '{{orderUrl}}',
                }),
            },
            {
                type: 'contact_auto_reply',
                name: 'Contact Form Auto-Reply',
                subject: 'We received your message!',
                description: 'Variables: customerName',
                bodyHtml: this.buildEmailShell({
                    preheader: 'We received your message and our team will reply shortly.',
                    eyebrow: 'Support',
                    title: 'We received your message.',
                    lead: 'Your note is safely in our support queue. A specialist will get back to you within 24 hours with the same care and polish reflected across the storefront experience.',
                    bodyHtml: `
                        <div style="padding: 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">{{customerName}}</strong>, thank you for getting in touch. This auto-reply is intentionally designed to feel on-brand rather than transactional.
                        </div>
                    `,
                }),
            },
            {
                type: 'contact_admin_notification',
                name: 'Contact Form Admin Notification',
                subject: 'New contact inquiry: {{contactSubject}}',
                description: 'Variables: customerName, customerEmail, customerPhone, contactSubject, contactMessage, submittedAt, adminContactsUrl',
                bodyHtml: this.buildEmailShell({
                    preheader: 'A new contact form submission needs attention.',
                    eyebrow: 'Support Inbox',
                    title: 'New contact inquiry received.',
                    lead: 'A customer has submitted the contact form. This internal notification keeps the details clean, readable, and ready for a fast response.',
                    bodyHtml: `
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                            <tbody>
                                <tr>
                                    <td class="mobile-stack" style="width: 50%; padding-right: 8px; vertical-align: top;">
                                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4;">
                                            <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c7e6f;">From</div>
                                            <div style="margin-top: 10px; font-size: 18px; font-weight: 700; color: #181512;">{{customerName}}</div>
                                            <div style="margin-top: 6px; font-size: 14px; color: #5d5348;">{{customerEmail}}</div>
                                            <div style="margin-top: 6px; font-size: 14px; color: #5d5348;">{{customerPhone}}</div>
                                        </div>
                                    </td>
                                    <td class="mobile-stack" style="width: 50%; padding-left: 8px; vertical-align: top;">
                                        <div style="padding: 18px 20px; border-radius: 22px; background: #f4ede4;">
                                            <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8c7e6f;">Submitted</div>
                                            <div style="margin-top: 10px; font-size: 18px; font-weight: 700; color: #181512;">{{submittedAt}}</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="margin-top: 24px; padding: 18px 20px; border-radius: 22px; background: #f4ede4; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            <strong style="color:#181512;">Subject:</strong> {{contactSubject}}
                        </div>
                        <div style="margin-top: 18px; padding: 20px; border-radius: 22px; background: #fffdf9; border: 1px solid #eadfce; font-size: 15px; line-height: 1.8; color: #5d5348;">
                            {{contactMessage}}
                        </div>
                    `,
                    primaryCtaLabel: 'Open Support Inbox',
                    primaryCtaUrl: '{{adminContactsUrl}}',
                }),
            }
        ];

        for (const tmpl of DEFAULTS) {
            await EmailTemplate.updateOne(
                { type: tmpl.type },
                { $set: tmpl },
                { upsert: true }
            );
        }
    }

    /**
     * Interpolates values into an active template and triggers Resend payload
     */
    static async sendTemplatedEmail(
        to: string,
        type: EmailType,
        variables: Record<string, string>,
        options?: { attachments?: EmailAttachment[] }
    ) {
        if (!process.env.RESEND_API_KEY) {
            console.warn('[EmailService] RESEND_API_KEY missing. Cannot send real email to', to);
            return false;
        }

        if (!process.env.SENDER_EMAIL || process.env.SENDER_EMAIL.includes('yourdomain.com')) {
            console.warn(
                '[EmailService] SENDER_EMAIL is still using the placeholder domain. Configure a verified Resend sender before expecting deliveries.'
            );
            return false;
        }

        await dbConnect();
        await this.seedDefaultTemplates();
        const template = await EmailTemplate.findOne({ type, isActive: true });
        
        if (!template) {
            console.warn(`[EmailService] Template '${type}' is missing or inactive. Action aborted.`);
            return false;
        }

        const replacer = (text: string) => {
            return text.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
                return variables[key] !== undefined ? variables[key] : ``;
            });
        };

        const subjectHTML = replacer(template.subject);
        const bodyHTML = replacer(template.bodyHtml);
        const finalRecipient = TEST_RECIPIENT || to;

        if (TEST_RECIPIENT && TEST_RECIPIENT !== to) {
            console.log(
                `[EmailService] Development reroute enabled. Sending ${type} to ${TEST_RECIPIENT} instead of ${to}.`
            );
        }

        try {
            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: finalRecipient,
                subject: subjectHTML,
                html: bodyHTML,
                attachments: options?.attachments,
            });

            if (result.error) {
                console.error('[EmailService] Resend API Error:', result.error);
                return false;
            }
            console.log(`[EmailService] Dispatched ${type} successfully to ${finalRecipient}`);
            return true;
        } catch (error) {
            console.error('[EmailService] Hard block failure:', error);
            return false;
        }
    }
}
