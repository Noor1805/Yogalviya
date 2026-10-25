'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Package, RefreshCcw, Send, ShieldAlert, Trash2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useAdminNotifications } from '@/components/admin/AdminNotificationsProvider';

interface EvidenceItem {
    url: string;
    thumbnailUrl?: string;
    type: 'image' | 'video';
}

interface OrderData {
    _id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    status: string;
    paymentStatus?: string;
    fulfillmentStatus?: string;
    orderStatus?: string;
    totalInCents: number;
    currency: 'USD' | 'INR';
    paymentGateway: string;
    lineItems: Array<{ productId: string; sku: string; name: string; quantity: number; priceAtPurchase: number; image?: string }>;
    shippingAddress: { line1: string; line2?: string; city: string; state: string; postalCode: string; country: string };
    trackingNumber?: string;
    trackingUrl?: string;
    courierName?: string;
    estimatedDeliveryAt?: string;
    refundReason?: string;
    refundAmount?: number;
    cancellation?: { status: string; reason?: string; requestedAt?: string; adminDecisionReason?: string };
    returnRequest?: { status: string; reason?: string; requestedAt?: string; evidence?: EvidenceItem[]; adminDecisionReason?: string };
    replacement?: { status: string; reason?: string; requestedAt?: string; evidence?: EvidenceItem[]; adminDecisionReason?: string };
    refund?: { status: string; gatewayRefundId?: string; amount?: number; reason?: string; initiatedAt?: string; completedAt?: string };
    returnReason?: string;
    returnRequestedAt?: string;
    returnEvidence?: EvidenceItem[];
    replaceReason?: string;
    replaceRequestedAt?: string;
    replaceEvidence?: EvidenceItem[];
    paidAt?: string;
    notes: Array<{ message: string; author: string; createdAt: string }>;
    createdAt: string;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
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

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    processing: 'Processing',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivery_failed: 'Delivery Failed',
    delivered: 'Delivered',
    completed: 'Completed',
    cancel_requested: 'Cancellation Requested',
    cancel_approved: 'Cancellation Approved',
    refund_pending: 'Refund Pending',
    return_requested: 'Return Requested',
    return_approved: 'Return Approved',
    return_pickup_scheduled: 'Return Pickup Scheduled',
    return_picked_up: 'Return Picked Up',
    return_received: 'Return Received',
    return_qc_passed: 'Return QC Passed',
    return_qc_failed: 'Return QC Failed',
    replace_requested: 'Replacement Requested',
    replace_approved: 'Replacement Approved',
    replacement_processing: 'Replacement Processing',
    replacement_shipped: 'Replacement Shipped',
    returned: 'Returned',
    replaced: 'Replaced',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
};

const formatMoney = (amountInCents: number, currency: 'USD' | 'INR') =>
    new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency }).format(amountInCents / 100);

export default function OrderManagementDetailClient({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { refresh } = useAdminNotifications();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');
    const [courierName, setCourierName] = useState('');
    const [estimatedDeliveryAt, setEstimatedDeliveryAt] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [note, setNote] = useState('');

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load order');
            setOrder(data);
            setSelectedStatus(data.status);
            setTrackingNumber(data.trackingNumber || '');
            setTrackingUrl(data.trackingUrl || '');
            setCourierName(data.courierName || '');
            setEstimatedDeliveryAt(data.estimatedDeliveryAt ? data.estimatedDeliveryAt.slice(0, 10) : '');
        } catch (fetchError) {
            setError(fetchError instanceof Error ? fetchError.message : 'Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const validNextStatuses = useMemo(() => {
        if (!order) return [];

        const next = VALID_TRANSITIONS[order.status || ''] || [];
        if (order.paymentGateway === 'cod') {
            return next;
        }

        if (order.paymentStatus !== 'paid') {
            return next.filter((status) => ['paid', 'cancel_requested', 'cancelled'].includes(status));
        }

        return next;
    }, [order]);
    const effectivePaymentStatusForActions =
        order?.paymentStatus ||
        (order?.refund?.status === 'completed' ? 'refunded' : undefined) ||
        (order?.status === 'refunded' ? 'refunded' : undefined) ||
        (order?.status === 'paid' || order?.paidAt ? 'paid' : 'pending');
    const canMarkCodPaid = Boolean(
        order &&
        order.paymentGateway === 'cod' &&
        effectivePaymentStatusForActions !== 'paid' &&
        ['delivered', 'completed'].includes(order.status)
    );
    const supportRequest = useMemo(() => {
        if (!order) return null;
        if (order.cancellation?.status === 'requested' || order.cancellation?.status === 'approved') {
            return {
                type: 'cancellation' as const,
                workflowStatus: order.cancellation.status,
                reason: order.cancellation.reason,
                requestedAt: order.cancellation.requestedAt,
                evidence: [] as EvidenceItem[],
            };
        }
        if (order.returnRequest && !['none', 'rejected', 'refunded', 'closed'].includes(order.returnRequest.status)) {
            return {
                type: 'return' as const,
                workflowStatus: order.returnRequest.status,
                reason: order.returnRequest.reason || order.returnReason,
                requestedAt: order.returnRequest.requestedAt || order.returnRequestedAt,
                evidence: order.returnRequest.evidence || order.returnEvidence || [],
            };
        }
        if (order.replacement && !['none', 'rejected', 'replaced', 'closed'].includes(order.replacement.status)) {
            return {
                type: 'replacement' as const,
                workflowStatus: order.replacement.status,
                reason: order.replacement.reason || order.replaceReason,
                requestedAt: order.replacement.requestedAt || order.replaceRequestedAt,
                evidence: order.replacement.evidence || order.replaceEvidence || [],
            };
        }
        if (order.status === 'return_requested') {
            return { type: 'return' as const, workflowStatus: 'requested', reason: order.returnReason, requestedAt: order.returnRequestedAt, evidence: order.returnEvidence || [] };
        }
        if (order.status === 'replace_requested') {
            return { type: 'replacement' as const, workflowStatus: 'requested', reason: order.replaceReason, requestedAt: order.replaceRequestedAt, evidence: order.replaceEvidence || [] };
        }
        return null;
    }, [order]);

    const patchOrder = async (body: Record<string, unknown>) => {
        setUpdating(true);
        setMessage('');
        setError('');
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Order update failed');
            setOrder(data);
            setSelectedStatus(data.status);
            void refresh();
            return data;
        } catch (patchError) {
            setError(patchError instanceof Error ? patchError.message : 'Order update failed');
            return null;
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!order) return;
        if (!confirm(`Move order #${order.orderNumber} to the recycle bin? You can restore it later.`)) return;

        setUpdating(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to move order to recycle bin');

            void refresh();
            router.push('/admin/trash');
            router.refresh();
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Failed to move order to recycle bin');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-neutral-300" /></div>;
    }

    if (!order) {
        return (
            <div className="space-y-4">
                <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900">
                    <ArrowLeft className="h-4 w-4" />
                    Back to orders
                </Link>
                <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                    {error || 'Order not found.'}
                </div>
            </div>
        );
    }

    const effectivePaymentStatus =
        order.paymentStatus ||
        (order.refund?.status === 'completed' ? 'refunded' : undefined) ||
        (order.status === 'refunded' ? 'refunded' : undefined) ||
        (order.status === 'paid' || order.paidAt ? 'paid' : 'pending');

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900">
                        <ArrowLeft className="h-4 w-4" />
                        Back to orders
                    </Link>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">Order #{order.orderNumber}</h1>
                    <p className="mt-2 text-sm text-neutral-500">{order.customerName} • {order.customerEmail}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-semibold capitalize text-neutral-900">
                        {order.status.replace(/_/g, ' ')}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDelete}
                        disabled={updating}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Move to Trash
                    </Button>
                </div>
            </div>

            {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
                <div className="space-y-6">
                    <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-neutral-900">Status and fulfillment</h2>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Order status</label>
                                <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900">
                                    <option value={order.status}>{STATUS_LABELS[order.status] || order.status}</option>
                                    {validNextStatuses.map((status) => (
                                        <option key={status} value={status}>{STATUS_LABELS[status] || status}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Payment gateway</label>
                                <div className="mt-2 flex h-11 items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium uppercase text-neutral-700">
                                    {order.paymentGateway} / {effectivePaymentStatus}
                                </div>
                                {canMarkCodPaid && (
                                    <Button
                                        onClick={async () => {
                                            const updated = await patchOrder({ action: 'markPaymentCollected', note: 'COD cash collected on delivery.' });
                                            if (updated) setMessage('COD payment marked as collected.');
                                        }}
                                        disabled={updating}
                                        className="mt-3 w-full bg-neutral-900 text-white hover:bg-neutral-800"
                                    >
                                        {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                        Mark COD Collected
                                    </Button>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Fulfillment state</label>
                                <div className="mt-2 flex h-11 items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium capitalize text-neutral-700">
                                    {(order.fulfillmentStatus || 'unfulfilled').replace(/_/g, ' ')}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Courier</label>
                                <Input value={courierName} onChange={(event) => setCourierName(event.target.value)} className="mt-2" placeholder="Blue Dart, Delhivery, DHL..." />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Tracking number</label>
                                <Input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} className="mt-2" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Tracking URL</label>
                                <Input value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} className="mt-2" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Estimated delivery</label>
                                <Input type="date" value={estimatedDeliveryAt} onChange={(event) => setEstimatedDeliveryAt(event.target.value)} className="mt-2" />
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end">
                            <Button
                                onClick={async () => {
                                    if (selectedStatus === order.status) return;
                                    const updated = await patchOrder({ action: 'updateStatus', status: selectedStatus, trackingNumber, trackingUrl, courierName, estimatedDeliveryAt });
                                    if (updated) setMessage(`Order updated to ${STATUS_LABELS[updated.status] || updated.status}.`);
                                }}
                                disabled={updating || selectedStatus === order.status}
                                className="bg-neutral-900 text-white hover:bg-neutral-800"
                            >
                                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Update status
                            </Button>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-neutral-900">Order items</h2>
                        <div className="mt-5 space-y-4">
                            {order.lineItems.map((item, index) => (
                                <div key={`${item.sku}-${index}`} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center">
                                    {item.image ? <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white"><Package className="h-6 w-6 text-neutral-300" /></div>}
                                    <div className="flex-1">
                                        <p className="text-base font-semibold text-neutral-900">{item.name}</p>
                                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-400">SKU {item.sku}</p>
                                    </div>
                                    <div className="text-sm text-neutral-600">Qty {item.quantity} • {formatMoney(item.priceAtPurchase * item.quantity, order.currency)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 border-t border-neutral-200 pt-4 text-right">
                            <p className="text-sm text-neutral-500">Order total</p>
                            <p className="mt-1 text-2xl font-semibold text-neutral-900">{formatMoney(order.totalInCents, order.currency)}</p>
                        </div>
                    </section>

                    {supportRequest && (
                        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <ShieldAlert className="mt-1 h-5 w-5 text-amber-700" />
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-amber-950">
                                        {supportRequest.type === 'cancellation'
                                            ? 'Cancellation workflow'
                                            : supportRequest.type === 'return'
                                              ? 'Return workflow'
                                              : 'Replacement workflow'}
                                    </h2>
                                    <p className="mt-2 text-sm text-amber-900/80">
                                        Status: <span className="font-semibold capitalize">{supportRequest.workflowStatus.replace(/_/g, ' ')}</span>
                                        {supportRequest.requestedAt ? ` / Requested on ${new Date(supportRequest.requestedAt).toLocaleString()}` : ''}
                                    </p>
                                    {supportRequest.reason && <p className="mt-4 text-sm leading-6 text-amber-950">Reason: {supportRequest.reason}</p>}
                                </div>
                            </div>

                            {supportRequest.evidence.length > 0 && (
                                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {supportRequest.evidence.map((item, index) => (
                                        <div key={`${item.url}-${index}`} className="overflow-hidden rounded-2xl border border-amber-200 bg-white">
                                            <div className="aspect-[4/3] bg-neutral-100">
                                                {item.type === 'video' ? <video src={item.url} controls className="h-full w-full object-cover" /> : <img src={item.url} alt="Support evidence" className="h-full w-full object-cover" />}
                                            </div>
                                            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{item.type}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-5 flex flex-wrap gap-3">
                                {supportRequest.type === 'cancellation' && supportRequest.workflowStatus === 'requested' && (
                                    <>
                                        <Button
                                            onClick={async () => {
                                                const updated = await patchOrder({ action: 'reviewCancellation', approved: true, note: 'Cancellation request approved by admin.' });
                                                if (updated) setMessage('Cancellation request approved.');
                                            }}
                                            disabled={updating}
                                            className="bg-neutral-900 text-white hover:bg-neutral-800"
                                        >
                                            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                            Approve Cancellation
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={async () => {
                                                const updated = await patchOrder({ action: 'reviewCancellation', approved: false, note: 'Cancellation request rejected by admin.' });
                                                if (updated) setMessage('Cancellation request rejected.');
                                            }}
                                            disabled={updating}
                                            className="border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}

                                {supportRequest.type === 'cancellation' && supportRequest.workflowStatus === 'approved' && (
                                    <p className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-amber-950">
                                        Cancellation is approved. Use refund controls to complete online-paid orders.
                                    </p>
                                )}

                                {supportRequest.type === 'return' && supportRequest.workflowStatus === 'requested' && (
                                    <>
                                        <Button
                                            onClick={async () => {
                                                const updated = await patchOrder({ action: 'reviewReturn', approved: true, note: 'Return request approved by admin.' });
                                                if (updated) setMessage('Return request approved.');
                                            }}
                                            disabled={updating}
                                            className="bg-neutral-900 text-white hover:bg-neutral-800"
                                        >
                                            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                                            Approve Return
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={async () => {
                                                const updated = await patchOrder({ action: 'reviewReturn', approved: false, note: 'Return request rejected by admin.' });
                                                if (updated) setMessage('Return request rejected.');
                                            }}
                                            disabled={updating}
                                            className="border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}

                                {supportRequest.type === 'return' && supportRequest.workflowStatus === 'approved' && (
                                    <Button
                                        onClick={async () => {
                                            const updated = await patchOrder({ action: 'updateStatus', status: 'return_pickup_scheduled', note: 'Return pickup scheduled.' });
                                            if (updated) setMessage('Return pickup scheduled.');
                                        }}
                                        disabled={updating}
                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                    >
                                        Schedule Pickup
                                    </Button>
                                )}

                                {supportRequest.type === 'return' && supportRequest.workflowStatus === 'pickup_scheduled' && (
                                    <Button
                                        onClick={async () => {
                                            const updated = await patchOrder({ action: 'updateStatus', status: 'return_picked_up', note: 'Return picked up from customer.' });
                                            if (updated) setMessage('Return marked as picked up.');
                                        }}
                                        disabled={updating}
                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                    >
                                        Mark Picked Up
                                    </Button>
                                )}

                                {supportRequest.type === 'return' && supportRequest.workflowStatus === 'picked_up' && (
                                    <Button
                                        onClick={async () => {
                                            const updated = await patchOrder({ action: 'updateStatus', status: 'return_received', note: 'Returned item received for QC.' });
                                            if (updated) setMessage('Return received.');
                                        }}
                                        disabled={updating}
                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                    >
                                        Mark Received
                                    </Button>
                                )}

                                {supportRequest.type === 'return' && supportRequest.workflowStatus === 'received' && (
                                    <>
                                        <Button
                                            onClick={async () => {
                                                const updated = await patchOrder({ action: 'updateStatus', status: 'return_qc_passed', note: 'Return QC passed. Refund can be processed.' });
                                                if (updated) setMessage('Return QC passed.');
                                            }}
                                            disabled={updating}
                                            className="bg-neutral-900 text-white hover:bg-neutral-800"
                                        >
                                            QC Passed
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={async () => {
                                                const updated = await patchOrder({ action: 'updateStatus', status: 'return_qc_failed', note: 'Return QC failed.' });
                                                if (updated) setMessage('Return QC failed.');
                                            }}
                                            disabled={updating}
                                            className="border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
                                        >
                                            QC Failed
                                        </Button>
                                    </>
                                )}

                                {supportRequest.type === 'return' && supportRequest.workflowStatus === 'qc_passed' && (
                                    <p className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-amber-950">
                                        QC passed. Use refund controls to complete the customer refund.
                                    </p>
                                )}

                                {supportRequest.type === 'replacement' && supportRequest.workflowStatus === 'requested' && (
                                    <>
                                        <Button
                                            onClick={async () => {
                                                const updated = await patchOrder({ action: 'reviewReplacement', approved: true, note: 'Replacement request approved by admin.' });
                                                if (updated) setMessage('Replacement request approved.');
                                            }}
                                            disabled={updating}
                                            className="bg-neutral-900 text-white hover:bg-neutral-800"
                                        >
                                            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                                            Approve Replacement
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={async () => {
                                                const updated = await patchOrder({ action: 'reviewReplacement', approved: false, note: 'Replacement request rejected by admin.' });
                                                if (updated) setMessage('Replacement request rejected.');
                                            }}
                                            disabled={updating}
                                            className="border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}

                                {supportRequest.type === 'replacement' && supportRequest.workflowStatus === 'approved' && (
                                    <Button
                                        onClick={async () => {
                                            const updated = await patchOrder({ action: 'updateStatus', status: 'replacement_processing', note: 'Replacement processing started.' });
                                            if (updated) setMessage('Replacement processing started.');
                                        }}
                                        disabled={updating}
                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                    >
                                        Start Replacement
                                    </Button>
                                )}

                                {supportRequest.type === 'replacement' && supportRequest.workflowStatus === 'replacement_processing' && (
                                    <Button
                                        onClick={async () => {
                                            const updated = await patchOrder({ action: 'updateStatus', status: 'replacement_shipped', note: 'Replacement item shipped.' });
                                            if (updated) setMessage('Replacement shipped.');
                                        }}
                                        disabled={updating}
                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                    >
                                        Mark Replacement Shipped
                                    </Button>
                                )}

                                {supportRequest.type === 'replacement' && supportRequest.workflowStatus === 'replacement_shipped' && (
                                    <Button
                                        onClick={async () => {
                                            const updated = await patchOrder({ action: 'updateStatus', status: 'replaced', note: 'Replacement delivered to customer.' });
                                            if (updated) setMessage('Replacement completed.');
                                        }}
                                        disabled={updating}
                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                    >
                                        Mark Replaced
                                    </Button>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                <div className="space-y-6">
                    <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-neutral-900">Customer and shipping</h2>
                        <div className="mt-5 space-y-4 text-sm text-neutral-600">
                            <div>
                                <p className="font-semibold text-neutral-900">{order.customerName}</p>
                                <p>{order.customerEmail}</p>
                                {order.customerPhone && <p>{order.customerPhone}</p>}
                            </div>
                            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 leading-7">
                                <p>{order.shippingAddress.line1}</p>
                                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                <p>{order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-neutral-900">Refund controls</h2>
                        <div className="mt-5 space-y-4">
                            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Refund lifecycle</p>
                                <p className="mt-2 text-sm font-semibold capitalize text-neutral-900">{(order.refund?.status || 'none').replace(/_/g, ' ')}</p>
                                {order.refund?.gatewayRefundId && <p className="mt-1 text-xs text-neutral-500">Gateway ID: {order.refund.gatewayRefundId}</p>}
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Refund reason</label>
                                <Input value={refundReason} onChange={(event) => setRefundReason(event.target.value)} className="mt-2" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Refund amount</label>
                                <Input value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} className="mt-2" placeholder={`Leave blank for full refund (${formatMoney(order.totalInCents, order.currency)})`} />
                            </div>
                            <Button
                                onClick={async () => {
                                    if (!refundReason) {
                                        setError('Refund reason is required.');
                                        return;
                                    }
                                    const updated = await patchOrder({
                                        action: 'refund',
                                        refundReason,
                                        refundAmount: refundAmount ? Math.round(parseFloat(refundAmount) * 100) : undefined,
                                    });
                                    if (updated) {
                                        setRefundAmount('');
                                        setRefundReason('');
                                        setMessage('Refund processed successfully.');
                                    }
                                }}
                                disabled={updating || !['paid', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'completed', 'cancel_approved', 'refund_pending', 'return_qc_passed', 'returned'].includes(order.status)}
                                className="w-full bg-red-600 text-white hover:bg-red-700"
                            >
                                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                                Process refund
                            </Button>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-neutral-900">Admin notes</h2>
                        <div className="mt-5 space-y-3">
                            {order.notes.slice().reverse().map((entry, index) => (
                                <div key={`${entry.createdAt}-${index}`} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                                    <p className="text-sm text-neutral-800">{entry.message}</p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-neutral-400">{entry.author} • {new Date(entry.createdAt).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 border-t border-neutral-200 pt-5">
                            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Add an admin note" className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900" />
                            <Button
                                onClick={async () => {
                                    if (!note.trim()) return;
                                    const updated = await patchOrder({ action: 'addNote', note });
                                    if (updated) {
                                        setNote('');
                                        setMessage('Admin note added.');
                                    }
                                }}
                                disabled={updating || !note.trim()}
                                className="mt-3 w-full bg-neutral-900 text-white hover:bg-neutral-800"
                            >
                                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Save note
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
