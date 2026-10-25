'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Loader2, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SavedPaymentMethod {
    id: string;
    provider: 'stripe' | 'razorpay' | 'manual';
    brand: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    holderName: string;
    isDefault: boolean;
}

const emptyMethod = (): SavedPaymentMethod => ({
    id: `pm_${Date.now()}`,
    provider: 'manual',
    brand: '',
    last4: '',
    expiryMonth: '',
    expiryYear: '',
    holderName: '',
    isDefault: false,
});

export default function PaymentsPage() {
    const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/customer/profile');
                const data = await res.json();
                if (data.success) {
                    setMethods(data.data.savedPaymentMethods || []);
                }
            } catch (fetchError) {
                console.error(fetchError);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const updateMethod = <K extends keyof SavedPaymentMethod>(index: number, key: K, value: SavedPaymentMethod[K]) => {
        setMethods((current) =>
            current.map((method, methodIndex) => (methodIndex === index ? { ...method, [key]: value } : method))
        );
    };

    const setDefaultMethod = (index: number) => {
        setMethods((current) =>
            current.map((method, methodIndex) => ({
                ...method,
                isDefault: methodIndex === index,
            }))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        setError('');

        const invalidMethod = methods.find((method) => !method.brand || !method.last4 || !method.holderName);
        if (invalidMethod) {
            setError('Each saved payment profile needs a brand, holder name, and last 4 digits.');
            setSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/customer/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ savedPaymentMethods: methods }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save payment methods');
            }

            setMethods(data.data.savedPaymentMethods || []);
            setMessage('Your payment preferences have been updated.');
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Failed to save payment methods');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-neutral-300" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Payment Methods</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Store masked payment preferences for quicker reorders. Full card data is not stored here.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setMethods((current) => [...current, emptyMethod()])}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                    <Plus className="h-4 w-4" />
                    Add Payment Profile
                </button>
            </div>

            <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>
                        This account page stores only masked reference details like provider, brand, last 4 digits, and expiry so customers can recognize their preferred payment profile.
                    </p>
                </div>
            </div>

            {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="space-y-6">
                {methods.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-sm text-neutral-500">
                        No payment profiles saved yet. Add one for quicker checkout recognition.
                    </div>
                ) : (
                    methods.map((method, index) => (
                        <section key={method.id} className="rounded-[28px] border border-neutral-200/70 bg-neutral-50 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full border border-neutral-200 bg-white p-2">
                                        <CreditCard className="h-4 w-4 text-neutral-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold capitalize text-neutral-900">{method.brand || `Payment profile ${index + 1}`}</p>
                                        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">{method.provider}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setDefaultMethod(index)}
                                        className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                                            method.isDefault ? 'bg-neutral-900 text-white' : 'border border-neutral-200 bg-white text-neutral-600'
                                        }`}
                                    >
                                        {method.isDefault ? 'Default' : 'Set default'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMethods((current) => current.filter((_, methodIndex) => methodIndex !== index))}
                                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor={`provider-${index}`}>Provider</Label>
                                    <select
                                        id={`provider-${index}`}
                                        value={method.provider}
                                        onChange={(event) => updateMethod(index, 'provider', event.target.value as SavedPaymentMethod['provider'])}
                                        className="mt-2 h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900"
                                    >
                                        <option value="manual">Manual</option>
                                        <option value="stripe">Stripe</option>
                                        <option value="razorpay">Razorpay</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor={`brand-${index}`}>Brand</Label>
                                    <Input id={`brand-${index}`} value={method.brand} onChange={(event) => updateMethod(index, 'brand', event.target.value)} placeholder="Visa, Mastercard, UPI, etc." />
                                </div>
                                <div>
                                    <Label htmlFor={`holder-${index}`}>Cardholder / account holder</Label>
                                    <Input id={`holder-${index}`} value={method.holderName} onChange={(event) => updateMethod(index, 'holderName', event.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor={`last4-${index}`}>Last 4 digits</Label>
                                    <Input id={`last4-${index}`} maxLength={4} value={method.last4} onChange={(event) => updateMethod(index, 'last4', event.target.value.replace(/\D/g, '').slice(0, 4))} />
                                </div>
                                <div>
                                    <Label htmlFor={`month-${index}`}>Expiry month</Label>
                                    <Input id={`month-${index}`} maxLength={2} value={method.expiryMonth} onChange={(event) => updateMethod(index, 'expiryMonth', event.target.value.replace(/\D/g, '').slice(0, 2))} />
                                </div>
                                <div>
                                    <Label htmlFor={`year-${index}`}>Expiry year</Label>
                                    <Input id={`year-${index}`} maxLength={4} value={method.expiryYear} onChange={(event) => updateMethod(index, 'expiryYear', event.target.value.replace(/\D/g, '').slice(0, 4))} />
                                </div>
                            </div>
                        </section>
                    ))
                )}
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save Payment Profiles
                </button>
            </div>
        </div>
    );
}
