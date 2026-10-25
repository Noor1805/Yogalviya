'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    X,
    Save,
    Ticket,
    Calendar,
    Percent,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

interface Coupon {
    _id: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxUses: number | null;
    usedCount: number;
    maxUsesPerCustomer: number;
    minOrderAmount: number;
    maxDiscountAmount: number | null;
    applicableCategories: string[];
    applicableProducts: string[];
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);

    const [form, setForm] = useState({
        code: '',
        description: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: 0,
        maxUses: null as number | null,
        maxUsesPerCustomer: 1,
        minOrderAmount: 0,
        maxDiscountAmount: null as number | null,
        startDate: new Date().toISOString().split('T')[0],
        endDate: defaultEndDate.toISOString().split('T')[0],
        isActive: true,
    });

    const fetchCoupons = async () => {
        const res = await fetch('/api/admin/coupons');
        const data = await res.json();
        setCoupons(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const startCreate = () => {
        setCreating(true);
        setEditing(null);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        setForm({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: 0,
            maxUses: null,
            maxUsesPerCustomer: 1,
            minOrderAmount: 0,
            maxDiscountAmount: null,
            startDate: new Date().toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            isActive: true,
        });
    };

    const startEdit = (coupon: Coupon) => {
        setEditing(coupon._id);
        setCreating(false);
        setForm({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            maxUses: coupon.maxUses,
            maxUsesPerCustomer: coupon.maxUsesPerCustomer,
            minOrderAmount: coupon.minOrderAmount,
            maxDiscountAmount: coupon.maxDiscountAmount,
            startDate: new Date(coupon.startDate).toISOString().split('T')[0],
            endDate: new Date(coupon.endDate).toISOString().split('T')[0],
            isActive: coupon.isActive,
        });
    };

    const cancel = () => {
        setEditing(null);
        setCreating(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (creating) {
                const res = await fetch('/api/admin/coupons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                if (!res.ok) {
                    const data = await res.json();
                    console.error('Create error:', data);
                    alert(data.error || data.details || 'Failed to create coupon');
                    setSaving(false);
                    return;
                }
            } else if (editing) {
                const res = await fetch('/api/admin/coupons', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ _id: editing, ...form }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    console.error('Update error:', data);
                    alert(data.error || data.details || 'Failed to update coupon');
                    setSaving(false);
                    return;
                }
            }
            await fetchCoupons();
            cancel();
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save');
        }
        setSaving(false);
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Delete coupon "${code}"?`)) return;
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
                return;
            }
            await fetchCoupons();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete');
        }
    };

    const getStatus = (coupon: Coupon) => {
        const now = new Date();
        const start = new Date(coupon.startDate);
        const end = new Date(coupon.endDate);

        if (!coupon.isActive) return { label: 'Inactive', color: 'text-neutral-400', bg: 'bg-neutral-50' };
        if (now < start) return { label: 'Scheduled', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (now > end) return { label: 'Expired', color: 'text-red-600', bg: 'bg-red-50' };
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return { label: 'Usage Limit Reached', color: 'text-orange-600', bg: 'bg-orange-50' };
        }
        return { label: 'Active', color: 'text-green-600', bg: 'bg-green-50' };
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                            <Ticket className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-neutral-900">
                                Coupons
                            </h1>
                            <p className="text-[13px] font-medium text-neutral-400">
                                Manage discount codes and promotions
                            </p>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={startCreate}
                    className="gap-2 bg-neutral-900 hover:bg-neutral-800"
                >
                    <Plus className="h-4 w-4" />
                    Create Coupon
                </Button>
            </div>

            {/* Form Modal */}
            {(creating || editing) && (
                <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-neutral-900">
                            {creating ? 'Create New Coupon' : 'Edit Coupon'}
                        </h2>
                        <button onClick={cancel} className="text-neutral-400 hover:text-neutral-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Coupon Code */}
                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
                                Coupon Code *
                            </label>
                            <Input
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                placeholder="SUMMER20"
                                className="font-mono text-lg tracking-wider uppercase"
                            />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
                                Description
                            </label>
                            <Input
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Summer sale - 20% off"
                            />
                        </div>

                        {/* Discount Type */}
                        <div>
                            <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
                                Discount Type *
                            </label>
                            <select
                                value={form.discountType}
                                onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' })}
                                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-[13px] focus:border-neutral-900 focus:outline-none"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>

                        {/* Discount Value */}
                        <div>
                            <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
                                Discount Value *
                            </label>
                            <div className="relative">
                                {form.discountType === 'percentage' ? (
                                    <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                ) : (
                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                )}
                                <Input
                                    type="number"
                                    value={form.discountValue}
                                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                                    placeholder={form.discountType === 'percentage' ? '20' : '500'}
                                    className="pl-10"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
                                Start Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
                                End Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Max Uses */}
                        <div>
                            <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
                                Max Total Uses
                            </label>
                            <Input
                                type="number"
                                value={form.maxUses || ''}
                                onChange={(e) => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : null })}
                                placeholder="Leave empty for unlimited"
                                min="0"
                            />
                        </div>

                        {/* Max Uses Per Customer */}
                        <div>
                            <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
                                Max Uses Per Customer *
                            </label>
                            <Input
                                type="number"
                                value={form.maxUsesPerCustomer}
                                onChange={(e) => setForm({ ...form, maxUsesPerCustomer: Number(e.target.value) })}
                                min="1"
                            />
                        </div>

                        {/* Min Order Amount */}
                        <div>
                            <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
                                Minimum Order Amount (₹)
                            </label>
                            <Input
                                type="number"
                                value={form.minOrderAmount}
                                onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        {/* Max Discount Amount (for percentage) */}
                        {form.discountType === 'percentage' && (
                            <div>
                                <label className="mb-1.5 block text-[12px] font-semibold text-neutral-700">
                                    Max Discount Cap (₹)
                                </label>
                                <Input
                                    type="number"
                                    value={form.maxDiscountAmount || ''}
                                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value ? Number(e.target.value) : null })}
                                    placeholder="Leave empty for no cap"
                                    min="0"
                                />
                            </div>
                        )}

                        {/* Active Status */}
                        <div className="sm:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                />
                                <span className="text-[13px] font-medium text-neutral-700">Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={cancel} disabled={saving}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !form.code || form.discountValue <= 0}
                            className="gap-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {creating ? 'Create Coupon' : 'Save Changes'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            <div className="space-y-3">
                {coupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white py-16">
                        <Ticket className="mb-4 h-12 w-12 text-neutral-300" />
                        <p className="text-[15px] font-medium text-neutral-500">
                            No coupons created yet
                        </p>
                        <p className="mt-1 text-[13px] text-neutral-400">
                            Create your first coupon to get started
                        </p>
                    </div>
                ) : (
                    coupons.map((coupon) => {
                        const status = getStatus(coupon);
                        return (
                            <div
                                key={coupon._id}
                                className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    {/* Left: Coupon Info */}
                                    <div className="flex flex-1 items-start gap-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                                            <Ticket className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-mono text-lg font-semibold tracking-wider text-neutral-900">
                                                    {coupon.code}
                                                </h3>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.bg} ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            {coupon.description && (
                                                <p className="mt-1 text-[13px] text-neutral-500">
                                                    {coupon.description}
                                                </p>
                                            )}
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-neutral-400">
                                                <span className="flex items-center gap-1">
                                                    {coupon.discountType === 'percentage' ? (
                                                        <><Percent className="h-3 w-3" /> {coupon.discountValue}% off</>
                                                    ) : (
                                                        <><DollarSign className="h-3 w-3" /> ₹{coupon.discountValue} off</>
                                                    )}
                                                </span>
                                                {coupon.minOrderAmount > 0 && (
                                                    <span>Min: ₹{coupon.minOrderAmount}</span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                                                </span>
                                                {coupon.maxUses && (
                                                    <span>
                                                        Uses: {coupon.usedCount}/{coupon.maxUses}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2 lg:flex-shrink-0">
                                        <button
                                            onClick={() => startEdit(coupon)}
                                            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon._id, coupon.code)}
                                            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
