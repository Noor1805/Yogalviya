"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";
import Counter from "@/components/ui/Counter";

interface OurProductProps {
  products: Product[];
}

export default function OurProduct({ products }: OurProductProps) {
  const categoryFilters = useMemo(
    () => ["ALL", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const [active, setActive] = useState("ALL");
  const filtered =
    active === "ALL"
      ? products
      : products.filter((product) => product.category === active);

  // Pad to multiple of 4 to avoid empty gaps in the UI
  const paddedProducts = useMemo(() => {
    if (filtered.length === 0) return [];
    const padded = [...filtered];
    if (padded.length < 12) {
        let idx = 0;
        while (padded.length < 12) {
            padded.push(filtered[idx % filtered.length]);
            idx++;
        }
    }
    return padded;
  }, [filtered]);

  const featuredProducts = paddedProducts.slice(0, 3);
  const bottomProducts = paddedProducts.slice(8, 12);

  return (
    <section className="bg-white py-24">
      <Container className="max-w-[1440px]">

        {/* Heading */}
        <h2
          className="text-center font-black uppercase text-black mb-12"
          style={{ fontSize: "clamp(36px, 6vw, 72px)", letterSpacing: "-0.02em" }}
        >
          CURATED FOR YOU
        </h2>

        {/* Filter tabs */}
        <div className="flex justify-center flex-wrap gap-3 mb-16">
          {categoryFilters.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setActive(filter)}
              className={`px-5 py-2 min-h-[44px] text-[11px] font-bold uppercase tracking-[0.15em] border transition-all duration-300 touch-manipulation ${
                active === filter
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Row 1 — first 4 products */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 mb-16">
          {paddedProducts.slice(0, 4).map((product, idx) => (
            <ProductCard key={`${product.id}-${idx}-1`} product={product} />
          ))}
        </div>

        {/* Row 2 — next 4 products */}
        {paddedProducts.length >= 8 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 mb-20">
            {paddedProducts.slice(4, 8).map((product, idx) => (
              <ProductCard key={`${product.id}-${idx}-2`} product={product} />
            ))}
          </div>
        )}

        {/* ═══════════════ PERFECT MATCH SECTION ═══════════════ */}
        <div className="w-full mb-32 overflow-hidden border-y border-gray-100 relative py-12 md:py-0 bg-white">
          <div className="max-w-[1440px] mx-auto relative px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center min-h-auto md:min-h-[600px] gap-10 md:gap-0">
              {/* LEFT IMAGE CONTAINER (HIDDEN ON MOBILE, VISIBLE ON TABLET/DESKTOP) */}
              <div className="hidden md:block relative w-[46%] shrink-0">
                <div
                  className="relative w-full h-[320px] sm:h-[420px] md:h-[560px] lg:h-[620px] overflow-hidden"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 60px), calc(100% - 60px) 100%, 0 100%)",
                  }}
                >
                  <Image
                    src="/images/product/perfect.jpg"
                    alt="Perfect Match"
                    fill
                    className="object-cover grayscale"
                  />
                </div>

                {/* BOTTOM STAR (MATCHED TO 60PX CUT) */}
                <span className="absolute bottom-[-50px] md:bottom-[-90px] lg:bottom-[-130px] right-[-20px] md:right-[-40px] lg:right-[-90px] text-[80px] md:text-[220px] lg:text-[340px] font-black text-black leading-none z-[50] pointer-events-none">
                  *
                </span>
              </div>

              {/* RIGHT CONTENT (CENTERED ON MOBILE, LEFT-ALIGNED ON TABLET/DESKTOP) */}
              <div className="flex-1 md:pl-14 lg:pl-20 pr-0 md:pr-4 z-20 text-center md:text-left flex flex-col items-center md:items-start">
                {/* HEADING (BALANCED FLUID SCALING) */}
                <h2
                  className="font-black uppercase text-black leading-[0.8] tracking-[-0.05em]"
                  style={{
                    fontSize: "clamp(72px, 9vw, 130px)",
                  }}
                >
                  PERFECT <br />
                  MATCH
                </h2>

                {/* DESCRIPTION (LONGER CONTENT + BETTER SCALING) */}
                <p className="mt-6 md:mt-8 text-[13px] md:text-[15px] text-gray-500 leading-relaxed w-[80%] md:max-w-[460px] italic font-serif">
                  An editorial curation of sculpted tailoring, elevated essentials, and statement accessories composed for a wardrobe of lasting distinction. From precise cuts to tactile finishes, each piece carries the quiet confidence of true luxury.
                </p>

                {/* STATS (CENTERED GRID ON MOBILE) */}
                <div className="grid grid-cols-2 md:flex md:justify-between w-full max-w-[520px] mt-8 md:mt-12 gap-x-8 gap-y-8 md:gap-x-4">
                  {[
                    { value: 700, suffix: "+", label: "Pieces" },
                    { value: 8, suffix: "", label: "Categories" },
                    { value: 5, suffix: "+", label: "Collaborations" },
                    { value: 380, suffix: "", label: "Curations" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center md:items-start shrink-0">
                      <p className="text-[24px] md:text-[26px] lg:text-[30px] font-black text-black leading-none">
                        <Counter end={stat.value} suffix={stat.suffix} replayOnView />
                      </p>
                      <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-1.5">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 4 products */}
        {bottomProducts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {bottomProducts.map((product, idx) => (
              <ProductCard key={`bottom-${product.id}-${idx}`} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
