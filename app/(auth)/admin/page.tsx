'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Package, ShoppingBag, Users, TrendingUp,
    Plus, ArrowUpRight, MessageSquare, Trash2,
} from 'lucide-react';

import { useAdminNotifications } from '@/components/admin/AdminNotificationsProvider';
import { formatAdminAttentionCount } from '@/lib/utils/admin-notifications';

interface Stats {
    products: number;
    orders: number;
    customers: number;
    revenue: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, customers: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const { summary, loading: notificationsLoading } = useAdminNotifications();

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch {
                // Stats endpoint may not exist yet
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    const cards = [
        {
            label: 'Products',
            value: stats.products,
            icon: Package,
            href: '/admin/products',
            description: 'Total active listings',
        },
        {
            label: 'Orders',
            value: stats.orders,
            icon: ShoppingBag,
            href: '/admin/orders',
            description: 'All time orders',
        },
        {
            label: 'Customers',
            value: stats.customers,
            icon: Users,
            href: '/admin/customers',
            description: 'Registered accounts',
        },
        {
            label: 'Revenue',
            value: `$${(stats.revenue ?? 0).toLocaleString()}`,
            icon: TrendingUp,
            href: '/admin/orders',
            description: 'Total revenue earned',
        },
    ];

    const attentionCards = [
        {
            label: 'New Orders',
            value: summary.orders.newCount,
            href: '/admin/orders',
            icon: ShoppingBag,
            description: 'Placed orders awaiting review',
        },
        {
            label: 'New Contacts',
            value: summary.contacts.newCount,
            href: '/admin/contacts',
            icon: MessageSquare,
            description: 'Unread contact form messages',
        },
        {
            label: 'Recycle Bin',
            value: summary.recycleBin.totalCount,
            href: '/admin/trash',
            icon: Trash2,
            description: 'Soft-deleted items across the admin',
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-neutral-400">
                    Welcome back
                </p>
            </div>

            <div className="mb-10">
                <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                    Needs Attention
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {attentionCards.map((card) => (
                        <Link
                            key={card.label}
                            href={card.href}
                            className="group rounded-xl border border-neutral-200/60 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        {card.label}
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                                        {notificationsLoading
                                            ? '—'
                                            : formatAdminAttentionCount(card.value)}
                                    </p>
                                    <p className="mt-1 text-[11px] text-neutral-400">
                                        {card.description}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 transition-all duration-200 group-hover:bg-neutral-900 group-hover:text-white">
                                    <card.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                {cards.map((card) => (
                    <Link
                        key={card.label}
                        href={card.href}
                        className="group relative overflow-hidden rounded-xl border border-neutral-200/60 bg-white p-5 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                    {card.label}
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                                    {loading ? '—' : card.value}
                                </p>
                                <p className="mt-1 text-[11px] text-neutral-400">
                                    {card.description}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-all duration-200">
                                <card.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                            </div>
                        </div>
                        <ArrowUpRight className="absolute bottom-3 right-3 h-4 w-4 text-neutral-200 group-hover:text-neutral-400 transition-colors" />
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
                            <Plus className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[13px] font-medium text-neutral-900">New Product</p>
                            <p className="text-[11px] text-neutral-400">Add a new listing</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin/categories"
                        className="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                            <Package className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[13px] font-medium text-neutral-900">Categories</p>
                            <p className="text-[11px] text-neutral-400">Manage collections</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                            <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[13px] font-medium text-neutral-900">Orders</p>
                            <p className="text-[11px] text-neutral-400">View recent orders</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
