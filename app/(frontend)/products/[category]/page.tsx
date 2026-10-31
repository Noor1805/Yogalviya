import { Metadata } from 'next';
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductGrid from '@/components/products/ProductGrid';
import { getProductsByCategory, getCategoryBySlug, getAllCategories } from '@/data/products';
import { buildMetadata } from '@/lib/utils/seo';

interface CategoryPageProps {
    params: Promise<{
        category: string;
    }>;
}

export async function generateStaticParams() {
    const categories = await getAllCategories();
    return categories.map((cat) => ({
        category: cat.slug,
    }));
}

const CATEGORY_SEO_MAP: Record<string, { title: string; description: string }> = {
    'yoga-mats': {
        title: 'Yoga Mats for Your Practice | Yoglivya',
        description: 'Explore Yoglivya yoga mats. Compare available materials, sizes and thicknesses, and review product details to find an option for your routine.',
    },
    'yoga-props': {
        title: 'Yoga Props, Belts & Ropes | Yoglivya',
        description: 'Explore yoga props for your practice. Compare available belts, ropes, blocks and other essentials by material, size and intended use.',
    },
    'meditation': {
        title: 'Meditation Essentials | Yoglivya',
        description: 'Explore Yoglivya meditation essentials for the space and routine you bring to stillness. Review product details and available options.',
    },
    'wellness': {
        title: 'Wellness Essentials | Yoglivya',
        description: 'Explore products for personal rituals and everyday routines. Read each listing for its materials or ingredients, intended use and care information.',
    },
    'accessories': {
        title: 'Yoga Accessories | Yoglivya',
        description: 'Find the additional pieces that fit around your practice. Explore the available accessories and choose what is useful to your routine.',
    },
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { category } = await params;
    const cat = await getCategoryBySlug(category);
    if (!cat) return {};

    const override = CATEGORY_SEO_MAP[category];

    return buildMetadata({
        title: override ? override.title : `${cat.name}`,
        description: override ? override.description : cat.description,
        path: `/products/${cat.slug}`,
    });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = await params;
    const cat = await getCategoryBySlug(category);

    if (!cat) {
        notFound();
    }

    const products = await getProductsByCategory(category);

    return (
        <>
            <Container className="py-8">
                <Breadcrumbs
                    items={[
                        { name: 'Home', href: '/' },
                        { name: 'Products', href: '/products' },
                        { name: cat.name, href: `/products/${cat.slug}` },
                    ]}
                />
            </Container>

            <section className="bg-gradient-to-br from-sage-50 via-cream-100 to-cream-50 py-14">
                <Container className="text-center">
                    <p className="animate-fade-in-up text-xs font-semibold uppercase tracking-widest text-sage-500">Category</p>
                    <h1 className="animate-fade-in-up delay-100 mt-2 font-[var(--font-dm-sans)] text-4xl font-extrabold tracking-tight text-sage-900 sm:text-5xl">
                        Explore{' '}
                        <span className="bg-gradient-to-r from-sage-600 to-sage-800 bg-clip-text text-transparent">
                            {cat.name}
                        </span>
                    </h1>
                    <p className="animate-fade-in-up delay-200 mx-auto mt-4 max-w-2xl text-lg text-sage-600">
                        {cat.description}
                    </p>
                </Container>
            </section>

            <section className="bg-cream-50 py-12">
                <Container>
                    <ProductGrid products={products} />
                </Container>
            </section>
        </>
    );
}
