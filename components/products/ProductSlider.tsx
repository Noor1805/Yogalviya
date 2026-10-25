'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils/currency-utils';

interface ProductSliderProps {
  title: string;
  products: Product[];
  accentColor?: string;
}

export default function ProductSlider({ title, products, accentColor = '#000' }: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  if (!products.length) return null;

  return (
    <section className="py-10 border-t border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-5">
        <h2 className="text-[15px] font-extrabold uppercase tracking-tight text-gray-900">{title}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronRight className="w-4 h-4 rotate-180 text-gray-500" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Horizontal scroll row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.categorySlug}/${product.slug}`}
            className="flex-none w-[155px] group"
          >
            {/* Image */}
            <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-2.5">
              {product.heroImage ? (
                <Image
                  src={product.heroImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-active:scale-105"
                  sizes="155px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No Image</div>
              )}
              {/* Badge */}
              {product.badge && product.badge.trim() && (
                <span className="absolute top-2 left-2 bg-black text-white text-[8px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-sm">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Info */}
            <p className="text-[9.5px] uppercase tracking-[0.1em] text-gray-400 font-medium mb-0.5">{product.category}</p>
            <p className="text-[12.5px] font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">{product.name}</p>
            <p className="text-[13px] font-bold text-black">
              {formatCurrency(product.basePriceUSD || 0, 'USD')}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
