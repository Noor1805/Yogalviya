export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import ProductCard from '@/components/products/ProductCard';
import { getAllProducts, getAllCategories } from '@/data/products';
import ProductsClient from './ProductsClient';

interface ProductsPageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

const FALLBACK_CATEGORIES = [
  {
    name: 'Yoga Props',
    slug: 'yoga-props',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Yoga Mats',
    slug: 'yoga-mats',
    image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Meditation',
    slug: 'meditation',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Wellness',
    slug: 'wellness',
    image: 'https://images.unsplash.com/photo-1608248597359-54848039d678?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80',
  },
];

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [params, allProducts, categories] = await Promise.all([
    searchParams,
    getAllProducts(),
    getAllCategories(),
  ]);
  const initialSearch = params.search || '';
  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const featuredProducts = allProducts.filter((product) => product.featured);
  const bestSellers = (featuredProducts.length > 0 ? featuredProducts : allProducts).slice(0, 5);
  const heroImage = allProducts.find((product) => product.heroImage)?.heroImage || '/images/heroimage.png';
  const promoCategories = displayCategories.slice(0, 3);

  const getCategoryImage = (slug: string, index: number, image?: string) =>
    image ||
    allProducts.find((product) => product.categorySlug === slug && product.heroImage)?.heroImage ||
    FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length].image;

  return (
    <div className="bg-white">
      <Container className="pt-5 sm:pt-8">
        <section className="relative isolate min-h-[400px] overflow-hidden bg-[#d7d0c5] sm:min-h-[480px] lg:min-h-[540px]">
          <Image
            src={heroImage}
            alt="Explore the latest collection"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />
          <div className="relative flex min-h-[400px] items-center px-7 py-12 text-white sm:min-h-[480px] sm:px-12 lg:min-h-[540px] lg:px-16">
            <div className="max-w-xl">
              <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/80 sm:text-[10px]">
                New collection
              </p>
              <h1
                className="mt-4 max-w-lg text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Practice Better.
                <br />
                Live Better.
              </h1>
              <p className="mt-4 max-w-sm text-xs leading-6 text-white/85 sm:text-sm">
                Thoughtfully made essentials to support your movement, restore your balance, and bring intention to every day.
              </p>
              <Link
                href="#best-sellers"
                className="mt-7 inline-flex min-h-10 items-center bg-[#1c211d] px-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#35483a]"
              >
                Shop new arrivals
              </Link>
            </div>
            <span className="absolute bottom-8 right-8 hidden text-[10px] tracking-[0.2em] text-white/80 sm:block">
              01 <span className="ml-3 inline-block h-8 w-px bg-white/70 align-middle" /> 02
            </span>
          </div>
        </section>

        <section aria-label="Shop collections" className="grid gap-3 py-5 sm:grid-cols-3 sm:gap-4 sm:py-7">
          {promoCategories.map((category, index) => {
            const image = getCategoryImage(category.slug, index, category.image);
            return (
              <Link
                key={category.slug}
                href={`/products?category=${encodeURIComponent(category.slug)}#all-products`}
                className="group relative flex min-h-36 items-end overflow-hidden bg-[#eee9e1] p-5 sm:min-h-40 sm:p-6"
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  unoptimized={image.startsWith('http')}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <span className="relative text-white">
                  <span className="block font-serif text-xl">{category.name}</span>
                  <span className="mt-2 inline-flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.16em]">
                    Shop now <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </section>

        {displayCategories.length > 0 && (
          <section className="py-9 sm:py-12" aria-labelledby="shop-by-category">
            <div className="text-center">
              <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-[#827a68]">
                Top categories
              </p>
              <h2
                id="shop-by-category"
                className="mt-2 text-3xl font-normal text-[#1c211d]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Shop By Category
              </h2>
            </div>
            <div className="mt-7 flex gap-5 overflow-x-auto pb-3 sm:justify-center sm:gap-7">
              {displayCategories.map((category, index) => {
                const image = getCategoryImage(category.slug, index, category.image);
                return (
                  <Link
                    key={category.slug}
                    href={`/products?category=${encodeURIComponent(category.slug)}#all-products`}
                    className="group flex w-[76px] shrink-0 flex-col items-center sm:w-[88px]"
                  >
                    <span className="relative block h-[68px] w-[68px] overflow-hidden rounded-full bg-[#eee9e1] sm:h-[78px] sm:w-[78px]">
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="78px"
                        unoptimized={image.startsWith('http')}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </span>
                    <span className="mt-2 text-center text-[10px] text-[#1c211d] transition-colors group-hover:text-[#737e65] sm:text-[11px]">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {bestSellers.length > 0 && (
          <section id="best-sellers" className="scroll-mt-24 py-8 sm:py-10" aria-labelledby="best-sellers-title">
            <div className="mb-6 text-center">
              <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-[#827a68]">
                Customer favorites
              </p>
              <h2
                id="best-sellers-title"
                className="mt-2 text-3xl font-normal text-[#1c211d]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Best Sellers
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5">
              {bestSellers.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="#all-products"
                className="inline-flex min-h-10 items-center justify-center border border-[#77766f] px-7 text-[9px] font-medium uppercase tracking-[0.15em] text-[#1c211d] transition-colors hover:border-[#1c211d] hover:bg-[#1c211d] hover:text-white"
              >
                View all products
              </Link>
            </div>
          </section>
        )}

        <section className="relative isolate my-8 min-h-[230px] overflow-hidden bg-[#e8e0d6] sm:my-12 sm:min-h-[300px]">
          <Image
            src={FALLBACK_CATEGORIES[2].image}
            alt=""
            fill
            sizes="100vw"
            unoptimized
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#201b17]/55 via-[#201b17]/20 to-transparent" />
          <div className="relative flex min-h-[230px] items-center px-7 py-10 text-white sm:min-h-[300px] sm:px-12 lg:px-16">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-white/80">
                Make Space for Your Practice
              </p>
              <h2
                className="mt-3 max-w-md text-3xl font-normal leading-tight sm:text-4xl"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Refresh Your Practice
              </h2>
              <Link
                href="#all-products"
                className="mt-5 inline-flex items-center gap-2 border-b border-white/80 pb-1 text-[9px] font-medium uppercase tracking-[0.16em] text-white"
              >
                Explore the collection <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </Container>

      <section id="all-products" className="scroll-mt-20 border-t border-[#eeeae3] py-10 md:py-14">
        <Container>
          <div className="mb-8">
            <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-[#827a68]">
              Find your practice
            </p>
            <h2
              className="mt-2 text-3xl font-normal text-[#1c211d]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Shop All Essentials
            </h2>
          </div>
          <ProductsClient
            key={`${initialSearch}:${params.category || ''}`}
            allProducts={JSON.parse(JSON.stringify(allProducts))}
            categories={JSON.parse(JSON.stringify(categories))}
            initialSearch={initialSearch}
            initialCategory={params.category || ''}
          />
        </Container>
      </section>
    </div>
  );
}
