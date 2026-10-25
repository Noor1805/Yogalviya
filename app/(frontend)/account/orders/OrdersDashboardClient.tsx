'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock3, Loader2, Package, RefreshCcw, ShieldCheck } from 'lucide-react';

interface Order {
    _id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    totalInCents: number;
    currency: 'USD' | 'INR';
    lineItems: { name: string; quantity: number; image?: string }[];
}

const formatMoney = (amountInCents: number, currency: 'USD' | 'INR') =>
    new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency,
    }).format(amountInCents / 100);

const STATUS_LABELS: Record<string, string> = {
    pending: 'Payment pending',
    paid: 'Order confirmed',
    processing: 'Processing',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for delivery',
    delivery_failed: 'Delivery attempt failed',
    delivered: 'Delivered',
    cancel_requested: 'Cancellation requested',
    cancel_approved: 'Cancellation approved',
    refund_pending: 'Refund processing',
    return_requested: 'Return requested',
    return_approved: 'Return approved',
    return_pickup_scheduled: 'Return pickup scheduled',
    return_picked_up: 'Return picked up',
    return_received: 'Return received',
    return_qc_passed: 'Return approved for refund',
    replace_requested: 'Replacement requested',
    replace_approved: 'Replacement approved',
    replacement_processing: 'Replacement processing',
    replacement_shipped: 'Replacement shipped',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    returned: 'Returned',
    replaced: 'Replaced',
};

function OrderThumbnail({ image, name }: { image?: string; name: string }) {
    if (image) {
        return <img src={image} alt={name} className="h-20 w-20 rounded-2xl border border-neutral-200 bg-neutral-50 object-cover" />;
    }

    return (
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
            <Package className="h-7 w-7 text-neutral-300" />
        </div>
    );
}

export default function OrdersDashboardClient() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/customer/orders');
                const data = await res.json();
                if (data.success) {
                    setOrders(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const currentOrders = useMemo(
        () =>
            orders.filter((order) =>
                [
                    'pending',
                    'paid',
                    'processing',
                    'packed',
                    'shipped',
                    'out_for_delivery',
                    'delivery_failed',
                    'delivered',
                    'cancel_requested',
                    'cancel_approved',
                    'refund_pending',
                    'return_requested',
                    'return_approved',
                    'return_pickup_scheduled',
                    'return_picked_up',
                    'return_received',
                    'return_qc_passed',
                    'replace_requested',
                    'replace_approved',
                    'replacement_processing',
                    'replacement_shipped',
                ].includes(order.status)
            ),
        [orders]
    );

    const pastOrders = useMemo(
        () => orders.filter((order) => !currentOrders.some((currentOrder) => currentOrder._id === order._id)),
        [currentOrders, orders]
    );

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Your Orders</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Track active shipments, review service requests, and access your complete order history in one place.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-neutral-200/70 bg-neutral-50 p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Active orders</p>
                        <Clock3 className="h-4 w-4 text-neutral-400" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">{currentOrders.length}</p>
                </div>
                <div className="rounded-[24px] border border-neutral-200/70 bg-neutral-50 p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Service requests</p>
                        <ShieldCheck className="h-4 w-4 text-neutral-400" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">
                        {orders.filter((order) => ['return_requested', 'replace_requested'].includes(order.status)).length}
                    </p>
                </div>
                <div className="rounded-[24px] border border-neutral-200/70 bg-neutral-50 p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Order history</p>
                        <RefreshCcw className="h-4 w-4 text-neutral-400" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">{pastOrders.length}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[28px] border border-neutral-200/60 bg-neutral-50/50 py-16 text-neutral-400">
                    <Package className="mb-4 h-12 w-12 opacity-20" />
                    <p className="text-sm">You have not placed any orders yet.</p>
                    <Link href="/products" className="mt-4 text-sm font-semibold text-neutral-900 underline underline-offset-4">
                        Explore the collection
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    <section>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-neutral-900">Active orders and service requests</h2>
                            <p className="text-sm text-neutral-500">Orders currently in fulfillment, delivery, cancellation, return, or replacement review.</p>
                        </div>

                        <div className="space-y-4">
                            {currentOrders.length === 0 ? (
                                <div className="rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-5 py-6 text-sm text-neutral-500">
                                    There are no active orders at the moment.
                                </div>
                            ) : (
                                currentOrders.map((order) => (
                                    <Link
                                        key={order._id}
                                        href={`/account/orders/${order._id}`}
                                        className="block rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm transition-colors hover:border-neutral-900"
                                    >
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex items-start gap-4">
                                                <OrderThumbnail image={order.lineItems[0]?.image} name={order.lineItems[0]?.name || 'Order item'} />

                                                <div className="min-w-0">
                                                    <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Order #{order.orderNumber}</p>
                                                    <h3 className="mt-2 text-lg font-semibold text-neutral-900">
                                                        {order.lineItems[0]?.name || 'Order item'}
                                                        {order.lineItems.length > 1 ? ` +${order.lineItems.length - 1} more` : ''}
                                                    </h3>
                                                    <p className="mt-2 text-sm text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 border-t border-neutral-100 pt-4 sm:border-t-0 sm:pt-0 lg:flex lg:flex-wrap lg:gap-6 lg:items-center">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Status</p>
                                                    <p className="mt-2 text-sm font-semibold text-neutral-900">{STATUS_LABELS[order.status] || order.status.replace(/_/g, ' ')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Total</p>
                                                    <p className="mt-2 text-sm font-semibold text-neutral-900">
                                                        {formatMoney(order.totalInCents, order.currency)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Items</p>
                                                    <p className="mt-2 text-sm font-semibold text-neutral-900">
                                                        {order.lineItems.reduce((sum, item) => sum + item.quantity, 0)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-neutral-900">Order history</h2>
                            <p className="text-sm text-neutral-500">Completed, cancelled, refunded, returned, and replaced orders.</p>
                        </div>

                        <div className="space-y-3">
                            {pastOrders.length === 0 ? (
                                <div className="rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-5 py-6 text-sm text-neutral-500">
                                    No order history is available yet.
                                </div>
                            ) : (
                                pastOrders.map((order) => (
                                    <Link
                                        key={order._id}
                                        href={`/account/orders/${order._id}`}
                                        className="flex flex-col gap-3 rounded-[24px] border border-neutral-200 bg-neutral-50 px-5 py-4 transition-colors hover:border-neutral-900"
                                    >
                                        <div className="flex items-start gap-4">
                                            <OrderThumbnail image={order.lineItems[0]?.image} name={order.lineItems[0]?.name || 'Order item'} />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-neutral-900">#{order.orderNumber}</p>
                                                        <p className="mt-2 truncate text-sm font-medium text-neutral-700">
                                                            {order.lineItems[0]?.name || 'Order item'}
                                                            {order.lineItems.length > 1 ? ` +${order.lineItems.length - 1} more` : ''}
                                                        </p>
                                                        <p className="mt-1 text-sm text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm font-semibold text-neutral-900">{STATUS_LABELS[order.status] || order.status.replace(/_/g, ' ')}</p>
                                                        <p className="mt-1 text-sm text-neutral-500">{formatMoney(order.totalInCents, order.currency)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
