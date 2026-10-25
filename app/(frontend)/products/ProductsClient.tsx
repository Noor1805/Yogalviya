'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import ProductSidebar from '@/components/products/ProductSidebar';
import MobileFilterSheet from '@/components/products/MobileFilterSheet';
import MobileProductGrid from '@/components/products/MobileProductGrid';
import ProductGrid from '@/components/products/ProductGrid';
import { Product, CategoryInfo } from '@/types/product';
import { cn } from '@/lib/utils';

type FilterOption = {
    label: string;
    value: string;
};

type ColorFilterOption = FilterOption & {
    hex: string;
    border?: string;
};

const MOBILE_SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Name: A-Z', value: 'name_asc' },
];

const PRICE_OPTIONS: FilterOption[] = [
    { label: 'Under $200', value: 'under_200' },
    { label: '$200 - $500', value: '200_500' },
    { label: '$500 - $1,000', value: '500_1000' },
    { label: '$1,000 - $2,000', value: '1000_2000' },
    { label: 'Over $2,000', value: 'over_2000' },
];

const DEFAULT_COLOR_SWATCHES: Record<string, { hex: string; border?: string }> = {
    black: { hex: '#0a0a0a' },
    white: { hex: '#f5f5f5', border: '#d4d4d4' },
    ivory: { hex: '#fffaf0', border: '#e5e5e5' },
    cream: { hex: '#f5ecd9', border: '#e5e5e5' },
    gold: { hex: '#c9a84c' },
    beige: { hex: '#d4b896' },
    brown: { hex: '#5c3d2e' },
    navy: { hex: '#1a2744' },
    blue: { hex: '#2a4c7f' },
    red: { hex: '#8b1e2d' },
    pink: { hex: '#d8a1b1' },
    green: { hex: '#445b45' },
    silver: { hex: '#c0c0c0', border: '#d4d4d4' },
    grey: { hex: '#8f8f8f' },
    gray: { hex: '#8f8f8f' },
};

const SIZE_SORT_ORDER = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'xxxxl', 'onesize'];
const SIZE_LABEL_OVERRIDES: Record<string, string> = {
    xxs: 'XXS',
    xs: 'XS',
    s: 'S',
    m: 'M',
    l: 'L',
    xl: 'XL',
    xxl: 'XXL',
    xxxl: 'XXXL',
    xxxxl: 'XXXXL',
    onesize: 'One Size',
};

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ');

const normalizeFilterValue = (value?: string | null) => {
    if (typeof value !== 'string') return null;
    const normalized = normalizeWhitespace(value);
    if (!normalized || normalized.toLowerCase() === 'all') return null;
    return normalized;
};

const normalizeColorToken = (value?: string | null) => normalizeFilterValue(value)?.toLowerCase() ?? null;

const normalizeSizeToken = (value?: string | null) => {
    const normalized = normalizeFilterValue(value);
    if (!normalized) return null;
    return normalized.toLowerCase().replace(/[\s-]+/g, '');
};

const titleCase = (value: string) =>
    value
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

const formatColorLabel = (value: string) => titleCase(normalizeWhitespace(value));

const formatSizeLabel = (value: string) => {
    const normalized = normalizeWhitespace(value);
    const token = normalizeSizeToken(normalized);
    if (!token) return normalized;
    if (SIZE_LABEL_OVERRIDES[token]) return SIZE_LABEL_OVERRIDES[token];
    return normalized.length <= 4 ? normalized.toUpperCase() : titleCase(normalized);
};

const isColorAttributeName = (value: string) => {
    const normalized = normalizeWhitespace(value).toLowerCase();
    return normalized.includes('color') || normalized.includes('colour');
};

const isSizeAttributeName = (value: string) => normalizeWhitespace(value).toLowerCase().includes('size');

const findExplicitColorHex = (colorValues: Record<string, string> | undefined, value: string) => {
    if (!colorValues) return undefined;
    const target = normalizeColorToken(value);
    if (!target) return undefined;

    for (const [label, hex] of Object.entries(colorValues)) {
        if (normalizeColorToken(label) === target) {
            return hex;
        }
    }

    return undefined;
};

const getColorSwatch = (value: string, explicitHex?: string) => {
    const cleanedHex = explicitHex?.trim();
    if (cleanedHex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleanedHex)) {
        return {
            hex: cleanedHex,
            border: cleanedHex.toLowerCase() === '#ffffff' ? '#d4d4d4' : undefined,
        };
    }

    const preset = DEFAULT_COLOR_SWATCHES[normalizeColorToken(value) ?? ''];
    return preset ?? { hex: '#d4d4d4', border: '#d4d4d4' };
};

const sortSizeOptions = (a: FilterOption, b: FilterOption) => {
    const aIndex = SIZE_SORT_ORDER.indexOf(a.value);
    const bIndex = SIZE_SORT_ORDER.indexOf(b.value);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' });
};

const buildFilterOptions = (products: Product[]) => {
    const sizeMap = new Map<string, FilterOption>();
    const colorMap = new Map<string, ColorFilterOption>();

    const addSize = (value?: string | null) => {
        const token = normalizeSizeToken(value);
        const rawValue = normalizeFilterValue(value);
        if (!token || !rawValue || sizeMap.has(token)) return;
        sizeMap.set(token, {
            label: formatSizeLabel(rawValue),
            value: token,
        });
    };

    const addColor = (value?: string | null, explicitHex?: string) => {
        const token = normalizeColorToken(value);
        const rawValue = normalizeFilterValue(value);
        if (!token || !rawValue || colorMap.has(token)) return;
        const swatch = getColorSwatch(rawValue, explicitHex);
        colorMap.set(token, {
            label: formatColorLabel(rawValue),
            value: token,
            hex: swatch.hex,
            border: swatch.border,
        });
    };

    products.forEach((product) => {
        product.attributes?.forEach((attribute) => {
            if (isColorAttributeName(attribute.name)) {
                attribute.values.forEach(value => addColor(value, findExplicitColorHex(attribute.colorValues, value)));
            }

            if (isSizeAttributeName(attribute.name)) {
                attribute.values.forEach(addSize);
            }
        });

        product.variations?.forEach((variation) => {
            Object.entries(variation.attributes ?? {}).forEach(([key, value]) => {
                if (isColorAttributeName(key)) addColor(value);
                if (isSizeAttributeName(key)) addSize(value);
            });
        });

        product.colors?.forEach(color => addColor(color));
    });

    return {
        sizeOptions: Array.from(sizeMap.values()).sort(sortSizeOptions),
        colorOptions: Array.from(colorMap.values()).sort((a, b) =>
            a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
        ),
        priceOptions: PRICE_OPTIONS,
    };
};

const productMatchesColor = (product: Product, activeColor: string) => {
    const attributeMatch = product.attributes?.some(attribute =>
        isColorAttributeName(attribute.name) &&
        attribute.values.some(value => normalizeColorToken(value) === activeColor)
    );

    const variationMatch = product.variations?.some(variation =>
        Object.entries(variation.attributes ?? {}).some(([key, value]) =>
            isColorAttributeName(key) && normalizeColorToken(value) === activeColor
        )
    );

    const topLevelColorMatch = product.colors?.some(color => normalizeColorToken(color) === activeColor);

    return Boolean(attributeMatch || variationMatch || topLevelColorMatch);
};

const productMatchesSize = (product: Product, activeSize: string) => {
    const attributeMatch = product.attributes?.some(attribute =>
        isSizeAttributeName(attribute.name) &&
        attribute.values.some(value => normalizeSizeToken(value) === activeSize)
    );

    const variationMatch = product.variations?.some(variation =>
        Object.entries(variation.attributes ?? {}).some(([key, value]) =>
            isSizeAttributeName(key) && normalizeSizeToken(value) === activeSize
        )
    );

    return Boolean(attributeMatch || variationMatch);
};

interface ProductsClientProps {
    allProducts: Product[];
    categories: CategoryInfo[];
    initialSearch?: string;
    initialCategory?: string;
}

export default function ProductsClient({ allProducts, categories, initialSearch, initialCategory }: ProductsClientProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory || null);
    const [activeSize, setActiveSize] = useState<string | null>(null);
    const [activeColor, setActiveColor] = useState<string | null>(null);
    const [activePrice, setActivePrice] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialSearch || '');
    const mobileLayout = 'grid';
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const [activeSort, setActiveSort] = useState<string>('newest');
    const { sizeOptions, colorOptions, priceOptions } = useMemo(
        () => buildFilterOptions(allProducts),
        [allProducts]
    );

    const filteredProducts = useMemo(() => {
        let items = allProducts;
        const normalizedActivePrice = normalizeFilterValue(activePrice)?.toLowerCase() ?? null;
        const normalizedActiveColor = normalizeColorToken(activeColor);
        const normalizedActiveSize = normalizeSizeToken(activeSize);

        if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            items = items.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                (p.shortDescription && p.shortDescription.toLowerCase().includes(query)) ||
                (p.longDescription && p.longDescription.toLowerCase().includes(query))
            );
        }

        if (activeCategory && activeCategory !== 'all') {
            items = items.filter(p => p.categorySlug === activeCategory);
        }

        if (normalizedActivePrice) {
            items = items.filter(p => {
                const usd = p.basePriceUSD;
                if (normalizedActivePrice === 'under_200') return usd < 200;
                if (normalizedActivePrice === '200_500') return usd >= 200 && usd <= 500;
                if (normalizedActivePrice === '500_1000') return usd >= 500 && usd <= 1000;
                if (normalizedActivePrice === '1000_2000') return usd >= 1000 && usd <= 2000;
                if (normalizedActivePrice === 'over_2000') return usd > 2000;
                return true;
            });
        }

        if (normalizedActiveColor) {
            items = items.filter(p => productMatchesColor(p, normalizedActiveColor));
        }

        if (normalizedActiveSize) {
            items = items.filter(p => productMatchesSize(p, normalizedActiveSize));
        }

        // Sort
        const sorted = [...items];
        if (activeSort === 'price_asc') sorted.sort((a, b) => (a.basePriceUSD || 0) - (b.basePriceUSD || 0));
        else if (activeSort === 'price_desc') sorted.sort((a, b) => (b.basePriceUSD || 0) - (a.basePriceUSD || 0));
        else if (activeSort === 'name_asc') sorted.sort((a, b) => a.name.localeCompare(b.name));

        return sorted;
    }, [allProducts, activeCategory, activePrice, activeSize, activeColor, searchQuery, activeSort]);

    const activeFiltersCount = [
        activeCategory && activeCategory !== 'all' ? 1 : 0,
        normalizeSizeToken(activeSize) ? 1 : 0,
        normalizeColorToken(activeColor) ? 1 : 0,
        normalizeFilterValue(activePrice) ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    const clearAll = useCallback(() => {
        setActiveCategory(null);
        setActiveSize(null);
        setActiveColor(null);
        setActivePrice(null);
        setSearchQuery('');
    }, []);

    const catList = useMemo(() => categories.map(c => ({ name: c.name, slug: c.slug })), [categories]);

    // Listen for global filter event from StoreHeader
    useEffect(() => {
        const handleFilter = () => setFilterSheetOpen(true);
        window.addEventListener('open-mobile-filter', handleFilter);
        return () => window.removeEventListener('open-mobile-filter', handleFilter);
    }, []);

    useEffect(() => {
        const handleSort = () => setSortOpen(true);
        window.addEventListener('open-mobile-sort', handleSort);
        return () => window.removeEventListener('open-mobile-sort', handleSort);
    }, []);

    useEffect(() => {
        if (!sortOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [sortOpen]);

    return (
        <>
            {/* ─── Mobile Layout (< lg) ─── */}
            <div className="lg:hidden pt-4">
                <div className="px-4 mb-4">
                  <h1 className="text-[20px] font-light uppercase tracking-[0.2em] text-black">
                    {activeCategory ? categories.find(c => c.slug === activeCategory)?.name : 'The Collection'}
                  </h1>
                  <p className="text-[11px] text-gray-400 font-medium mt-1">
                    Showing {filteredProducts.length} items
                  </p>
                </div>

                <MobileProductGrid
                    products={filteredProducts}
                    layout={mobileLayout}
                />

                <MobileFilterSheet
                    open={filterSheetOpen}
                    onClose={() => setFilterSheetOpen(false)}
                    categories={catList}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    activeSize={activeSize}
                    onSizeChange={setActiveSize}
                    sizeOptions={sizeOptions}
                    activeColor={activeColor}
                    onColorChange={setActiveColor}
                    colorOptions={colorOptions}
                    activePrice={activePrice}
                    onPriceChange={setActivePrice}
                    priceOptions={priceOptions}
                    onClearAll={clearAll}
                    activeFiltersCount={activeFiltersCount}
                    totalCount={filteredProducts.length}
                />

                <div
                    className={cn(
                        'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
                        sortOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    )}
                    onClick={() => setSortOpen(false)}
                />

                <div
                    className={cn(
                        'fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                        sortOpen ? 'translate-y-0' : 'translate-y-full'
                    )}
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <div>
                            <h2 className="text-[15px] font-bold text-gray-900">Sort by</h2>
                            <p className="mt-0.5 text-[11px] text-gray-400">Choose how products are arranged</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSortOpen(false)}
                            className="rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-semibold text-gray-600"
                        >
                            Close
                        </button>
                    </div>

                    <div className="px-5 py-3">
                        {MOBILE_SORT_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    setActiveSort(option.value);
                                    setSortOpen(false);
                                }}
                                className={cn(
                                    'flex w-full items-center justify-between border-b border-gray-100 py-4 text-left text-[14px] transition-colors',
                                    activeSort === option.value ? 'font-semibold text-black' : 'text-gray-500'
                                )}
                            >
                                <span>{option.label}</span>
                                <span className={cn('text-[11px] uppercase tracking-[0.2em]', activeSort === option.value ? 'text-black' : 'text-transparent')}>
                                    Selected
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Desktop Layout (lg+) ─── */}
            <div className="hidden lg:flex gap-12 lg:gap-16 w-full">
                <div>
                    <ProductSidebar
                        categories={catList}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        activeSize={activeSize}
                        onSizeChange={setActiveSize}
                        sizeOptions={sizeOptions}
                        activeColor={activeColor}
                        onColorChange={setActiveColor}
                        colorOptions={colorOptions}
                        activePrice={activePrice}
                        onPriceChange={setActivePrice}
                        priceOptions={priceOptions}
                        totalCount={filteredProducts.length}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <ProductGrid products={filteredProducts} hideMoq={true} />
                    <div className="mt-20 flex justify-center items-center gap-2">
                        {[1, 2, 3].map((page) => (
                            <button
                                key={page}
                                className={cn(
                                    'w-10 h-10 flex items-center justify-center text-[11px] font-semibold transition-colors',
                                    page === 1
                                        ? 'bg-[#26352b] text-white'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                )}
                            >
                                {page}
                            </button>
                        ))}
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
