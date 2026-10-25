'use client';

import { useEffect, useState, type ElementType } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Save, Loader2, Plus, Trash2, Edit, X, Tags, Palette, Ruler, Type, List
} from 'lucide-react';

interface Attribute {
    _id: string;
    name: string;
    slug: string;
    type: 'color' | 'size' | 'text' | 'select';
    values: string[];
    colorValues?: Record<string, string>;
    description?: string;
    order: number;
    isActive: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; icon: ElementType; color: string; bg: string }> = {
    color: { label: 'Color', icon: Palette, color: 'text-pink-600', bg: 'bg-pink-50' },
    size: { label: 'Size', icon: Ruler, color: 'text-blue-600', bg: 'bg-blue-50' },
    text: { label: 'Text', icon: Type, color: 'text-green-600', bg: 'bg-green-50' },
    select: { label: 'Select', icon: List, color: 'text-purple-600', bg: 'bg-purple-50' },
};

export default function AttributesManagementClient({ initialAttributes }: { initialAttributes: Attribute[] }) {
    const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        slug: '',
        type: 'text' as 'color' | 'size' | 'text' | 'select',
        values: [''],
        colorValues: {} as Record<string, string>,
        description: '',
    });

    const fetchAttributes = async (nextSearch = search) => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();
            if (nextSearch) params.set('search', nextSearch);

            const res = await fetch(`/api/admin/attributes?${params.toString()}`, { cache: 'no-store' });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch attributes');
            }

            setAttributes(Array.isArray(data) ? data : []);
        } catch (fetchError) {
            console.error('Failed to fetch attributes:', fetchError);
            setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch attributes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchAttributes(search);
        }, 150);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const resetForm = () => {
        setForm({ name: '', slug: '', type: 'text', values: [''], colorValues: {}, description: '' });
        setEditing(null);
        setCreating(false);
    };

    const startCreate = () => {
        resetForm();
        setCreating(true);
    };

    const startEdit = (attr: Attribute) => {
        setForm({
            name: attr.name,
            slug: attr.slug,
            type: attr.type,
            values: attr.values.length > 0 ? [...attr.values] : [''],
            colorValues: attr.colorValues || {},
            description: attr.description || '',
        });
        setEditing(attr._id);
        setCreating(false);
    };

    const updateName = (name: string) => {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        setForm((currentForm) => ({ ...currentForm, name, slug }));
    };

    const addValue = () => {
        setForm((currentForm) => ({ ...currentForm, values: [...currentForm.values, ''] }));
    };

    const removeValue = (idx: number) => {
        setForm((currentForm) => ({ ...currentForm, values: currentForm.values.filter((_, i) => i !== idx) }));
    };

    const updateValue = (idx: number, val: string) => {
        setForm((currentForm) => {
            const values = [...currentForm.values];
            values[idx] = val;
            return { ...currentForm, values };
        });
    };

    const updateColorValue = (valueName: string, hex: string) => {
        setForm((currentForm) => ({
            ...currentForm,
            colorValues: { ...currentForm.colorValues, [valueName]: hex },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload = {
                ...form,
                values: form.values.filter((v) => v.trim()),
            };

            const res = await fetch('/api/admin/attributes', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editing ? { ...payload, _id: editing } : payload),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save attribute');
            }

            resetForm();
            await fetchAttributes(search);
        } catch (submitError) {
            console.error('Failed to save attribute:', submitError);
            setError(submitError instanceof Error ? submitError.message : 'Failed to save attribute');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this attribute?')) return;

        setDeleting(id);
        setError('');

        try {
            const res = await fetch('/api/admin/attributes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete attribute');
            }

            await fetchAttributes(search);
        } catch (deleteError) {
            console.error('Failed to delete attribute:', deleteError);
            setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete attribute');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="p-5 md:p-8 max-w-[1400px]">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Attributes</h1>
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400 mt-0.5">
                        Manage product attributes like Color, Size, Material
                    </p>
                </div>
                {!creating && !editing && (
                    <Button onClick={startCreate} className="bg-neutral-900 text-[12px] font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 h-9 px-5">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add Attribute
                    </Button>
                )}
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                    {error}
                </div>
            )}

            {(creating || editing) && (
                <div className="mb-8 rounded-xl border border-neutral-200/60 bg-white p-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300 mb-4">
                        {editing ? 'Edit Attribute' : 'New Attribute'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="lg:col-span-2">
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                    Attribute Name *
                                </Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => updateName(e.target.value)}
                                    placeholder="e.g., Color, Size, Material"
                                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                    Type
                                </Label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm((currentForm) => ({ ...currentForm, type: e.target.value as typeof currentForm.type }))}
                                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                >
                                    <option value="text">Text</option>
                                    <option value="color">Color</option>
                                    <option value="size">Size</option>
                                    <option value="select">Select</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                    Slug
                                </Label>
                                <Input
                                    value={form.slug}
                                    onChange={(e) => setForm((currentForm) => ({ ...currentForm, slug: e.target.value }))}
                                    placeholder="auto-generated"
                                    className="mt-1.5 border-neutral-200 text-neutral-500 focus:border-neutral-900 focus:ring-neutral-900"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                Values *
                            </Label>
                            <div className="mt-1.5 space-y-2">
                                {form.values.map((val, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        {form.type === 'color' && (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-9 w-9 rounded-lg border border-neutral-200 cursor-pointer overflow-hidden"
                                                    style={{ backgroundColor: form.colorValues[val] || '#000000' }}
                                                >
                                                    <input
                                                        type="color"
                                                        value={form.colorValues[val] || '#000000'}
                                                        onChange={(e) => updateColorValue(val, e.target.value)}
                                                        className="opacity-0 w-full h-full cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <Input
                                            value={val}
                                            onChange={(e) => updateValue(idx, e.target.value)}
                                            placeholder={`Value ${idx + 1} (e.g., ${form.type === 'color' ? 'Red' : form.type === 'size' ? 'M' : 'Option'})`}
                                            className="flex-1 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                        />
                                        {form.values.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeValue(idx)}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-300 hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addValue}
                                className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                                + Add value
                            </button>
                        </div>

                        <div className="mt-4">
                            <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                Description
                            </Label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm((currentForm) => ({ ...currentForm, description: e.target.value }))}
                                rows={2}
                                className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-[13px] text-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                                placeholder="Optional description..."
                            />
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-neutral-900 text-[12px] font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 h-9 px-5"
                            >
                                {saving ? (
                                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Saving...</>
                                ) : (
                                    <><Save className="mr-2 h-3.5 w-3.5" />Save Attribute</>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                className="text-[12px] border-neutral-200 text-neutral-600 hover:bg-neutral-50 h-9 px-5"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mb-6">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search attributes..."
                    className="max-w-sm border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
            ) : attributes.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-neutral-200/60 bg-neutral-50/50">
                    <Tags className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <p className="text-neutral-500 text-sm">No attributes found</p>
                    <p className="text-neutral-400 text-xs mt-1">Create your first attribute to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attributes.map((attr) => {
                        const typeConfig = TYPE_CONFIG[attr.type] || TYPE_CONFIG.text;
                        const TypeIcon = typeConfig.icon;

                        return (
                            <div
                                key={attr._id}
                                className="rounded-xl border border-neutral-200/60 bg-white p-5 hover:border-neutral-300 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', typeConfig.bg)}>
                                            <TypeIcon className={cn('h-4 w-4', typeConfig.color)} />
                                        </div>
                                        <div>
                                            <h3 className="text-[13px] font-semibold text-neutral-900">{attr.name}</h3>
                                            <p className="text-[10px] text-neutral-400">{attr.slug}</p>
                                        </div>
                                    </div>
                                    <span className={cn('text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full', typeConfig.bg, typeConfig.color)}>
                                        {typeConfig.label}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {attr.values.slice(0, 5).map((val, idx) => (
                                            attr.type === 'color' ? (
                                                <div
                                                    key={idx}
                                                    className="h-6 w-6 rounded-full border border-neutral-200"
                                                    style={{ backgroundColor: attr.colorValues?.[val] || '#000000' }}
                                                    title={val}
                                                />
                                            ) : (
                                                <span
                                                    key={idx}
                                                    className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
                                                >
                                                    {val}
                                                </span>
                                            )
                                        ))}
                                        {attr.values.length > 5 && (
                                            <span className="text-[10px] text-neutral-400">+{attr.values.length - 5} more</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-neutral-100">
                                    <button
                                        onClick={() => startEdit(attr)}
                                        className="flex flex-1 items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 transition-colors py-1.5 rounded-lg hover:bg-neutral-50"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(attr._id)}
                                        disabled={deleting === attr._id}
                                        className="flex flex-1 items-center justify-center gap-1.5 text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {deleting === attr._id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function cn(...classes: (string | false | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
