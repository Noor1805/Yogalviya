'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    categories?: Array<{ name: string; slug: string }>;
    trendingSearches?: string[];
    featuredProducts?: Array<{
        id: string;
        name: string;
        image: string;
        href: string;
    }>;
}

export default function SearchOverlay({
    isOpen,
    onClose,
    categories = [],
    trendingSearches = [],
    featuredProducts = [],
}: SearchOverlayProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const productRailRef = useRef<HTMLDivElement>(null);
    const dragStartXRef = useRef(0);
    const dragScrollLeftRef = useRef(0);
    const pointerDownRef = useRef(false);
    const dragMovedRef = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (!isOpen) return;

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        const raf = requestAnimationFrame(() => {
            overlayRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            inputRef.current?.focus({ preventScroll: true });
        });

        return () => {
            cancelAnimationFrame(raf);
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const updateRailProgress = () => {
        const rail = productRailRef.current;
        if (!rail) return;

        const maxScroll = rail.scrollWidth - rail.clientWidth;
        if (maxScroll <= 0) {
            setScrollProgress(0);
            return;
        }

        setScrollProgress((rail.scrollLeft / maxScroll) * 100);
    };

    const handleRailMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        const rail = productRailRef.current;
        if (!rail) return;

        pointerDownRef.current = true;
        dragMovedRef.current = false;
        dragStartXRef.current = event.pageX - rail.offsetLeft;
        dragScrollLeftRef.current = rail.scrollLeft;
    };

    const handleRailMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rail = productRailRef.current;
        if (!pointerDownRef.current || !rail) return;

        const nextX = event.pageX - rail.offsetLeft;
        const distance = (nextX - dragStartXRef.current) * 1.5;

        if (!dragMovedRef.current && Math.abs(distance) < 6) {
            return;
        }

        dragMovedRef.current = true;
        setIsDragging(true);
        event.preventDefault();
        rail.scrollLeft = dragScrollLeftRef.current - distance;
    };

    const stopRailDragging = () => {
        pointerDownRef.current = false;
        setIsDragging(false);
    };

    const handleRailWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        const rail = productRailRef.current;
        if (!rail) return;

        const isMostlyHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
        if (!isMostlyHorizontal && !event.shiftKey) {
            return;
        }

        event.preventDefault();
        rail.scrollLeft += isMostlyHorizontal ? event.deltaX : event.deltaY;
    };

    const handleOverlayWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        const overlay = overlayRef.current;
        const rail = productRailRef.current;
        if (!overlay) return;

        const target = event.target as Node | null;
        const isInsideRail = !!(target && rail?.contains(target));
        const isHorizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;

        if (isInsideRail && isHorizontalIntent) {
            return;
        }

        if (event.deltaY === 0) return;

        event.preventDefault();
        overlay.scrollTop += event.deltaY;
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;

        router.push(`/products?search=${encodeURIComponent(query)}`);
        onClose();
    };

    const handleCategoryClick = (slug: string) => {
        router.push(`/products?category=${slug}`);
        onClose();
    };

    const handleTrendingClick = (term: string) => {
        router.push(`/products?search=${encodeURIComponent(term)}`);
        onClose();
    };

    const handleBrandClick = () => {
        router.push('/');
        onClose();
    };

    return (
        <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-white"
            style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y',
            }}
            aria-hidden={!isOpen}
            onWheelCapture={handleOverlayWheel}
        >
            <div className="min-h-screen max-w-[1400px] mx-auto px-8 lg:px-20 py-10 pb-28">
                <motion.div
                    initial={{ opacity: 0, y: -18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="relative flex items-center justify-center mb-20"
                >
                    <button
                        type="button"
                        onClick={handleBrandClick}
                        className="text-black font-light uppercase tracking-[0.4em] text-[13px] lg:text-[15px] transition-opacity duration-200 hover:opacity-70"
                        style={{ fontFamily: 'Georgia, serif' }}
                    >
                        YOGLIVYA
                    </button>

                    <button
                        onClick={onClose}
                        className="absolute right-0 group flex items-center gap-3 text-black transition-opacity duration-300 hover:opacity-60"
                    >
                        <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Close</span>
                        <div className="relative w-5 h-5 flex items-center justify-center">
                            <X className="h-4 w-4 stroke-[1px]" />
                        </div>
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.65, ease: 'easeOut' }}
                    className="mb-24 mt-10 max-w-4xl"
                >
                    <form onSubmit={handleSearch} className="relative flex flex-col items-start">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-black mb-1 font-normal select-none">
                            Search for
                        </label>

                        <div className="w-full relative group border-b border-black">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search mats, props and practice essentials"
                                className="w-full bg-transparent py-3 text-lg lg:text-xl font-light text-black placeholder:text-neutral-300 outline-none focus:outline-none focus:ring-0"
                                style={{
                                    border: 'none',
                                    borderRadius: '0',
                                    boxShadow: 'none',
                                    WebkitAppearance: 'none',
                                    outline: 'none',
                                }}
                            />

                            <button
                                type="submit"
                                aria-label="Search products"
                                className="absolute right-0 bottom-4 text-black transition-opacity hover:opacity-50"
                            >
                                <Search className="h-5 w-5 stroke-[1px]" />
                            </button>
                        </div>
                    </form>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16, duration: 0.5, ease: 'easeOut' }}
                        className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-3"
                    >
                        <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-medium">
                            Trending Searches
                        </span>

                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                            {trendingSearches.map((term) => (
                                <button
                                    key={term}
                                    type="button"
                                    onClick={() => handleTrendingClick(term)}
                                    className="text-[10px] uppercase tracking-[0.12em] text-black border-b border-black/10 hover:border-black transition-all duration-300 pb-0.5"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-12 lg:gap-32 gap-y-16">
                    <motion.div
                        initial={{ opacity: 0, x: -42 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="col-span-12 lg:col-span-3"
                    >
                        <div className="lg:sticky lg:top-6">
                            <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-400 font-bold mb-12 pb-4 border-b border-neutral-100">
                                Handpicked Categories
                            </p>

                            <div className="flex flex-col items-start gap-10">
                                {categories.map((category, index) => (
                                    <motion.button
                                        key={category.slug}
                                        type="button"
                                        initial={{ opacity: 0, x: -28 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.28 + index * 0.05,
                                            duration: 0.5,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                        onClick={() => handleCategoryClick(category.slug)}
                                        className="text-[13px] lg:text-[14px] uppercase tracking-[0.4em] font-light text-neutral-800 hover:text-black transition-all duration-300 relative group"
                                    >
                                        {category.name}
                                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all duration-500 group-hover:w-full" />
                                    </motion.button>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.48, duration: 0.55, ease: 'easeOut' }}
                                className="mt-24 pt-12 border-t border-neutral-100"
                            >
                                <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-400 font-bold mb-8">
                                    Concierge
                                </p>

                                <Link
                                    href="/contact"
                                    onClick={onClose}
                                    className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors mb-4"
                                >
                                    Book an appointment
                                </Link>

                                <Link
                                    href="/contact"
                                    onClick={onClose}
                                    className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors"
                                >
                                    Store Locator
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 42 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.24, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                        className="col-span-12 lg:col-span-9 min-w-0"
                    >
                        <div className="flex items-center justify-between gap-6 mb-10 pb-4 pr-8 lg:pr-12 border-b border-neutral-100">
                            <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-400 font-bold">
                                Most Coveted
                            </p>

                            <Link
                                href="/products"
                                onClick={onClose}
                                className="shrink-0 pl-6 text-[9px] uppercase tracking-[0.3em] text-black hover:opacity-50 transition-opacity"
                            >
                                Discover All
                            </Link>
                        </div>

                        <div className="relative min-w-0">
                            <div
                                ref={productRailRef}
                                onScroll={updateRailProgress}
                                onWheel={handleRailWheel}
                                onMouseDown={handleRailMouseDown}
                                onMouseMove={handleRailMouseMove}
                                onMouseUp={stopRailDragging}
                                onMouseLeave={stopRailDragging}
                                className={`flex gap-x-12 overflow-x-auto overflow-y-hidden pb-16 scrollbar-hide ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                                style={{
                                    scrollBehavior: 'auto',
                                    WebkitOverflowScrolling: 'touch',
                                    touchAction: 'pan-x',
                                }}
                            >
                                {featuredProducts.length > 0 ? (
                                    featuredProducts.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.36 + index * 0.08,
                                                duration: 0.55,
                                                ease: 'easeOut',
                                            }}
                                            className="w-[250px] lg:w-[290px] flex-shrink-0 snap-start"
                                        >
                                            <Link
                                                href={product.href}
                                                onClick={(event) => {
                                                    if (dragMovedRef.current) {
                                                        event.preventDefault();
                                                        dragMovedRef.current = false;
                                                        return;
                                                    }
                                                    onClose();
                                                }}
                                                className="group block"
                                            >
                                                <div className="relative aspect-[4/5] overflow-hidden bg-[#f7f4ef] mb-6">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        sizes="(max-width: 768px) 250px, 290px"
                                                        className="object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                                        draggable={false}
                                                    />
                                                </div>

                                                <div className="min-h-[42px] text-center px-2">
                                                    <p className="text-[10px] lg:text-[11px] uppercase tracking-[0.25em] text-neutral-900 line-clamp-2 leading-relaxed">
                                                        {product.name}
                                                    </p>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="w-full py-32 text-center">
                                        <div className="inline-block w-3 h-3 rounded-full bg-neutral-200 animate-pulse mb-4" />
                                        <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-300">
                                            Curating collection...
                                        </p>
                                    </div>
                                )}
                            </div>

                            {featuredProducts.length > 1 && (
                                <div className="absolute bottom-6 left-0 right-0 h-[1.5px] bg-neutral-100/50">
                                    <motion.div
                                        className="h-full w-32 bg-black origin-left"
                                        animate={{ x: `${scrollProgress * 0.75}%` }}
                                        transition={{ type: 'spring', stiffness: 220, damping: 38 }}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
