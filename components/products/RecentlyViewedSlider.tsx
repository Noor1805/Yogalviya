'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils/currency-utils';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 12;

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  category: string;
  heroImage: string;
  basePriceUSD: number;
  badge?: string;
  viewedAt: number;
}

// ── Hook to manage recently viewed state ─────────────────────────────────────
export function useRecentlyViewed() {
  const get = (): RecentlyViewedProduct[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const add = (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => {
    try {
      const current = get().filter((p) => p.id !== product.id);
      const updated = [{ ...product, viewedAt: Date.now() }, ...current].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore localStorage errors
    }
  };

  return { get, add };
}

// ── Tracker component — call on product page mount ───────────────────────────
interface RecentlyViewedTrackerProps {
  product: Omit<RecentlyViewedProduct, 'viewedAt'>;
}

export function RecentlyViewedTracker({ product }: RecentlyViewedTrackerProps) {
  const { add } = useRecentlyViewed();

  useEffect(() => {
    add(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return null;
}

// ── Slider display component ─────────────────────────────────────────────────
interface RecentlyViewedSliderProps {
  excludeId?: string;
}

export default function RecentlyViewedSlider({ excludeId }: RecentlyViewedSliderProps) {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const all: RecentlyViewedProduct[] = raw ? JSON.parse(raw) : [];
      const filtered = all.filter((p) => p.id !== excludeId).slice(0, 10);
      setProducts(filtered);
    } catch {
      setProducts([]);
    }
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="py-10 border-t border-gray-100">
      <div className="px-4 mb-5">
        <h2 className="text-[15px] font-extrabold uppercase tracking-tight text-gray-900">Recently Viewed</h2>
        <p className="text-[11px] text-gray-400 mt-0.5">Your browsing history</p>
      </div>

      <div
        className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.categorySlug}/${product.slug}`}
            className="flex-none w-[130px] group"
          >
            {/* Image */}
            <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-2">
              {product.heroImage ? (
                <Image
                  src={product.heroImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-active:scale-105"
                  sizes="130px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No Image</div>
              )}
            </div>
            <p className="text-[12px] font-semibold text-gray-900 leading-snug line-clamp-1 mb-0.5">{product.name}</p>
            <p className="text-[12px] font-bold text-black">{formatCurrency(product.basePriceUSD || 0, 'USD')}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
