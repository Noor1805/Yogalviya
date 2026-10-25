import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { productSchema } from '@/lib/validations/product';
import {
    normalizeProductDraft,
    type ProductDraftShape,
    summarizeVariations,
    cleanAttributeOptions,
    normalizeVariationMediaByVisualAttributes,
    validateProductDraft,
} from '@/lib/utils/product-admin';
// GET â€” List products with search, filter, pagination
export async function GET(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
        filter.categorySlug = category;
    }

    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Product.countDocuments(filter),
    ]);

    return NextResponse.json({
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
}

// POST â€” Create new product
export async function POST(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await request.json();

        // 1. Zod Validation
        const validation = productSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload data', details: validation.error.format() },
                { status: 400 }
            );
        }

        let validData: ReturnType<typeof normalizeProductDraft>;
        const sanitizedInput: ProductDraftShape = {
            ...validation.data,
            variations: Array.isArray(validation.data.variations)
                ? validation.data.variations.map((variation) => ({
                    ...variation,
                    compareAtPrice: variation.compareAtPrice ?? undefined,
                    gallery: Array.isArray(variation.gallery) ? variation.gallery : [],
                }))
                : validation.data.variations,
        };

        if (sanitizedInput.productType === 'variable' && Array.isArray(sanitizedInput.variations) && sanitizedInput.variations.length > 0) {
            // Trust the client's variation data directly â€” do NOT re-run reconcileVariations
            const attributes = cleanAttributeOptions(sanitizedInput.attributes ?? []);
            // Normalize variations: strip null compareAtPrice so types align
            const variations = normalizeVariationMediaByVisualAttributes(sanitizedInput.variations.map(v => ({
                ...v,
                image: v.image ?? '',
            })));
            const variationSummary = summarizeVariations(variations);

            const baseData = normalizeProductDraft({
                ...sanitizedInput,
                variations: [],
            });

            validData = {
                ...baseData,
                attributes,
                variations,
                price: variationSummary.minPrice,
                compareAtPrice: variationSummary.minCompareAtPrice,
                stockCount: variationSummary.totalStock,
                inStock: variationSummary.totalStock > 0,
            };
        } else {
            validData = normalizeProductDraft(sanitizedInput);
        }

        // 2. Auto-generate slug if not provided
        if (!validData.slug && validData.name) {
            validData.slug = validData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        // Check slug uniqueness
        const existing = await Product.findOne({ slug: validData.slug });
        if (existing) {
            return NextResponse.json(
                { error: 'A product with this slug already exists' },
                { status: 400 }
            );
        }

        const businessRuleErrors = validateProductDraft(validData);
        if (businessRuleErrors.length > 0) {
            return NextResponse.json(
                { error: businessRuleErrors[0], details: businessRuleErrors },
                { status: 400 }
            );
        }

        const product = await Product.create(validData);

        // Instantly refresh live website caches
        revalidatePath('/products');
        revalidatePath('/');
        revalidateTag('products', 'max');
        if (product.categorySlug) {
            revalidatePath(`/products/${product.categorySlug}`);
            revalidatePath(`/products/${product.categorySlug}/${product.slug}`);
        }

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
