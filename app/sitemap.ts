import { MetadataRoute } from 'next';
import { getAllCategories, getAllProducts } from '@/data/products';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await getAllProducts();
    const categories = await getAllCategories();

    const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${SITE_URL}/products/${product.categorySlug}/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${SITE_URL}/products/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    }));

    const staticUrls: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];

    return [...staticUrls, ...categoryUrls, ...productUrls];
}
