'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import BulkActionBar from '@/components/admin/BulkActionBar';
import { useAdminNotifications } from '@/components/admin/AdminNotificationsProvider';
import { useHotkeys } from '@/hooks/useHotkeys';

const TABS = [
    { key: 'products', label: 'Products', icon: Package, target: 'Product' },
    { key: 'orders', label: 'Orders', icon: ShoppingBag, target: 'Order' },
    { key: 'media', label: 'Media', icon: ImageIcon, target: 'Media' }
];

export default function TrashBinPage() {
    const [data, setData] = useState<any>({ products: [], orders: [], media: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [error, setError] = useState('');
    
    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    const { refresh } = useAdminNotifications();

    const activeList = data[activeTab] || [];
    const activeTarget = TABS.find(t => t.key === activeTab)?.target;

    const fetchTrash = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/trash', { cache: 'no-store' });
            if (res.ok) {
                const json = await res.json();
                setData(json);
                setSelectedIds(new Set());
            } else {
                const payload = await res.json().catch(() => null);
                setError(payload?.error || 'Failed to load recycle bin.');
            }
        } catch (error) {
            console.error('Failed to fetch trash bin', error);
            setError('Failed to load recycle bin.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    useHotkeys('a', () => {
        if (selectedIds.size === activeList.length && activeList.length > 0) setSelectedIds(new Set());
        else setSelectedIds(new Set(activeList.map((i: any) => i._id)));
    }, true);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleBulkAction = async (action: 'delete' | 'restore' | 'hard_delete') => {
        let endpoint = '/api/admin/bulk-action';
        const method = 'POST';
        let resolvedAction = action;

        if (action === 'hard_delete') {
            if (!confirm(`WARNING: Are you sure you want to permanently delete these ${selectedIds.size} items? This cannot be undone.`)) return;
            endpoint = '/api/admin/trash';
        } else if (action === 'restore') {
            if (!confirm(`Are you sure you want to restore these ${selectedIds.size} items?`)) return;
        } else if (action === 'delete') {
            if (!confirm(`WARNING: Are you sure you want to permanently delete these ${selectedIds.size} items? This cannot be undone.`)) return;
            endpoint = '/api/admin/trash';
            resolvedAction = 'hard_delete';
        }

        setBulkLoading(true);
        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds), action: resolvedAction, target: activeTarget })
            });
            if (res.ok) {
                await fetchTrash();
                void refresh();
            } else {
                const payload = await res.json().catch(() => null);
                alert(payload?.error || 'Action failed');
            }
        } catch (error) {
            console.error('Trash action failed', error);
            alert('Action failed');
        }
        setBulkLoading(false);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Missing Date';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="relative pb-24">
            <BulkActionBar 
                selectedIds={Array.from(selectedIds)} 
                onClear={() => setSelectedIds(new Set())} 
                onAction={handleBulkAction} 
                loading={bulkLoading} 
                mode="trash"
            />
            
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                    <Trash2 className="h-6 w-6 text-red-500" /> Recycle Bin
                </h1>
                <p className="mt-1 text-sm text-neutral-500">Deleted items are stored here. You can restore them or delete them permanently.</p>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 flex gap-2 border-b border-neutral-200">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.key;
                    const count = data[tab.key]?.length || 0;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key);
                                setSelectedIds(new Set());
                            }}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                                isActive 
                                    ? 'border-neutral-900 text-neutral-900' 
                                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            <span className={`ml-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] ${
                                isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
                    </div>
                ) : activeList.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center">
                        <Trash2 className="h-10 w-10 text-neutral-200 mb-3" />
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Bin is Empty</h3>
                        <p className="text-xs text-neutral-400 mt-1">No deleted {activeTab} found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50 border-t-0">
                                <th className="w-12 px-4 py-4 rounded-tl-xl text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.size === activeList.length && activeList.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedIds(new Set(activeList.map((i: any) => i._id)));
                                            else setSelectedIds(new Set());
                                        }}
                                        className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                                    />
                                </th>
                                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                    Item / Reference
                                </th>
                                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                    Deleted At
                                </th>
                                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeList.map((item: any) => {
                                const isSelected = selectedIds.has(item._id);
                                return (
                                    <tr 
                                        key={item._id} 
                                        className={`border-b border-neutral-100 last:border-0 transition-colors ${
                                            isSelected ? 'bg-red-50/50' : 'hover:bg-neutral-50/50'
                                        }`}
                                    >
                                        <td className="px-4 py-4 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => toggleSelect(item._id)}
                                                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            {activeTab === 'products' && (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-100 border border-neutral-200">
                                                        {item.mainImage || item.heroImage ? (
                                                            <img src={item.mainImage || item.heroImage} alt={item.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-neutral-300"><Package className="h-4 w-4" /></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                                                        <p className="text-xs text-neutral-500">/{item.slug}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'orders' && (
                                                <div>
                                                    <p className="text-sm font-semibold text-neutral-900">#{item.orderNumber}</p>
                                                    <p className="text-xs text-neutral-500">{item.customerEmail}</p>
                                                </div>
                                            )}
                                            {activeTab === 'media' && (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-100 border border-neutral-200">
                                                        <img src={item.thumbnailUrl} alt={item.filename} className="h-full w-full object-cover" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-neutral-900 line-clamp-1">{item.filename}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-neutral-500">
                                            {formatDate(item.deletedAt || item.updatedAt)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-red-700 uppercase">
                                                <Trash2 className="h-3 w-3" /> Soft Deleted
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
