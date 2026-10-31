import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

// Import models
import Product from '../lib/models/Product';
import Category from '../lib/models/Category';

const SEED_CATEGORIES = [
  { name: 'KNITWEAR', slug: 'knitwear', description: 'Handcrafted knit pieces for timeless elegance.', order: 0 },
  { name: 'TROUSERS', slug: 'trousers', description: 'Tailored silhouettes and structural integrity.', order: 1 },
  { name: 'OUTWEAR', slug: 'outwear', description: 'Protective and stylish layers.', order: 2 },
  { name: 'FINE JEWELRY', slug: 'fine-jewelry', description: 'Artisanal diamonds and gold.', order: 3 }
];

const SEED_PRODUCTS = [
  {
    name: "Wool Vest",
    slug: "wool-vest",
    category: "KNITWEAR",
    categorySlug: "knitwear",
    shortDescription: "Refined wool vest for layering.",
    basePriceINR: 4000,
    heroImage: "/images/product/pr1.jpg",
    images: ["/images/product/pr1.jpg", "/images/product/pr5.jpg", "/images/product/pr9.jpg"],
    inStock: true,
    featured: true
  },
  {
    name: "Adjustable Velvet Trousers",
    slug: "adjustable-velvet-trousers",
    category: "TROUSERS",
    categorySlug: "trousers",
    shortDescription: "Luxe velvet with customizable fit.",
    basePriceINR: 4000,
    heroImage: "/images/product/pr2.jpg",
    images: ["/images/product/pr2.jpg", "/images/product/pr7.jpg", "/images/product/pr11.jpg"],
    inStock: true,
    featured: true
  },
  {
    name: "Crew Sweater",
    slug: "crew-sweater",
    category: "KNITWEAR",
    categorySlug: "knitwear",
    shortDescription: "A purity of line and structural integrity.",
    basePriceINR: 4000,
    heroImage: "/images/product/pr3.jpg",
    images: ["/images/product/pr3.jpg", "/images/product/pr8.jpg", "/images/product/pr12.jpg"],
    inStock: true,
    featured: true
  },
  {
    name: "Classic Crew Wool Cardigan",
    slug: "classic-crew-wool-cardigan",
    category: "OUTWEAR",
    categorySlug: "outwear",
    shortDescription: "Designed for the modern woman who leads with grace.",
    basePriceINR: 4000,
    heroImage: "/images/product/pr4.jpg",
    images: ["/images/product/pr4.jpg", "/images/product/prr6.png"],
    inStock: true,
    featured: true
  },
  {
    name: "Diamond Solitaire Studs",
    slug: "diamond-solitaire-studs",
    category: "FINE JEWELRY",
    categorySlug: "fine-jewelry",
    shortDescription: "18k white gold studs featuring conflict-free diamonds.",
    basePriceINR: 89000,
    heroImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop"],
    inStock: true,
    featured: true
  }
];

async function seed() {
  console.log('🌱 Starting Legacy Couture Seed...');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  console.log('🧹 Cleaning legacy data...');
  await Category.deleteMany({});
  await Product.deleteMany({});

  console.log('📁 Seeding categories...');
  await Category.insertMany(SEED_CATEGORIES);

  console.log('📦 Seeding products...');
  for (const product of SEED_PRODUCTS) {
    await Product.create({
      name: product.name,
      slug: product.slug,
      productType: 'simple',
      category: product.category,
      categorySlug: product.categorySlug,
      description: product.shortDescription,
      price: product.basePriceINR,
      sku: `SKU-${product.slug.toUpperCase()}`,
      stockCount: product.inStock ? 10 : 0,
      mainImage: product.heroImage,
      gallery: product.images,
      heroImage: product.heroImage,
      images: product.images,
      inStock: product.inStock,
      featured: product.featured,
      status: 'published',
    });
  }

  console.log('🎉 Legacy Couture Seed Complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
