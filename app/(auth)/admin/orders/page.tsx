'use client';

export { default } from './OrdersManagementClient';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Search, Loader2, Package,
    Clock, CreditCard, Truck, CheckCircle, XCircle, RotateCcw, ArrowRight,
    Filter, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHotkeys } from '@/hooks/useHotkeys';
import BulkActionBar from '@/components/admin/BulkActionBar';

interface OrderItem {
    _id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    totalInCents: number;
    currency: string;
    paymentGateway: string;
    lineItems: { name: string; quantity: number }[];
    createdAt: string;
    paidAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
    pending:    { label: 'Pending Payment', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200', icon: Clock },
    paid:       { label: 'Paid',            color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',  icon: CreditCard },
    processing: { label: 'Processing',      color: 'text-indigo-700',  bg: 'bg-indigo-50',   border: 'border-indigo-200',icon: Package },
    shipped:    { label: 'Shipped',          color: 'text-purple-700',  bg: 'bg-purple-50',   border: 'border-purple-200',icon: Truck },
    delivered:  { label: 'Delivered',        color: 'text-teal-700',    bg: 'bg-teal-50',     border: 'border-teal-200',  icon: CheckCircle },
    completed:  { label: 'Completed',        color: 'text-green-700',   bg: 'bg-green-50',    border: 'border-green-200', icon: CheckCircle },
    cancelled:  { label: 'Cancelled',        color: 'text-neutral-500', bg: 'bg-neutral-50',  border: 'border-neutral-200', icon: XCircle },
    refunded:   { label: 'Refunded',         color: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-200',  icon: RotateCcw },
};

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'refunded', label: 'Refunded' },
];

function LegacyAdminOrdersPage() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [total, setTotal] = useState(0);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [bulkAction, setBulkAction] = useState('');
    const [bulkLoading, setBulkLoading] = useState(false);

    useHotkeys('a', () => toggleSelectAll(), true);

    const fetchOrders = async (status = activeTab, query = search) => {
        setLoading(true);
        const params = new URLSearchParams();
        if (status !== 'all') params.set('status', status);
        if (query) params.set('search', query);
        const res = await fetch(`/api/admin/orders?${params}`);
        const data = await res.json();
        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setLoading(false);
        setSelectedOrders(new Set());
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        fetchOrders(tab, search);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchOrders(activeTab, search);
    };

    const toggleSelect = (id: string) => {
        setSelectedOrders((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedOrders.size === orders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(orders.map((o) => o._id)));
        }
    };

    const handleTrashAction = async (action: 'delete' | 'restore' | 'hard_delete') => {
        if (!confirm(`Are you sure you want to move ${selectedOrders.size} orders to trash?`)) return;
        setBulkLoading(true);
        try {
            const res = await fetch('/api/admin/bulk-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedOrders), action, target: 'Order' })
            });
            if (res.ok) {
                setSelectedOrders(new Set());
                fetchOrders();
            } else {
                alert('Bulk action failed');
            }
        } catch {
            alert('Bulk action failed');
        }
        setBulkLoading(false);
    };

    const formatPrice = (cents: number, currency: string) => {
        const amount = (cents / 100).toFixed(2);
        return currency === 'INR' ? `₹${amount}` : `$${amount}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="relative pb-24">
            <BulkActionBar 
                selectedIds={Array.from(selectedOrders)} 
                onClear={() => setSelectedOrders(new Set())} 
                onAction={handleTrashAction} 
                loading={bulkLoading} 
            />
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Orders</h1>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wider text-neutral-400">
                        {total} order{total !== 1 ? 's' : ''} found
                    </p>
                </div>
            </div>

            {/* Status Tabs — WooCommerce style */}
            <div className="mb-5 flex items-center gap-1 overflow-x-auto border-b border-neutral-200 pb-0 scrollbar-hide">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`relative shrink-0 px-4 py-2.5 text-[12px] font-medium transition-colors ${
                            activeTab === tab.key
                                ? 'text-neutral-900'
                                : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900 rounded-t" />
                        )}
                    </button>
                ))}
            </div>

            {/* Filters Bar — WooCommerce style */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
                {/* Bulk Actions */}
                <div className="flex items-center gap-2">
                    <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        className="h-8 rounded-md border border-neutral-200 bg-white px-2.5 text-[12px] text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    >
                        <option value="">Bulk actions</option>
                        <option value="processing">Mark Processing</option>
                        <option value="shipped">Mark Shipped</option>
                        <option value="completed">Mark Completed</option>
                        <option value="cancelled">Cancel Orders</option>
                    </select>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-[11px] border-neutral-200 text-neutral-500"
                        disabled={selectedOrders.size === 0 || !bulkAction}
                    >
                        Apply
                    </Button>
                </div>

                <div className="h-5 w-px bg-neutral-200" />

                {/* Date filter placeholder */}
                <Button variant="outline" size="sm" className="h-8 text-[11px] border-neutral-200 text-neutral-500">
                    <Calendar className="mr-1.5 h-3 w-3" /> All dates
                </Button>

                <Button variant="outline" size="sm" className="h-8 text-[11px] border-neutral-200 text-neutral-500">
                    <Filter className="mr-1.5 h-3 w-3" /> Filter
                </Button>

                {/* Search */}
                <form onSubmit={handleSearch} className="ml-auto flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-300" />
                        <Input
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 w-56 pl-8 text-[12px] border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                        />
                    </div>
                    <Button type="submit" variant="outline" size="sm" className="h-8 text-[11px] border-neutral-200 text-neutral-500">
                        Search
                    </Button>
                </form>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : orders.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50">
                    <Package className="h-8 w-8 text-neutral-300 mb-3" />
                    <p className="text-[13px] text-neutral-400">No orders found</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden overflow-hidden rounded-lg border border-neutral-200/80 bg-white md:block">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                    <th className="w-10 px-3 py-2.5">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.size === orders.length && orders.length > 0}
                                            onChange={toggleSelectAll}
                                            className="h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                        />
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500">
                                        Order
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500">
                                        Date
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-neutral-500">
                                        Total
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500">
                                        Gateway
                                    </th>
                                    <th className="px-4 py-2.5 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                    const StatusIcon = cfg.icon;
                                    const isSelected = selectedOrders.has(order._id);
                                    return (
                                        <tr
                                            key={order._id}
                                            className={`border-b border-neutral-50 transition-colors ${
                                                isSelected ? 'bg-blue-50/30' : 'hover:bg-neutral-50/50'
                                            }`}
                                        >
                                            <td className="px-3 py-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(order._id)}
                                                    className="h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="group"
                                                >
                                                    <span className="text-[13px] font-semibold text-blue-700 group-hover:text-blue-900 group-hover:underline">
                                                        #{order.orderNumber}
                                                    </span>
                                                    <span className="text-[12px] text-neutral-500 ml-1.5">
                                                        {order.customerName}
                                                    </span>
                                                </Link>
                                                <p className="text-[11px] text-neutral-400 mt-0.5">{order.customerEmail}</p>
                                            </td>
                                            <td className="px-4 py-3 text-[12px] text-neutral-600">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-[13px] font-semibold text-neutral-900">
                                                    {formatPrice(order.totalInCents, order.currency)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                                                    {order.paymentGateway}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="flex h-7 w-7 items-center justify-center rounded text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                                                >
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="space-y-2 md:hidden">
                        {orders.map((order) => {
                            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            const StatusIcon = cfg.icon;
                            return (
                                <Link
                                    key={order._id}
                                    href={`/admin/orders/${order._id}`}
                                    className="block rounded-lg border border-neutral-200/60 bg-white p-4 transition-all active:bg-neutral-50"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-[13px] font-semibold text-blue-700">
                                                #{order.orderNumber}
                                            </p>
                                            <p className="text-[11px] text-neutral-500 mt-0.5">{order.customerName}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                            <StatusIcon className="h-2.5 w-2.5" />
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-neutral-100 pt-2 mt-2">
                                        <span className="text-[11px] text-neutral-400">{formatDate(order.createdAt)}</span>
                                        <span className="text-[13px] font-semibold text-neutral-900">
                                            {formatPrice(order.totalInCents, order.currency)}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
