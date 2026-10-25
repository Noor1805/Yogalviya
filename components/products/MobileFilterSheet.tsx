'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
    label: string;
    value: string;
}

interface ColorFilterOption extends FilterOption {
    hex: string;
    border?: string;
}

interface MobileFilterSheetProps {
    open: boolean;
    onClose: () => void;
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
    onClearAll: () => void;
    activeFiltersCount: number;
    totalCount: number;
}

function SheetSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);

    return (
        <div className="border-b border-gray-100">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4"
            >
                <span className="text-[12px] uppercase tracking-[0.18em] font-bold text-gray-900">
                    {title}
                </span>
                <ChevronDown
                    className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', open && 'rotate-180')}
                    strokeWidth={2}
                />
            </button>
            <div className={cn('overflow-hidden transition-all duration-300', open ? 'max-h-96 pb-4' : 'max-h-0')}>
                <div className="px-5">{children}</div>
            </div>
        </div>
    );
}

export default function MobileFilterSheet({
    open,
    onClose,
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
    onClearAll,
    activeFiltersCount,
    totalCount,
}: MobileFilterSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const currentY = useRef(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            setDragOffset(0);
        } else {
            document.body.style.overflow = '';
        }

        window.dispatchEvent(
            new CustomEvent('mobile-nav-visibility', {
                detail: { hidden: open },
            })
        );

        return () => {
            document.body.style.overflow = '';
            window.dispatchEvent(
                new CustomEvent('mobile-nav-visibility', {
                    detail: { hidden: false },
                })
            );
        };
    }, [open]);

    const onTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        const delta = Math.max(0, e.touches[0].clientY - startY.current);
        currentY.current = delta;
        setDragOffset(delta);
    };

    const onTouchEnd = () => {
        setIsDragging(false);
        if (currentY.current > 120) {
            onClose();
        } else {
            setDragOffset(0);
        }
        currentY.current = 0;
    };

    return (
        <>
            <div
                className={cn(
                    'fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] transition-all duration-300',
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            <div
                ref={sheetRef}
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-[85] bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                    open ? 'translate-y-0' : 'translate-y-full'
                )}
                style={{
                    maxHeight: '88vh',
                    transform: open ? `translateY(${dragOffset}px)` : 'translateY(100%)',
                    transition: isDragging ? 'none' : undefined,
                    paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
                }}
            >
                <div
                    className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing touch-none"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0 border-b border-gray-100">
                    <div>
                        <h2 className="text-[15px] font-bold text-gray-900">Filters</h2>
                        {activeFiltersCount > 0 && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                                {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {activeFiltersCount > 0 && (
                            <button
                                type="button"
                                onClick={onClearAll}
                                className="text-[12px] font-semibold text-gray-400 underline underline-offset-2 active:text-black transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-transform"
                        >
                            <X className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 overscroll-contain">
                    <SheetSection title="Category">
                        <div className="flex flex-wrap gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => onCategoryChange(null)}
                                className={cn(
                                    'px-4 py-2 rounded-full text-[12px] font-semibold border transition-all duration-150 active:scale-95',
                                    !activeCategory
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-500 border-gray-200'
                                )}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    type="button"
                                    key={cat.slug}
                                    onClick={() => onCategoryChange(cat.slug)}
                                    className={cn(
                                        'px-4 py-2 rounded-full text-[12px] font-semibold border transition-all duration-150 active:scale-95',
                                        activeCategory === cat.slug
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-500 border-gray-200'
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </SheetSection>

                    <SheetSection title="Size">
                        <div className="flex flex-wrap gap-2.5 pt-1">
                            {sizeOptions.map((size) => (
                                <button
                                    type="button"
                                    key={size.value}
                                    onClick={() => onSizeChange(activeSize === size.value ? null : size.value)}
                                    className={cn(
                                        'min-w-[48px] h-11 px-3 flex items-center justify-center text-[12px] font-semibold border rounded-xl transition-all duration-150 active:scale-95',
                                        activeSize === size.value
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-600 border-gray-200'
                                    )}
                                >
                                    {size.label}
                                </button>
                            ))}
                        </div>
                    </SheetSection>

                    <SheetSection title="Color">
                        <div className="flex flex-wrap gap-3 pt-1">
                            {colorOptions.map((color) => (
                                <button
                                    type="button"
                                    key={color.value}
                                    onClick={() => onColorChange(activeColor === color.value ? null : color.value)}
                                    className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                                >
                                    <span
                                        className={cn(
                                            'w-9 h-9 rounded-full border-2 transition-all duration-150',
                                            activeColor === color.value
                                                ? 'ring-2 ring-offset-2 ring-black scale-110'
                                                : 'ring-0'
                                        )}
                                        style={{
                                            backgroundColor: color.hex,
                                            borderColor: color.border ?? color.hex,
                                        }}
                                    />
                                    <span
                                        className={cn(
                                            'text-[10px] font-medium',
                                            activeColor === color.value ? 'text-black' : 'text-gray-400'
                                        )}
                                    >
                                        {color.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </SheetSection>

                    <SheetSection title="Price">
                        <div className="flex flex-col gap-1 pt-1">
                            {priceOptions.map((price) => (
                                <button
                                    type="button"
                                    key={price.value}
                                    onClick={() => onPriceChange(activePrice === price.value ? null : price.value)}
                                    className={cn(
                                        'flex items-center justify-between w-full py-2.5 text-[13px] transition-colors',
                                        activePrice === price.value
                                            ? 'text-black font-bold'
                                            : 'text-gray-500 font-medium'
                                    )}
                                >
                                    <span>{price.label}</span>
                                    {activePrice === price.value && (
                                        <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path
                                                    d="M1 4L3.5 6.5L9 1"
                                                    stroke="white"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </SheetSection>

                    <div className="h-6" />
                </div>

                <div
                    className="shrink-0 px-5 pt-3 bg-white border-t border-gray-100"
                    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-black text-white rounded-2xl py-4 text-[14px] font-bold tracking-wide active:scale-[0.98] transition-all duration-150"
                    >
                        View {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
                    </button>
                </div>
            </div>
        </>
    );
}
