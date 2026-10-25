"use client";

import Container from "@/components/layout/Container";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/product";

interface RecommendationSectionProps {
  products: Product[];
}

export default function RecommendationSection({ products }: RecommendationSectionProps) {
  return (
    <section className="py-24 bg-white">
      <Container className="max-w-[1440px]">
        {/* Heading */}
        <h2
          className="text-center font-black uppercase text-black mb-16"
          style={{
            fontSize: "clamp(32px, 5vw, 64px)",
            letterSpacing: "-0.02em",
          }}
        >
          RECOMMENDATION
        </h2>

        {/* 4 dynamic product cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.slice(0, 4).map((product, idx) => (
            <ProductCard key={`rec-${product.id}-${idx}`} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
