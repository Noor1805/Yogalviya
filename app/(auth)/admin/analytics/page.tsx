'use client';

import { useEffect, useState } from 'react';
import { 
    TrendingUp, Package, AlertTriangle, IndianRupee, 
    ArrowUpRight, ArrowDownRight, Loader2, BarChart3, ShoppingCart 
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { AnalyticsTabs } from '@/components/admin/AnalyticsTabs';

interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    inventory: {
        totalItems: number;
        lowStockWarnings: number;
        outOfStock: number;
        activeProducts: number;
    };
    chartData: Array<{month: string, revenue: number}>;
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then(res => res.json())
            .then(d => {
                // Ensure chartData is correctly mapped to an array of objects
                if (d.chartData && !d.chartData.length) {
                    d.chartData = [
                        { month: 'Oct', revenue: 0 },
                        { month: 'Nov', revenue: 0 },
                        { month: 'Dec', revenue: 0 },
                        { month: 'Jan', revenue: 0 },
                        { month: 'Feb', revenue: 0 },
                        { month: 'Mar', revenue: 0 }
                    ];
                }
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
            </div>
        );
    }

    const revenueDiff = data.thisMonthRevenue - data.lastMonthRevenue;
    const revenueDiffPercent = data.lastMonthRevenue === 0 
        ? (data.thisMonthRevenue > 0 ? 100 : 0) 
        : ((revenueDiff / data.lastMonthRevenue) * 100).toFixed(1);
    
    const isRevenueUp = revenueDiff >= 0;

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Analytics Review</h1>
                <p className="mt-1 text-[13px] text-neutral-500">Overview of your store performance</p>
            </div>

            <AnalyticsTabs />

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-500">Total Revenue</p>
                        <IndianRupee className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <h2 className="text-3xl font-extrabold text-neutral-900">₹{data.totalRevenue.toLocaleString()}</h2>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-500">This Month</p>
                        <BarChart3 className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <h2 className="text-3xl font-extrabold text-neutral-900">₹{data.thisMonthRevenue.toLocaleString()}</h2>
                        <div className={`flex items-center gap-1 text-[13px] font-bold ${isRevenueUp ? 'text-green-600' : 'text-red-500'}`}>
                            {isRevenueUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            {Math.abs(Number(revenueDiffPercent))}%
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-500">Total Orders</p>
                        <ShoppingCart className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <h2 className="text-3xl font-extrabold text-neutral-900">{data.totalOrders}</h2>
                        <p className="text-[12px] font-medium text-neutral-400">Avg ₹{data.avgOrderValue}</p>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-500">Active Products</p>
                        <Package className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <h2 className="text-3xl font-extrabold text-neutral-900">{data.inventory.activeProducts}</h2>
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* Chart Section */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 text-[14px] font-bold uppercase tracking-wider text-neutral-800">Revenue Overview (Last 6 Months)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#737373' }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#737373' }} 
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#F5F5F5' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar 
                                    dataKey="revenue" 
                                    fill="#171717" 
                                    radius={[4, 4, 0, 0]} 
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Inventory Health Section */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm flex flex-col">
                    <div className="border-b border-neutral-100 p-5">
                        <h3 className="text-[14px] font-bold uppercase tracking-wider text-neutral-800">Inventory Health</h3>
                    </div>
                    <div className="flex-1 p-5 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold uppercase text-neutral-500">Total Stock</p>
                                    <p className="text-xl font-bold text-neutral-900">{data.inventory.totalItems} Units</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-neutral-100" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold uppercase text-neutral-500">Low Stock</p>
                                    <p className="text-xl font-bold text-orange-600">{data.inventory.lowStockWarnings} Items</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-neutral-100" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold uppercase text-neutral-500">Out of Stock</p>
                                    <p className="text-xl font-bold text-red-600">{data.inventory.outOfStock} Items</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ children }: { children: React.ReactNode }) {
    return <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">{children}</div>;
}
