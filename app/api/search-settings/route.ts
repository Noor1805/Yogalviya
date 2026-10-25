import { NextResponse } from 'next/server';
import { getAllProducts, getAllCategories } from '@/data/products';
import type { CategoryInfo, Product } from '@/types/product';

type SearchOverlayCategory = CategoryInfo & {
    showInSearchOverlay?: boolean;
};

type SearchOverlayProduct = Product & {
    isMostCoveted?: boolean;
};

type SearchOverlayProductCard = {
    id: string;
    name: string;
    image: string;
    href: string;
};

// GET - Fetch public search overlay settings
export async function GET() {
    try {
        const [allProducts, allCategories] = await Promise.all([
            getAllProducts(),
            getAllCategories()
        ]);

        const categoriesSource = allCategories as SearchOverlayCategory[];
        const productsSource = allProducts as SearchOverlayProduct[];

        // Get enabled categories (those with showInSearchOverlay: true)
        const enabledCategories = categoriesSource
            .filter((category) => category.showInSearchOverlay === true)
            .map((category) => ({ name: category.name, slug: category.slug }));

        const categories = enabledCategories.length > 0
            ? enabledCategories
            : categoriesSource
                .slice(0, 6)
                .map((category) => ({ name: category.name, slug: category.slug }));

        const mapProductCard = (product: SearchOverlayProduct): SearchOverlayProductCard => ({
            id: product.id,
            name: product.name,
            image: product.heroImage || product.images?.[0] || '/placeholder.jpg',
            href: `/products/${product.categorySlug}/${product.slug}`
        });

        const mostCoveted = productsSource
            .filter((product) => product.isMostCoveted === true)
            .map(mapProductCard);

        const featuredProducts = mostCoveted.length > 0
            ? mostCoveted
            : productsSource.slice(0, 8).map(mapProductCard);

        return NextResponse.json({
            categories,
            trendingSearches: ['Suits', 'Silk Ties', 'Blazers', 'New Collection'],
            featuredProducts
        });
    } catch (error) {
        console.error('Error fetching search settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}
