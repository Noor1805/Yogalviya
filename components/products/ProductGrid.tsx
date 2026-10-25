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
