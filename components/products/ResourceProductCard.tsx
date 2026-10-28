'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';

interface ProductCardProps {
    id: string;
    name: string;
    slug: string;
    categorySlug: string;
    shortDescription?: string;
    priceINR: number;
    image: string;
    badge?: string;
}

export default function ResourceProductCard({
    id,
    name,
    slug,
    categorySlug,
    shortDescription,
    priceINR,
    image,
    badge,
}: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const [added, setAdded] = useState(false);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        addItem({
            productId: id,
            sku: slug.toUpperCase(),
            name: name,
            price: priceINR,
            image: image,
            quantity: 1,
        });

        setAdded(true);
        toast.success(`Added ${name} to your bag`);
        setTimeout(() => setAdded(false), 1400);
    };

    return (
        <div className="group relative flex flex-col min-w-0 transition-transform duration-200">
            {/* Image Container */}
            <Link
                href={`/products/${categorySlug || 'yoga-props'}/${slug}`}
                className="relative aspect-square w-full overflow-hidden bg-[#f0efea] rounded-[2px] block"
            >
                {badge && (
                    <span className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-[#1c211d] shadow-sm uppercase">
                        {badge}
                    </span>
                )}

                <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                    }}
                />
            </Link>

            {/* Product Info & Quick Buy Button Row */}
            <div className="flex items-center justify-between gap-2.5 mt-3 min-w-0">
                <Link
                    href={`/products/${categorySlug || 'yoga-props'}/${slug}`}
                    className="flex-1 min-w-0 hover:text-[#26352b] transition-colors"
                >
                    <h3 
                        className="text-[14.5px] sm:text-[15px] text-[#1c211d] font-normal truncate leading-tight"
                        style={{ fontFamily: 'Georgia, serif' }}
                    >
                        {name}
                    </h3>
                </Link>

                {/* Quick Add Button */}
                <button
                    type="button"
                    onClick={handleQuickAdd}
                    aria-label={`Add ${name} to bag`}
                    title="Add to bag"
                    className={`flex-none h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                        added
                            ? 'bg-[#26352b] text-white scale-95'
                            : 'bg-[#e9e9dc] text-[#26352b] hover:bg-[#d9ddca] hover:-translate-y-0.5'
                    }`}
                >
                    {added ? (
                        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                            <path d="m5 12 4 4L19 6" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                            <path d="M5 8h14l-1 13H6L5 8Z" />
                            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Description Subtitle */}
            {shortDescription && (
                <p className="text-[11px] text-[#77766f] mt-0.5 truncate">
                    {shortDescription}
                </p>
            )}

            {/* Price */}
            <p className="text-[12.5px] font-medium text-[#1c211d] mt-1">
                ₹{priceINR.toLocaleString('en-IN')}
            </p>
        </div>
    );
}
