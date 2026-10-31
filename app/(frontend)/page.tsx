import Link from "next/link";
import ResourceProductCard from "@/components/products/ResourceProductCard";
import HeroSlider from "@/components/home/HeroSlider";
import MarqueeBanner from "@/components/home/MarqueeBanner";
import { buildMetadata, faqPageSchema } from "@/lib/utils/seo";
import JsonLd from "@/components/seo/JsonLd";
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";

export const metadata = buildMetadata({
  title: "Yoga & Meditation Essentials",
  description:
    "Explore Yoglivya yoga mats, props and meditation essentials for movement, stillness and everyday practice. Find what suits your routine.",
  path: "/",
  keywords: [
    "yoga props",
    "yoga mats",
    "meditation essentials",
    "yoga belts",
    "yoga blocks",
    "mindful practice India",
  ],
});

const homeFaqs = [
  {
    question: "How do I choose a product for my practice?",
    answer:
      "Start with what you need it for, then compare the dimensions, materials and intended use on the product page. If a detail is unclear, contact us with the product name and your question.",
  },
  {
    question: "I’m new to yoga. Where should I begin shopping?",
    answer:
      "Browse by product type and consider what your class or teacher recommends. You do not need to buy every accessory at once. Choose around the practice you plan to follow.",
  },
  {
    question: "Where do you deliver?",
    answer:
      "Please see Shipping & Delivery for our confirmed delivery areas and any exclusions.",
  },
  {
    question: "Do you supply studios or groups?",
    answer:
      "You can enquire about Yoglivya-branded products through our Business & Bulk Enquiries form. Include the products and approximate quantities you are considering.",
  },
];

export default async function HomePage() {
  let rawProducts: any[] = [];
  try {
    await dbConnect();
    rawProducts = await Product.find({ status: 'published' }).lean();
  } catch (e) {
    console.warn('DB query skipped, using local product catalog');
  }

  const productImages: Record<string, string> = {
    'premium-cotton-yoga-belt': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139071/yoglivya/products/yoga-belt.jpg',
    'premium-yoga-wheel': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139075/yoglivya/products/yoga-wheel.jpg',
    'iyengar-yoga-rope': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139065/yoglivya/products/iyengar-yoga-rope.jpg',
    'yoga-bolster': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139072/yoglivya/products/yoga-bolster.jpg',
    'trataka-stand': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139068/yoglivya/products/trataka-stand.jpg',
    'practice-journal': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139065/yoglivya/products/practice-journal.jpg',
    'premium-hammock': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139066/yoglivya/products/premium-hammock.jpg',
    'wellness-potli': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139070/yoglivya/products/wellness-potli.jpg',
    'sutra-neti': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139067/yoglivya/products/sutra-neti.jpg',
    'yoga-rope-set': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139073/yoglivya/products/yoga-rope-set.jpg',
    'yoga-strap': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139075/yoglivya/products/yoga-strap.jpg',
    'vastra-dhauti': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139069/yoglivya/products/vastra-dhauti.jpg',
    'prana-grip-non-slip-pu-yoga-mat': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139081/yoglivya/categories/yoga-mats.png',
    'organic-cork-yoga-mat': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139081/yoglivya/categories/yoga-mats.png',
  };

  const products = rawProducts.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    categorySlug: p.categorySlug || 'yoga-props',
    shortDescription: p.shortDescription || '',
    priceINR: (p as any).priceINR || p.price || 999,
    image: productImages[p.slug] || p.mainImage || (p.images && p.images[0]) || '',
  }));

  // Match the resource sections with authentic yoga products on neutral studio gray background
  const bestsellers = [
    products.find((p) => p.slug === 'premium-cotton-yoga-belt') || {
      id: 'belt',
      name: 'Premium Cotton Yoga Belt',
      slug: 'premium-cotton-yoga-belt',
      categorySlug: 'yoga-props',
      shortDescription: 'Army Green · 10 FT',
      priceINR: 349,
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139071/yoglivya/products/yoga-belt.jpg',
    },
    products.find((p) => p.slug === 'premium-yoga-wheel') || {
      id: 'wheel',
      name: 'Premium Yoga Wheel',
      slug: 'premium-yoga-wheel',
      categorySlug: 'yoga-props',
      shortDescription: 'Support & Mobility',
      priceINR: 1649,
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139075/yoglivya/products/yoga-wheel.jpg',
    },
    products.find((p) => p.slug === 'iyengar-yoga-rope') || {
      id: 'rope',
      name: 'Iyengar Yoga Rope',
      slug: 'iyengar-yoga-rope',
      categorySlug: 'yoga-props',
      shortDescription: 'Spun Cotton',
      priceINR: 799,
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139065/yoglivya/products/iyengar-yoga-rope.jpg',
    },
    products.find((p) => p.slug === 'yoga-bolster') || {
      id: 'bolster',
      name: 'Yoga Bolster',
      slug: 'yoga-bolster',
      categorySlug: 'meditation',
      shortDescription: 'Premium Support',
      priceINR: 1299,
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139072/yoglivya/products/yoga-bolster.jpg',
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
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139068/yoglivya/products/trataka-stand.jpg',
    },
    products.find((p) => p.slug === 'practice-journal') || {
      id: 'journal',
      name: 'Practice Journal',
      slug: 'practice-journal',
      categorySlug: 'accessories',
      shortDescription: 'Daily Reflection',
      priceINR: 499,
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139065/yoglivya/products/practice-journal.jpg',
    },
    products.find((p) => p.slug === 'premium-hammock') || {
      id: 'hammock',
      name: 'Premium Hammock',
      slug: 'premium-hammock',
      categorySlug: 'yoga-props',
      shortDescription: 'Aerial Practice',
      priceINR: 2499,
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139066/yoglivya/products/premium-hammock.jpg',
    },
    products.find((p) => p.slug === 'wellness-potli') || {
      id: 'potli',
      name: 'Wellness Potli',
      slug: 'wellness-potli',
      categorySlug: 'wellness',
      shortDescription: 'Traditional Ritual',
      priceINR: 699,
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139070/yoglivya/products/wellness-potli.jpg',
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
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139067/yoglivya/products/sutra-neti.jpg',
    },
    products.find((p) => p.slug === 'yoga-rope-set') || {
      id: 'ropeset',
      name: 'Yoga Rope Set',
      slug: 'yoga-rope-set',
      categorySlug: 'yoga-props',
      shortDescription: 'Spun Cotton',
      priceINR: 450,
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139073/yoglivya/products/yoga-rope-set.jpg',
    },
    products.find((p) => p.slug === 'yoga-strap') || {
      id: 'strap',
      name: 'Yoga Strap',
      slug: 'yoga-strap',
      categorySlug: 'yoga-props',
      shortDescription: 'Everyday Mobility',
      priceINR: 349,
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139075/yoglivya/products/yoga-strap.jpg',
    },
    products.find((p) => p.slug === 'vastra-dhauti') || {
      id: 'dhauti',
      name: 'Vastra Dhauti',
      slug: 'vastra-dhauti',
      categorySlug: 'wellness',
      shortDescription: 'Traditional Wellness',
      priceINR: 599,
      image: 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139069/yoglivya/products/vastra-dhauti.jpg',
    },
  ];

  const categories = [
    {
      name: "Yoga Props",
      slug: "yoga-props",
      tagline: "Tools for the way you practise.",
      image: "https://res.cloudinary.com/dzobobkqw/image/upload/v1793139079/yoglivya/categories/yoga-blocks.png",
    },
    {
      name: "Yoga Mats",
      slug: "yoga-mats",
      tagline: "Make space for movement.",
      image: "https://res.cloudinary.com/dzobobkqw/image/upload/v1793139081/yoglivya/categories/yoga-mats.png",
    },
    {
      name: "Meditation",
      slug: "meditation",
      tagline: "Settle into your own ritual.",
      image: "https://res.cloudinary.com/dzobobkqw/image/upload/v1793139072/yoglivya/products/yoga-bolster.jpg",
    },
    {
      name: "Wellness",
      slug: "wellness",
      tagline: "Explore everyday rituals.",
      image: "https://res.cloudinary.com/dzobobkqw/image/upload/v1793139068/yoglivya/products/trataka-stand.jpg",
    },
    {
      name: "Accessories",
      slug: "accessories",
      tagline: "The details around your practice.",
      image: "https://res.cloudinary.com/dzobobkqw/image/upload/v1793139078/yoglivya/categories/yoga-accessories.png",
    },
  ];

  return (
    <>
      <JsonLd data={faqPageSchema(homeFaqs)} />

      <HeroSlider />
      <MarqueeBanner />

      <section id="collection" className="max-w-[1240px] mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="flex items-end justify-between mb-7 border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              EXPLORE THE COLLECTION
            </span>
            <h2
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Essentials for your practice
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[10px] tracking-[0.14em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] hover:border-[#a08758] transition-colors"
          >
            Shop All
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {bestsellers.map((item) => (
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

      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-14 sm:py-16">
        <div className="flex items-end justify-between mb-7">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              FIND YOUR ESSENTIALS
            </span>
            <h2
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Shop by practice
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

      {/* ═══════════════ SECTION 06: NEW ARRIVALS ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="flex items-end justify-between mb-7 border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              NEW TO YOGLIVYA
            </span>
            <h2 
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Fresh additions to your practice
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[10px] tracking-[0.14em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] hover:border-[#a08758] transition-colors"
          >
            View New Arrivals
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {newArrivals.map((item) => (
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

      {/* ═══════════════ SECTION 07: EXPLORE MORE ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="flex items-end justify-between mb-7 border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              EXPLORE MORE
            </span>
            <h2 
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Find your next practice essential
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[10px] tracking-[0.14em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] hover:border-[#a08758] transition-colors"
          >
            View the Collection
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

      {/* ═══════════════ SECTION 08: PHILOSOPHY SPLIT BLOCK ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-[2px] overflow-hidden">
          {/* Left Text */}
          <div className="bg-[#26352b] text-white p-8 sm:p-12 lg:p-16 min-h-[420px] flex flex-col justify-center">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#c7b995] font-bold">
              THE YOGLIVYA PERSPECTIVE
            </span>
            <h2 
              className="text-[32px] sm:text-[38px] font-normal leading-[1.12] text-white my-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              There is more to practice than movement.
            </h2>
            <p className="text-[13.5px] leading-[1.8] text-[#cdd2cc] max-w-[470px] mb-6">
              A stretch. A steady breath. A moment of attention. At Yoglivya, we make room for each part of practice, bringing yoga essentials together with a thoughtful invitation to turn inward.
            </p>
            <div>
              <Link
                href="/about#purpose"
                className="inline-block px-6 py-3.5 border border-white text-white text-[10px] tracking-[0.14em] uppercase font-semibold hover:bg-white hover:text-[#26352b] transition-colors"
              >
                Discover Our Philosophy
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

      {/* ═══════════════ SECTION 09: YOGA EDUCATION ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-8 border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              LEARN &amp; PRACTISE
            </span>
            <h2 
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Get to know your practice essentials
            </h2>
          </div>
          <Link
            href="/about#everyday"
            className="text-[10px] tracking-[0.14em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] hover:border-[#a08758] transition-colors"
          >
            Explore the Guides
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <article className="border-t border-[#e7e5df] pt-5 group">
            <div className="aspect-[1.3] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=700&q=80"
                alt="How to choose a yoga belt"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[19px] sm:text-[20px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              How to choose a yoga belt
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              Understand length, fastening and material before choosing a belt for your practice.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read the Guide
            </Link>
          </article>

          <article className="border-t border-[#e7e5df] pt-5 group">
            <div className="aspect-[1.3] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80"
                alt="Getting to know yoga props"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[19px] sm:text-[20px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Getting to know yoga props
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              Explore the different roles of blocks, belts and other tools in a yoga practice.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read the Guide
            </Link>
          </article>

          <article className="border-t border-[#e7e5df] pt-5 group">
            <div className="aspect-[1.3] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80"
                alt="Choosing a yoga mat for your routine"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[19px] sm:text-[20px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Choosing a yoga mat for your routine
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              Consider size, thickness, surface and care when comparing your options.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read the Guide
            </Link>
          </article>
        </div>
      </section>

      {/* ═══════════════ SECTION 10: HERE TO HELP ═══════════════ */}
      <section className="bg-[#f7f6f2] py-16 sm:py-20 px-5 sm:px-8 border-y border-[#e7e5df]">
        <div className="max-w-[700px] mx-auto text-center">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
            HERE TO HELP
          </span>
          <h2 
            className="text-[30px] sm:text-[36px] font-normal text-[#1c211d] mt-2 mb-3"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Find what fits your practice.
          </h2>
          <p className="text-[13.5px] leading-[1.8] text-[#666666] max-w-[540px] mx-auto mb-8">
            Have a question about a product, size or material? Tell us what you are considering so we can help you understand your options.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#26352b] text-white text-[10px] font-bold tracking-[0.14em] uppercase hover:bg-[#1c2720] transition-colors"
          >
            <span>Ask a Product Question</span>
            <span className="text-[14px]">↗</span>
          </Link>
        </div>
      </section>

      {/* ═══════════════ SECTION 11: FROM THE JOURNAL ═══════════════ */}
      <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-14 sm:py-16">
        <div className="flex items-end justify-between mb-8 border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
              THE YOGLIVYA JOURNAL
            </span>
            <h2 
              className="text-[28px] sm:text-[32px] font-normal text-[#1c211d] mt-1.5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Reflections beyond the mat
            </h2>
          </div>
          <Link
            href="/about#journal"
            className="text-[10px] tracking-[0.14em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
          >
            Visit the Journal
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr] gap-6">
          <article className="group">
            <div className="aspect-[1.35] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
                alt="Making room for a personal practice"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[22px] sm:text-[25px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Making room for a personal practice
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              A reflection on time, space and finding a rhythm that belongs to you.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read the Story
            </Link>
          </article>

          <article className="group">
            <div className="aspect-[1.35] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=800&q=80"
                alt="What does mindful living mean to you?"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[19px] sm:text-[20px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              What does mindful living mean to you?
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              Exploring attention in the ordinary moments that make up a day.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read the Story
            </Link>
          </article>

          <article className="group">
            <div className="aspect-[1.35] bg-[#f5f3ed] mb-4 overflow-hidden rounded-[2px]">
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
                alt="Movement, stillness and the space between"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 
              className="text-[19px] sm:text-[20px] font-normal text-[#1c211d] leading-snug group-hover:text-[#26352b] transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Movement, stillness and the space between
            </h3>
            <p className="text-[12px] text-[#77766f] leading-[1.65] mt-2 mb-3.5">
              Considering the different ways we make room for practice.
            </p>
            <Link
              href="/about#everyday"
              className="text-[10px] tracking-[0.12em] uppercase text-[#1c211d] border-b border-[#1c211d] pb-0.5 hover:text-[#a08758] transition-colors"
            >
              Read the Story
            </Link>
          </article>
        </div>
      </section>

      {/* ═══════════════ SECTION 12: NEWSLETTER ═══════════════ */}
      <section className="bg-[#f5f3ed] py-14 sm:py-16 px-5 sm:px-8 text-center border-t border-[#e7e5df]">
        <div className="max-w-[550px] mx-auto">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold">
            STAY CONNECTED
          </span>
          <h2 
            className="text-[30px] sm:text-[34px] font-normal text-[#1c211d] mt-2 mb-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            A little space for your practice.
          </h2>
          <p className="text-[12.5px] text-[#77766f] mb-6">
            Join the Yoglivya newsletter for product updates, practice ideas and notes on mindful living.
          </p>

          <form 
            action="/contact" 
            className="flex flex-col gap-3 max-w-[480px] mx-auto"
          >
            <div className="flex border border-[#deded5] bg-white rounded-[2px] overflow-hidden shadow-sm">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="flex-1 px-4 py-3 text-[12.5px] outline-none text-[#1c211d] bg-transparent"
              />
              <button
                type="submit"
                className="bg-[#26352b] text-white px-6 text-[10px] font-bold tracking-[0.12em] uppercase hover:bg-[#1c2720] transition-colors whitespace-nowrap"
              >
                Join the Newsletter
              </button>
            </div>
            <p className="text-[10.5px] text-[#827a68] text-center">
              I’d like to receive email updates from Yoglivya. I can unsubscribe at any time. Read our{' '}
              <Link href="/privacy" className="underline hover:text-[#26352b]">
                Privacy Policy
              </Link>.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
