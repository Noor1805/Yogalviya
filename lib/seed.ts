/**
 * Seed script — migrates official Yoglivya product data + categories into MongoDB
 * and creates the initial admin account for Yoglivya.
 *
 * Usage: npm run seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yoglivya';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yoglivya.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Yoglivya@2026';

const staticCategories = [
    {
        name: 'Yoga Props',
        slug: 'yoga-props',
        description: 'Support your practice with thoughtfully crafted blocks, straps, wheels, and ropes.',
        image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=600&q=85',
    },
    {
        name: 'Yoga Mats',
        slug: 'yoga-mats',
        description: 'Ground your practice with non-slip PU, tree rubber, and bio-cork mats.',
        image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=600&q=85',
    },
    {
        name: 'Meditation',
        slug: 'meditation',
        description: 'Create stillness with buckwheat bolsters, ergonomic zafu cushions, and eye pillows.',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=85',
    },
    {
        name: 'Wellness',
        slug: 'wellness',
        description: 'Everyday rituals inspired by traditional yogic lifestyle and ayurvedic wisdom.',
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=85',
    },
    {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Practice essentials including journals, organic cotton mat bags, and cleansers.',
        image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&w=600&q=80',
    },
];

// Import models
import Admin from './models/Admin';
import Category from './models/Category';
import Product from './models/Product';
import { EmailService } from './services/email.service';

async function seed() {
    console.log('🌱 Starting Yoglivya resource seed...\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    try {
        console.log('📧 Seeding Email Templates...');
        await EmailService.seedDefaultTemplates();
        console.log('✅ Email Templates Seeded\n');
    } catch (e) {
        console.warn('⚠️ Email template seeding skipped or non-fatal:', e);
    }

    // ── 1. Create Admin ──
    console.log('👤 Creating Yoglivya admin user...');
    const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
        console.log('   Admin already exists, skipping.\n');
    } else {
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await Admin.create({
            email: ADMIN_EMAIL,
            passwordHash,
            name: 'Yoglivya Admin',
            role: 'admin',
        });
        console.log(`   ✅ Admin created: ${ADMIN_EMAIL}\n`);
    }

    // ── 2. Seed Categories ──
    console.log('📁 Seeding yoga categories from resource...');
    await Category.deleteMany({});
    for (let i = 0; i < staticCategories.length; i++) {
        const cat = staticCategories[i];
        await Category.create({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image: cat.image,
            order: i,
        });
        console.log(`   ✅ Created: ${cat.name}`);
    }
    console.log('');

    // ── 3. Seed Yoga Products from Resource ──
    const allProducts = [
        // Bestsellers
        {
            name: "Premium Cotton Yoga Belt",
            slug: "premium-cotton-yoga-belt",
            category: "Yoga Props",
            categorySlug: "yoga-props",
            shortDescription: "Army Green · 10 FT",
            description: "Woven from durable unbleached organic cotton with solid steel D-ring buckles for stability and alignment.",
            priceINR: 349,
            priceUSD: 5,
            badge: "BESTSELLER",
            heroImage: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: true,
            section: "bestseller",
        },
        {
            name: "Premium Yoga Wheel",
            slug: "premium-yoga-wheel",
            category: "Yoga Props",
            categorySlug: "yoga-props",
            shortDescription: "Support & Mobility",
            description: "High-density natural cork outer layer with sweat-resistant TPE inner core, relieving back tension and opening hips.",
            priceINR: 1649,
            priceUSD: 20,
            badge: "",
            heroImage: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: true,
            section: "bestseller",
        },
        {
            name: "Iyengar Yoga Rope",
            slug: "iyengar-yoga-rope",
            category: "Yoga Props",
            categorySlug: "yoga-props",
            shortDescription: "Spun Cotton",
            description: "Traditional wall-rope handcrafted from heavy-duty soft spun cotton for deep therapeutic traction and spinal decompression.",
            priceINR: 799,
            priceUSD: 10,
            badge: "BESTSELLER",
            heroImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: true,
            section: "bestseller",
        },
        {
            name: "Yoga Bolster",
            slug: "yoga-bolster",
            category: "Meditation",
            categorySlug: "meditation",
            shortDescription: "Premium Support",
            description: "Filled with clean natural buckwheat hulls, encased in a washable linen zippered slipcover for restorative yoga poses.",
            priceINR: 1299,
            priceUSD: 16,
            badge: "",
            heroImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: true,
            section: "bestseller",
        },

        // New Arrivals
        {
            name: "Trataka Stand",
            slug: "trataka-stand",
            category: "Wellness",
            categorySlug: "wellness",
            shortDescription: "Mindful Focus",
            description: "Solid brass and natural wood gazing candle stand crafted to eye-level for traditional yogic trataka meditation.",
            priceINR: 1399,
            priceUSD: 17,
            badge: "NEW",
            heroImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: false,
            section: "new",
        },
        {
            name: "Practice Journal",
            slug: "practice-journal",
            category: "Accessories",
            categorySlug: "accessories",
            shortDescription: "Daily Reflection",
            description: "Hardcover linen journal with unbleached recycled cotton paper for morning intention-setting, sadhana logs, and reflections.",
            priceINR: 499,
            priceUSD: 6,
            badge: "NEW",
            heroImage: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: false,
            section: "new",
        },
        {
            name: "Premium Hammock",
            slug: "premium-hammock",
            category: "Yoga Props",
            categorySlug: "yoga-props",
            shortDescription: "Aerial Practice",
            description: "High-strength aerial yoga silk with reinforced carabiners and daisy chains for antigravity studio and home suspension.",
            priceINR: 2499,
            priceUSD: 30,
            badge: "",
            heroImage: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: true,
            section: "new",
        },
        {
            name: "Wellness Potli",
            slug: "wellness-potli",
            category: "Wellness",
            categorySlug: "wellness",
            shortDescription: "Traditional Ritual",
            description: "Hand-tied herbal pouch filled with therapeutic Ayurvedic herbs, camphor, and Himalayan rock salt for soothing sore muscles.",
            priceINR: 699,
            priceUSD: 9,
            badge: "",
            heroImage: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: false,
            section: "new",
        },

        // Trending
        {
            name: "Sutra Neti",
            slug: "sutra-neti",
            category: "Wellness",
            categorySlug: "wellness",
            shortDescription: "Traditional Practice",
            description: "Pure beeswax-coated cotton thread for classical shatkarma nasal cleansing and respiratory purification.",
            priceINR: 299,
            priceUSD: 4,
            badge: "",
            heroImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: false,
            section: "trending",
        },
        {
            name: "Yoga Rope Set",
            slug: "yoga-rope-set",
            category: "Yoga Props",
            categorySlug: "yoga-props",
            shortDescription: "Spun Cotton",
            description: "Pair of short and long ropes for inversion hanging, shoulder opening, and back traction exercises.",
            priceINR: 450,
            priceUSD: 6,
            badge: "",
            heroImage: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: false,
            section: "trending",
        },
        {
            name: "Yoga Strap",
            slug: "yoga-strap",
            category: "Yoga Props",
            categorySlug: "yoga-props",
            shortDescription: "Everyday Mobility",
            description: "8-foot organic webbing strap designed to help deepen stretches, extend reach, and improve joint mobility safely.",
            priceINR: 349,
            priceUSD: 5,
            badge: "",
            heroImage: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: false,
            section: "trending",
        },
        {
            name: "Vastra Dhauti",
            slug: "vastra-dhauti",
            category: "Wellness",
            categorySlug: "wellness",
            shortDescription: "Traditional Wellness",
            description: "Fine organic muslin cloth prepared for authentic Hatha yoga digestive and mucosal cleansing practice.",
            priceINR: 599,
            priceUSD: 8,
            badge: "",
            heroImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: false,
            section: "trending",
        },

        // Yoga Mats
        {
            name: "Prana Grip Non-Slip PU Yoga Mat",
            slug: "prana-grip-non-slip-pu-yoga-mat",
            category: "Yoga Mats",
            categorySlug: "yoga-mats",
            shortDescription: "Natural Tree Rubber & Non-slip PU (5mm)",
            description: "5mm dense cushioning with sweat-activated grip and laser-engraved alignment lines for precision practice.",
            priceINR: 3499,
            priceUSD: 42,
            badge: "BESTSELLER",
            heroImage: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: true,
            section: "mats",
        },
        {
            name: "Organic Cork Yoga Mat",
            slug: "organic-cork-yoga-mat",
            category: "Yoga Mats",
            categorySlug: "yoga-mats",
            shortDescription: "100% Sustainable Bio-Cork & Natural Rubber",
            description: "Naturally antimicrobial surface that gets grippier with sweat. Zero plastic, zero toxic chemicals, 100% biodegradable.",
            priceINR: 2999,
            priceUSD: 36,
            badge: "",
            heroImage: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=900&q=85",
            inStock: true,
            featured: true,
            section: "mats",
        }
    ];

    console.log(`📦 Clearing existing products...`);
    await Product.deleteMany({});
    
    console.log(`📦 Seeding ${allProducts.length} new Yoglivya products from resource...`);

    for (const product of allProducts) {
        await Product.create({
            name: product.name,
            slug: product.slug,
            productType: 'simple',
            category: product.category,
            categorySlug: product.categorySlug,
            description: product.description,
            shortDescription: product.shortDescription,
            price: product.priceINR,
            basePriceINR: product.priceINR,
            priceINR: product.priceINR,
            priceUSD: product.priceUSD,
            compareAtPrice: undefined,
            sku: product.slug.toUpperCase(),
            stockCount: 50,
            attributes: [],
            variations: [],
            specifications: [
                { label: 'Material', value: '100% Sustainable & Natural' },
                { label: 'Origin', value: 'Handcrafted in India' },
                { label: 'Care', value: 'Wipe clean with organic cloth' },
                { label: 'Category', value: product.category }
            ],
            mainImage: product.heroImage,
            gallery: [product.heroImage],
            status: 'published',
            featured: product.featured,
            heroImage: product.heroImage,
            images: [product.heroImage],
            inStock: product.inStock,
        });
        console.log(`   ✅ Created: ${product.name} (₹${product.priceINR})`);
    }

    console.log('\n🎉 Resource Seed complete!');
    console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`   Categories: ${staticCategories.length}`);
    console.log(`   Products: ${allProducts.length}`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
