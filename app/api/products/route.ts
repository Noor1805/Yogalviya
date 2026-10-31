import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';

// GET - Fetch products (public)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids');
        const slug = searchParams.get('slug');

        // If IDs are provided, fetch specific products
        if (ids) {
            const idArray = ids.split(',').filter(id => id.trim());
            const products = await Product.find({ _id: { $in: idArray } })
                .select('name slug category categorySlug price priceINR priceUSD mainImage images heroImage shortDescription badge inStock stockCount sku')
                .lean();

            return NextResponse.json({ products });
        }

        // If slug is provided, fetch product by slug
        if (slug) {
            const products = await Product.find({ slug })
                .select('name slug category categorySlug price priceINR priceUSD mainImage images heroImage shortDescription badge inStock stockCount sku')
                .lean();

            return NextResponse.json({ products });
        }

        // If category is provided
        const category = searchParams.get('category');
        if (category) {
            const products = await Product.find({
                categorySlug: category,
                isDeleted: { $ne: true },
                status: 'published',
            })
                .select('name slug category categorySlug price priceINR priceUSD mainImage images heroImage shortDescription badge inStock stockCount featured')
                .lean();

            return NextResponse.json({ products });
        }

        // Return all published products
        const products = await Product.find({
            isDeleted: { $ne: true },
            status: 'published',
        })
            .select('name slug category categorySlug price priceINR priceUSD mainImage images heroImage shortDescription badge inStock stockCount featured')
            .lean();

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
