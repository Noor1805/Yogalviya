'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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

interface ProductGalleryProps {
  heroImage: string;
  images: string[];
  name: string;
  featured: boolean;
  inStock: boolean;
  productType?: 'simple' | 'variable';
  variations?: Variation[];
  selectedAttributes?: Record<string, string>;
}

export default function ProductGallery({
  heroImage,
  images,
  name,
  productType,
  variations,
  selectedAttributes,
}: ProductGalleryProps) {
  // ── 1. Derive matched variation ──────────────────────────────────────────
  const matchedVariation = useMemo(() => {
    if (
      productType !== 'variable' ||
      !variations?.length ||
      !selectedAttributes ||
      Object.keys(selectedAttributes).length === 0
    ) return null;

    return (
      variations
        .filter((v) =>
          Object.entries(selectedAttributes).every(([key, value]) => {
            const k = Object.keys(v.attributes).find(
              (vk) => vk.toLowerCase() === key.toLowerCase()
            );
            return k && v.attributes[k]?.toString().toLowerCase() === value.toLowerCase();
          })
        )
        .sort((a, b) => Object.keys(b.attributes).length - Object.keys(a.attributes).length)[0] || null
    );
  }, [productType, variations, selectedAttributes]);

  // ── 2. Build the full deduplicated image list ────────────────────────────
  const allImages = useMemo(() => {
    const base = [...new Set([heroImage, ...images].filter(Boolean))];
    const varImgs = [
      matchedVariation?.image,
      ...(matchedVariation?.gallery || []),
    ].filter(Boolean) as string[];
    const uniqueVariationImages = [...new Set(varImgs)];

    if (uniqueVariationImages.length > 0) {
      return uniqueVariationImages.slice(0, 4);
    }

    if (base.length === 0 && heroImage) {
      base.push(heroImage);
    }

    return base.slice(0, 4);
  }, [heroImage, images, matchedVariation]);

  // ── 3. Active index — reset to 0 when variation set changes ─────────────
  const [activeIdx, setActiveIdx] = useState(0);

  // When the image set changes due to a variant switch, jump to slot 0
  const prevVariationRef = useMemo(() => ({ id: matchedVariation?.id }), [matchedVariation]);
  useEffect(() => {
    setActiveIdx(0);
  }, [prevVariationRef.id]);

  const handleSelect = useCallback((idx: number) => setActiveIdx(idx), []);

  // Swipe support for mobile so gallery still works on real touch devices.
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 40;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchEndX.current = null;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setActiveIdx((prev) => Math.min(prev + 1, allImages.length - 1));
    } else if (isRightSwipe) {
      setActiveIdx((prev) => Math.max(prev - 1, 0));
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }, [allImages.length]);

  // ── 4. Preload all variation images on mount so swap is instant ──────────
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
  }, []); // Only on mount — gallery images don't change during session

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* ── Main Image Container ── */}
      {/*
        KEY PERF FIX: Instead of changing `src` (unmounts/remounts the <img>
        and causes a network fetch), we stack ALL images on top of each other
        and only toggle visibility via opacity. This way every image is already
        in the browser's decoded image cache after the first render.
      */}
      <div
        className="relative w-full aspect-[3/4] overflow-hidden bg-[#F4F4F4] touch-manipulation select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {allImages.map((src, idx) => (
          <div
            key={src}
            className={cn(
              'absolute inset-0 transition-opacity',
              // Active image: instant show (no fade delay). Outgoing: 150 ms fade.
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

      {/* ── Thumbnail Strip ── */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-3 gap-1.5">
          {allImages.slice(1, 4).map((src, i) => {
            const idx = i + 1;
            return (
              <button
                type="button"
                key={src}
                onClick={() => handleSelect(idx)}
                className={cn(
                  'relative w-full overflow-hidden bg-[#F4F4F4] transition-all duration-150 touch-manipulation',
                  activeIdx === idx
                    ? 'ring-1 ring-black opacity-100'
                    : 'opacity-60 active:opacity-90 lg:hover:opacity-90'
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
