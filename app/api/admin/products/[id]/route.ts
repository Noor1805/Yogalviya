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
interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET â€” Single product by ID
export async function GET(_request: NextRequest, { params }: RouteParams) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    try {
        const product = await Product.findById(id).lean();
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
}

// PUT â€” Update product
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    try {
        const body = await request.json();

        // Zod Validation (Partial because it's an update)
        const validation = productSchema.partial().safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload data', details: validation.error.format() },
                { status: 400 }
            );
        }

        const existingProduct = await Product.findById(id).lean();
        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const previousCategorySlug = existingProduct.categorySlug;
        const previousSlug = existingProduct.slug;

        // Merge incoming payload with existing product for non-variation fields
        const mergedInput: ProductDraftShape = {
            ...(existingProduct as unknown as ProductDraftShape),
            ...validation.data,
            variations: Array.isArray(validation.data.variations)
                ? validation.data.variations.map((variation) => ({
                    ...variation,
                    compareAtPrice: variation.compareAtPrice ?? undefined,
                    gallery: Array.isArray(variation.gallery) ? variation.gallery : [],
                }))
                : (existingProduct as unknown as ProductDraftShape).variations,
        };

        let validData: ReturnType<typeof normalizeProductDraft>;

        if (mergedInput.productType === 'variable' && Array.isArray(validation.data.variations) && validation.data.variations.length > 0) {
            // Trust the client's variation data directly â€” do NOT re-run reconcileVariations
            // which would re-match by signature and could wipe gallery images.
            const attributes = cleanAttributeOptions(mergedInput.attributes ?? []);
            // Normalize variations: strip null compareAtPrice so types align
            const variations = normalizeVariationMediaByVisualAttributes(validation.data.variations.map(v => ({
                ...v,
                compareAtPrice: v.compareAtPrice ?? undefined,
                image: v.image ?? '',
                gallery: Array.isArray(v.gallery) ? v.gallery : [],
            })));
            const variationSummary = summarizeVariations(variations);

            // Run normalizeProductDraft only for non-variation fields
            const baseData = normalizeProductDraft({
                ...mergedInput,
                variations: [], // Temporarily empty so reconcileVariations inside makes an empty array
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
            validData = normalizeProductDraft(mergedInput);
        }

        // Check slug uniqueness if slug changed
        if (validData.slug) {
            const existing = await Product.findOne({
                slug: validData.slug,
                _id: { $ne: id },
            });
            if (existing) {
                return NextResponse.json(
                    { error: 'A product with this slug already exists' },
                    { status: 400 }
                );
            }
        }

        const businessRuleErrors = validateProductDraft(validData);
        if (businessRuleErrors.length > 0) {
            return NextResponse.json(
                { error: businessRuleErrors[0], details: businessRuleErrors },
                { status: 400 }
            );
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { $set: validData },
            { new: true, runValidators: true }
        );

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Instantly refresh live website caches
        revalidatePath('/products');
        revalidatePath('/');
        revalidateTag('products', 'max');
        if (previousCategorySlug) {
            revalidatePath(`/products/${previousCategorySlug}`);
        }
        if (previousCategorySlug && previousSlug) {
            revalidatePath(`/products/${previousCategorySlug}/${previousSlug}`);
        }
        if (product.categorySlug) {
            revalidatePath(`/products/${product.categorySlug}`);
            revalidatePath(`/products/${product.categorySlug}/${product.slug}`);
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE â€” Delete product
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    try {
        const product = await Product.findByIdAndUpdate(id, {
            $set: { isDeleted: true, deletedAt: new Date() }
        });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Instantly refresh live website caches
        revalidatePath('/products');
        revalidatePath('/');
        revalidateTag('products', 'max');
        if (product.categorySlug) {
            revalidatePath(`/products/${product.categorySlug}`);
            revalidatePath(`/products/${product.categorySlug}/${product.slug}`);
        }

        return NextResponse.json({ success: true, message: 'Product deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
