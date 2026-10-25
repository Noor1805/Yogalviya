'use client';

import { useState, useEffect } from 'react';
import { AnalyticsTabs } from '@/components/admin/AnalyticsTabs';
import { Loader2, FolderOpen, PieChart } from 'lucide-react';

interface TopCategory {
    category: string;
    totalQuantitySold: number;
    totalRevenueInCents: number;
}

export default function TopCategoriesPage() {
    const [categories, setCategories] = useState<TopCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopCategories = async () => {
            try {
                const res = await fetch('/api/admin/analytics/top-categories');
                const data = await res.json();
                if (data.success) {
                    setCategories(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopCategories();
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
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Top Selling Categories</h1>
                <p className="mt-1 text-[13px] text-neutral-500">Your most popular and profitable categories</p>
            </div>
            
            <AnalyticsTabs />

            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-neutral-400" /> Top Categories by Volume
                    </h3>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-400 text-[13px]">
                        <FolderOpen className="h-10 w-10 opacity-20 mb-3" />
                        No category sales recorded yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-neutral-100 text-[10px] uppercase tracking-wider text-neutral-400">
                                    <th className="pb-3 font-semibold">Rank</th>
                                    <th className="pb-3 font-semibold">Category</th>
                                    <th className="pb-3 font-semibold text-right">Units Sold</th>
                                    <th className="pb-3 font-semibold text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px] text-neutral-700">
                                {categories.map((c, idx) => (
                                    <tr key={c.category} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 font-medium text-neutral-500">
                                            #{idx + 1}
                                        </td>
                                        <td className="py-4 font-medium text-neutral-900 flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-500">
                                                <FolderOpen className="h-3.5 w-3.5" />
                                            </div>
                                            {c.category}
                                        </td>
                                        <td className="py-4 text-right font-medium">{c.totalQuantitySold}</td>
                                        <td className="py-4 text-right font-medium text-neutral-900">{formatCurrency(c.totalRevenueInCents)}</td>
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
