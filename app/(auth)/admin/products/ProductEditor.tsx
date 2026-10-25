'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Save, Loader2, Plus, Trash2, Upload, X, ArrowLeft, ImageIcon,
    Layers, Package, FolderSearch, ChevronDown
} from 'lucide-react';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import { cleanAttributeOptions, reconcileVariations, summarizeVariations } from '@/lib/utils/product-admin';

// ─── Types ───────────────────────────────────────────────────
interface Specification {
    label: string;
    value: string;
}

interface AttributeOption {
    name: string;       // e.g. "Color"
    values: string[];   // e.g. ["Black", "Beige", "Navy"]
    colorValues?: Record<string, string>; // Hex codes for color attributes
}

interface GlobalAttributeOption {
    id: string;
    name: string;
    slug: string;
    type?: string;
    values: string[];
    colorValues?: Record<string, string>;
    description?: string;
}

interface Variation {
    id: string;
    attributes: Record<string, string>; // e.g. { Color: "Black", Size: "M" }
    price: number;
    compareAtPrice?: number;
    sku: string;
    stockCount: number;
    image?: string;
    gallery?: string[]; // Additional gallery images for this variation
}

interface CategoryOption {
    name: string;
    slug: string;
}

interface AdditionalInfoRow {
    label: string;
    value: string;
}

interface ProductFormData {
    name: string;
    slug: string;
    productType: 'simple' | 'variable';
    category: string;
    categorySlug: string;
    description: string;
    shortDescription?: string;
    productDetails?: string;
    commitment?: string;
    additionalInfo?: AdditionalInfoRow[];
    price: number;
    compareAtPrice?: number;
    sku: string;
    stockCount: number;
    specifications: Specification[];
    mainImage: string;
    gallery: string[];
    attributes: AttributeOption[];
    variations: Variation[];
    status: 'draft' | 'published';
    featured: boolean;
    badge: string;
    availableBadges: string[];
}

interface ProductEditorProps {
    initialData?: ProductFormData;
    productId?: string;
    categories: CategoryOption[];
    globalAttributes?: GlobalAttributeOption[];
}

const emptyForm: ProductFormData = {
    name: '',
    slug: '',
    productType: 'simple',
    category: '',
    categorySlug: '',
    description: '',
    shortDescription: '',
    productDetails: '',
    commitment: '',
    additionalInfo: [],
    price: 0,
    compareAtPrice: undefined,
    sku: '',
    stockCount: 0,
    specifications: [{ label: '', value: '' }],
    mainImage: '',
    gallery: [],
    attributes: [],
    variations: [],
    status: 'draft',
    featured: false,
    badge: '',
    availableBadges: [],
};

// ─── Unique ID generator ────────────────────────────────────
// ═════════════════════════════════════════════════════════════
//  PRODUCT EDITOR COMPONENT
// ═════════════════════════════════════════════════════════════

export default function ProductEditor({
    initialData,
    productId,
    categories,
    globalAttributes = [],
}: ProductEditorProps) {
    const router = useRouter();
    const mergedInitialData = initialData
        ? { ...emptyForm, ...Object.fromEntries(Object.entries(initialData).filter(([, value]) => value !== undefined)) }
        : emptyForm;
    const [form, setForm] = useState<ProductFormData>(mergedInitialData);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'main' | 'gallery' | string>('main');
    const [expandedVariations, setExpandedVariations] = useState<Set<string>>(new Set());
    const [variableDefaultsDirty, setVariableDefaultsDirty] = useState({
        price: false,
        compareAtPrice: false,
        stockCount: false,
    });

    const toggleVariation = (id: string) => {
        setExpandedVariations((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const isEdit = !!productId;
    const variationSummary = summarizeVariations(form.variations);

    const syncVariableDraft = (nextForm: ProductFormData) => {
        if (nextForm.productType !== 'variable') {
            return {
                ...nextForm,
                attributes: [],
                variations: [],
            };
        }

        const attributes = cleanAttributeOptions(nextForm.attributes);
        const variations = reconcileVariations(attributes, nextForm.variations, {
            slug: nextForm.slug,
            price: nextForm.price,
            compareAtPrice: nextForm.compareAtPrice,
            stockCount: nextForm.stockCount,
            mainImage: nextForm.mainImage,
        });

        return {
            ...nextForm,
            attributes,
            variations,
        };
    };

    // ── Auto-slug ──
    const updateName = (name: string) => {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        setForm((f) => ({ ...f, name, slug }));
    };

    // ── Category select ──
    const updateCategory = (slug: string) => {
        const cat = categories.find((c) => c.slug === slug);
        if (cat) {
            setForm((f) => ({ ...f, category: cat.name, categorySlug: cat.slug }));
        }
    };

    // ── Specifications ──
    const addSpec = () => setForm((f) => ({ ...f, specifications: [...f.specifications, { label: '', value: '' }] }));
    const removeSpec = (i: number) => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));
    const updateSpec = (i: number, field: 'label' | 'value', val: string) => setForm((f) => {
        const specifications = [...f.specifications];
        specifications[i] = { ...specifications[i], [field]: val };
        return { ...f, specifications };
    });

    const addAdditionalInfoRow = () =>
        setForm((f) => ({
            ...f,
            additionalInfo: [...(f.additionalInfo || []), { label: '', value: '' }],
        }));

    const updateAdditionalInfoRow = (index: number, field: keyof AdditionalInfoRow, value: string) =>
        setForm((f) => {
            const additionalInfo = [...(f.additionalInfo || [])];
            additionalInfo[index] = { ...additionalInfo[index], [field]: value };
            return { ...f, additionalInfo };
        });

    const removeAdditionalInfoRow = (index: number) =>
        setForm((f) => ({
            ...f,
            additionalInfo: (f.additionalInfo || []).filter((_, rowIndex) => rowIndex !== index),
        }));

    const createBadge = (value: string) => {
        const newBadge = value.trim().toUpperCase();
        if (!newBadge) return;

        setForm((f) => {
            if (f.availableBadges.includes(newBadge)) {
                return { ...f, badge: newBadge };
            }

            return {
                ...f,
                availableBadges: [...f.availableBadges, newBadge],
                badge: newBadge,
            };
        });
    };

    const removeBadge = (badgeText: string) =>
        setForm((f) => ({
            ...f,
            availableBadges: f.availableBadges.filter((badge) => badge !== badgeText),
            badge: f.badge === badgeText ? '' : f.badge,
        }));

    const parseVariationGalleryTarget = (target: string) => {
        if (!target.startsWith('variation-gallery-')) {
            return null;
        }

        const parts = target.split('-');
        const slotValue = parts.pop();
        const slotIndex = Number.parseInt(slotValue ?? '', 10);

        if (!Number.isFinite(slotIndex)) {
            return null;
        }

        const variationId = parts.slice(2).join('-');
        if (!variationId) {
            return null;
        }

        return { variationId, slotIndex };
    };

    const updateVariationGallerySlot = (variationId: string, slotIndex: number, url: string) => {
        setForm((f) => ({
            ...f,
            variations: f.variations.map((variation) => {
                if (variation.id !== variationId) {
                    return variation;
                }

                const nextGallery = [...(variation.gallery || [])];
                nextGallery[slotIndex] = url;

                return {
                    ...variation,
                    gallery: nextGallery.slice(0, 3),
                };
            }),
        }));
    };

    const applyDefaultOverridesToVariations = (
        variations: Variation[],
        dirtyState = variableDefaultsDirty
    ) => variations.map((variation) => ({
        ...variation,
        price: dirtyState.price ? (form.price || 0) : variation.price,
        compareAtPrice: dirtyState.compareAtPrice ? form.compareAtPrice : variation.compareAtPrice,
        stockCount: dirtyState.stockCount ? (form.stockCount || 0) : variation.stockCount,
        image: variation.image || form.mainImage,
    }));

    // ═══════════════════════════════════════════════════════
    //  ATTRIBUTES  (Color, Size, Material, etc.)
    // ═══════════════════════════════════════════════════════
    const addAttribute = () => {
        setForm((f) => syncVariableDraft({
            ...f,
            attributes: [...f.attributes, { name: '', values: [''] }],
        }));
    };

    const addGlobalAttribute = (attribute: GlobalAttributeOption) => {
        setForm((f) => {
            const alreadyExists = f.attributes.some(
                (existing) => existing.name.toLowerCase() === attribute.name.toLowerCase()
            );

            if (alreadyExists) {
                return f;
            }

            return syncVariableDraft({
                ...f,
                attributes: [
                    ...f.attributes,
                    {
                        name: attribute.name,
                        values: attribute.values.length > 0 ? [...attribute.values] : [''],
                        colorValues: { ...(attribute.colorValues || {}) },
                    },
                ],
            });
        });
    };

    const removeAttribute = (i: number) => {
        setForm((f) => syncVariableDraft({
            ...f,
            attributes: f.attributes.filter((_, idx) => idx !== i),
        }));
    };

    const updateAttributeName = (i: number, name: string) => {
        setForm((f) => {
            const attributes = [...f.attributes];
            const previousName = attributes[i]?.name;
            attributes[i] = { ...attributes[i], name };
            const variations = f.variations.map((variation) => {
                if (!previousName || previousName === name) return variation;

                const nextAttributes = { ...variation.attributes };
                if (previousName in nextAttributes) {
                    nextAttributes[name] = nextAttributes[previousName];
                    delete nextAttributes[previousName];
                }

                return {
                    ...variation,
                    attributes: nextAttributes,
                };
            });

            return syncVariableDraft({ ...f, attributes, variations });
        });
    };

    const addAttributeValue = (attrIdx: number) => {
        setForm((f) => {
            const attributes = [...f.attributes];
            attributes[attrIdx] = {
                ...attributes[attrIdx],
                values: [...attributes[attrIdx].values, ''],
            };
            return syncVariableDraft({ ...f, attributes });
        });
    };

    const removeAttributeValue = (attrIdx: number, valIdx: number) => {
        setForm((f) => {
            const attributes = [...f.attributes];
            attributes[attrIdx] = {
                ...attributes[attrIdx],
                values: attributes[attrIdx].values.filter((_, i) => i !== valIdx),
            };
            return syncVariableDraft({ ...f, attributes });
        });
    };

    const updateAttributeValue = (attrIdx: number, valIdx: number, val: string) => {
        setForm((f) => {
            const attributes = [...f.attributes];
            const values = [...attributes[attrIdx].values];
            values[valIdx] = val;
            attributes[attrIdx] = { ...attributes[attrIdx], values };
            return syncVariableDraft({ ...f, attributes });
        });
    };

    // ═══════════════════════════════════════════════════════
    //  GENERATE VARIATIONS (Cartesian product)
    // ═══════════════════════════════════════════════════════
    const generateVariations = () => {
        setForm((f) => syncVariableDraft(f));
    };

    const updateVariation = (id: string, field: keyof Variation, value: unknown) => {
        setForm((f) => ({
            ...f,
            variations: f.variations.map((v) =>
                v.id === id ? { ...v, [field]: value } : v
            ),
        }));
    };

    const applyDefaultsToAllVariations = () => {
        setForm((f) => ({
            ...f,
            variations: f.variations.map((variation) => ({
                ...variation,
                price: f.price || 0,
                compareAtPrice: f.compareAtPrice,
                stockCount: f.stockCount || 0,
                image: variation.image || f.mainImage,
            })),
        }));
        setVariableDefaultsDirty({
            price: false,
            compareAtPrice: false,
            stockCount: false,
        });
    };

    // ── Image upload ──
    const uploadImage = useCallback(async (file: File, target: 'main' | 'gallery' | string) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                if (target === 'main') {
                    setForm((f) => ({ ...f, mainImage: data.url }));
                } else if (target === 'gallery') {
                    setForm((f) => ({ ...f, gallery: [...f.gallery, data.url] }));
                } else if (target.startsWith('variation-gallery-')) {
                    const parsedTarget = parseVariationGalleryTarget(target);
                    if (parsedTarget) {
                        updateVariationGallerySlot(parsedTarget.variationId, parsedTarget.slotIndex, data.url);
                    }
                } else {
                    // Variation image — target is the variation ID
                    setForm((f) => ({
                        ...f,
                        variations: f.variations.map((v) =>
                            v.id === target ? { ...v, image: data.url } : v
                        ),
                    }));
                }
            } else {
                alert('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch {
            alert('Upload failed');
        }
        setUploading(false);
    }, []);

    const removeGalleryImage = (idx: number) => {
        setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== idx) }));
    };

    const removeVariationGalleryImage = (variationId: string, galleryIndex: number) => {
        setForm((f) => ({
            ...f,
            variations: f.variations.map((v) =>
                v.id === variationId
                    ? {
                        ...v,
                        gallery: (() => {
                            const nextGallery = [...(v.gallery || [])];
                            nextGallery[galleryIndex] = '';
                            return nextGallery.slice(0, 3);
                        })(),
                    }
                    : v
            ),
        }));
    };

    const handleLibrarySelect = (url: string) => {
        if (pickerTarget === 'main') {
            setForm((f) => ({ ...f, mainImage: url }));
        } else if (pickerTarget === 'gallery') {
            setForm((f) => ({ ...f, gallery: [...f.gallery, url] }));
        } else if (pickerTarget.startsWith('variation-gallery-')) {
            const parsedTarget = parseVariationGalleryTarget(pickerTarget);
            if (parsedTarget) {
                updateVariationGallerySlot(parsedTarget.variationId, parsedTarget.slotIndex, url);
            }
        } else {
            setForm((f) => ({
                ...f,
                variations: f.variations.map((v) =>
                    v.id === pickerTarget ? { ...v, image: url } : v
                ),
            }));
        }
    };

    // ── Save ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            ...form,
            specifications: form.specifications.filter((s) => s.label && s.value),
            additionalInfo: (form.additionalInfo || []).filter((item) => item.label && item.value),
            name: form.name.trim(),
            slug: form.slug?.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            category: form.category.trim(),
            categorySlug: form.categorySlug.trim(),
            variations:
                form.productType === 'variable'
                    ? applyDefaultOverridesToVariations(form.variations)
                    : [],
        };

        try {
            const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(
                    Array.isArray(data.details) && data.details.length > 0
                        ? data.details[0]
                        : (data.error || 'Failed to save')
                );
                setSaving(false);
                return;
            }

            router.push('/admin/products');
            router.refresh();
            setVariableDefaultsDirty({
                price: false,
                compareAtPrice: false,
                stockCount: false,
            });
        } catch {
            setError('Failed to save product');
            setSaving(false);
        }
    };

    // ═══════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════
    return (
        <>
        <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
                            {isEdit ? 'Edit Product' : 'New Product'}
                        </h1>
                        <p className="text-[11px] uppercase tracking-wider text-neutral-400 mt-0.5">
                            {form.productType === 'variable' ? 'Variable Product' : 'Simple Product'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
                        className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-[12px] font-medium text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="h-9 bg-neutral-900 px-5 text-[12px] font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
                    >
                        {saving ? (
                            <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Saving...</>
                        ) : (
                            <><Save className="mr-2 h-3.5 w-3.5" />Save Product</>
                        )}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                    {error}
                </div>
            )}

            {/* ── Product Type Toggle ── */}
            <div className="mb-8">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                    Product Type
                </p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, productType: 'simple', attributes: [], variations: [] }))}
                        className={`flex flex-1 items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${
                            form.productType === 'simple'
                                ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg'
                                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                        }`}
                    >
                        <Package className="h-5 w-5" />
                        <div className="text-left">
                            <p className="text-[13px] font-semibold">Simple Product</p>
                            <p className={`text-[11px] ${form.productType === 'simple' ? 'text-neutral-400' : 'text-neutral-400'}`}>
                                Single price, single SKU
                            </p>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, productType: 'variable' }))}
                        className={`flex flex-1 items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${
                            form.productType === 'variable'
                                ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg'
                                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                        }`}
                    >
                        <Layers className="h-5 w-5" />
                        <div className="text-left">
                            <p className="text-[13px] font-semibold">Variable Product</p>
                            <p className={`text-[11px] ${form.productType === 'variable' ? 'text-neutral-400' : 'text-neutral-400'}`}>
                                Multiple sizes, colors, etc.
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
                {/* ════════════════════════════════════════════
                    LEFT COLUMN — Main Content
                   ════════════════════════════════════════════ */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <Section title="General">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800">
                                    Product Name *
                                </Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => updateName(e.target.value)}
                                    placeholder="Enter product name"
                                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800">
                                    Slug
                                </Label>
                                <Input
                                    value={form.slug}
                                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                                    placeholder="Auto-generated from product name"
                                    className="mt-1.5 border-neutral-200 text-neutral-500 focus:border-neutral-900 focus:ring-neutral-900"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800">
                                Category *
                            </Label>
                            <select
                                value={form.categorySlug}
                                onChange={(e) => updateCategory(e.target.value)}
                                className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4">
                            <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800">
                                Product Description
                            </Label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                rows={4}
                                className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-[13px] text-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                                placeholder="Write a clear product description"
                            />
                        </div>
                    </Section>

                    <Section title="Editorial Copy">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800">
                                    Additional Description
                                </Label>
                                <textarea
                                    value={form.shortDescription || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                                    rows={4}
                                    className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-[13px] text-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                                    placeholder="Add a short summary for product highlights or supporting copy"
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800">
                                    Product Details
                                </Label>
                                <textarea
                                    value={form.productDetails || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, productDetails: e.target.value }))}
                                    rows={4}
                                    className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-[13px] text-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                                    placeholder="Enter materials, features, dimensions, or care instructions"
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800">
                                    Our Commitment
                                </Label>
                                <textarea
                                    value={form.commitment || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, commitment: e.target.value }))}
                                    rows={4}
                                    className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-[13px] text-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                                    placeholder="Add shipping, returns, warranty, or brand commitment details"
                                />
                            </div>
                        </div>
                    </Section>

                    <Section title="Additional Information">
                        <div className="space-y-2">
                            {(form.additionalInfo || []).map((info, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={info.label}
                                        onChange={(e) => updateAdditionalInfoRow(index, 'label', e.target.value)}
                                        placeholder="Enter detail label"
                                        className="flex-1 text-[13px] border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                    />
                                    <Input
                                        value={info.value}
                                        onChange={(e) => updateAdditionalInfoRow(index, 'value', e.target.value)}
                                        placeholder="Enter detail value"
                                        className="flex-[2] text-[13px] border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeAdditionalInfoRow(index)}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-300 hover:text-red-500 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addAdditionalInfoRow}
                            className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            + Add information row
                        </button>
                    </Section>

                    {/* Pricing — Only for Simple Product */}
                    {form.productType === 'simple' && (
                        <Section title="Pricing & Inventory">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Price *
                                    </Label>
                                    <div className="relative mt-1.5">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={form.price || ''}
                                            onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                                            className="pl-7 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                            placeholder="248.00"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Compare at Price
                                    </Label>
                                    <div className="relative mt-1.5">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={form.compareAtPrice || ''}
                                            onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: parseFloat(e.target.value) || undefined }))}
                                            className="pl-7 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                            placeholder="320.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                        SKU
                                    </Label>
                                    <Input
                                        value={form.sku}
                                        onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                                        className="mt-1.5 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                        placeholder="ALP-CRW-BLK"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 max-w-[200px]">
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                    Stock Count
                                </Label>
                                <Input
                                    type="number"
                                    value={form.stockCount || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, stockCount: parseInt(e.target.value) || 0 }))}
                                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                    placeholder="50"
                                />
                            </div>
                        </Section>
                    )}

                    {form.productType === 'variable' && (
                        <Section title="Variation Defaults">
                            <p className="mb-4 text-[12px] text-neutral-400">
                                These defaults are used when syncing new combinations and can be pushed across all current variations.
                            </p>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Default Price
                                    </Label>
                                    <div className="relative mt-1.5">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={form.price || ''}
                                            onChange={(e) => {
                                                setVariableDefaultsDirty((current) => ({ ...current, price: true }));
                                                setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }));
                                            }}
                                            className="pl-7 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                            placeholder="248.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Compare at Price
                                    </Label>
                                    <div className="relative mt-1.5">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={form.compareAtPrice || ''}
                                            onChange={(e) => {
                                                setVariableDefaultsDirty((current) => ({ ...current, compareAtPrice: true }));
                                                setForm((f) => ({ ...f, compareAtPrice: parseFloat(e.target.value) || undefined }));
                                            }}
                                            className="pl-7 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                            placeholder="320.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Default Stock
                                    </Label>
                                <Input
                                    type="number"
                                    value={form.stockCount || ''}
                                    onChange={(e) => {
                                        setVariableDefaultsDirty((current) => ({ ...current, stockCount: true }));
                                        setForm((f) => ({ ...f, stockCount: parseInt(e.target.value) || 0 }));
                                    }}
                                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                    placeholder="12"
                                />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={applyDefaultsToAllVariations}
                                    disabled={form.variations.length === 0}
                                    className="text-[12px] border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                >
                                    Apply Defaults to Variations
                                </Button>
                                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[12px] text-neutral-500">
                                    Live summary: {variationSummary.count} variants, {variationSummary.totalStock} total stock
                                </div>
                            </div>
                        </Section>
                    )}

                    {/* ═══════════════════════════════════════
                        ATTRIBUTES — Only for Variable Product
                       ═══════════════════════════════════════ */}
                    {form.productType === 'variable' && (
                        <Section title="Attributes">
                            <p className="mb-4 text-[12px] text-neutral-400">
                                Define attributes like Color, Size, Material. Then generate variations.
                            </p>

                            {globalAttributes.length > 0 && (
                                <div className="mb-5 rounded-xl border border-neutral-200 bg-white p-4">
                                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Saved Attribute Presets
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {globalAttributes.map((attribute) => {
                                            const alreadyAdded = form.attributes.some(
                                                (existing) =>
                                                    existing.name.toLowerCase() === attribute.name.toLowerCase()
                                            );

                                            return (
                                                <button
                                                    key={attribute.id}
                                                    type="button"
                                                    onClick={() => addGlobalAttribute(attribute)}
                                                    disabled={alreadyAdded}
                                                    className={`rounded-lg border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                                                        alreadyAdded
                                                            ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300'
                                                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900'
                                                    }`}
                                                >
                                                    {attribute.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {form.attributes.map((attr, attrIdx) => (
                                    <div
                                        key={attrIdx}
                                        className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <Input
                                                value={attr.name}
                                                onChange={(e) => updateAttributeName(attrIdx, e.target.value)}
                                                placeholder="Attribute name (e.g. Color)"
                                                className="flex-1 border-neutral-200 bg-white font-medium text-[13px] focus:border-neutral-900 focus:ring-neutral-900"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeAttribute(attrIdx)}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {attr.values.map((val, valIdx) => (
                                                <div key={valIdx} className="flex gap-2">
                                                    <Input
                                                        value={val}
                                                        onChange={(e) => updateAttributeValue(attrIdx, valIdx, e.target.value)}
                                                        placeholder={`Value (e.g. ${attr.name === 'Color' ? 'Black' : attr.name === 'Size' ? 'M' : 'Option ' + (valIdx + 1)})`}
                                                        className="flex-1 border-neutral-200 bg-white text-[13px] focus:border-neutral-900 focus:ring-neutral-900"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttributeValue(attrIdx, valIdx)}
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addAttributeValue(attrIdx)}
                                            className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
                                        >
                                            + Add value
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addAttribute}
                                    className="text-[12px] border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                >
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    Add Attribute
                                </Button>
                                {form.attributes.length > 0 && (
                                    <Button
                                        type="button"
                                        onClick={generateVariations}
                                        className="bg-neutral-900 text-[12px] text-white hover:bg-neutral-800"
                                    >
                                        <Layers className="mr-1.5 h-3.5 w-3.5" />
                                        Sync Variations
                                    </Button>
                                )}
                            </div>
                        </Section>
                    )}

                    {/* ═══════════════════════════════════════
                        VARIATIONS TABLE
                       ═══════════════════════════════════════ */}
                    {form.productType === 'variable' && form.variations.length > 0 && (
                        <Section title={`Variations (${form.variations.length})`}>
                            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Variants</p>
                                    <p className="mt-2 text-xl font-semibold text-neutral-900">{variationSummary.count}</p>
                                </div>
                                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Price Range</p>
                                    <p className="mt-2 text-xl font-semibold text-neutral-900">
                                        ${variationSummary.minPrice}
                                        {variationSummary.maxPrice !== variationSummary.minPrice && ` - $${variationSummary.maxPrice}`}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Total Stock</p>
                                    <p className="mt-2 text-xl font-semibold text-neutral-900">{variationSummary.totalStock}</p>
                                </div>
                            </div>

                            {/* TWO SEPARATE SECTIONS: COLOR and SIZE */}
                            <div className="space-y-8">
                                        {/* COLOR Section */}
                                        {form.attributes.length > 0 && form.attributes[0].name.toLowerCase().includes('color') && (
                                            <div>
                                                <div className="mb-4 px-4 py-2 bg-neutral-100 rounded-lg inline-block">
                                                    <h3 className="text-[18px] font-bold text-neutral-900 uppercase tracking-tight">
                                                        {form.attributes[0].name.toUpperCase().replace(' ', '')}
                                                    </h3>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {form.attributes[0].values.map((colorValue) => {
                                                        const colorHex = form.attributes[0].colorValues?.[colorValue] || '#000000';
                                                        const colorVariation = form.variations.find(v => v.attributes[form.attributes[0].name] === colorValue);
                                                        const isExpanded = colorVariation ? expandedVariations.has(colorVariation.id) : false;
                                                        const totalStock = form.variations.filter(v => v.attributes[form.attributes[0].name] === colorValue).reduce((sum, v) => sum + v.stockCount, 0);
                                                        
                                                        return (
                                                            <div key={colorValue} className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
                                                                {/* Collapsed Header - Dropdown Style */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => colorVariation && toggleVariation(colorVariation.id)}
                                                                    className="w-full p-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors"
                                                                >
                                                                    {/* Image Thumbnail */}
                                                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                                                                        {colorVariation?.image ? (
                                                                            <Image src={colorVariation.image} alt="" fill className="object-cover" sizes="56px" />
                                                                        ) : (
                                                                            <div className="h-full w-full" style={{ backgroundColor: colorHex }} />
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* Color Info */}
                                                                    <div className="flex-1 text-left">
                                                                        <p className="text-[14px] font-semibold text-neutral-900">{colorValue}</p>
                                                                        <p className="text-[11px] text-neutral-400">COAT-{colorValue.toUpperCase()}</p>
                                                                    </div>
                                                                    
                                                                    {/* Price & Stock */}
                                                                    <div className="flex items-center gap-8 text-right">
                                                                        <div>
                                                                            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Price</p>
                                                                            <p className="text-[14px] font-bold text-neutral-900">${colorVariation?.price || 0}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Stock</p>
                                                                            <p className="text-[14px] font-bold text-neutral-900">{totalStock}</p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Dropdown Chevron */}
                                                                    <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                
                                                                {isExpanded && colorVariation && (
                                                                    <div className="border-t border-neutral-200 p-6">
                                                                        <div className="mb-6">
                                                                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Variation Image</p>
                                                                            {colorVariation.image ? (
                                                                                <div className="relative inline-block">
                                                                                    <div className="relative h-48 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                                                                                        <Image src={colorVariation.image} alt="" fill className="object-contain p-4" sizes="192px" />
                                                                                    </div>
                                                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                                                        <button type="button" onClick={() => { setPickerTarget(colorVariation!.id); setPickerOpen(true); }} className="p-2 rounded-lg bg-white shadow-md text-neutral-700 hover:bg-neutral-50">
                                                                                            <FolderSearch className="h-4 w-4" />
                                                                                        </button>
                                                                                        <button type="button" onClick={() => updateVariation(colorVariation!.id, 'image', '')} className="p-2 rounded-lg bg-white shadow-md text-red-600 hover:bg-red-50">
                                                                                            <X className="h-4 w-4" />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex gap-3">
                                                                                    <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 transition-colors">
                                                                                        {uploading ? <Loader2 className="h-6 w-6 animate-spin text-neutral-400" /> : (
                                                                                            <>
                                                                                                <Upload className="h-6 w-6 text-neutral-300" />
                                                                                                <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Upload</span>
                                                                                            </>
                                                                                        )}
                                                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(file, colorVariation!.id); }} />
                                                                                    </label>
                                                                                    <button type="button" onClick={() => { setPickerTarget(colorVariation.id); setPickerOpen(true); }} className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-neutral-400 hover:border-neutral-900 hover:text-neutral-600 transition-colors">
                                                                                        <FolderSearch className="h-6 w-6" />
                                                                                        <span className="text-[10px] font-medium uppercase tracking-wider">Library</span>
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div className="mb-6">
                                                                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Gallery Images (up to 3)</p>
                                                                            <div className="flex gap-3">
                                                                                {[0, 1, 2].map((index) => {
                                                                                    const galleryImage = colorVariation.gallery?.[index];
                                                                                    return (
                                                                                        <div key={index} className="relative">
                                                                                            {galleryImage ? (
                                                                                                <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 group">
                                                                                                    <Image src={galleryImage} alt="" fill className="object-cover" sizes="96px" />
                                                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                                                                        <button type="button" onClick={() => { setPickerTarget(`variation-gallery-${colorVariation!.id}-${index}`); setPickerOpen(true); }} className="p-1.5 rounded bg-white/90 text-neutral-700 hover:bg-white">
                                                                                                            <FolderSearch className="h-3 w-3" />
                                                                                                        </button>
                                                                                                        <button type="button" onClick={() => removeVariationGalleryImage(colorVariation!.id, index)} className="p-1.5 rounded bg-white/90 text-red-600 hover:bg-white">
                                                                                                            <X className="h-3 w-3" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="flex gap-1.5">
                                                                                                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 transition-colors">
                                                                                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin text-neutral-400" /> : (
                                                                                                            <>
                                                                                                                <Upload className="h-4 w-4 text-neutral-300" />
                                                                                                                <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">Add</span>
                                                                                                            </>
                                                                                                        )}
                                                                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(file, `variation-gallery-${colorVariation!.id}-${index}`); }} />
                                                                                                    </label>
                                                                                                    <button type="button" onClick={() => { setPickerTarget(`variation-gallery-${colorVariation!.id}-${index}`); setPickerOpen(true); }} className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white text-neutral-400 hover:border-neutral-900 hover:text-neutral-600 transition-colors">
                                                                                                        <FolderSearch className="h-4 w-4" />
                                                                                                        <span className="text-[9px] font-medium uppercase tracking-wider">Library</span>
                                                                                                    </button>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                                            <div>
                                                                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Price *</Label>
                                                                                <div className="relative mt-1.5">
                                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                                                                                    <Input type="number" step="0.01" value={colorVariation.price || ''} onChange={(e) => updateVariation(colorVariation.id, 'price', parseFloat(e.target.value) || 0)} className="pl-7 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900" placeholder="0.00" />
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Compare at Price</Label>
                                                                                <div className="relative mt-1.5">
                                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                                                                                    <Input type="number" step="0.01" value={colorVariation.compareAtPrice || ''} onChange={(e) => updateVariation(colorVariation.id, 'compareAtPrice', parseFloat(e.target.value) || undefined)} className="pl-7 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900" placeholder="0.00" />
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">SKU</Label>
                                                                                <Input value={colorVariation.sku} onChange={(e) => updateVariation(colorVariation.id, 'sku', e.target.value)} className="mt-1.5 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900" placeholder="PRODUCT-VARIANT" />
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Stock Count</Label>
                                                                                <Input type="number" value={colorVariation.stockCount || ''} onChange={(e) => updateVariation(colorVariation.id, 'stockCount', parseInt(e.target.value) || 0)} className="mt-1.5 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900" placeholder="0" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* SIZE Section - Compact list */}
                                        {form.attributes.length >= 2 && form.attributes[1].name.toLowerCase().includes('size') && (
                                            <div>
                                                <div className="mb-4 px-4 py-2 bg-neutral-100 rounded-lg inline-block">
                                                    <h3 className="text-[18px] font-bold text-neutral-900 uppercase tracking-tight">
                                                        {form.attributes[1].name}
                                                    </h3>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {form.variations.map((variation) => {
                                                        const isExpanded = expandedVariations.has(variation.id);
                                                        const variantName = Object.values(variation.attributes).join(' / ');
                                                        
                                                        return (
                                                            <div key={variation.id} className="rounded-lg border border-neutral-200 bg-white">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleVariation(variation.id)}
                                                                    className="w-full p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
                                                                >
                                                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                                                                        {variation.image ? (
                                                                            <Image src={variation.image} alt="" fill className="object-cover" sizes="40px" />
                                                                        ) : (
                                                                            <ImageIcon className="h-4 w-4 text-neutral-300 absolute inset-0 m-auto" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 text-left">
                                                                        <p className="text-[12px] font-semibold text-neutral-900">{variantName}</p>
                                                                        <p className="text-[10px] text-neutral-400">{variation.sku || 'No SKU'}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-right">
                                                                        <div>
                                                                            <p className="text-[10px] text-neutral-400 uppercase">Price</p>
                                                                            <p className="text-[12px] font-semibold text-neutral-900">${variation.price}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] text-neutral-400 uppercase">Stock</p>
                                                                            <p className="text-[12px] font-semibold text-neutral-900">{variation.stockCount}</p>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                
                                                                {isExpanded && (
                                                                    <div className="border-t border-neutral-200 p-4">
                                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                                            <div>
                                                                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Price *</Label>
                                                                                <div className="relative mt-1.5">
                                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                                                                                    <Input type="number" step="0.01" value={variation.price || ''} onChange={(e) => updateVariation(variation.id, 'price', parseFloat(e.target.value) || 0)} className="pl-7 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900" placeholder="0.00" />
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Compare at Price</Label>
                                                                                <div className="relative mt-1.5">
                                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                                                                                    <Input type="number" step="0.01" value={variation.compareAtPrice || ''} onChange={(e) => updateVariation(variation.id, 'compareAtPrice', parseFloat(e.target.value) || undefined)} className="pl-7 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900" placeholder="0.00" />
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">SKU</Label>
                                                                                <Input value={variation.sku} onChange={(e) => updateVariation(variation.id, 'sku', e.target.value)} className="mt-1.5 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900" placeholder="PRODUCT-VARIANT" />
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Stock Count</Label>
                                                                                <Input type="number" value={variation.stockCount || ''} onChange={(e) => updateVariation(variation.id, 'stockCount', parseInt(e.target.value) || 0)} className="mt-1.5 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900" placeholder="0" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                        </Section>
                    )}

                    {/* Specifications */}
                    <Section title="Specifications">
                        <div className="space-y-2">
                            {form.specifications.map((spec, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        value={spec.label}
                                        onChange={(e) => updateSpec(i, 'label', e.target.value)}
                                        placeholder="Enter specification name"
                                        className="flex-1 text-[13px] border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                    />
                                    <Input
                                        value={spec.value}
                                        onChange={(e) => updateSpec(i, 'value', e.target.value)}
                                        placeholder="Enter specification value"
                                        className="flex-[2] text-[13px] border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSpec(i)}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-300 hover:text-red-500 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addSpec}
                            className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            + Add specification
                        </button>
                    </Section>
                </div>

                {/* ════════════════════════════════════════════
                    RIGHT COLUMN — Sidebar
                   ════════════════════════════════════════════ */}
                <div className="space-y-6">
                    {/* Status */}
                    <Section title="Status">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                            />
                            <span className="text-[13px] font-medium text-neutral-700">Featured Product</span>
                        </label>
                    </Section>

                    <Section title="Product Badge">
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    id="new-badge-input"
                                    placeholder="Type badge name..."
                                    className="border-neutral-200 text-[13px] uppercase tracking-wide focus:border-neutral-900 focus:ring-neutral-900"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.currentTarget;
                                            createBadge(input.value);
                                            input.value = '';
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('new-badge-input') as HTMLInputElement | null;
                                        if (!input) return;
                                        createBadge(input.value);
                                        input.value = '';
                                    }}
                                    className="bg-neutral-900 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-neutral-800"
                                >
                                    Create
                                </Button>
                            </div>

                            {form.availableBadges.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {form.availableBadges.map((badgeText) => (
                                        <div
                                            key={badgeText}
                                            className={`group relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all ${
                                                form.badge === badgeText
                                                    ? 'border-neutral-900 bg-neutral-900 text-white'
                                                    : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-900'
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        badge: f.badge === badgeText ? '' : badgeText,
                                                    }))
                                                }
                                                className="text-[11px] font-semibold uppercase tracking-wide"
                                            >
                                                {badgeText}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeBadge(badgeText)}
                                                className="opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                                                aria-label={`Remove ${badgeText} badge`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-[11px] text-neutral-500">
                                {form.badge ? `Active badge: ${form.badge} (shown on product card)` : 'Click a badge to activate it'}
                            </p>
                        </div>
                    </Section>

                    {/* Main Image */}
                    <Section title="Main Image">
                        {form.mainImage ? (
                            <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                                <Image src={form.mainImage} alt="Main" fill className="object-contain p-3" sizes="380px" />
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, mainImage: '' }))}
                                    className="absolute right-2 top-2 rounded-full bg-neutral-900 p-1.5 text-white shadow-lg hover:bg-red-600 transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-10 transition-all hover:border-neutral-400 hover:bg-neutral-50">
                                {uploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                                ) : (
                                    <>
                                        <Upload className="h-6 w-6 text-neutral-300" />
                                        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                                            Upload Image
                                        </span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadImage(file, 'main');
                                    }}
                                />
                            </label>
                        )}
                        {!form.mainImage && (
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => { setPickerTarget('main'); setPickerOpen(true); }}
                                className="w-full mt-3 text-xs border-neutral-200"
                            >
                                <FolderSearch className="w-4 h-4 mr-2" /> Choose from Library
                            </Button>
                        )}
                    </Section>

                    {/* Gallery */}
                    <Section title="Gallery">
                        <div className="grid grid-cols-2 gap-2">
                            {form.gallery.map((img, i) => (
                                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                                    <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="180px" />
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImage(i)}
                                        className="absolute right-1.5 top-1.5 rounded-full bg-neutral-900 p-1 text-white shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-4 transition-all hover:border-neutral-400 aspect-square">
                                {uploading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5 text-neutral-300" />
                                        <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">Add</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadImage(file, 'gallery');
                                    }}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => { setPickerTarget('gallery'); setPickerOpen(true); }}
                            className="w-full mt-3 text-xs border-neutral-200"
                        >
                            <FolderSearch className="w-4 h-4 mr-2" /> Select Media from Library
                        </Button>
                    </Section>
                </div>
            </div>
        </form>
        <MediaPickerModal
            isOpen={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={handleLibrarySelect}
            suggestedFolder={form.categorySlug || undefined}
        />
        </>
    );
}

// ─── Section wrapper ─────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-neutral-200/60 bg-white p-6">
            <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-700">
                {title}
            </h3>
            {children}
        </div>
    );
}
