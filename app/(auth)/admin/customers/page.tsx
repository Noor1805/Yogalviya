'use client';

import { useEffect, useState } from 'react';
import { Search, Loader2, Users, Calendar, Clock, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CustomerItem {
    _id: string;
    email: string;
    name: string;
    phone?: string;
    createdAt: string;
    lastLogin?: string;
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<CustomerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set('search', search);

        try {
            const res = await fetch(`/api/admin/customers?${params}`);
            const data = await res.json();
            setCustomers(data.customers || []);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCustomers();
    };

    const formatDate = (dateValue: string | undefined) => {
        if (!dateValue) return 'Never';
        return new Date(dateValue).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="relative pb-24">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Customers</h1>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wider text-neutral-400">
                        {customers.length} registered accounts
                    </p>
                    <p className="mt-2 text-[12px] text-neutral-500">
                        Contact form submissions appear in the <span className="font-medium text-neutral-800">Contacts</span> section. This page only shows registered customer accounts.
                    </p>
                </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 border-neutral-200 text-[13px] focus:border-neutral-900 focus:ring-neutral-900"
                    />
                </div>
                <Button type="submit" variant="outline" className="border-neutral-200 text-[12px] text-neutral-600 hover:bg-neutral-50">
                    Search
                </Button>
            </form>

            {/* Customers Table */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : customers.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                        <Users className="h-6 w-6 text-neutral-400" />
                    </div>
                    <p className="text-[13px] text-neutral-500 font-medium">No customers found</p>
                    <p className="mt-1 text-[12px] text-neutral-400">Registered customers will appear here after account signup.</p>
                </div>
            ) : (
                <>
                    {/* Desktop View */}
                    <div className="hidden overflow-hidden rounded-xl border border-neutral-200/60 bg-white md:block">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-100">
                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Customer
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Email Address
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Joined
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Last Active
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer._id} className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white font-bold uppercase text-[15px]">
                                                    {customer.name?.charAt(0) || customer.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-medium text-neutral-900">{customer.name}</p>
                                                    {customer.phone && (
                                                        <p className="mt-0.5 text-[11px] text-neutral-400">{customer.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                                                <span className="text-[13px] text-neutral-600">{customer.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                                <span className="text-[13px] font-medium text-neutral-800">
                                                    {formatDate(customer.createdAt)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                                <span className="text-[13px] text-neutral-600">
                                                    {formatDate(customer.lastLogin)}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="space-y-3 md:hidden">
                        {customers.map((customer) => (
                            <div key={customer._id} className="rounded-xl border border-neutral-200/60 bg-white p-4">
                                <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white font-bold uppercase text-[15px]">
                                        {customer.name?.charAt(0) || customer.email.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-[13px] font-semibold text-neutral-900">{customer.name}</h3>
                                        <p className="text-[12px] text-neutral-500">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="pt-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Joined</p>
                                        <p className="text-[12px] font-medium text-neutral-700">{formatDate(customer.createdAt)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Last Active</p>
                                        <p className="text-[12px] font-medium text-neutral-700">{formatDate(customer.lastLogin)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
