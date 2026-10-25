'use client';

import { useWishlistStore, type WishlistItem } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { ArrowRight, Heart, Package, ShoppingBag, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import Image from 'next/image';
import { formatCurrency, useCurrency } from '@/lib/utils/currency';

export default function WishlistPage() {
    const { items, removeItem, addItem } = useWishlistStore();
    const { addItem: addToCart } = useCartStore();
    const { currency } = useCurrency();

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
        return '/products';
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
            <section className="relative overflow-hidden rounded-[28px] bg-[#26352b] px-6 py-8 text-white sm:px-9 sm:py-10">
                <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border border-white/10" />
                <div className="absolute -right-2 -top-8 h-40 w-40 rounded-full border border-white/10" />
                <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#d7c5a7]">
                            <Sparkles className="h-3.5 w-3.5" />
                            Your considered collection
                        </p>
                        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
                            Your Wishlist
                        </h1>
                        <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">
                            A thoughtful place for the pieces you love. Keep them close until you&apos;re ready to make them part of your practice.
                        </p>
                    </div>
                    <div className="flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5">
                        <Heart className="h-4 w-4 text-[#d7c5a7]" />
                        <span className="text-sm font-medium">{items.length} {items.length === 1 ? 'saved piece' : 'saved pieces'}</span>
                    </div>
                </div>
            </section>

            <div className="mt-7 sm:mt-9">
                {items.length === 0 ? (
                    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-[#e7e5df] bg-[#fbfaf7] px-6 py-14 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e7e5df] bg-white text-[#a08758] shadow-sm">
                            <Heart className="h-7 w-7" strokeWidth={1.5} />
                        </div>
                        <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#a08758]">
                            Your collection begins here
                        </p>
                        <h2 className="mt-2 font-serif text-2xl font-normal text-[#1c211d]">
                            Nothing saved just yet
                        </h2>
                        <p className="mt-2 max-w-md text-sm leading-6 text-[#77766f]">
                            Explore mindful essentials and save the pieces that feel right for your practice.
                        </p>
                        <Link
                            href="/products"
                            className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#26352b] px-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#35483a]"
                        >
                            Explore the collection
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </section>
                ) : (
                    <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <article
                                key={item.productId}
                                className="group overflow-hidden rounded-[24px] border border-[#e7e5df] bg-white p-3 shadow-[0_10px_35px_rgba(28,33,29,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c8b58d] hover:shadow-[0_18px_45px_rgba(28,33,29,0.09)]"
                            >
                                <div className="relative aspect-[4/4.5] overflow-hidden rounded-[18px] bg-[#f2f0e9]">
                                    <Link
                                        href={getProductLink(item)}
                                        aria-label={`View ${item.name}`}
                                        className="absolute inset-0"
                                    >
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[#b6b2a7]">
                                                <Package className="h-11 w-11" strokeWidth={1.25} />
                                            </div>
                                        )}
                                    </Link>

                                    <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#59634f] backdrop-blur-sm">
                                        Saved for later
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.productId)}
                                        aria-label={`Remove ${item.name} from wishlist`}
                                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#77766f] shadow-sm backdrop-blur-sm transition-colors hover:bg-[#26352b] hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="px-2 pb-2 pt-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <Link href={getProductLink(item)} className="group/name">
                                                <h2 className="truncate font-serif text-lg font-normal text-[#1c211d] transition-colors group-hover/name:text-[#59634f]">
                                                    {item.name}
                                                </h2>
                                            </Link>
                                            <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-[#918d82]">
                                                A Yoglivya essential
                                            </p>
                                        </div>
                                        <p className="shrink-0 pt-0.5 text-sm font-semibold text-[#26352b]">
                                            {formatCurrency(item.price, currency)}
                                        </p>
                                    </div>

                                    <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleMoveToCart(item)}
                                            className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#26352b] px-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#35483a]"
                                        >
                                            <ShoppingBag className="h-3.5 w-3.5" />
                                            Move to bag
                                        </button>
                                        <Link
                                            href={getProductLink(item)}
                                            aria-label={`View ${item.name}`}
                                            className="inline-flex min-h-11 w-11 items-center justify-center border border-[#e7e5df] text-[#26352b] transition-colors hover:border-[#26352b] hover:bg-[#f5f3ed]"
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
