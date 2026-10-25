'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Download, ExternalLink, Loader2, MapPin, Package, RefreshCcw, XCircle } from 'lucide-react';
import OrderSupportDialog from '@/components/account/OrderSupportDialog';

interface OrderDetails {
    _id: string;
    orderNumber: string;
    status: string;
    paymentStatus?: string;
    fulfillmentStatus?: string;
    orderStatus?: string;
    cancellation?: { status: string; reason?: string; requestedAt?: string; adminDecisionReason?: string };
    returnRequest?: { status: string; requestedAt?: string; adminDecisionReason?: string };
    replacement?: { status: string; requestedAt?: string; adminDecisionReason?: string };
    refund?: { status: string; gatewayRefundId?: string; amount?: number; reason?: string; completedAt?: string };
    totalInCents: number;
    currency: 'USD' | 'INR';
    deliveredAt?: string;
    createdAt: string;
    paidAt?: string;
    acceptedAt?: string;
    processedAt?: string;
    packedAt?: string;
    shippedAt?: string;
    outForDeliveryAt?: string;
    completedAt?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    lineItems: Array<{ name: string; quantity: number; sku: string; priceAtPurchase: number; image?: string }>;
    shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    notes: Array<{ message: string; author: string; createdAt: string }>;
}

const formatMoney = (amountInCents: number, currency: 'USD' | 'INR') =>
    new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency,
    }).format(amountInCents / 100);

const CUSTOMER_STATUS_LABELS: Record<string, string> = {
    pending: 'Payment pending',
    paid: 'Order confirmed',
    processing: 'Processing',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for delivery',
    delivery_failed: 'Delivery attempt failed',
    delivered: 'Delivered',
    completed: 'Completed',
    cancel_requested: 'Cancellation requested',
    cancel_approved: 'Cancellation approved',
    cancelled: 'Cancelled',
    refund_pending: 'Refund processing',
    refunded: 'Refunded',
    return_requested: 'Return requested',
    return_approved: 'Return approved',
    return_pickup_scheduled: 'Return pickup scheduled',
    return_picked_up: 'Return picked up',
    return_received: 'Return received',
    return_qc_passed: 'Return approved for refund',
    return_qc_failed: 'Return review failed',
    returned: 'Returned',
    replace_requested: 'Replacement requested',
    replace_approved: 'Replacement approved',
    replacement_processing: 'Replacement processing',
    replacement_shipped: 'Replacement shipped',
    replaced: 'Replaced',
};

export default function OrderDetailsClient({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showReturnDialog, setShowReturnDialog] = useState(false);
    const [showReplaceDialog, setShowReplaceDialog] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/customer/orders/${params.id}`);
                const data = await res.json();
                if (data.success) {
                    setOrder(data.data);
                } else {
                    setOrder(null);
                }
            } catch (error) {
                console.error(error);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params.id]);

    const isWithin7Days = (deliveredAtStr?: string) => {
        if (!deliveredAtStr) return false;
        const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(deliveredAtStr).getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    const hasActiveCancellation = order?.cancellation?.status === 'requested' || order?.cancellation?.status === 'approved';
    const hasActiveReturn = order?.returnRequest && !['none', 'rejected', 'refunded', 'closed'].includes(order.returnRequest.status);
    const hasActiveReplacement = order?.replacement && !['none', 'rejected', 'replaced', 'closed'].includes(order.replacement.status);
    const canCancel = Boolean(order && !hasActiveCancellation && ['pending', 'paid', 'processing', 'packed'].includes(order.status));
    const canReturnOrReplace = Boolean(
        order &&
        !hasActiveReturn &&
        !hasActiveReplacement &&
        ['delivered', 'completed'].includes(order.status) &&
        isWithin7Days(order.deliveredAt)
    );
    const canAccessInvoice = Boolean(
        order &&
        (order.deliveredAt || order.completedAt || ['delivered', 'completed', 'returned', 'replaced', 'refunded'].includes(order.status))
    );

    const timeline = useMemo(() => {
        if (!order) return [];

        return [
            { label: 'Order placed', date: order.createdAt },
            { label: 'Payment confirmed', date: order.paidAt },
            { label: 'Order accepted', date: order.acceptedAt },
            { label: 'Processing', date: order.processedAt },
            { label: 'Packed', date: order.packedAt },
            { label: 'Shipped', date: order.shippedAt },
            { label: 'Out for delivery', date: order.outForDeliveryAt },
            { label: 'Delivered', date: order.deliveredAt },
            { label: 'Completed', date: order.completedAt },
        ].filter((item) => item.date);
    }, [order]);

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        setActionLoading(true);
        setMessage('');

        try {
            const res = await fetch(`/api/customer/orders/${params.id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel', reason: 'Customer cancelled from account dashboard' }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to cancel order');
            }

            setMessage(data.message);
            setOrder((current) =>
                current
                    ? {
                          ...current,
                          status: 'cancel_requested',
                          cancellation: {
                              ...(current.cancellation || {}),
                              status: 'requested',
                              requestedAt: new Date().toISOString(),
                          },
                      }
                    : current
            );
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-neutral-300" /></div>;
    }

    if (!order) {
        return <div className="py-12 text-center text-neutral-500">Order not found.</div>;
    }

    const effectivePaymentStatus =
        order.paymentStatus ||
        (order.refund?.status === 'completed' ? 'refunded' : undefined) ||
        (order.paidAt ? 'paid' : 'pending');

    return (
        <div className="animate-fade-in-up space-y-8">
            <Link href="/account/orders" className="inline-flex items-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Link>

            <div className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-400">Order Reference</p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">#{order.orderNumber}</h1>
                        <p className="mt-2 text-sm text-neutral-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString()} with {order.lineItems.length} item{order.lineItems.length > 1 ? 's' : ''}.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {message && <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">{message}</div>}
                        {canCancel && (
                            <button
                                onClick={handleCancel}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                            >
                                <XCircle className="h-4 w-4" />
                                Request Cancellation
                            </button>
                        )}
                        {canReturnOrReplace && (
                            <>
                                <button onClick={() => setShowReturnDialog(true)} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
                                    <RefreshCcw className="h-4 w-4" />
                                    Return
                                </button>
                                <button onClick={() => setShowReplaceDialog(true)} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
                                    <AlertCircle className="h-4 w-4" />
                                    Replace
                                </button>
                            </>
                        )}
                        {canAccessInvoice && (
                            <>
                                <a
                                    href={`/api/customer/orders/${order._id}/invoice`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    View Invoice
                                </a>
                                <a
                                    href={`/api/customer/orders/${order._id}/invoice?download=1`}
                                    className="inline-flex items-center gap-2 rounded-full border border-neutral-900 bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Invoice
                                </a>
                            </>
                        )}
                    </div>
                </div>

                {hasActiveCancellation && (
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                        Your cancellation request is {order.cancellation?.status === 'approved' ? 'approved and waiting for final processing.' : 'under admin review.'}
                    </div>
                )}

                {hasActiveReturn && (
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                        Return status: <span className="font-semibold capitalize">{order.returnRequest?.status.replace(/_/g, ' ')}</span>.
                    </div>
                )}

                {hasActiveReplacement && (
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                        Replacement status: <span className="font-semibold capitalize">{order.replacement?.status.replace(/_/g, ' ')}</span>.
                    </div>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Current Status</p>
                        <p className="mt-2 text-lg font-semibold text-neutral-900">{CUSTOMER_STATUS_LABELS[order.status] || order.status.replace(/_/g, ' ')}</p>
                        <p className="mt-1 text-xs capitalize text-neutral-500">Payment: {effectivePaymentStatus.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Order Total</p>
                        <p className="mt-2 text-lg font-semibold text-neutral-900">{formatMoney(order.totalInCents, order.currency)}</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Tracking</p>
                        <p className="mt-2 text-sm font-medium text-neutral-900">{order.trackingNumber || 'Will appear once shipped'}</p>
                    </div>
                </div>

                {canAccessInvoice && (
                    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
                        Your invoice slip is ready. You can view or download it from this order page anytime.
                    </div>
                )}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.6fr_0.9fr]">
                <div className="space-y-8">
                    <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-semibold text-neutral-900">Items in this order</h2>
                        <div className="mt-6 space-y-4">
                            {order.lineItems.map((item, index) => (
                                <div key={`${item.sku}-${index}`} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl bg-white object-cover" />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white">
                                            <Package className="h-8 w-8 text-neutral-300" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-neutral-900">{item.name}</h3>
                                        <p className="mt-1 font-mono text-xs text-neutral-500">SKU: {item.sku}</p>
                                        <p className="mt-3 text-sm text-neutral-600">Quantity: {item.quantity}</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm text-neutral-500">Unit Price</p>
                                        <p className="mt-1 text-lg font-semibold text-neutral-900">{formatMoney(item.priceAtPurchase, order.currency)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-semibold text-neutral-900">Activity Timeline</h2>
                        <div className="mt-6 space-y-4">
                            {timeline.map((item, index) => (
                                <div key={`${item.label}-${index}`} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        {index !== timeline.length - 1 && <div className="mt-2 h-full w-px bg-neutral-200" />}
                                    </div>
                                    <div className="pb-6">
                                        <p className="font-medium text-neutral-900">{item.label}</p>
                                        <p className="mt-1 text-sm text-neutral-500">{new Date(item.date as string).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-neutral-500" />
                            <h2 className="text-xl font-semibold text-neutral-900">Shipping Address</h2>
                        </div>
                        <div className="mt-5 text-sm leading-7 text-neutral-600">
                            <p>{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                            <p>{order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                        {order.trackingUrl && (
                            <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center text-sm font-semibold text-neutral-900 underline underline-offset-4">
                                Open Live Tracking
                            </a>
                        )}
                    </section>

                    <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-semibold text-neutral-900">Support Window</h2>
                        <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
                            Orders can be cancelled before shipping. Delivered orders remain eligible for return or replacement requests for up to 7 days, with one image and one video required for review.
                        </div>
                        {order.notes.length > 0 && (
                            <div className="mt-6 space-y-3">
                                {order.notes.slice().reverse().map((entry, index) => (
                                    <div key={`${entry.createdAt}-${index}`} className="rounded-2xl border border-neutral-200 p-4">
                                        <p className="text-sm font-medium text-neutral-800">{entry.message}</p>
                                        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-neutral-400">
                                            {entry.author} • {new Date(entry.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <OrderSupportDialog
                open={showReturnDialog}
                onOpenChange={setShowReturnDialog}
                action="return"
                orderId={order._id}
                onSuccess={(nextMessage, nextStatus) => {
                    setMessage(nextMessage);
                    setOrder((current) => (current ? { ...current, status: nextStatus } : current));
                }}
            />
            <OrderSupportDialog
                open={showReplaceDialog}
                onOpenChange={setShowReplaceDialog}
                action="replace"
                orderId={order._id}
                onSuccess={(nextMessage, nextStatus) => {
                    setMessage(nextMessage);
                    setOrder((current) => (current ? { ...current, status: nextStatus } : current));
                }}
            />
        </div>
    );
}
