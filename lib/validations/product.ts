import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    slug: z.string().optional(),
    productType: z.enum(['simple', 'variable']).default('simple'),
    category: z.string().min(1, 'Category is required'),
    categorySlug: z.string().min(1, 'Category Slug is required'),
    description: z.string().optional(),
    longDescription: z.string().optional(),
    shortDescription: z.string().optional(),
    additionalDescription: z.string().optional(),
    subheadingDescription: z.string().optional(),
    productDetails: z.string().optional(),
    commitment: z.string().optional(),
    additionalInfo: z.array(z.object({
        label: z.string(),
        value: z.string()
    })).optional(),

    // Simple product
    price: z.number().optional(),
    compareAtPrice: z.number().optional().nullable(),
    sku: z.string().optional(),
    stockCount: z.number().optional(),

    // Variable product
    attributes: z.array(
        z.object({
            name: z.string(),
            values: z.array(z.string()),
            colorValues: z.record(z.string(), z.string()).optional(),
        })
    ).optional(),
    variations: z.array(
        z.object({
            id: z.string(),
            attributes: z.record(z.string(), z.string()),
            price: z.number(),
            compareAtPrice: z.number().optional().nullable(),
            sku: z.string(),
            stockCount: z.number(),
            image: z.string().optional(),
            gallery: z.array(z.string()).optional(),
        })
    ).optional(),

    // Media
    mainImage: z.string().optional(),
    gallery: z.array(z.string()).optional(),

    // Meta
    specifications: z.array(
        z.object({
            label: z.string(),
            value: z.string(),
        })
    ).optional(),
    status: z.enum(['draft', 'published']).default('draft'),
    featured: z.boolean().optional(),
    badge: z.string().optional(),
    availableBadges: z.array(z.string()).optional(),

    // Legacy compat — accepted but not required
    heroImage: z.string().optional(),
    images: z.array(z.string()).optional(),
    inStock: z.boolean().optional(),
});
