'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Loader2, X, Save, FolderOpen } from 'lucide-react';

interface CategoryItem {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    order: number;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', slug: '', description: '', image: '', order: 0 });

    const fetchCategories = async () => {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        setCategories(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const startCreate = () => {
        setCreating(true);
        setEditing(null);
        setForm({ name: '', slug: '', description: '', image: '', order: categories.length });
    };

    const startEdit = (cat: CategoryItem) => {
        setEditing(cat._id);
        setCreating(false);
        setForm({ name: cat.name, slug: cat.slug, description: cat.description, image: cat.image, order: cat.order });
    };

    const cancel = () => {
        setEditing(null);
        setCreating(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (creating) {
                const res = await fetch('/api/admin/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                if (!res.ok) {
                    const data = await res.json();
                    alert(data.error || 'Failed to create category');
                    setSaving(false);
                    return;
                }
            } else if (editing) {
                const res = await fetch('/api/admin/categories', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ _id: editing, ...form }),
                });
                if (!res.ok) {
                    alert('Failed to update category');
                    setSaving(false);
                    return;
                }
            }
            await fetchCategories();
            cancel();
        } catch {
            alert('Failed to save');
        }
        setSaving(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete collection "${name}"? Ensure all associated pieces are reassigned first.`)) return;
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
                return;
            }
            await fetchCategories();
        } catch {
            alert('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-800" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
                    <p className="mt-1 text-sm text-gray-500">{categories.length} curated collections</p>
                </div>
                <Button onClick={startCreate} className="bg-neutral-800 text-white hover:bg-neutral-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Collection
                </Button>
            </div>

            {/* Create/Edit Form */}
            {(creating || editing) && (
                <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
                    <h3 className="mb-4 text-sm font-bold text-gray-900">
                        {creating ? 'New Collection' : 'Edit Collection'}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-[10px] font-semibold text-gray-400">Collection Name</label>
                            <Input
                                value={form.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                    setForm((f) => ({ ...f, name, slug }));
                                }}
                                placeholder="e.g. Autumn/Winter 2024"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-gray-400">Slug</label>
                            <Input
                                value={form.slug}
                                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                                placeholder="e.g. aw-2024"
                                className="mt-1"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-semibold text-gray-400">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                rows={2}
                                placeholder="Describe the inspiration behind this collection..."
                                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button onClick={handleSave} disabled={saving} className="bg-neutral-800 text-white hover:bg-neutral-700">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Collection
                        </Button>
                        <Button variant="outline" onClick={cancel}>
                            <X className="mr-1.5 h-4 w-4" />Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Categories List */}
            <div className="space-y-3">
                {categories.map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-50">
                                <FolderOpen className="h-5 w-5 text-neutral-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                                <p className="text-xs text-gray-400">/{cat.slug}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-8" onClick={() => startEdit(cat)}>
                                <Edit className="mr-1.5 h-3.5 w-3.5" />Edit
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(cat._id, cat.name)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
                {categories.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-400">No categories yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

