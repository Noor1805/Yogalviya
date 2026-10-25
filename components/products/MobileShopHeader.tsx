'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X, SlidersHorizontal, LayoutGrid, List, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Name: A–Z', value: 'name_asc' },
];

interface MobileShopHeaderProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    layout: 'grid' | 'list';
    onLayoutChange: (l: 'grid' | 'list') => void;
    onFilterOpen: () => void;
    activeFiltersCount: number;
    totalCount: number;
    activeSort: string;
    onSortChange: (s: string) => void;
}

export default function MobileShopHeader({
    searchQuery,
    onSearchChange,
    layout,
    onLayoutChange,
    onFilterOpen,
    activeFiltersCount,
    totalCount,
    activeSort,
    onSortChange,
}: MobileShopHeaderProps) {
    const [searchFocused, setSearchFocused] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close sort dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const activeLabel = SORT_OPTIONS.find(o => o.value === activeSort)?.label ?? 'Sort';

    return (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
            {/* Search Row */}
            <div className="px-4 pt-3 pb-2">
                <div
                    className={cn(
                        'flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5 border border-transparent transition-all duration-200',
                        searchFocused ? 'border-black ring-1 ring-black bg-white shadow-sm' : 'border-gray-200'
                    )}
                >
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products…"
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="flex-1 bg-transparent text-[13.5px] text-gray-900 placeholder:text-gray-400 m-0 p-0"
                        style={{
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            appearance: 'none',
                            WebkitAppearance: 'none'
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { onSearchChange(''); inputRef.current?.focus(); }}
                            className="shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center active:scale-90 transition-transform"
                        >
                            <X className="w-3 h-3 text-gray-500" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Bar Row */}
            <div className="px-4 pb-2.5 flex items-center justify-between gap-2">
                {/* Left: Filter + Sort */}
                <div className="flex items-center gap-2">
                    {/* Filter Button */}
                    <button
                        onClick={onFilterOpen}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-150 active:scale-95',
                            activeFiltersCount > 0
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-700 border-gray-200'
                        )}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Filter
                        {activeFiltersCount > 0 && (
                            <span className="ml-0.5 bg-white text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {/* Sort Dropdown */}
                    <div ref={sortRef} className="relative">
                        <button
                            onClick={() => setSortOpen(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border border-gray-200 bg-white text-gray-700 transition-all duration-150 active:scale-95"
                        >
                            {activeSort !== 'newest' ? (
                                <span className="text-black">{activeLabel}</span>
                            ) : (
                                <span>Sort</span>
                            )}
                            <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', sortOpen && 'rotate-180')} />
                        </button>

                        {sortOpen && (
                            <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden py-1">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
                                        className={cn(
                                            'w-full text-left px-4 py-2.5 text-[13px] transition-colors',
                                            activeSort === opt.value
                                                ? 'font-semibold text-black bg-gray-50'
                                                : 'text-gray-500 hover:bg-gray-50'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Result count + Layout Toggle */}
                <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-gray-400 font-medium">
                        {totalCount} {totalCount === 1 ? 'item' : 'items'}
                    </span>
                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                        <button
                            onClick={() => onLayoutChange('grid')}
                            className={cn(
                                'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150',
                                layout === 'grid' ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                            )}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onLayoutChange('list')}
                            className={cn(
                                'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150',
                                layout === 'list' ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
