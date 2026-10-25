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
                .select('name slug categorySlug images')
                .lean();

            return NextResponse.json({ products });
        }

        // If slug is provided, fetch product by slug
        if (slug) {
            const products = await Product.find({ slug })
                .select('name slug categorySlug images')
                .lean();

            return NextResponse.json({ products });
        }

        // Otherwise, return empty or handle other query params
        return NextResponse.json({ products: [] });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
