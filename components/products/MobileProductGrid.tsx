'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '@/types/product';
import { useCurrency, formatCurrency } from '@/lib/utils/currency';
import { getStartingPrice, getPriceRange } from '@/lib/utils/pricing';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MobileProductGridProps {
    products: Product[];
    layout: 'grid' | 'list';
}

function MobileProductCard({
    product,
    index,
    layout,
}: {
    product: Product;
    index: number;
    layout: 'grid' | 'list';
}) {
    const { currency } = useCurrency();
    const startingPrice = getStartingPrice(product, currency);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const addItemToCart = useCartStore(state => state.addItem);
    const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
    const isWishlisted = mounted ? isInWishlist(product.id) : false;
    const badge = product.badge && product.badge.trim() ? product.badge : undefined;

    const handleQuickAdd = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItemToCart({
            productId: product.id,
            sku: product.id,
            name: product.name,
            price: startingPrice || 0,
            quantity: 1,
            image: product.heroImage,
        });
        toast.success(`Added to bag`);
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('open-cart'));
    };

    const toggleWishlist = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeWishlist(product.id);
            toast.success('Removed from wishlist');
        } else {
            addWishlist({
                productId: product.id,
                sku: product.id,
                name: product.name,
                price: startingPrice || 0,
                image: product.heroImage,
                slug: product.slug,
                categorySlug: product.categorySlug,
            });
            toast.success('Added to wishlist');
        }
    };

    const priceDisplay = (() => {
        const range = getPriceRange(product, currency);
        if (range.hasRange) return `${formatCurrency(range.min, currency)} – ${formatCurrency(range.max, currency)}`;
        return formatCurrency(startingPrice, currency);
    })();

    const href = `/products/${product.categorySlug}/${product.slug}`;

    if (layout === 'list') {
        return (
            <div
                className="flex gap-3.5 items-start animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
            >
                {/* Image */}
                <Link href={href} className="shrink-0 relative w-[110px] h-[140px] bg-[#F6F6F6] overflow-hidden rounded-2xl">
                    {product.heroImage ? (
                        <Image
                            src={product.heroImage}
                            alt={product.name}
                            fill
                            priority={index < 6}
                            className="object-cover transition-transform duration-500 active:scale-110"
                            sizes="110px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[11px]">No Image</div>
                    )}
                    {badge && (
                        <span className="absolute top-2 left-2 bg-black text-white text-[8px] font-bold tracking-[0.15em] uppercase px-2 py-1 rounded-sm">
                            {badge}
                        </span>
                    )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 pt-1">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium mb-1">{product.category}</p>
                    <Link href={href}>
                        <h3 className="text-[14px] font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">{product.name}</h3>
                    </Link>
                    <p className="text-[14px] font-bold text-black mb-3">{priceDisplay}</p>
                    {product.shortDescription && (
                        <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-2 mb-3">{product.shortDescription}</p>
                    )}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleQuickAdd}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-black text-white rounded-xl py-2.5 text-[12px] font-bold tracking-wide active:scale-[0.97] transition-all duration-150 touch-manipulation"
                        >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add to Bag
                        </button>
                        <button
                            type="button"
                            onClick={toggleWishlist}
                            className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center active:scale-90 transition-transform touch-manipulation"
                        >
                            <Heart
                                className={cn('w-4.5 h-4.5 transition-colors', isWishlisted ? 'fill-black text-black' : 'text-gray-400')}
                                style={{ width: '18px', height: '18px' }}
                            />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Grid layout card
    return (
        <div
            className="group relative flex flex-col animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Image */}
            <div className="relative aspect-[3/4] w-full bg-[#F6F6F6] overflow-hidden rounded-2xl mb-3">
                <Link href={href} className="block w-full h-full">
                    {product.heroImage ? (
                        <Image
                            src={product.heroImage}
                            alt={product.name}
                            fill
                            priority={index < 6}
                            className="object-cover transition-transform duration-700 group-active:scale-105"
                            sizes="(max-width: 640px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[11px]">No Image</div>
                    )}
                </Link>

                {/* Badge */}
                {badge && (
                    <span className="absolute top-2.5 left-2.5 bg-black text-white text-[8px] font-bold tracking-[0.15em] uppercase px-2 py-1 rounded-sm z-10">
                        {badge}
                    </span>
                )}

                {/* Wishlist */}
                <button
                    type="button"
                    onClick={toggleWishlist}
                    className="absolute top-2.5 right-2.5 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm z-10 active:scale-90 transition-transform touch-manipulation"
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart
                        className={cn('transition-colors', isWishlisted ? 'fill-black text-black' : 'text-gray-500')}
                        style={{ width: '14px', height: '14px' }}
                    />
                </button>

                {/* Quick add - always visible on mobile */}
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/12 via-black/5 to-transparent p-2 pt-8">
                    <button
                        type="button"
                        onClick={handleQuickAdd}
                        className="w-full bg-black/88 backdrop-blur-md text-white rounded-xl py-2.5 text-[11px] font-bold tracking-wider active:scale-[0.97] transition-all touch-manipulation"
                    >
                        Add to Bag
                    </button>
                </div>
            </div>

            {/* Content */}
            <Link href={href} className="flex flex-col">
                <p className="text-[9.5px] uppercase tracking-[0.12em] text-gray-400 font-medium mb-0.5">{product.category}</p>
                <h3 className="text-[12.5px] font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-[13px] font-bold text-black">{priceDisplay}</p>
            </Link>
        </div>
    );
}

export default function MobileProductGrid({ products, layout }: MobileProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">Try adjusting your filters or search terms to find what you're looking for.</p>
            </div>
        );
    }

    return (
        <div className="px-4 pt-4 pb-6">
            {layout === 'grid' ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-6">
                    {products.slice(0, 24).map((product, index) => (
                        <MobileProductCard key={product.id} product={product} index={index} layout="grid" />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {products.slice(0, 24).map((product, index) => (
                        <div key={product.id}>
                            <MobileProductCard product={product} index={index} layout="list" />
                            {index < products.length - 1 && <div className="h-px bg-gray-100 mt-5" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
