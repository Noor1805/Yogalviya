'use client';

import { useState, useEffect } from 'react';
import { AnalyticsTabs } from '@/components/admin/AnalyticsTabs';
import { Loader2, Package, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface TopProduct {
    _id: string; // product ID
    name: string;
    sku: string;
    image?: string;
    totalQuantitySold: number;
    totalRevenueInCents: number;
}

export default function TopProductsPage() {
    const [products, setProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const res = await fetch('/api/admin/analytics/top-products');
                const data = await res.json();
                if (data.success) {
                    setProducts(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopProducts();
    }, []);

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(cents / 100);
    };

    return (
        <div className="max-w-6xl">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Top Selling Products</h1>
                <p className="mt-1 text-[13px] text-neutral-500">Your most popular and profitable items</p>
            </div>
            
            <AnalyticsTabs />

            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-neutral-400" /> Top 10 by Volume
                    </h3>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-400 text-[13px]">
                        <Package className="h-10 w-10 opacity-20 mb-3" />
                        No product sales recorded yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-neutral-100 text-[10px] uppercase tracking-wider text-neutral-400">
                                    <th className="pb-3 font-semibold">Rank</th>
                                    <th className="pb-3 font-semibold">Product</th>
                                    <th className="pb-3 font-semibold">SKU</th>
                                    <th className="pb-3 font-semibold text-right">Units Sold</th>
                                    <th className="pb-3 font-semibold text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px] text-neutral-700">
                                {products.map((p, idx) => (
                                    <tr key={p._id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 font-medium text-neutral-500">
                                            #{idx + 1}
                                        </td>
                                        <td className="py-4 font-medium text-neutral-900">
                                            <div className="flex items-center gap-3">
                                                {p.image ? (
                                                    <div className="relative h-10 w-10 overflow-hidden rounded bg-neutral-100">
                                                        <Image src={p.image.replace(/\.[^/.]+$/, ".jpg")} fill className="object-cover" alt={p.name} sizes="40px" />
                                                    </div>
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 border border-neutral-200">
                                                        <Package className="h-4 w-4 text-neutral-300" />
                                                    </div>
                                                )}
                                                {p.name}
                                            </div>
                                        </td>
                                        <td className="py-4 text-neutral-500 font-mono text-[11px]">{p.sku}</td>
                                        <td className="py-4 text-right font-medium">{p.totalQuantitySold}</td>
                                        <td className="py-4 text-right font-medium text-neutral-900">{formatCurrency(p.totalRevenueInCents)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
