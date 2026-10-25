'use client';

import { useEffect, useState } from 'react';
import { Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Address {
    label: string;
    type: 'billing' | 'shipping';
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

const emptyAddress = (): Address => ({
    label: 'New address',
    type: 'shipping',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false,
});

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
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
                    setAddresses(data.data.addresses || []);
                }
            } catch (fetchError) {
                console.error(fetchError);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const updateAddress = <K extends keyof Address>(index: number, key: K, value: Address[K]) => {
        setAddresses((current) =>
            current.map((address, addressIndex) => (addressIndex === index ? { ...address, [key]: value } : address))
        );
    };

    const setDefaultAddress = (index: number) => {
        setAddresses((current) =>
            current.map((address, addressIndex) => ({
                ...address,
                isDefault: addressIndex === index,
            }))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        setError('');

        const invalidAddress = addresses.find(
            (address) => !address.line1 || !address.city || !address.state || !address.postalCode || !address.country
        );

        if (invalidAddress) {
            setError('Please complete line 1, city, state, postal code, and country for every saved address.');
            setSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/customer/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addresses }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save addresses');
            }

            setAddresses(data.data.addresses || []);
            setMessage('Your address book has been updated.');
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Failed to save addresses');
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
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Addresses</h1>
                    <p className="mt-1 text-sm text-neutral-500">Manage your shipping and billing locations for faster checkout.</p>
                </div>

                <button
                    type="button"
                    onClick={() => setAddresses((current) => [...current, emptyAddress()])}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                    <Plus className="h-4 w-4" />
                    Add Address
                </button>
            </div>

            {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="space-y-6">
                {addresses.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-sm text-neutral-500">
                        No addresses saved yet. Add a shipping or billing address to make checkout faster.
                    </div>
                ) : (
                    addresses.map((address, index) => (
                        <section key={`${address.label}-${index}`} className="rounded-[28px] border border-neutral-200/70 bg-neutral-50 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full border border-neutral-200 bg-white p-2">
                                        <MapPin className="h-4 w-4 text-neutral-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-900">{address.label || `Address ${index + 1}`}</p>
                                        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">{address.type}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setDefaultAddress(index)}
                                        className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                                            address.isDefault ? 'bg-neutral-900 text-white' : 'border border-neutral-200 bg-white text-neutral-600'
                                        }`}
                                    >
                                        {address.isDefault ? 'Default' : 'Set default'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAddresses((current) => current.filter((_, addressIndex) => addressIndex !== index))}
                                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor={`label-${index}`}>Label</Label>
                                    <Input id={`label-${index}`} value={address.label} onChange={(event) => updateAddress(index, 'label', event.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor={`type-${index}`}>Type</Label>
                                    <select
                                        id={`type-${index}`}
                                        value={address.type}
                                        onChange={(event) => updateAddress(index, 'type', event.target.value as Address['type'])}
                                        className="mt-2 h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900"
                                    >
                                        <option value="shipping">Shipping</option>
                                        <option value="billing">Billing</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor={`line1-${index}`}>Address line 1</Label>
                                    <Input id={`line1-${index}`} value={address.line1} onChange={(event) => updateAddress(index, 'line1', event.target.value)} />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor={`line2-${index}`}>Address line 2</Label>
                                    <Input id={`line2-${index}`} value={address.line2 || ''} onChange={(event) => updateAddress(index, 'line2', event.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor={`city-${index}`}>City</Label>
                                    <Input id={`city-${index}`} value={address.city} onChange={(event) => updateAddress(index, 'city', event.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor={`state-${index}`}>State</Label>
                                    <Input id={`state-${index}`} value={address.state} onChange={(event) => updateAddress(index, 'state', event.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor={`postal-${index}`}>Postal code</Label>
                                    <Input id={`postal-${index}`} value={address.postalCode} onChange={(event) => updateAddress(index, 'postalCode', event.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor={`country-${index}`}>Country</Label>
                                    <Input id={`country-${index}`} value={address.country} onChange={(event) => updateAddress(index, 'country', event.target.value)} />
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
                    Save Addresses
                </button>
            </div>
        </div>
    );
}
