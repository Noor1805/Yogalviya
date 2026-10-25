'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Trash2, Edit, Loader2, Package, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminNotifications } from '@/components/admin/AdminNotificationsProvider';
import { useHotkeys } from '@/hooks/useHotkeys';
import BulkActionBar from '@/components/admin/BulkActionBar';
import { summarizeVariations } from '@/lib/utils/product-admin';

interface ProductItem {
    _id: string;
    name: string;
    slug: string;
    productType: 'simple' | 'variable';
    category: string;
    categorySlug: string;
    mainImage: string;
    heroImage: string; // backward compat
    price: number;
    stockCount: number;
    variations?: { sku: string; price: number; stockCount: number }[];
    status: 'draft' | 'published';
    featured: boolean;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const { refresh } = useAdminNotifications();

    useHotkeys('a', () => {
        if (selectedIds.length === products.length) setSelectedIds([]);
        else setSelectedIds(products.map(p => p._id));
    }, true);

    const fetchProducts = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        const res = await fetch(`/api/admin/products?${params}`, { cache: 'no-store' });
        const data = await res.json();
        setProducts(data.products || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Move "${name}" to the recycle bin? You can restore it later.`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts((prev) => prev.filter((p) => p._id !== id));
                void refresh();
            } else {
                alert('Failed to move product to recycle bin');
            }
        } catch {
            alert('Failed to move product to recycle bin');
        }
        setDeleting(null);
    };

    const handleBulkAction = async (action: 'delete' | 'restore' | 'hard_delete') => {
        if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} products?`)) return;
        setBulkLoading(true);
        try {
            const res = await fetch('/api/admin/bulk-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds, action, target: 'Product' })
            });
            if (res.ok) {
                setSelectedIds([]);
                fetchProducts();
                void refresh();
            } else {
                alert('Bulk action failed');
            }
        } catch {
            alert('Bulk action failed');
        }
        setBulkLoading(false);
    };

    const getImage = (p: ProductItem) => p.mainImage || p.heroImage;

    const getTotalStock = (p: ProductItem) => {
        if (p.productType === 'variable' && p.variations?.length) {
            return p.variations.reduce((sum, v) => sum + (v.stockCount || 0), 0);
        }
        return p.stockCount || 0;
    };

    const getDisplayPrice = (p: ProductItem) => {
        if (p.productType === 'variable' && p.variations?.length) {
            const summary = summarizeVariations(
                p.variations.map((variation) => ({
                    ...variation,
                    id: variation.sku,
                    attributes: {},
                }))
            );

            return summary.minPrice === summary.maxPrice
                ? `$${summary.minPrice}`
                : `$${summary.minPrice} - $${summary.maxPrice}`;
        }

        return p.price ? `$${p.price}` : '—';
    };

    return (
        <div className="relative pb-24">
            <BulkActionBar 
                selectedIds={selectedIds} 
                onClear={() => setSelectedIds([])} 
                onAction={handleBulkAction} 
                loading={bulkLoading} 
            />
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Products</h1>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wider text-neutral-400">
                        {products.length} total products
                    </p>
                </div>
                <Button asChild className="h-9 bg-neutral-900 px-5 text-[12px] font-semibold uppercase tracking-wider text-white hover:bg-neutral-800">
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Add Product
                    </Link>
                </Button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 border-neutral-200 text-[13px] focus:border-neutral-900 focus:ring-neutral-900"
                    />
                </div>
                <Button type="submit" variant="outline" className="border-neutral-200 text-[12px] text-neutral-600 hover:bg-neutral-50">
                    Search
                </Button>
            </form>

            {/* Products Table */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : products.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50">
                    <p className="text-[13px] text-neutral-400">No products found</p>
                    <Button asChild variant="outline" className="mt-4 text-[12px] border-neutral-200">
                        <Link href="/admin/products/new">Create your first product</Link>
                    </Button>
                </div>
            ) : (
                <>
                    {/* Desktop View */}
                    <div className="hidden overflow-hidden rounded-xl border border-neutral-200/60 bg-white md:block">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-100">
                                    <th className="px-5 py-3 text-left w-12">
                                        <input 
                                            type="checkbox" 
                                            className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" 
                                            checked={selectedIds.length === products.length && products.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedIds(products.map(p => p._id));
                                                else setSelectedIds([]);
                                            }}
                                        />
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Product
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Type
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Category
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Price
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Stock
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} className={`border-b border-neutral-50 transition-colors hover:bg-neutral-50/50 ${selectedIds.includes(product._id) ? 'bg-neutral-50' : ''}`}>
                                        <td className="px-5 py-3">
                                            <input 
                                                type="checkbox" 
                                                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                                checked={selectedIds.includes(product._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedIds(prev => [...prev, product._id]);
                                                    else setSelectedIds(prev => prev.filter(id => id !== product._id));
                                                }}
                                            />
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                                                    {getImage(product) ? (
                                                        <Image
                                                            src={getImage(product)}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="44px"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <Package className="h-4 w-4 text-neutral-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-medium text-neutral-900">{product.name}</p>
                                                    <p className="text-[11px] text-neutral-400">/{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                                product.productType === 'variable'
                                                    ? 'bg-neutral-100 text-neutral-600'
                                                    : 'bg-neutral-50 text-neutral-400'
                                            }`}>
                                                {product.productType === 'variable' ? (
                                                    <><Layers className="h-3 w-3" /> Variable</>
                                                ) : (
                                                    <><Package className="h-3 w-3" /> Simple</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-[13px] font-medium text-neutral-800">
                                            {getDisplayPrice(product)}
                                        </td>
                                        <td className="px-5 py-3 text-[13px] text-neutral-600">
                                            {getTotalStock(product)}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                                                    product.status === 'published' ? 'bg-green-500' : 'bg-amber-400'
                                                }`} />
                                                <span className="text-[11px] uppercase tracking-wider font-medium text-neutral-500">
                                                    {product.status || 'draft'}
                                                </span>
                                                {product.featured && (
                                                    <span className="ml-1 rounded bg-neutral-900 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={`/admin/products/${product._id}/edit`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id, product.name)}
                                                    disabled={deleting === product._id}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                >
                                                    {deleting === product._id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="space-y-3 md:hidden">
                        {products.map((product) => (
                            <div key={product._id} className="rounded-xl border border-neutral-200/60 bg-white p-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                                        {getImage(product) ? (
                                            <Image src={getImage(product)} alt={product.name} fill className="object-cover" sizes="56px" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Package className="h-4 w-4 text-neutral-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="line-clamp-1 text-[13px] font-semibold text-neutral-900">{product.name}</h3>
                                                <p className="mt-0.5 text-[11px] text-neutral-400">{product.category}</p>
                                            </div>
                                            {product.featured && (
                                                <span className="shrink-0 rounded bg-neutral-900 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center gap-3">
                                            <p className="text-[13px] font-semibold text-neutral-800">{getDisplayPrice(product)}</p>
                                            <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                                                {product.productType === 'variable' ? 'Variable' : 'Simple'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
                                    <Button asChild size="sm" variant="outline" className="h-8 flex-1 text-[11px] font-semibold uppercase tracking-wider border-neutral-200 text-neutral-700">
                                        <Link href={`/admin/products/${product._id}/edit`}>
                                            <Edit className="mr-1.5 h-3 w-3" /> Edit
                                        </Link>
                                    </Button>
                                    <button
                                        onClick={() => handleDelete(product._id, product.name)}
                                        disabled={deleting === product._id}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        {deleting === product._id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
