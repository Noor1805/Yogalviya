'use client';

export { default } from './OrdersDashboardClient';

import { useState, useEffect } from 'react';
import { Package, Loader2, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Order {
    _id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    totalInCents: number;
    lineItems: { name: string; quantity: number }[];
}

function LegacyOrdersPage() {
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
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'paid': case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': case 'refunded': return 'bg-neutral-100 text-neutral-800';
            case 'return_requested': case 'replace_requested': return 'bg-orange-100 text-orange-800';
            default: return 'bg-neutral-100 text-neutral-800';
        }
    };

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Your Orders</h1>
            <p className="mt-1 text-sm text-neutral-500">
                View your order history, track shipments, or initiate returns.
            </p>

            <div className="mt-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200/60 bg-neutral-50/50 py-16 text-neutral-400">
                        <Package className="h-12 w-12 opacity-20 mb-4" />
                        <p className="text-sm">You haven't placed any orders yet.</p>
                        <Link href="/collections/all" className="mt-4 text-sm font-semibold text-neutral-900 underline underline-offset-4">
                            Start shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="rounded-xl border border-neutral-200/60 overflow-hidden bg-white shadow-sm transition-all hover:border-neutral-300">
                                {/* Header */}
                                <div className="border-b border-neutral-100 bg-neutral-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex gap-8 text-sm">
                                        <div>
                                            <p className="text-neutral-500 uppercase tracking-wider text-[10px] font-bold">Order Placed</p>
                                            <p className="font-medium text-neutral-900 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-500 uppercase tracking-wider text-[10px] font-bold">Total</p>
                                            <p className="font-medium text-neutral-900 mt-0.5">${(order.totalInCents / 100).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 text-sm">
                                        <p className="text-neutral-500 uppercase tracking-wider text-[10px] font-bold">Order # {order.orderNumber}</p>
                                        <Link href={`/account/orders/${order._id}`} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                                            View Order Details
                                        </Link>
                                    </div>
                                </div>
                                {/* Body */}
                                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-neutral-900">
                                            {order.lineItems.length} item{order.lineItems.length > 1 ? 's' : ''} • {order.lineItems[0].name} {order.lineItems.length > 1 ? '& more' : ''}
                                        </p>
                                    </div>
                                    <div className="w-full sm:w-auto flex shrink-0 gap-3">
                                        <Link href={`/account/orders/${order._id}`} className="w-full sm:w-auto flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm">
                                            Track Package
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
