'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Package, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { useAdminNotifications } from '@/components/admin/AdminNotificationsProvider';

interface OrderItem {
    _id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    totalInCents: number;
    currency: 'USD' | 'INR';
    lineItems: { name: string; quantity: number }[];
    createdAt: string;
}

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'processing', label: 'Processing' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancel_requested', label: 'Cancel Requests' },
    { key: 'return_requested', label: 'Return Requests' },
    { key: 'replace_requested', label: 'Replace Requests' },
    { key: 'refund_pending', label: 'Refund Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'refunded', label: 'Refunded' },
];

const formatMoney = (amountInCents: number, currency: 'USD' | 'INR') =>
    new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency,
    }).format(amountInCents / 100);

export default function OrdersManagementClient() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
    const { refresh } = useAdminNotifications();

    const fetchOrders = async (status = activeTab, query = search) => {
        setLoading(true);

        try {
            const params = new URLSearchParams();
            if (status !== 'all') params.set('status', status);
            if (query) params.set('search', query);

            const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error(error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (order: OrderItem) => {
        if (!confirm(`Move order #${order.orderNumber} to the recycle bin? You can restore it later.`)) return;

        setDeletingOrderId(order._id);
        try {
            const res = await fetch(`/api/admin/orders/${order._id}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Failed to move order to recycle bin');
            }

            setOrders((prev) => prev.filter((item) => item._id !== order._id));
            void refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to move order to recycle bin');
        } finally {
            setDeletingOrderId(null);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const supportQueueCount = useMemo(
        () => orders.filter((order) => ['cancel_requested', 'return_requested', 'replace_requested'].includes(order.status)).length,
        [orders]
    );

    return (
        <div className="space-y-6">
            <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Order management</p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">Customer orders and support requests</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                            This view is wired to the live order API so the admin panel can process regular order movement alongside return and replacement requests.
                        </p>
                    </div>

                    <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-amber-700">Support queue</p>
                                <p className="mt-1 text-2xl font-semibold text-amber-900">{supportQueueCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    fetchOrders(tab.key, search);
                                }}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                    activeTab === tab.key ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            fetchOrders(activeTab, search);
                        }}
                        className="flex w-full gap-3 lg:max-w-md"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search order, customer, email"
                                className="pl-9"
                            />
                        </div>
                        <button type="submit" className="rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800">
                            Search
                        </button>
                    </form>
                </div>

                <div className="mt-6">
                    {loading ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 text-neutral-400">
                            <Package className="mb-3 h-8 w-8" />
                            <p className="text-sm">No orders found for this filter.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    className="rounded-[26px] border border-neutral-200 bg-neutral-50 p-5 transition-colors hover:border-neutral-900"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <Link href={`/admin/orders/${order._id}`} className="block flex-1">
                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Order #{order.orderNumber}</p>
                                                    <h2 className="mt-2 text-lg font-semibold text-neutral-900">{order.customerName}</h2>
                                                    <p className="mt-1 text-sm text-neutral-500">{order.customerEmail}</p>
                                                </div>

                                                <div className="flex flex-wrap gap-6 lg:items-center">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Status</p>
                                                        <p className="mt-2 text-sm font-semibold capitalize text-neutral-900">{order.status.replace(/_/g, ' ')}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Total</p>
                                                        <p className="mt-2 text-sm font-semibold text-neutral-900">{formatMoney(order.totalInCents, order.currency)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Placed</p>
                                                        <p className="mt-2 text-sm font-semibold text-neutral-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="mt-4 text-sm text-neutral-500">
                                                {order.lineItems.length} item(s): {order.lineItems[0]?.name || 'Order item'}
                                                {order.lineItems.length > 1 ? ` +${order.lineItems.length - 1} more` : ''}
                                            </p>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(order)}
                                            disabled={deletingOrderId === order._id}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                            title="Move order to recycle bin"
                                        >
                                            {deletingOrderId === order._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
