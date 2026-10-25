'use client';

import { useState } from 'react';
import ProductGalleryStable from './ProductGalleryStable';
import ProductActions from './ProductActions';

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

interface ProductClientWrapperProps {
  product: {
    id: string;
    name: string;
    slug: string;
    heroImage: string;
    images: string[];
    featured: boolean;
    inStock: boolean;
    productType: 'simple' | 'variable';
    price: number;
    compareAtPrice?: number;
    sku: string;
    stockCount: number;
    attributes: Array<{ name: string; values: string[]; colorValues?: Record<string, string> }>;
    variations: Variation[];
    description?: string;
    shortDescription?: string;
    productDetails?: string;
    commitment?: string;
    additionalInfo?: Array<{ label: string; value: string }>;
  };
}

export default function ProductClientWrapper({ product }: ProductClientWrapperProps) {
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});

  return (
    <>
      {/* LEFT — Gallery */}
      <ProductGalleryStable
        heroImage={product.heroImage}
        images={product.images}
        name={product.name}
        featured={product.featured}
        inStock={product.inStock}
        productType={product.productType}
        variations={product.variations}
        selectedAttributes={selectedAttrs}
      />

      {/* RIGHT — Info Panel */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase">
          New Season
        </span>
        <h1 className="mt-2 text-[22px] font-semibold tracking-tight text-neutral-900 leading-tight">
          {product.name}
        </h1>

        <ProductActions
          productId={product.id}
          name={product.name}
          slug={product.slug}
          heroImage={product.heroImage}
          productType={product.productType}
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          sku={product.sku}
          stockCount={product.stockCount}
          attributes={product.attributes}
          variations={product.variations}
          description={product.description}
          productDetails={product.productDetails}
          commitment={product.commitment}
          onVariantChange={setSelectedAttrs}
        />
      </div>
    </>
  );
}
