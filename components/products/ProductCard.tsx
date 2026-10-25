'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrency, formatCurrency } from '@/lib/utils/currency';
import { getStartingPrice, getPriceRange } from '@/lib/utils/pricing';
import { Product } from '@/types/product';
import { Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
  hideDescription?: boolean;
  hidePrice?: boolean;
  hideMoq?: boolean;
  badge?: string;
  stockLeft?: number;
}

const emptySubscribe = (() => () => {}) as (onStoreChange: () => void) => () => void;

export default function ProductCard({
  product,
  index = 0,
  hidePrice = false,
  badge: propBadge,
  stockLeft,
}: ProductCardProps) {
  const { currency } = useCurrency();
  const startingPrice = getStartingPrice(product, currency);

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const addItemToCart = useCartStore((state) => state.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();

  const isWishlisted = mounted ? isInWishlist(product.id) : false;
  const badge = propBadge || (product.badge && product.badge.trim() ? product.badge : undefined);

  const handleQuickAdd = (e: React.MouseEvent) => {
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
    toast.success(`Added ${product.name} to bag`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('open-cart'));
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeWishlist(product.id);
      toast.success(`Removed ${product.name} from wishlist`);
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
      toast.success(`Added ${product.name} to wishlist`);
    }
  };

  const hoverImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img !== product.heroImage) || product.images[0]
      : null;

  return (
    <div className="group block relative w-full">
      {/* Image Container with Warm Tone Background & Rounded Border */}
      <div className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden bg-[#e9e4d8] rounded-[2px] mb-3">
        <Link
          href={`/products/${product.categorySlug}/${product.slug}`}
          className="block w-full h-full relative"
        >
          {product.heroImage ? (
            <>
              <Image
                src={product.heroImage}
                alt={product.name}
                fill
                priority={index < 4}
                className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                  hoverImage ? 'group-hover:opacity-0' : ''
                }`}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} gallery view`}
                  fill
                  className="object-cover absolute inset-0 opacity-0 scale-100 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-[#e9e4d8] text-xs">
              Yoglivya
            </div>
          )}
        </Link>

        {/* Badge Overlay */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/95 backdrop-blur-sm text-[#1c211d] text-[9px] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 shadow-sm">
              {badge}
            </span>
          </div>
        )}

        {/* Wishlist Icon */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:bg-white hover:scale-110 active:scale-95 shadow-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isWishlisted ? 'fill-[#26352b] text-[#26352b]' : 'text-[#1c211d] hover:text-[#26352b]'
            }`}
          />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-center pointer-events-none z-10">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="pointer-events-auto w-full py-2.5 px-4 bg-[#26352b]/95 hover:bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
          >
            <span>Add to Bag</span>
            <span>+</span>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col mt-2.5">
        <Link href={`/products/${product.categorySlug}/${product.slug}`}>
          <h3
            className="text-[15px] text-[#1c211d] hover:text-[#26352b] leading-tight font-normal transition-colors"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {product.name}
          </h3>
        </Link>

        {!hidePrice && (
          <p className="text-[13px] font-medium text-[#26352b] mt-1.5 font-mono">
            {(() => {
              const range = getPriceRange(product, currency);
              if (range.hasRange) {
                return `${formatCurrency(range.min, currency)} - ${formatCurrency(range.max, currency)}`;
              }
              return formatCurrency(startingPrice, currency);
            })()}
          </p>
        )}

        {stockLeft !== undefined && stockLeft > 0 && stockLeft <= 5 && (
          <p className="text-[10px] text-[#c88f70] mt-1">
            Only {stockLeft} left in stock
          </p>
        )}
      </div>
    </div>
  );
}
