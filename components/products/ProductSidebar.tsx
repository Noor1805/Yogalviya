'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, X } from 'lucide-react';

interface FilterOption {
    label: string;
    value: string;
}

interface ColorFilterOption extends FilterOption {
    hex: string;
    border?: string;
}

interface ProductSidebarProps {
    categories: { name: string; slug: string }[];
    activeCategory: string | null;
    onCategoryChange: (slug: string | null) => void;
    activeSize: string | null;
    onSizeChange: (size: string | null) => void;
    sizeOptions: FilterOption[];
    activeColor: string | null;
    onColorChange: (color: string | null) => void;
    colorOptions: ColorFilterOption[];
    activePrice: string | null;
    onPriceChange: (price: string | null) => void;
    priceOptions: FilterOption[];
    totalCount: number;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);

    return (
        <div className="border-b border-gray-100 py-5">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between group"
            >
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-black">
                    {title}
                </span>
                <ChevronDown
                    className={cn(
                        'w-3 h-3 text-gray-400 transition-transform duration-300',
                        open && 'rotate-180'
                    )}
                    strokeWidth={2}
                />
            </button>
            <div
                className={cn(
                    'overflow-hidden transition-all duration-300',
                    open ? 'max-h-96 mt-4' : 'max-h-0'
                )}
            >
                {children}
            </div>
        </div>
    );
}

export default function ProductSidebar({
    categories,
    activeCategory,
    onCategoryChange,
    activeSize,
    onSizeChange,
    sizeOptions,
    activeColor,
    onColorChange,
    colorOptions,
    activePrice,
    onPriceChange,
    priceOptions,
    totalCount,
    searchQuery,
    onSearchChange,
}: ProductSidebarProps) {
    const hasActiveFilters = Boolean(
        activeCategory || activeSize || activeColor || activePrice || searchQuery
    );

    const clearAll = () => {
        onCategoryChange(null);
        onSizeChange(null);
        onColorChange(null);
        onPriceChange(null);
        onSearchChange('');
    };

    return (
        <aside className="w-52 shrink-0 sticky top-28 self-start">
            <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-black">
                    Filter
                </p>
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-gray-400 hover:text-black transition-colors"
                    >
                        <X className="w-2.5 h-2.5" strokeWidth={2} />
                        Clear
                    </button>
                )}
            </div>

            <div className="mb-6">
                <div className="relative flex items-center bg-gray-50 rounded-lg px-3 lg:py-2 py-2.5 transition-all">
                    <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-transparent text-[11px] pl-2 pr-6 placeholder:text-gray-400 text-black m-0 p-0"
                        style={{
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-black transition-colors"
                        >
                            <X className="w-2.5 h-2.5" />
                        </button>
                    )}
                </div>
            </div>

            <FilterSection title="Category">
                <div className="flex flex-col gap-2.5">
                    <button
                        onClick={() => onCategoryChange(null)}
                        className={cn(
                            'text-left text-[11px] tracking-wide transition-colors',
                            !activeCategory
                                ? 'text-black font-semibold'
                                : 'text-gray-400 hover:text-black font-medium'
                        )}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => onCategoryChange(cat.slug)}
                            className={cn(
                                'text-left text-[11px] tracking-wide transition-colors',
                                activeCategory === cat.slug
                                    ? 'text-[#26352b] font-semibold'
                                    : 'text-gray-400 hover:text-[#26352b] font-medium'
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Size">
                <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                        <button
                            key={size.value}
                            onClick={() => onSizeChange(activeSize === size.value ? null : size.value)}
                            className={cn(
                                'min-w-[36px] h-9 px-2 text-[10px] font-medium border transition-all duration-200',
                                activeSize === size.value
                                    ? 'bg-[#26352b] text-white border-[#26352b]'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#26352b] hover:text-[#26352b]'
                            )}
                        >
                            {size.label}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Color">
                <div className="flex flex-col gap-3">
                    {colorOptions.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => onColorChange(activeColor === color.value ? null : color.value)}
                            className="flex items-center gap-3 group"
                        >
                            <span
                                className={cn(
                                    'w-4 h-4 rounded-full border transition-all duration-200',
                                    activeColor === color.value
                                        ? 'ring-1 ring-offset-1 ring-black scale-110'
                                        : 'group-hover:scale-110'
                                )}
                                style={{
                                    backgroundColor: color.hex,
                                    borderColor: color.border ?? color.hex,
                                }}
                            />
                            <span
                                className={cn(
                                    'text-[11px] tracking-wide transition-colors',
                                    activeColor === color.value
                                        ? 'text-black font-semibold'
                                        : 'text-gray-400 group-hover:text-black font-medium'
                                )}
                            >
                                {color.label}
                            </span>
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Price">
                <div className="flex flex-col gap-2.5">
                    {priceOptions.map((price) => (
                        <button
                            key={price.value}
                            onClick={() => onPriceChange(activePrice === price.value ? null : price.value)}
                            className={cn(
                                'text-left text-[11px] tracking-wide transition-colors',
                                activePrice === price.value
                                    ? 'text-[#26352b] font-semibold'
                                    : 'text-gray-400 hover:text-[#26352b] font-medium'
                            )}
                        >
                            {price.label}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-[0.1em]">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
            </p>
        </aside>
    );
}
