'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, X } from 'lucide-react';

interface ProductFiltersProps {
    categories: { name: string; slug: string }[];
    activeCategory: string | null;
    onCategoryChange: (slug: string | null) => void;
    activeSize: string | null;
    onSizeChange: (size: string | null) => void;
    activeColor: string | null;
    onColorChange: (color: string | null) => void;
    activePrice: string | null;
    onPriceChange: (price: string | null) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function ProductFilters({
    categories,
    activeCategory,
    onCategoryChange,
    activeSize,
    onSizeChange,
    activeColor,
    onColorChange,
    activePrice,
    onPriceChange,
    searchQuery,
    onSearchChange,
}: ProductFiltersProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdowns if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const filters = [
        {
            name: 'Category',
            activeValue: activeCategory !== 'all' ? activeCategory : null,
            options: [{ label: 'All', value: 'all' }, ...categories.map(c => ({ label: c.name, value: c.slug }))],
            onChange: onCategoryChange
        },
        {
            name: 'Size',
            activeValue: activeSize,
            options: [{ label: 'All', value: 'all' }, { label: 'Small', value: 's' }, { label: 'Medium', value: 'm' }, { label: 'Large', value: 'l' }],
            onChange: onSizeChange
        },
        {
            name: 'Color',
            activeValue: activeColor,
            options: [{ label: 'All', value: 'all' }, { label: 'Black', value: 'black' }, { label: 'White', value: 'white' }, { label: 'Gold', value: 'gold' }],
            onChange: onColorChange
        },
        {
            name: 'Price',
            activeValue: activePrice,
            options: [{ label: 'All', value: 'all' }, { label: 'Under $200', value: 'under_200' }, { label: '$200 - $500', value: '200_500' }, { label: 'Over $500', value: 'over_500' }],
            onChange: onPriceChange
        }
    ];

    return (
        <div ref={containerRef} className="border-b border-gray-100 pb-4 mb-12">
            {/* Search Bar - Mobile */}
            <div className="mb-4 w-full md:w-80">
                <div className="relative flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-transparent text-sm pl-2 pr-8 placeholder:text-gray-400 text-black m-0 p-0"
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
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-black transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-end justify-between">
            <div className="flex items-center gap-8 relative">
                {filters.map((filter) => (
                    <div key={filter.name} className="relative">
                        <button
                            onClick={() => toggleDropdown(filter.name)}
                            className="group flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] font-medium text-[#A3A3A3] hover:text-black transition-colors"
                        >
                            <span className={filter.activeValue ? 'text-black' : ''}>
                                {filter.activeValue ? filter.options.find(o => o.value === filter.activeValue)?.label || filter.name : filter.name}
                            </span>
                            <ChevronDown 
                                className={cn("w-2.5 h-2.5 transition-transform duration-300", filter.activeValue ? "text-black" : "text-[#e5e5e5] group-hover:text-black", openDropdown === filter.name && "rotate-180")} 
                                strokeWidth={2.5} 
                            />
                        </button>

                        {/* Dropdown Popover */}
                        <div 
                            className={cn(
                                "absolute top-full left-0 mt-3 w-40 bg-white border border-gray-100 shadow-2xl z-50 flex flex-col py-2 transition-all duration-300 origin-top-left",
                                openDropdown === filter.name ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                            )}
                        >
                            {filter.options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        filter.onChange(option.value);
                                        setOpenDropdown(null);
                                    }}
                                    className={cn(
                                        "text-left px-5 py-2 text-[11px] uppercase tracking-[0.15em] hover:bg-gray-50 transition-colors",
                                        filter.activeValue === option.value || (!filter.activeValue && option.value === 'all')
                                            ? "text-black font-semibold bg-gray-50"
                                            : "text-gray-500 font-medium"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block">
                <p className="text-[11px] italic font-serif text-gray-400">
                    Showing filtered items
                </p>
            </div>
            </div>
        </div>
    );
}
