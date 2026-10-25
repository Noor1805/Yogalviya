'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, X, Save, Search, Check } from 'lucide-react';

interface Category {
    _id: string;
    name: string;
    slug: string;
}

interface SearchSettingsCategory {
    name: string;
    slug: string;
    enabled: boolean;
}

interface SearchSettings {
    categories: SearchSettingsCategory[];
    trendingSearches: string[];
    featuredProductIds: string[];
}

export default function SearchSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SearchSettings>({
        categories: [],
        trendingSearches: [],
        featuredProductIds: [],
    });
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
    const [newTrending, setNewTrending] = useState('');
    const [newProductId, setNewProductId] = useState('');

    useEffect(() => {
        fetchSettings();
        fetchCategories();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/search-settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setAvailableCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/search-settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                toast.success('Search settings saved successfully');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const addCategory = () => {
        if (!selectedCategorySlug) return;
        
        const category = availableCategories.find(c => c.slug === selectedCategorySlug);
        if (!category) return;

        // Check if already added
        if (settings.categories.some(c => c.slug === category.slug)) {
            toast.error('Category already added');
            return;
        }

        setSettings({
            ...settings,
            categories: [...settings.categories, { name: category.name, slug: category.slug, enabled: true }],
        });
        setSelectedCategorySlug('');
    };

    const removeCategory = (index: number) => {
        setSettings({
            ...settings,
            categories: settings.categories.filter((_, i) => i !== index),
        });
    };

    const toggleCategory = (index: number) => {
        const updated = [...settings.categories];
        updated[index].enabled = !updated[index].enabled;
        setSettings({ ...settings, categories: updated });
    };

    const addTrendingSearch = () => {
        if (newTrending.trim()) {
            setSettings({
                ...settings,
                trendingSearches: [...settings.trendingSearches, newTrending.trim()],
            });
            setNewTrending('');
        }
    };

    const removeTrendingSearch = (index: number) => {
        setSettings({
            ...settings,
            trendingSearches: settings.trendingSearches.filter((_, i) => i !== index),
        });
    };

    const addFeaturedProduct = () => {
        if (newProductId.trim()) {
            setSettings({
                ...settings,
                featuredProductIds: [...settings.featuredProductIds, newProductId.trim()],
            });
            setNewProductId('');
        }
    };

    const removeFeaturedProduct = (index: number) => {
        setSettings({
            ...settings,
            featuredProductIds: settings.featuredProductIds.filter((_, i) => i !== index),
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif text-black italic">Search Overlay Settings</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Configure the desktop search overlay content
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Settings
                </button>
            </div>

            {/* Categories Section */}
            <div className="border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4">Categories</h2>
                <p className="text-sm text-neutral-500 mb-6">
                    Select categories from your existing collections to display in the search overlay
                </p>

                {/* Add Category Dropdown */}
                <div className="flex gap-4 mb-6">
                    <select
                        value={selectedCategorySlug}
                        onChange={(e) => setSelectedCategorySlug(e.target.value)}
                        className="flex-1 h-12 px-4 text-sm border border-neutral-200 focus:border-black outline-none bg-white"
                    >
                        <option value="">Select a category...</option>
                        {availableCategories
                            .filter(cat => !settings.categories.some(sc => sc.slug === cat.slug))
                            .map((category) => (
                                <option key={category._id} value={category.slug}>
                                    {category.name} (/{category.slug})
                                </option>
                            ))}
                    </select>
                    <button
                        onClick={addCategory}
                        disabled={!selectedCategorySlug}
                        className="flex items-center gap-2 px-6 h-12 border border-black text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </button>
                </div>

                {/* Categories List */}
                <div className="space-y-3">
                    {settings.categories.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-neutral-200">
                            <p className="text-sm text-neutral-400">No categories added yet</p>
                            <p className="text-xs text-neutral-300 mt-1">Select categories from the dropdown above</p>
                        </div>
                    ) : (
                        settings.categories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border border-neutral-100 bg-white">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleCategory(index)}
                                        className={`w-12 h-6 rounded-full transition-colors ${
                                            category.enabled ? 'bg-black' : 'bg-neutral-200'
                                        }`}
                                    >
                                        <div
                                            className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                                category.enabled ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}
                                        />
                                    </button>
                                    <div>
                                        <p className="text-sm font-medium text-black">{category.name}</p>
                                        <p className="text-xs text-neutral-400">/{category.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        category.enabled ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                                    }`}>
                                        {category.enabled ? 'Active' : 'Inactive'}
                                    </span>
                                    <button
                                        onClick={() => removeCategory(index)}
                                        className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Trending Searches Section */}
            <div className="border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4">Trending Searches</h2>
                <p className="text-sm text-neutral-500 mb-6">
                    Add popular search terms that users can click
                </p>

                {/* Add Trending Search Form */}
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={newTrending}
                        onChange={(e) => setNewTrending(e.target.value)}
                        placeholder="Enter search term (e.g., Summer Collection)"
                        className="flex-1 h-12 px-4 text-sm border border-neutral-200 focus:border-black outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && addTrendingSearch()}
                    />
                    <button
                        onClick={addTrendingSearch}
                        className="flex items-center gap-2 px-6 h-12 border border-black text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </button>
                </div>

                {/* Trending Searches List */}
                <div className="flex flex-wrap gap-3">
                    {settings.trendingSearches.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-neutral-200 w-full">
                            <p className="text-sm text-neutral-400">No trending searches added yet</p>
                        </div>
                    ) : (
                        settings.trendingSearches.map((term, index) => (
                            <div key={index} className="flex items-center gap-2 px-4 py-2 bg-neutral-50 border border-neutral-100">
                                <span className="text-sm text-black">{term}</span>
                                <button
                                    onClick={() => removeTrendingSearch(index)}
                                    className="text-neutral-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Featured Products Section */}
            <div className="border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4">Featured Products (Most Coveted)</h2>
                <p className="text-sm text-neutral-500 mb-6">
                    Add product IDs to display in the "Most Coveted" section. Go to Products page to copy product IDs.
                </p>

                {/* Add Product ID Form */}
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={newProductId}
                        onChange={(e) => setNewProductId(e.target.value)}
                        placeholder="Enter product ID (e.g., 65abc123...)"
                        className="flex-1 h-12 px-4 text-sm border border-neutral-200 focus:border-black outline-none font-mono"
                        onKeyDown={(e) => e.key === 'Enter' && addFeaturedProduct()}
                    />
                    <button
                        onClick={addFeaturedProduct}
                        className="flex items-center gap-2 px-6 h-12 border border-black text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </button>
                </div>

                {/* Featured Products List */}
                <div className="space-y-3">
                    {settings.featuredProductIds.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-neutral-200">
                            <p className="text-sm text-neutral-400">No featured products added yet</p>
                            <p className="text-xs text-neutral-300 mt-1">Add product IDs from the Products page</p>
                        </div>
                    ) : (
                        settings.featuredProductIds.map((id, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border border-neutral-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <Search className="h-4 w-4 text-neutral-400" />
                                    <code className="text-sm text-neutral-700 font-mono">{id}</code>
                                </div>
                                <button
                                    onClick={() => removeFeaturedProduct(index)}
                                    className="text-neutral-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
