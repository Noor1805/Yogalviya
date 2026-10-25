import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Attribute from '@/lib/models/Attribute';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import ProductEditor from '../../ProductEditor';

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;

    await dbConnect();

    let product;
    try {
        product = await Product.findById(id).lean();
    } catch {
        notFound();
    }

    if (!product) {
        notFound();
    }

    const productWithLegacyFields = product as typeof product & {
        longDescription?: string;
        additionalDescription?: string;
        subheadingDescription?: string;
    };

    const [categories, attributes] = await Promise.all([
        Category.find().sort({ order: 1 }).lean(),
        Attribute.find({ isDeleted: { $ne: true }, isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
    ]);
    const categoryOptions = categories.map((c) => ({
        name: c.name,
        slug: c.slug,
    }));
    const globalAttributes = attributes.map((attribute) => ({
        id: String(attribute._id),
        name: attribute.name,
        slug: attribute.slug,
        type: attribute.type,
        values: attribute.values || [],
        colorValues: attribute.colorValues || {},
        description: attribute.description || '',
    }));

    // Serialize for client component — maps to new ProductFormData shape
    const productData = {
        name: product.name || '',
        slug: product.slug || '',
        productType: (product.productType || 'simple') as 'simple' | 'variable',
        category: product.category || '',
        categorySlug: product.categorySlug || '',
        description: product.description ?? productWithLegacyFields.longDescription ?? '',
        shortDescription:
            product.shortDescription ??
            productWithLegacyFields.additionalDescription ??
            productWithLegacyFields.subheadingDescription ??
            '',
        productDetails: product.productDetails ?? '',
        commitment: product.commitment ?? '',
        additionalInfo: Array.isArray(product.additionalInfo) ? product.additionalInfo : [],
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice,
        sku: product.sku || '',
        stockCount: product.stockCount || 0,
        specifications: (product.specifications || []).map((s: { label: string; value: string }) => ({
            label: s.label,
            value: s.value,
        })),
        mainImage: product.mainImage || product.heroImage || '',
        gallery: product.gallery || product.images || [],
        attributes: (product.attributes || []).map((a: {
            name: string;
            values: string[];
            colorValues?: Record<string, string>;
        }) => ({
            name: a.name,
            values: a.values || [],
            colorValues: a.colorValues || {},
        })),
        variations: (product.variations || []).map((v: {
            id: string;
            attributes: Record<string, string>;
            price: number;
            compareAtPrice?: number;
            sku: string;
            stockCount: number;
            image?: string;
            gallery?: string[];
        }) => ({
            id: v.id,
            attributes: v.attributes || {},
            price: v.price || 0,
            compareAtPrice: v.compareAtPrice,
            sku: v.sku || '',
            stockCount: v.stockCount || 0,
            image: v.image || '',
            gallery: Array.isArray(v.gallery) ? v.gallery : [],
        })),
        status: (product.status || 'draft') as 'draft' | 'published',
        featured: typeof product.featured === 'boolean' ? product.featured : false,
        badge: typeof product.badge === 'string' ? product.badge : '',
        availableBadges: Array.isArray((product as any).availableBadges) ? (product as any).availableBadges : [],
    };

    return (
        <ProductEditor
            initialData={productData}
            productId={id}
            categories={categoryOptions}
            globalAttributes={globalAttributes}
        />
    );
}
