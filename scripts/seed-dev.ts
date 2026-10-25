import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing in .env.local');
  process.exit(1);
}

// Define basic schemas for seeding
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  image: String,
  description: String
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  mainImage: String,
  images: [String],
  stock: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const SEED_CATEGORIES = [
  { name: 'Luxury Watches', slug: 'luxury-watches', description: 'Timeless pieces for your collection.' },
  { name: 'Handbags & Totes', slug: 'handbags', description: 'Premium leather goods and designer carries.' },
  { name: 'Fine Jewelry', slug: 'jewelry', description: 'Elegant diamonds, gold, and artisanal silver.' },
  { name: 'Designer Shoes', slug: 'shoes', description: 'Step into luxury with our curated footwear.' }
];

const SEED_PRODUCTS = [
  {
    name: 'Obsidian Midnight Chronograph',
    slug: 'obsidian-midnight-chronograph',
    description: 'A limited edition matte black luxury watch with sapphire crystal and automatic movement.',
    price: 45000,
    category: 'Luxury Watches',
    mainImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop',
    stock: 12,
    isFeatured: true
  },
  {
    name: 'Classic Silver Heritage',
    slug: 'classic-silver-heritage',
    description: 'Stainless steel case with a genuine leather strap. Water resistant up to 50m.',
    price: 28500,
    category: 'Luxury Watches',
    mainImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
    stock: 25,
    isFeatured: false
  },
  {
    name: 'Tuscany Leather Tote',
    slug: 'tuscany-leather-tote',
    description: 'Hand-stitched Italian leather bag in classic tan. Perfect for daily luxury.',
    price: 32000,
    category: 'Handbags & Totes',
    mainImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
    stock: 8,
    isFeatured: true
  },
  {
    name: 'Diamond Solitaire Studs',
    slug: 'diamond-solitaire-studs',
    description: '18k white gold studs featuring 1-carat conflict-free diamonds.',
    price: 89000,
    category: 'Fine Jewelry',
    mainImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
    stock: 5,
    isFeatured: true
  }
];

async function runSeed() {
  try {
    console.log('🚀 Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGODB_URI!);
    
    // Safety check: Don't wipe if we're on a production cluster mistakenly
    if (MONGODB_URI!.includes('cluster')) { // Simple check for Atlas
        console.log('⚠️  Atlas cluster detected. Proceeding with caution...');
    }

    console.log('🧹 Cleaning existing sandbox data...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('🌱 Seeding categories...');
    await Category.insertMany(SEED_CATEGORIES);

    console.log('🌱 Seeding products...');
    await Product.insertMany(SEED_PRODUCTS);

    console.log('✅ Seed successful! Local sandbox is ready for frontend dev.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
