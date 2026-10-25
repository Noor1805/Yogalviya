'use client';

import { useState, useSyncExternalStore, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Minus, Plus, ChevronDown, Truck, Store, ShieldCheck, Banknote, ShoppingBag, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency, formatCurrency } from '@/lib/utils/currency';
import {
  findBestMatchingVariation,
  findBestMediaVariation,
  getPrimaryVariantImage,
} from '@/lib/utils/product-variant-selection';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { toast } from 'sonner';

interface AttributeOption {
  name: string;
  values: string[];
  colorValues?: Record<string, string>;
}

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

interface ProductActionsProps {
  productId: string;
  name: string;
  slug: string;
  heroImage: string;
  productType: 'simple' | 'variable';
  price: number;
  compareAtPrice?: number;
  sku: string;
  stockCount: number;
  attributes: AttributeOption[];
  variations: Variation[];
  description?: string;
  productDetails?: string;
  commitment?: string;
  onVariantChange?: (attrs: Record<string, string>) => void;
}

const emptySubscribe = (() => () => {}) as (onStoreChange: () => void) => () => void;

const COLOR_MAP: Record<string, string> = {
  black: '#0a0a0a',
  white: '#ffffff',
  ivory: '#f5f0e8',
  stone: '#cfc7bc',
  taupe: '#b5a49a',
  beige: '#d4c5b0',
  cream: '#f5f0e1',
  gold: '#c9a84c',
  brown: '#5c3d2e',
  navy: '#1a2744',
  grey: '#888888',
  gray: '#888888',
  red: '#c0392b',
  pink: '#e8a0a0',
  green: '#2d6a4f',
  blue: '#3b5998',
  silver: '#c0c0c0',
};

const isColorAttribute = (name: string) => {
  const n = name.toLowerCase();
  return n.includes('color') || n.includes('colour') || n.includes('coat');
};

// Accordion section for the right panel
function AccordionItem({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-900">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function ProductActions({
  productId,
  name,
  slug,
  heroImage,
  productType,
  price,
  compareAtPrice,
  sku,
  stockCount,
  attributes,
  variations,
  description,
  productDetails,
  commitment,
  onVariantChange,
}: ProductActionsProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { currency } = useCurrency();

  const addItemToCart = useCartStore((state) => state.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = mounted ? isInWishlist(productId) : false;

  const matchedVariation = useMemo(
    () =>
      productType === 'variable' && attributes.every((attribute) => !!selectedAttrs[attribute.name])
        ? findBestMatchingVariation(variations, selectedAttrs)
        : null,
    [attributes, productType, selectedAttrs, variations]
  );

  const mediaVariation = useMemo(
    () =>
      productType === 'variable'
        ? findBestMediaVariation(variations, selectedAttrs)
        : null,
    [productType, selectedAttrs, variations]
  );

  const currentPrice = matchedVariation?.price ?? price;
  const currentCompareAtPrice = matchedVariation?.compareAtPrice ?? compareAtPrice;
  const currentSku = matchedVariation?.sku || sku || productId;
  const currentStock = matchedVariation?.stockCount ?? stockCount;
  const currentImage = getPrimaryVariantImage({
    heroImage,
    mediaVariation,
    fallbackVariation: matchedVariation,
  });
  const inStock = currentStock > 0;

  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedAttrs);
    }
  }, [selectedAttrs, onVariantChange]);

  const isValueAvailable = (attrName: string, value: string) => {
    if (productType !== 'variable' || !variations.length) return true;
    const otherSelected = Object.entries(selectedAttrs).filter(([key]) => key !== attrName);
    return variations.some((variation) => {
      const currentVarAttrKey = Object.keys(variation.attributes).find(k => k.toLowerCase() === attrName.toLowerCase());
      if (!currentVarAttrKey) return false;
      if (variation.attributes[currentVarAttrKey]?.toString().toLowerCase() !== value.toLowerCase()) return false;
      return otherSelected.every(([key, val]) => {
        const varAttrKey = Object.keys(variation.attributes).find(k => k.toLowerCase() === key.toLowerCase());
        if (!varAttrKey) return false;
        return variation.attributes[varAttrKey]?.toString().toLowerCase() === val.toLowerCase();
      });
    });
  };

  const validateVariants = () => {
    if (productType === 'variable') {
      const missing = attributes.filter((attribute) => !selectedAttrs[attribute.name]);
      if (missing.length > 0) {
        toast.error(`Please select: ${missing.map((attribute) => attribute.name).join(', ')}`);
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateVariants()) return;
    addItemToCart({
      productId,
      sku: currentSku,
      name,
      price: currentPrice,
      quantity,
      image: currentImage,
    });
    toast.success(`${name} added to bag`);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('open-cart'));
  };

  // Buy Now: add to cart then go straight to checkout
  const handleBuyNow = () => {
    if (!validateVariants()) return;
    addItemToCart({
      productId,
      sku: currentSku,
      name,
      price: currentPrice,
      quantity,
      image: currentImage,
    });
    router.push('/checkout');
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeWishlist(productId);
      toast.success('Removed from wishlist');
      return;
    }
    addWishlist({
      productId,
      sku: currentSku,
      name,
      price: currentPrice,
      image: currentImage,
      slug,
    });
    toast.success('Added to wishlist');
  };

  return (
    <>
      <div className="mt-6 flex flex-col">
        {/* Price */}
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-medium text-[#26352b] font-mono">
            {formatCurrency(currentPrice, currency)}
          </span>
          {currentCompareAtPrice && (
            <span className="text-lg text-gray-400 line-through font-normal font-mono">
              {formatCurrency(currentCompareAtPrice, currency)}
            </span>
          )}
        </div>

        {/* Variant selectors */}
        {productType === 'variable' && attributes.length > 0 && (
          <div className="mt-6 space-y-5">
            {attributes.map((attribute) => (
              <div key={attribute.name}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[12px] font-medium text-neutral-900">
                    {isColorAttribute(attribute.name) ? 'Product Color' : 'Product Size'}{selectedAttrs[attribute.name] ? ':' : ''}
                  </span>
                  {selectedAttrs[attribute.name] && (
                    <span className="text-[12px] text-neutral-600">{selectedAttrs[attribute.name]}</span>
                  )}
                  {!isColorAttribute(attribute.name) && (
                    <button className="ml-auto text-[11px] underline text-neutral-500 hover:text-neutral-900">
                      Size Chart
                    </button>
                  )}
                </div>

                {isColorAttribute(attribute.name) ? (
                  <div className="flex gap-3">
                    {attribute.values.map((value) => {
                      const selected = selectedAttrs[attribute.name] === value;
                      const available = isValueAvailable(attribute.name, value);
                      const colorHex = attribute.colorValues?.[value] ?? COLOR_MAP[value.toLowerCase()] ?? '#d4d4d4';
                      const isLightColor = ['white', 'ivory', 'cream', 'silver'].includes(value.toLowerCase());
                      return (
                        <button
                          key={value}
                          type="button"
                          title={value}
                          onClick={() => available && setSelectedAttrs((prev) => ({ ...prev, [attribute.name]: value }))}
                          disabled={!available}
                          className={cn(
                            'relative h-11 w-11 rounded-full transition-all duration-200 touch-manipulation',
                            selected && 'ring-2 ring-black ring-offset-2',
                            !available && 'opacity-30 cursor-not-allowed'
                          )}
                        >
                          <span
                            className={cn('absolute inset-[3px] rounded-full', isLightColor && 'border border-neutral-200')}
                            style={{ backgroundColor: colorHex }}
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attribute.values.map((value) => {
                      const selected = selectedAttrs[attribute.name] === value;
                      const available = isValueAvailable(attribute.name, value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => available && setSelectedAttrs((prev) => ({ ...prev, [attribute.name]: value }))}
                          disabled={!available}
                          className={cn(
                            'min-w-[48px] h-11 px-3 text-[11px] font-medium tracking-wide transition-all duration-200 touch-manipulation active:scale-95',
                            selected
                              ? 'bg-black text-white border border-black'
                              : !available
                              ? 'bg-neutral-100 text-neutral-300 border border-neutral-100 cursor-not-allowed'
                              : 'bg-white text-neutral-700 border border-neutral-300 hover:border-black hover:text-black'
                          )}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quantity + Add to Bag (desktop only) */}
        <div className="mt-6 hidden lg:block">
          {inStock && (
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">Qty</span>
              <div className="flex items-center border border-neutral-300">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center text-neutral-400 hover:text-black transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center text-neutral-400 hover:text-black transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop: Add to Bag + Wishlist + Buy Now */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className={cn(
                  'flex-1 h-12 text-[11px] font-bold uppercase tracking-[0.2em] transition-all',
                  inStock
                    ? 'bg-[#26352b] text-white hover:bg-[#35483a]'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                )}
              >
                {inStock ? 'Add to Bag' : 'Out of Stock'}
              </button>
              <button
                type="button"
                onClick={toggleWishlist}
                className={cn(
                  'flex h-12 w-12 items-center justify-center border transition-all',
                  isWishlisted
                    ? 'bg-[#26352b] border-[#26352b] text-white'
                    : 'border-neutral-300 text-neutral-400 hover:border-[#26352b] hover:text-[#26352b]'
                )}
              >
                <Heart className={cn('h-4 w-4', isWishlisted && 'fill-white')} />
              </button>
            </div>
            {/* Buy Now — desktop */}
            {inStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full h-12 border-2 border-[#26352b] text-[#26352b] text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#26352b] hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Zap className="h-3.5 w-3.5" />
                Buy Now
              </button>
            )}
          </div>
        </div>

        {/* Mobile: Qty shown inline (small), full CTA bar is sticky at bottom of screen */}
        <div className="mt-4 lg:hidden">
          {inStock && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">Qty</span>
              <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center text-neutral-400 active:bg-gray-100 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center text-neutral-400 active:bg-gray-100 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-neutral-200 pt-5">
          <div className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Free Express Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <Store className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Click & Collect</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">100% Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Cash on Delivery</span>
          </div>
        </div>

        {/* Accordion sections */}
        <div className="mt-6 space-y-0">
          <AccordionItem title="Product Description" defaultOpen={false}>
            {description && (
              <p className="text-[12px] text-neutral-600 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            )}
          </AccordionItem>
          <AccordionItem title="Product Details">
            {productDetails ? (
              <p className="text-[12px] text-neutral-600 leading-relaxed whitespace-pre-line">
                {productDetails}
              </p>
            ) : null}
          </AccordionItem>
          <AccordionItem title="Our Commitment">
            {commitment ? (
              <p className="text-[12px] text-neutral-600 leading-relaxed whitespace-pre-line">
                {commitment}
              </p>
            ) : null}
          </AccordionItem>
        </div>
      </div>

      {/* ─── Mobile Sticky Bottom CTA Bar ─── sits at the very bottom now */}
      <div
        className="lg:hidden fixed left-0 right-0 bottom-0 z-[60] bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Wishlist icon */}
          <button
            type="button"
            onClick={toggleWishlist}
            className={cn(
              'flex-none w-12 h-12 rounded-xl border-2 flex items-center justify-center active:scale-90 transition-all duration-150',
              isWishlisted
                ? 'bg-black border-black text-white'
                : 'border-gray-200 text-gray-400'
            )}
          >
            <Heart className={cn('h-5 w-5', isWishlisted && 'fill-white')} />
          </button>

          {/* Add to Cart icon button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={cn(
              'flex-none w-12 h-12 rounded-xl border-2 flex items-center justify-center active:scale-90 transition-all duration-150',
              inStock
                ? 'border-black text-black bg-white'
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            )}
          >
            <ShoppingBag className="h-5 w-5" />
          </button>

          {/* Buy Now — full width */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!inStock}
            className={cn(
              'flex-1 h-12 rounded-xl text-[13px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150',
              inStock
                ? 'bg-[#26352b] text-white hover:bg-[#35483a]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            <Zap className="h-4 w-4" />
            {inStock ? 'Buy Now' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </>
  );
}
