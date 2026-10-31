import Link from 'next/link';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  hideDescription?: boolean;
  hidePrice?: boolean;
  hideMoq?: boolean;
}

export default function ProductGrid({
  products,
  hideDescription = false,
  hidePrice = false,
  hideMoq = true,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center bg-[#faf9f6] border border-[#e7e5df] rounded-[2px]">
        <h3
          className="text-[20px] font-normal text-[#1c211d] mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          No products match these filters.
        </h3>
        <p className="text-[13px] text-[#77766f] mb-6 max-w-sm">
          Try removing a filter or explore the full collection.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase hover:bg-[#35483a] transition-colors"
        >
          View All Essentials
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 lg:gap-x-12 lg:gap-y-20">
      {products.slice(0, 12).map((product, index) => (
        <ProductCard
         key={product.id}
          product={product}
          index={index}
          hideDescription={hideDescription}
          hidePrice={hidePrice}
          hideMoq={hideMoq}
          badge={product.badge}
          stockLeft={product.stockLeft}
        />
      ))}
    </div>
  );
}
