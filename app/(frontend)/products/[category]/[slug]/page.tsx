import { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { getAllProducts, getProductByCategoryAndSlug, getCategoryBySlug } from "@/data/products";
import { buildMetadata, productSchema } from "@/lib/utils/seo";
import ProductCard from "@/components/products/ProductCard";
import ProductClientWrapper from "./ProductClientWrapper";
import ProductTabs from "./ProductTabs";
import ProductSlider from "@/components/products/ProductSlider";
import RecentlyViewedSlider, { RecentlyViewedTracker } from "@/components/products/RecentlyViewedSlider";
import ViewContentTracker from "@/components/analytics/ViewContentTracker";

interface ProductPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export const dynamic = 'force-dynamic';

function formatCategoryName(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ category: p.categorySlug, slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const product = await getProductByCategoryAndSlug(category, slug);
  if (!product) return {};
  return buildMetadata({
    title: product.name,
    description: product.longDescription || product.name,
    path: `/products/${product.categorySlug}/${product.slug}`,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, slug } = await params;
  
  // Parallelize DB queries
  const [product, cat, allProducts] = await Promise.all([
    getProductByCategoryAndSlug(category, slug),
    getCategoryBySlug(category),
    getAllProducts(),
  ]);

  if (!product) notFound();

  const resolvedCategory = cat ?? {
    name: product.category || formatCategoryName(product.categorySlug || category),
    slug: product.categorySlug || category,
    description: '',
    image: '',
  };
  const relatedCategorySlug = product.categorySlug || category;
  const related = allProducts.filter((p) => p.categorySlug === relatedCategorySlug && p.slug !== slug).slice(0, 8);
  const upsell = related.length >= 2 ? related : allProducts.filter((p) => p.slug !== slug).slice(0, 8);

  // Serialize product data for client components
  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    heroImage: product.heroImage,
    images: product.images || [],
    featured: product.featured,
    inStock: product.inStock,
    productType: (product.productType || 'simple') as 'simple' | 'variable',
    price: product.basePriceUSD,
    compareAtPrice: product.compareAtPrice,
    sku: product.sku || product.slug.toUpperCase(),
    stockCount: product.stockCount ?? (product.inStock ? 1 : 0),
    attributes: product.attributes || [],
    variations: product.variations || [],
    description: product.longDescription,
    shortDescription: product.shortDescription,
    productDetails: product.productDetails,
    commitment: product.commitment,
    additionalInfo: product.additionalInfo,
    specifications: product.specifications || [],
  };

  // Data for recently viewed tracker (serializable)
  const recentlyViewedData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categorySlug: product.categorySlug,
    category: product.category,
    heroImage: product.heroImage,
    basePriceUSD: product.basePriceUSD,
    badge: product.badge,
  };

  return (
    <>
      <JsonLd data={productSchema(product)} />
      <ViewContentTracker />

      {/* Track this product in recently viewed (client-side, localStorage) */}
      <RecentlyViewedTracker product={recentlyViewedData} />

      {/* Breadcrumb — hidden on mobile to save space */}
      <Container className="py-4 hidden lg:block">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Products", href: "/products" },
            { name: resolvedCategory.name, href: `/products/${resolvedCategory.slug}` },
            { name: product.name, href: `/products/${resolvedCategory.slug}/${product.slug}` },
          ]}
        />
      </Container>

      {/* ══ PRODUCT HERO ══ */}
      <section className="bg-white pb-8">
        <Container className="max-w-6xl">
          {/* Mobile: add bottom padding so sticky bar doesn't overlap content */}
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1fr_1fr] items-start pb-24 lg:pb-0">
            <ProductClientWrapper product={productData} />
          </div>
        </Container>
      </section>

      {/* ══ TABS / ACCORDIONS: Description / Additional Info / Reviews ══ */}
      <Container>
        <ProductTabs
          productId={product.id}
          description={product.longDescription}
          shortDescription={product.shortDescription}
          productDetails={product.productDetails}
          commitment={product.commitment}
          additionalInfo={product.additionalInfo}
          specifications={product.specifications || []}
        />
      </Container>

      {/* ══ YOU MAY ALSO LIKE — Mobile: horizontal slider, Desktop: grid ══ */}
      {upsell.length > 0 && (
        <>
          {/* Mobile slider */}
          <div className="lg:hidden bg-white border-t border-neutral-100 mt-4">
            <ProductSlider title="You May Also Like" products={upsell} />
          </div>

          {/* Desktop grid */}
          <section className="hidden lg:block bg-white py-20 border-t border-neutral-100">
            <Container>
              <div className="mb-12">
                <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-neutral-900">
                  You May Also Like
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {upsell.slice(0, 3).map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </Container>
          </section>
        </>
      )}

      {/* ══ RECENTLY VIEWED — Mobile only ══ */}
      <div className="lg:hidden bg-white">
        <RecentlyViewedSlider excludeId={product.id} />
      </div>

      {/* Mobile bottom spacing: sticky CTA bar (~64px) + bottom nav (~72px) */}
      <div className="lg:hidden h-36" />
    </>
  );
}
