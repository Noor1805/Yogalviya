'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  buildVariantImageSet,
  findBestMediaVariation,
} from '@/lib/utils/product-variant-selection';

interface Variation {
  id: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stockCount: number;
  image?: string;
  gallery?: string[];
}

interface ProductGalleryStableProps {
  heroImage: string;
  images: string[];
  name: string;
  featured: boolean;
  inStock: boolean;
  productType?: 'simple' | 'variable';
  variations?: Variation[];
  selectedAttributes?: Record<string, string>;
}

export default function ProductGalleryStable({
  heroImage,
  images,
  name,
  productType,
  variations,
  selectedAttributes,
}: ProductGalleryStableProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const mediaVariation = useMemo(() => {
    if (productType !== 'variable') {
      return null;
    }

    return findBestMediaVariation(variations, selectedAttributes);
  }, [productType, selectedAttributes, variations]);

  const allImages = useMemo(() => {
    return buildVariantImageSet({
      heroImage,
      images,
      mediaVariation,
    });
  }, [heroImage, images, mediaVariation]);

  useEffect(() => {
    setActiveIdx(0);
  }, [mediaVariation?.id]);

  const handleSelect = useCallback((idx: number) => setActiveIdx(idx), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    allImages.slice(1).forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F4F4F4]">
        {allImages.map((src, idx) => (
          <div
            key={src}
            className={cn(
              'absolute inset-0 transition-opacity',
              activeIdx === idx ? 'opacity-100 duration-0' : 'opacity-0 duration-150'
            )}
            aria-hidden={activeIdx !== idx}
          >
            <Image
              src={src}
              alt={idx === 0 ? name : `${name} view ${idx + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={idx === 0}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {allImages.length > 1 && (
        <div className="grid grid-cols-3 gap-1.5">
          {allImages.slice(1, 4).map((src, i) => {
            const idx = i + 1;

            return (
              <button
                key={src}
                onClick={() => handleSelect(idx)}
                className={cn(
                  'relative w-full overflow-hidden bg-[#F4F4F4] transition-all duration-150',
                  activeIdx === idx
                    ? 'ring-1 ring-black opacity-100'
                    : 'opacity-60 hover:opacity-90'
                )}
                style={{ aspectRatio: '4/3' }}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={src}
                  alt={`${name} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 33vw, 200px"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
