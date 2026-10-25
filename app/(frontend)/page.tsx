import Link from "next/link";
import Image from "next/image";
import ResourceProductCard from "@/components/products/ResourceProductCard";
import { buildMetadata, faqPageSchema } from "@/lib/utils/seo";
import JsonLd from "@/components/seo/JsonLd";
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";

export const metadata = buildMetadata({
  title: "Yoglivya — Premium Yoga & Wellness Essentials",
  description:
    "Premium yoga props, non-slip mats, buckwheat bolsters and wellness essentials designed to bring greater support, alignment and intention to your daily practice.",
  path: "/",
  keywords: [
    "yoga props",
    "yoga mats",
    "meditation bolsters",
    "cotton yoga belts",
    "cork yoga wheels",
    "mindful wellness India",
  ],
});

const homeFaqs = [
  {
    question: "How do I choose the right yoga belt length?",
    answer:
      "A 6 FT or 8 FT belt is ideal for standard studio stretching and forward bends. For taller practitioners or deeper binding postures, our 10 FT belt provides extra reach and loop flexibility.",
  },
  {
    question: "What makes Yoglivya props durable and sustainable?",
    answer:
      "Every prop is crafted using unbleached organic cotton, renewable cork oak, solid zinc hardware, and biodegradable natural tree rubber, free from toxic PVC and synthetic glues.",
  },
  {
    question: "What are your delivery timelines across India?",
    answer:
      "We offer complimentary Pan-India delivery on orders above ₹999 with Cash on Delivery (COD) available. Standard shipping takes 3–5 business days, with express 1–2 day dispatch available.",
  },
  {
    question: "Do you offer bulk studio orders?",
    answer:
      "Yes, we collaborate with certified yoga studios and wellness retreats worldwide. Contact our team for customized studio prop packs and wholesale rates.",
  },
];

export default async function HomePage() {
  await dbConnect();

  // Query products from MongoDB
  const rawProducts = await Product.find({ status: 'published' }).lean();

  const products = rawProducts.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    categorySlug: p.categorySlug || 'yoga-props',
    shortDescription: p.shortDescription || '',
    priceINR: (p as any).priceINR || p.price || 999,
    image: p.mainImage || (p.images && p.images[0]) || '',
  }));

  // Match the resource sections
  const bestsellers = [
    products.find((p) => p.slug === 'premium-cotton-yoga-belt') || {
      id: 'belt',
      name: 'Premium Cotton Yoga Belt',
      slug: 'premium-cotton-yoga-belt',
      categorySlug: 'yoga-props',
      shortDescription: 'Army Green · 10 FT',
      priceINR: 349,
      image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=900&q=85',
    },
    products.find((p) => p.slug === 'premium-yoga-wheel') || {
      id: 'wheel',
      name: 'Premium Yoga Wheel',
      slug: 'premium-yoga-wheel',
      categorySlug: 'yoga-props',
      shortDescription: 'Support & Mobility',
      priceINR: 1649,
      image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=85',
    },
    products.find((p) => p.slug === 'iyengar-yoga-rope') || {
      id: 'rope',
      name: 'Iyengar Yoga Rope',
      slug: 'iyengar-yoga-rope',
      categorySlug: 'yoga-props',
      shortDescription: 'Spun Cotton',
      priceINR: 799,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85',
    },
    products.find((p) => p.slug === 'yoga-bolster') || {
      id: 'bolster',
      name: 'Yoga Bolster',
      slug: 'yoga-bolster',
      categorySlug: 'meditation',
      shortDescription: 'Premium Support',
      priceINR: 1299,
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=85',
    },
  ];

  const newArrivals = [
    products.find((p) => p.slug === 'trataka-stand') || {
      id: 'trataka',
      name: 'Trataka Stand',
      slug: 'trataka-stand',
      categorySlug: 'wellness',
      shortDescription: 'Mindful Focus',
      priceINR: 1399,
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=85',
    },
    products.find((p) => p.slug === 'practice-journal') || {
      id: 'journal',
      name: 'Practice Journal',
      slug: 'practice-journal',
      categorySlug: 'accessories',
      shortDescription: 'Daily Reflection',
      priceINR: 499,
      image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85',
    },
    products.find((p) => p.slug === 'premium-hammock') || {
      id: 'hammock',
      name: 'Premium Hammock',
      slug: 'premium-hammock',
      categorySlug: 'yoga-props',
      shortDescription: 'Aerial Practice',
      priceINR: 2499,
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=85',
    },
    products.find((p) => p.slug === 'wellness-potli') || {
      id: 'potli',
      name: 'Wellness Potli',
      slug: 'wellness-potli',
      categorySlug: 'wellness',
      shortDescription: 'Traditional Ritual',
      priceINR: 699,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85',
    },
  ];

  const trending = [
    products.find((p) => p.slug === 'sutra-neti') || {
      id: 'neti',
      name: 'Sutra Neti',
      slug: 'sutra-neti',
      categorySlug: 'wellness',
      shortDescription: 'Traditional Practice',
      priceINR: 299,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85',
    },
    products.find((p) => p.slug === 'yoga-rope-set') || {
      id: 'ropeset',
      name: 'Yoga Rope Set',
      slug: 'yoga-rope-set',
      categorySlug: 'yoga-props',
      shortDescription: 'Spun Cotton',
      priceINR: 450,
      image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=900&q=85',
    },
    products.find((p) => p.slug === 'yoga-strap') || {
      id: 'strap',
      name: 'Yoga Strap',
      slug: 'yoga-strap',
      categorySlug: 'yoga-props',
      shortDescription: 'Everyday Mobility',
      priceINR: 349,
      image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=85',
    },
    products.find((p) => p.slug === 'vastra-dhauti') || {
      id: 'dhauti',
      name: 'Vastra Dhauti',
      slug: 'vastra-dhauti',
      categorySlug: 'wellness',
      shortDescription: 'Traditional Wellness',
      priceINR: 599,
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85',
    },
  ];

  const categories = [
    {
      name: "Yoga Props",
      slug: "yoga-props",
      tagline: "Support your practice",
      image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=600&q=85",
    },
    {
      name: "Yoga Mats",
      slug: "yoga-mats",
      tagline: "Ground your practice",
      image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=600&q=85",
    },
    {
      name: "Meditation",
      slug: "meditation",
      tagline: "Create stillness",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=85",
    },
    {
      name: "Wellness",
      slug: "wellness",
      tagline: "Everyday rituals",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=85",
    },
    {
      name: "Accessories",
      slug: "accessories",
      tagline: "Practice essentials",
      image: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <>
      <JsonLd data={faqPageSchema(homeFaqs)} />

      {/* ═══════════════ SECTION 1: HERO (Resource Specification) ═══════════════ */}
      <section className="mx-[2.5%] my-[18px] min-h-[580px] lg:min-h-[650px] bg-[#f5f3ed] grid grid-cols-1 md:grid-cols-2 items-center overflow-hidden rounded-[2px]">
        {/* Left Copy */}
        <div className="p-8 sm:p-12 lg:p-16 max-w-[600px]">
          <div className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
            Living the Yogic Way
          </div>
          <h1 
            className="text-[42px] sm:text-[54px] lg:text-[68px] font-normal leading-[1.04] text-[#1c211d] mt-3.5 mb-5"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Practice with purpose.
          </h1>
          <p className="text-[13.5px] sm:text-[14px] leading-[1.8] text-[#686860] max-w-[450px]">
            Premium yoga props and wellness essentials designed to bring greater
            support, alignment and intention to your daily practice.
          </p>
          <Link
            href="/products"
            className="inline-block mt-6 px-6 py-3.5 bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase font-semibold border border-[#26352b] hover:bg-transparent hover:text-[#26352b] transition-colors"
          >
            Shop Collection
          </Link>
        </div>

        {/* Right Art */}
        <div className="relative h-[380px] md:h-full min-h-[380px] md:min-h-[650px] bg-[#e8e4d8] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=85"
            alt="Woman practicing yoga in a calm studio"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* ═══════════════ SECTION 2: SHOP BY CATEGORY ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-14 sm:py-16">
        <div className="flex items-end justify-between mb-7">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              Explore
            </span>
            <h2 
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Shop by Category
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products/${cat.slug}`}
              className="group relative aspect-[1/0.95] overflow-hidden rounded-[2px] bg-[#d9d7c9] flex items-end p-4 text-white"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17251de0] via-[#17251d55] to-transparent z-[1]" />
              <div className="relative z-[2]">
                <span 
                  className="block text-[17px] sm:text-[19px] font-normal leading-tight"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {cat.name}
                </span>
                <small className="block text-[10px] text-[#f0eee8] mt-1 font-sans">
                  {cat.tagline}
                </small>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════ SECTION 3: BESTSELLERS ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="flex items-end justify-between mb-7 border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              Most Loved
            </span>
            <h2 
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Bestsellers
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[10px] tracking-[0.14em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] hover:border-[#a08758] transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {bestsellers.map((item, index) => (
            <ResourceProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              slug={item.slug}
              categorySlug={item.categorySlug}
              shortDescription={item.shortDescription}
              priceINR={item.priceINR}
              image={item.image}
              badge={index === 0 || index === 2 ? 'BESTSELLER' : undefined}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════ SECTION 4: NEW ARRIVALS ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="flex items-end justify-between mb-7 border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              Just In
            </span>
            <h2 
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              New Arrivals
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[10px] tracking-[0.14em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] hover:border-[#a08758] transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {newArrivals.map((item, index) => (
            <ResourceProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              slug={item.slug}
              categorySlug={item.categorySlug}
              shortDescription={item.shortDescription}
              priceINR={item.priceINR}
              image={item.image}
              badge={index === 0 || index === 1 ? 'NEW' : undefined}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════ SECTION 5: TRENDING ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="flex items-end justify-between mb-7 border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              Popular Right Now
            </span>
            <h2 
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Trending
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[10px] tracking-[0.14em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] hover:border-[#a08758] transition-colors"
          >
            Explore
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {trending.map((item) => (
            <ResourceProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              slug={item.slug}
              categorySlug={item.categorySlug}
              shortDescription={item.shortDescription}
              priceINR={item.priceINR}
              image={item.image}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════ SECTION 6: PHILOSOPHY SPLIT ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-[2px] overflow-hidden">
          {/* Left Text */}
          <div className="bg-[#26352b] text-white p-8 sm:p-12 lg:p-16 min-h-[420px] flex flex-col justify-center">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#c7b995] font-bold">
              Our Philosophy
            </span>
            <h2 
              className="text-[32px] sm:text-[38px] font-normal leading-[1.12] text-white my-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Designed for the practice. Considered for everyday life.
            </h2>
            <p className="text-[13.5px] leading-[1.8] text-[#cdd2cc] max-w-[470px] mb-6">
              Yoglivya brings traditional yoga knowledge and modern product
              design together — creating beautiful, functional tools for a more
              intentional practice.
            </p>
            <div>
              <Link
                href="/about"
                className="inline-block px-6 py-3.5 border border-white text-white text-[10px] tracking-[0.14em] uppercase font-semibold hover:bg-white hover:text-[#26352b] transition-colors"
              >
                Discover Yoglivya
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="min-h-[380px] md:min-h-[420px] relative bg-[#f5f3ed] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1100&q=85"
              alt="Yoga and mindful wellness lifestyle"
              loading="lazy"
              className="w-full h-full object-cover object-center absolute inset-0"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 7: YOGA EDUCATION ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-8 border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              Learn & Practice
            </span>
            <h2 
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Yoga Education
            </h2>
          </div>
          <Link
            href="/about#everyday"
            className="text-[10px] tracking-[0.14em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] hover:border-[#a08758] transition-colors"
          >
            Explore Journal
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <article className="border-t border-[#e7e5df] pt-5 group">
            <div className="aspect-[1.3] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=700&q=80"
                alt="How to choose the right yoga belt length"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[19px] sm:text-[20px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              How to choose the right yoga belt length
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              A practical guide to choosing 6 FT, 8 FT or 10 FT for your practice.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read Guide
            </Link>
          </article>

          <article className="border-t border-[#e7e5df] pt-5 group">
            <div className="aspect-[1.3] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80"
                alt="Why yoga props matter for alignment"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[19px] sm:text-[20px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Why yoga props matter for alignment
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              Understand how simple props can support stability, reach and awareness.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read Guide
            </Link>
          </article>

          <article className="border-t border-[#e7e5df] pt-5 group">
            <div className="aspect-[1.3] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80"
                alt="A beginner's guide to yoga props"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[19px] sm:text-[20px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              A beginner&apos;s guide to yoga props
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              The essential props to start building a considered home practice.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read Guide
            </Link>
          </article>
        </div>
      </section>

      {/* ═══════════════ SECTION 8: REVIEWS BAND ═══════════════ */}
      <section className="bg-[#f7f6f2] py-16 sm:py-20 px-5 sm:px-8 border-y border-[#e7e5df]">
        <div className="max-w-[1050px] mx-auto text-center">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
            Real Practice
          </span>
          <h2 
            className="text-[30px] sm:text-[34px] font-normal text-[#1c211d] mt-2 mb-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Loved by Yoglivya customers
          </h2>
          <div className="text-[#a08758] text-[16px] tracking-[4px]">
            ★★★★★
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mt-10 text-left">
            <div className="bg-white p-6 border border-[#e7e5df] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="text-[#a08758] text-[12px] tracking-[2px] mb-2.5">
                  ★★★★★
                </div>
                <p className="text-[12.5px] text-[#666666] leading-[1.65]">
                  “The cotton feels premium and the belt has a secure grip during practice.”
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#f0eee8]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Aarohi Sharma"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#f0eee8]"
                />
                <div>
                  <strong className="block text-[11px] font-semibold text-[#1c211d]">
                    Aarohi Sharma
                  </strong>
                  <span className="block text-[9px] text-[#77766f] tracking-wide">
                    Verified customer
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-[#e7e5df] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="text-[#a08758] text-[12px] tracking-[2px] mb-2.5">
                  ★★★★★
                </div>
                <p className="text-[12.5px] text-[#666666] leading-[1.65]">
                  “Beautiful quality and very thoughtfully made. Exactly what I wanted.”
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#f0eee8]">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Rohan Mehta"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#f0eee8]"
                />
                <div>
                  <strong className="block text-[11px] font-semibold text-[#1c211d]">
                    Rohan Mehta
                  </strong>
                  <span className="block text-[9px] text-[#77766f] tracking-wide">
                    Verified customer
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-[#e7e5df] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="text-[#a08758] text-[12px] tracking-[2px] mb-2.5">
                  ★★★★★
                </div>
                <p className="text-[12.5px] text-[#666666] leading-[1.65]">
                  “Simple, functional and feels much more premium than ordinary yoga props.”
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#f0eee8]">
                <img
                  src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Meera Kapoor"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#f0eee8]"
                />
                <div>
                  <strong className="block text-[11px] font-semibold text-[#1c211d]">
                    Meera Kapoor
                  </strong>
                  <span className="block text-[9px] text-[#77766f] tracking-wide">
                    Verified customer
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 9: FROM THE JOURNAL ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-14 sm:py-16">
        <div className="flex items-end justify-between mb-8 border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              From the Journal
            </span>
            <h2 
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Ideas for your practice
            </h2>
          </div>
          <Link
            href="/about#everyday"
            className="text-[10px] tracking-[0.14em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
          >
            View Journal
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr] gap-6">
          <article className="group">
            <div className="aspect-[1.35] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
                alt="Building a more intentional home yoga practice"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[22px] sm:text-[25px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Building a more intentional home yoga practice
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              Simple ways to make your practice consistent, comfortable and purposeful.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read Article
            </Link>
          </article>

          <article className="group">
            <div className="aspect-[1.35] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=800&q=80"
                alt="Yoga props explained"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[19px] sm:text-[20px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Yoga props explained
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              What each essential prop actually does for your alignment and breath.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read Guide
            </Link>
          </article>

          <article className="group">
            <div className="aspect-[1.35] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
                alt="Yoga and everyday wellness"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[19px] sm:text-[20px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Yoga & everyday wellness
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              Small rituals that support a calmer routine throughout the week.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read Guide
            </Link>
          </article>
        </div>
      </section>

      {/* ═══════════════ SECTION 10: NEWSLETTER ═══════════════ */}
      <section className="bg-[#f5f3ed] py-14 sm:py-16 px-5 sm:px-8 text-center border-t border-[#e7e5df]">
        <div className="max-w-[550px] mx-auto">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
            Stay Connected
          </span>
          <h2 
            className="text-[30px] sm:text-[34px] font-normal text-[#1c211d] mt-2 mb-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Practice. Learn. Live.
          </h2>
          <p className="text-[12.5px] text-[#77766f] mb-6">
            Join the Yoglivya journal for yoga, wellness and new product updates.
          </p>

          <form 
            action="/contact" 
            className="flex max-w-[480px] mx-auto border border-[#deded5] bg-white rounded-[2px] overflow-hidden shadow-sm"
          >
            <input
              type="email"
              placeholder="Your email address"
              required
              className="flex-1 px-4 py-3 text-[12.5px] outline-none text-[#1c211d] bg-transparent"
            />
            <button
              type="submit"
              className="bg-[#26352b] text-white px-6 text-[10px] font-bold tracking-[0.12em] uppercase hover:bg-[#1c2720] transition-colors"
            >
              JOIN
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
