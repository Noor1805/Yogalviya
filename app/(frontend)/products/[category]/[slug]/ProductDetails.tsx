'use client';

import { useState, useEffect } from 'react';
import { Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency-utils';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { toast } from 'sonner';

// ── Types matching the DB model ────────────────────────────────
interface AttributeOption { name: string; values: string[] }
interface Variation {
  id: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stockCount: number;
  image?: string;
}
interface Specification { label: string; value: string }

interface ProductDetailsProps {
  productId: string;
  name: string;
  slug: string;
  categorySlug: string;
  heroImage: string;
  productType: 'simple' | 'variable';
  // Simple product
  price: number;
  compareAtPrice?: number;
  sku: string;
  stockCount: number;
  // Variable product
  attributes: AttributeOption[];
  variations: Variation[];
  // Description / Info / Reviews
  description?: string;
  shortDescription?: string;
  productDetails?: string;
  commitment?: string;
  additionalInfo?: string;
  specifications: Specification[];
  featured: boolean;
}

// ── Star Rating ────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn('w-3.5 h-3.5', s <= rating ? 'fill-[#C5A55A] text-[#C5A55A]' : 'fill-gray-200 text-gray-200')}
        />
      ))}
    </div>
  );
}

// ── Tab Section ────────────────────────────────────────────────
const DEMO_REVIEWS = [
  { id: 1, author: 'Priya S.', rating: 5, date: '2 days ago', text: 'Absolutely stunning quality. The craftsmanship is exceptional and it arrived beautifully packaged.' },
  { id: 2, author: 'Layla M.', rating: 5, date: '1 week ago', text: "I've been wearing this every day. It fits perfectly and the fabric is so luxurious." },
  { id: 3, author: 'Zara K.', rating: 4, date: '2 weeks ago', text: "Beautiful piece, true to size. Would love more color options!" },
];

function TabSection({
  description,
  shortDescription,
  productDetails,
  commitment,
  additionalInfo,
  specifications
}: {
  description?: string;
  shortDescription?: string;
  productDetails?: string;
  commitment?: string;
  additionalInfo?: string;
  specifications: Specification[]
}) {
  const [tab, setTab] = useState<'description' | 'info' | 'reviews'>('description');

  return (
    <div className="w-full mt-20 border-t border-gray-100">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-100">
        {(['description', 'info', 'reviews'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 relative',
              tab === t
                ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black'
                : 'text-gray-400 hover:text-gray-700'
            )}
          >
            {t === 'description' && 'Description'}
            {t === 'info' && 'Additional Information'}
            {t === 'reviews' && 'Reviews'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-16 max-w-3xl mx-auto px-4 text-center">
        {tab === 'description' && (
          <div className="space-y-12">
            {/* Big Description */}
            <div>
              <p className="text-[15px] text-gray-500 leading-loose font-serif italic">
                {description || 'Crafted for the modern woman who values refinement above all else.'}
              </p>
            </div>

            {/* Product Details & Commitment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left pt-8 border-t border-gray-50">
              {productDetails && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-black">Product Details</h4>
                  <p className="text-[12px] text-gray-500 leading-relaxed whitespace-pre-line">{productDetails}</p>
                </div>
              )}
              {commitment && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-black">Our Commitment</h4>
                  <p className="text-[12px] text-gray-500 leading-relaxed whitespace-pre-line">{commitment}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'info' && (
          <div className="text-left space-y-10">
            {additionalInfo && (
              <div className="mb-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-black">Additional Information</h4>
                <p className="text-[12px] text-gray-500 leading-relaxed whitespace-pre-line">{additionalInfo}</p>
              </div>
            )}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-black">Technical Specifications</h4>
              {specifications.length > 0 ? (
                <table className="w-full border-collapse">
                  <tbody>
                    {specifications.map((spec, i) => (
                      <tr key={i} className={cn('border-b border-gray-50', i % 2 === 0 && 'bg-gray-50/50')}>
                        <td className="py-3 px-4 text-[12px] font-medium text-gray-700 w-40">{spec.label}</td>
                        <td className="py-3 px-4 text-[12px] text-gray-500">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[11px] text-gray-400">No specifications provided.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="text-left flex gap-10">
            {/* Summary */}
            <div className="shrink-0 w-48 flex flex-col items-center border border-gray-100 rounded p-6">
              <p className="text-5xl font-light text-black">4.9</p>
              <StarRating rating={5} />
              <p className="text-[11px] text-gray-400 mt-2">Based on {DEMO_REVIEWS.length} Reviews</p>
              <button className="mt-4 w-full border border-black text-[10px] font-bold uppercase tracking-[0.2em] py-2.5 hover:bg-black hover:text-white transition-all duration-200">
                Write a Review
              </button>
            </div>

            {/* Review List */}
            <div className="flex-1 flex flex-col gap-6">
              {DEMO_REVIEWS.map((review) => (
                <div key={review.id} className="border-b border-gray-50 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-[11px] text-gray-400">{review.date}</span>
                  </div>
                  <p className="text-[13px] font-semibold text-black mb-1">Absolutely stunning quality!</p>
                  <p className="text-[12px] text-gray-500 leading-loose">{review.text}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                      {review.author.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-medium text-gray-700">{review.author}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Verified Buyer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function ProductDetails({
  productId,
  name,
  slug,
  categorySlug,
  heroImage,
  productType,
  price,
  compareAtPrice,
  sku,
  stockCount,
  attributes,
  variations,
  description,
  shortDescription,
  productDetails,
  commitment,
  additionalInfo,
  specifications,
}: ProductDetailsProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => setMounted(true), []);

  const addItemToCart = useCartStore((s) => s.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = mounted ? isInWishlist(productId) : false;

  // Find matching variation based on selected attributes
  const matchedVariation = productType === 'variable'
    ? variations.find((v) =>
        Object.entries(selectedAttrs).every(([k, val]) => v.attributes[k] === val)
      )
    : null;

  const currentPrice = matchedVariation ? matchedVariation.price : price;
  const currentSku = matchedVariation ? matchedVariation.sku : sku;
  const currentStock = matchedVariation ? matchedVariation.stockCount : stockCount;
  const inStock = currentStock > 0;

  const selectAttr = (attrName: string, value: string) => {
    setSelectedAttrs((prev) => ({ ...prev, [attrName]: value }));
  };

  const isColorAttr = (attrName: string) => {
    const n = attrName.toLowerCase();
    return n.includes('color') || n.includes('colour') || n.includes('coat');
  };

  const COLOR_MAP: Record<string, string> = {
    black: '#0a0a0a', white: '#f5f5f5', beige: '#d4b896', gold: '#c9a84c',
    brown: '#5c3d2e', navy: '#1a2744', grey: '#888888', gray: '#888888',
    red: '#c0392b', pink: '#e8a0a0', green: '#2d6a4f',
  };

  const handleAddToCart = () => {
    // If variable and not all attributes selected, warn
    if (productType === 'variable') {
      const missing = attributes.filter((a) => !selectedAttrs[a.name]);
      if (missing.length > 0) {
        toast.error(`Please select: ${missing.map(m => m.name).join(', ')}`);
        return;
      }
    }

    addItemToCart({
      productId,
      sku: currentSku,
      name,
      price: currentPrice,
      quantity,
      image: heroImage,
    });
    toast.success(`${name} added to bag`);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('open-cart'));
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeWishlist(productId);
      toast.success(`Removed from wishlist`);
    } else {
      addWishlist({ productId, sku: currentSku, name, price: currentPrice, image: heroImage, slug });
      toast.success(`Added to wishlist`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Season tag */}
      <span className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase">New Season</span>

      {/* Title */}
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 uppercase sm:text-4xl leading-tight">
        {name}
      </h1>

      {/* Price */}
      <div className="mt-5 flex items-baseline gap-3">
        <span className="text-2xl font-medium text-neutral-900 tracking-tight">
          {formatCurrency(currentPrice, 'USD')}
        </span>
        {(compareAtPrice || (matchedVariation?.compareAtPrice)) && (
          <span className="text-lg text-gray-400 line-through font-normal">
            {formatCurrency((matchedVariation?.compareAtPrice || compareAtPrice)!, 'USD')}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-neutral-400 leading-none">
        or 4 payments of {formatCurrency(currentPrice / 4, 'USD')} by{' '}
        <span className="font-bold underline text-neutral-600">afterpay</span>{' '}
        or <span className="font-bold text-neutral-600 underline">Klarna</span>
      </p>

      {/* Short Description */}
      {shortDescription && (
        <p className="mt-6 text-[13px] text-neutral-500 leading-relaxed max-w-md">
          {shortDescription}
        </p>
      )}

      {/* — Variable: Render attribute selectors — */}
      {productType === 'variable' && attributes.map((attr) => (
        <div key={attr.name} className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">
              {attr.name}
              {selectedAttrs[attr.name] && (
                <span className="ml-2 font-normal text-neutral-500 normal-case tracking-normal">
                  : {selectedAttrs[attr.name]}
                </span>
              )}
            </span>
          </div>

          {isColorAttr(attr.name) ? (
            /* Colour Swatches */
            <div className="flex flex-wrap gap-3">
              {attr.values.map((val) => {
                const hex = COLOR_MAP[val.toLowerCase()] ?? '#ccc';
                const selected = selectedAttrs[attr.name] === val;
                return (
                  <button
                    key={val}
                    title={val}
                    onClick={() => selectAttr(attr.name, val)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all duration-200',
                      selected ? 'border-black ring-2 ring-black ring-offset-2' : 'border-transparent hover:scale-110'
                    )}
                    style={{ backgroundColor: hex }}
                  />
                );
              })}
            </div>
          ) : (
            /* Size / Other Grid */
            <div className="flex flex-wrap gap-2">
              {attr.values.map((val) => {
                const selected = selectedAttrs[attr.name] === val;
                return (
                  <button
                    key={val}
                    onClick={() => selectAttr(attr.name, val)}
                    className={cn(
                      'min-w-[48px] px-3 h-11 border text-[11px] font-bold uppercase tracking-wide transition-all duration-200',
                      selected
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-neutral-200 hover:border-black hover:text-black'
                    )}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Quantity + Add to Bag + Wishlist */}
      <div className="mt-8 flex flex-col gap-3">
        {/* Quantity Counter */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">Qty</span>
          <div className="flex items-center border border-neutral-200">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-10 text-center text-[13px] font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          {!inStock && (
            <span className="text-[11px] font-medium text-red-500 uppercase tracking-wide">Out of Stock</span>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={cn(
              'flex-1 h-14 text-[12px] font-bold uppercase tracking-[0.25em] transition-all duration-200 flex items-center justify-center shadow-sm active:scale-[0.99]',
              inStock
                ? 'bg-black text-white hover:bg-neutral-900'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {inStock ? 'Add to Bag' : 'Out of Stock'}
          </button>

          {/* Wishlist */}
          <button
            onClick={toggleWishlist}
            className={cn(
              'w-14 h-14 border flex items-center justify-center transition-all duration-200 hover:border-black active:scale-95',
              isWishlisted ? 'border-black bg-black text-white' : 'border-neutral-200 text-gray-500 hover:text-black'
            )}
          >
            <Heart className={cn('w-5 h-5', isWishlisted && 'fill-white')} />
          </button>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="mt-8 space-y-3 border-t border-gray-100 pt-6">
        {[
          { icon: Truck, text: 'Complimentary express delivery on all orders' },
          { icon: RotateCcw, text: 'Free returns within 30 days' },
          { icon: ShieldCheck, text: 'Authenticity guaranteed on every piece' },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-center gap-3 text-[11px] text-neutral-500">
            <Icon className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={1.5} />
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* Tab Section (Description / Additional Info / Reviews) */}
      <TabSection
        description={description}
        specifications={specifications}
        shortDescription={shortDescription}
        productDetails={productDetails}
        commitment={commitment}
        additionalInfo={additionalInfo}
      />
    </div>
  );
}
