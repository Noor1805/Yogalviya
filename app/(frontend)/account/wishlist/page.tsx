'use client';

import { useWishlistStore, type WishlistItem } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { Package, X, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import Image from 'next/image';
import { formatCurrency, useCurrency } from '@/lib/utils/currency';

export default function WishlistPage() {
    const { items, removeItem, addItem } = useWishlistStore();
    const { addItem: addToCart } = useCartStore();
    const { currency } = useCurrency();

    // Fetch category info for products that don't have categorySlug and update the store
    useEffect(() => {
        let cancelled = false;

        const fetchCategories = async () => {
            const itemsNeedingCategory = items.filter(item => !item.categorySlug && item.slug);
            if (itemsNeedingCategory.length === 0) return;

            for (const item of itemsNeedingCategory) {
                try {
                    const response = await fetch(`/api/products?slug=${item.slug}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch product category (${response.status})`);
                    }

                    const data: { products?: Array<{ categorySlug?: string }> } = await response.json();
                    const categorySlug = data.products?.[0]?.categorySlug;
                    if (cancelled) return;

                    if (categorySlug) {
                        const updatedItem: WishlistItem = {
                            ...item,
                            categorySlug,
                        };
                        removeItem(item.productId);
                        addItem(updatedItem);
                        return;
                    }
                } catch (err) {
                    if (!cancelled) {
                        console.error(`Failed to fetch category for ${item.name}:`, err);
                    }
                }
            }
        };

        void fetchCategories();
        return () => {
            cancelled = true;
        };
    }, [addItem, items, removeItem]);

    const getProductLink = (item: WishlistItem) => {
        if (item.categorySlug && item.slug) {
            return `/products/${item.categorySlug}/${item.slug}`;
        }
        return `/products`;
    };

    const handleMoveToCart = (item: WishlistItem) => {
        addToCart({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            price: item.price,
            quantity: 1,
            image: item.image
        });
        removeItem(item.productId);
    };

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500 fill-red-500" /> Your Wishlist
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
                Items you&apos;ve saved for later. Move them to your cart when you&apos;re ready.
            </p>

            <div className="mt-10">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200/60 bg-neutral-50/50 py-20 text-neutral-400">
                        <Heart className="h-12 w-12 opacity-20 mb-4" />
                        <p className="text-sm">Your wishlist is currently empty.</p>
                        <Link href="/products" className="mt-4 text-sm font-semibold text-neutral-900 underline underline-offset-4">
                            Start exploring
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <div key={item.productId} className="group relative rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm transition-all hover:border-neutral-900">
                                
                                <button 
                                    onClick={() => removeItem(item.productId)}
                                    aria-label={`Remove ${item.name} from wishlist`}
                                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-400 shadow-md hover:text-red-500 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                
                                <Link 
                                    href={getProductLink(item)}
                                    className="block relative aspect-[4/5] rounded-xl bg-neutral-100 overflow-hidden mb-4"
                                >
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 640px) 100vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-10 w-10 text-neutral-300" />
                                        </div>
                                    )}
                                </Link>

                                <div>
                                    <h3 className="font-semibold text-neutral-900 truncate">{item.name}</h3>
                                    <p className="mt-1 text-sm font-medium text-neutral-900">{formatCurrency(item.price, currency)}</p>
                                </div>

                                <button
                                    onClick={() => handleMoveToCart(item)}
                                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
                                >
                                    <ShoppingCart className="h-4 w-4" /> Move to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
