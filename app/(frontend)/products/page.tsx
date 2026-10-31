import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import { getAllProducts, getAllCategories } from '@/data/products';
import { buildMetadata } from '@/lib/utils/seo';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Shop Yoga & Meditation Essentials | Yoglivya',
  description:
    'Browse Yoglivya’s collection of yoga and meditation essentials. Compare products, explore available options and choose for your practice.',
  path: '/products',
});

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
                All Essentials
              </p>
              <h1
                className="mt-4 max-w-lg text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Yoga &amp; Meditation Essentials
              </h1>
              <p className="mt-4 max-w-md text-xs leading-6 text-white/85 sm:text-sm">
                Explore mats, props and essentials for movement and stillness. Find what belongs in your practice, from your first session to the routine you return to.
              </p>
              <Link
                href="#all-products"
                className="mt-7 inline-flex min-h-10 items-center bg-[#1c211d] px-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#35483a]"
              >
                Explore the collection
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

      </Container>

      <section id="all-products" className="scroll-mt-20 border-t border-[#eeeae3] py-10 md:py-14">
        <Container>
          <div className="mb-8">
            <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-[#827a68]">
              FIND YOUR ESSENTIALS
            </p>
            <h2
              className="mt-2 text-3xl font-normal text-[#1c211d]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Yoga &amp; Meditation Essentials
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
