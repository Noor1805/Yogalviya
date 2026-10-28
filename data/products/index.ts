import { Product, ProductCategory, CategoryInfo } from '@/types/product';
import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/db';
import ProductModel from '@/lib/models/Product';
import CategoryModel from '@/lib/models/Category';
import { summarizeVariations } from '@/lib/utils/product-admin';
import { normalizeProductDocumentForClient } from '@/lib/utils/product-serialization';

// ── Fallback static data (used if DB is empty or unavailable) ──
const staticProducts: Product[] = [];
const staticCategories: CategoryInfo[] = [];

const authenticProductImages: Record<string, string> = {
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

// ── Helper to convert MongoDB doc to Product type ──────────────────────────
function docToProduct(doc: Record<string, unknown>): Product {
    const productType = (doc.productType as Product['productType']) || 'simple';
    const normalizedClientShape = normalizeProductDocumentForClient(doc);
    const variations = normalizedClientShape.variations;
    const attributes = normalizedClientShape.attributes;
    const gallery = normalizedClientShape.gallery;
    const colors = normalizedClientShape.colors;
    const variationSummary = summarizeVariations(variations || []);
    const slug = (doc.slug as string) || '';
    const fallbackStudioImage = authenticProductImages[slug];
    let heroImage = String(doc.mainImage || doc.heroImage || gallery[0] || '').trim();

    if (fallbackStudioImage && (!heroImage || heroImage.includes('unsplash.com'))) {
        heroImage = fallbackStudioImage;
    }

    const updatedGallery = fallbackStudioImage && (gallery.length === 0 || gallery.some(g => g.includes('unsplash.com')))
        ? [fallbackStudioImage, ...gallery.filter(g => !g.includes('unsplash.com'))]
        : gallery;

    let baseUSD = (doc.basePriceUSD as number) || (doc.price as number) || 0;
    let baseINR = (doc.basePriceINR as number) || 0;

    if (baseUSD === 0 && Array.isArray(doc.pricingTiers) && doc.pricingTiers.length > 0) {
        baseUSD = doc.pricingTiers[0].priceUSD;
        baseINR = doc.pricingTiers[0].priceINR;
    }

    if (productType === 'variable' && variationSummary.count > 0) {
        baseUSD = variationSummary.minPrice;
    }

    if (baseINR === 0 && baseUSD > 0) {
        baseINR = baseUSD;
    }

    const totalStock =
        productType === 'variable'
            ? variationSummary.totalStock
            : ((doc.stockCount as number) || 0);

    return {
        id: (doc._id || doc.id || '').toString(),
        name: doc.name as string,
        slug: doc.slug as string,
        category: doc.category as ProductCategory,
        categorySlug: doc.categorySlug as string,
        shortDescription: (doc.shortDescription ?? doc.additionalDescription ?? doc.subheadingDescription ?? '') as string,
        longDescription: (doc.description ?? doc.longDescription ?? '') as string,
        productDetails: (doc.productDetails || '') as string,
        commitment: (doc.commitment || '') as string,
        additionalInfo: normalizedClientShape.additionalInfo,
        specifications: normalizedClientShape.specifications,
        specificationsTitle: (doc.specificationsTitle || 'Product Details') as string,
        orderDetails: normalizedClientShape.orderDetails,
        orderDetailsTitle: (doc.orderDetailsTitle || 'Order Details') as string,
        basePriceUSD: baseUSD,
        basePriceINR: baseINR,
        moq: (doc.moq || 10) as number,
        images: updatedGallery,
        aplusImages: normalizedClientShape.aplusImages,
        heroImage,
        features: normalizedClientShape.features,
        certifications: normalizedClientShape.certifications,
        colors,
        weight: (doc.weight || '') as string,
        inStock: typeof doc.inStock === 'boolean' ? (doc.inStock as boolean) : totalStock > 0,
        featured: doc.featured as boolean,
        badge: (doc.badge as string) || '',
        productType,
        attributes,
        variations,
        compareAtPrice: (doc.compareAtPrice as number) || variationSummary.minCompareAtPrice,
        sku: (doc.sku as string) || '',
        stockCount: totalStock,
        stockLeft: totalStock,
    };
}

// ── Raw DB fetchers (not cached — used internally) ────────────────────────
async function _fetchAllProducts(): Promise<Product[]> {
    try {
        await dbConnect();
        const docs = await ProductModel
            .find({ isDeleted: { $ne: true } })
            .sort({ createdAt: -1 })
            // Only select the fields we actually need on the listing page
            .select('name slug category categorySlug heroImage gallery mainImage images basePriceUSD basePriceINR price compareAtPrice productType variations attributes badge inStock featured stockCount moq pricingTiers colors')
            .lean();
        if (docs.length > 0) {
            return docs.map((d) => docToProduct(d as unknown as Record<string, unknown>));
        }
    } catch (e) {
        console.warn('DB unavailable, using static data:', e);
    }
    return staticProducts;
}

async function _fetchProductBySlug(slug: string): Promise<Product | undefined> {
    try {
        await dbConnect();
        const doc = await ProductModel.findOne({ slug, isDeleted: { $ne: true } }).lean();
        if (doc) return docToProduct(doc as unknown as Record<string, unknown>);
    } catch (e) {
        console.warn('DB unavailable, using static data:', e);
    }
    return staticProducts.find((p) => p.slug === slug);
}

const authenticCategoryImages: Record<string, string> = {
    'yoga-props': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139079/yoglivya/categories/yoga-blocks.png',
    'yoga-mats': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139081/yoglivya/categories/yoga-mats.png',
    'meditation': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139072/yoglivya/products/yoga-bolster.jpg',
    'wellness': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139068/yoglivya/products/trataka-stand.jpg',
    'accessories': 'https://res.cloudinary.com/dzobobkqw/image/upload/v1793139078/yoglivya/categories/yoga-accessories.png',
};

async function _fetchAllCategories(): Promise<CategoryInfo[]> {
    try {
        await dbConnect();
        const docs = await CategoryModel.find().sort({ order: 1 }).lean();
        if (docs.length > 0) {
            return docs.map((d) => ({
                name: d.name as ProductCategory,
                slug: d.slug,
                description: d.description || '',
                image: (authenticCategoryImages[d.slug] || d.image || ''),
            }));
        }
    } catch (e) {
        console.warn('DB unavailable, using static data:', e);
    }
    return staticCategories;
}

// ── Cached wrappers (30-second server-side cache, revalidated by tag) ──────
// This prevents redundant DB round-trips on the same request or across
// concurrent SSR renders for the same page.

const CACHE_TTL = 30; // seconds — short enough to see edits quickly

export const getAllProducts = unstable_cache(
    _fetchAllProducts,
    ['all-products'],
    { revalidate: CACHE_TTL, tags: ['products'] }
);

export const getAllCategories = unstable_cache(
    _fetchAllCategories,
    ['all-categories'],
    { revalidate: CACHE_TTL, tags: ['categories'] }
);

export const getProductBySlug = unstable_cache(
    _fetchProductBySlug,
    ['product-by-slug'],
    { revalidate: CACHE_TTL, tags: ['products'] }
);

export async function getProductByCategoryAndSlug(
    categorySlug: string,
    slug: string
): Promise<Product | undefined> {
    try {
        await dbConnect();
        const doc = await ProductModel.findOne({
            categorySlug,
            slug,
            isDeleted: { $ne: true },
        }).lean();

        if (doc) {
            return docToProduct(doc as unknown as Record<string, unknown>);
        }
    } catch (e) {
        console.warn('DB unavailable, using static data:', e);
    }

    return staticProducts.find((product) => product.categorySlug === categorySlug && product.slug === slug);
}

// ── Other product queries ─────────────────────────────────────────────────

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
    try {
        await dbConnect();
        const docs = await ProductModel
            .find({ categorySlug, isDeleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .lean();
        if (docs.length > 0) {
            return docs.map((d) => docToProduct(d as unknown as Record<string, unknown>));
        }
    } catch (e) {
        console.warn('DB unavailable, using static data:', e);
    }
    return staticProducts.filter((p) => p.categorySlug === categorySlug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
    try {
        await dbConnect();
        const docs = await ProductModel.find({ featured: true, isDeleted: { $ne: true } }).lean();
        if (docs.length > 0) {
            return docs.map((d) => docToProduct(d as unknown as Record<string, unknown>));
        }
    } catch (e) {
        console.warn('DB unavailable, using static data:', e);
    }
    return staticProducts.filter((p) => p.featured);
}

export async function getCategoryBySlug(slug: string): Promise<CategoryInfo | undefined> {
    // Re-use the cached all-categories list to avoid an extra DB round-trip
    const cats = await getAllCategories();
    return cats.find((c) => c.slug === slug);
}

// Legacy exports for compatibility
export const categories = staticCategories;
export const allProducts = staticProducts;
