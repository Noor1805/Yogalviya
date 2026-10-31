import { Metadata } from 'next';
import { Product } from '@/types/product';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = 'Yoglivya';

interface BuildMetadataOptions {
    title: string;
    description: string;
    path: string;
    image?: string;
    noIndex?: boolean;
    keywords?: string[];
}

export function buildMetadata({
    title,
    description,
    path,
    image = '/images/og-default.jpg',
    noIndex = false,
    keywords = [
        'yoga mats',
        'yoga props and blocks',
        'meditation bolsters',
        'mindful activewear',
        'cork yoga mats',
        'organic yoga accessories',
        'Yoglivya yoga gear India'
    ],
}: BuildMetadataOptions): Metadata {
    const url = `${SITE_URL}${path}`;
    const fullTitle = path === '/' ? `${SITE_NAME} — Mindful Yoga & Wellness Essentials` : `${title} | ${SITE_NAME}`;

    return {
        title: fullTitle,
        description,
        keywords,
        robots: noIndex ? { index: false, follow: false } : {
            index: true,
            follow: true,
            nocache: false,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: url,
            languages: {
                'en-US': url,
            },
        },
        icons: {
            icon: '/Favicon-512x512-1.webp',
            shortcut: '/Favicon-512x512-1.webp',
            apple: '/Favicon-512x512-1.webp',
        },
        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName: SITE_NAME,
            type: 'website',
            images: [
                {
                    url: `${SITE_URL}${image}`,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [`${SITE_URL}${image}`],
        },
    };
}

export function organizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'Store'],
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        description: 'Premium mindful yoga essentials, eco-friendly mats, ergonomic props, and activewear crafted for holistic wellness.',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'IN',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+91 9891975582',
            contactType: 'customer service',
            availableLanguage: ['English', 'Hindi'],
        },
        sameAs: [],
    };
}

export function websiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/products?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
        creator: {
            '@type': 'Organization',
            name: 'Devacia Agency',
            url: 'https://www.devacia.com/',
            description: 'Full-service web development and digital solutions agency specializing in high-performance eCommerce, SaaS, and brand websites.',
        },
    };
}

export function productSchema(product: Product) {
    const baseSchema: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.shortDescription,
        image: product.images.map((img) => `${SITE_URL}${img}`),
        brand: {
            '@type': 'Brand',
            name: SITE_NAME,
        },
        category: product.category,
    };

    if (product.basePriceUSD > 0) {
        baseSchema.offers = {
            '@type': 'Offer',
            price: product.basePriceUSD,
            priceCurrency: 'USD',
            itemCondition: 'https://schema.org/NewCondition',
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 30,
                returnMethod: 'https://schema.org/ReturnByMail',
                returnFees: 'https://schema.org/ReturnShippingFees'
            }
        };
    }

    return baseSchema;
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

export function aboutPageSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: `About ${SITE_NAME} - Mindful Yoga & Wellness Essentials`,
        description: `Learn about ${SITE_NAME}'s philosophy, our commitment to mindful practice, and our collection of authentic yoga props and wellness essentials.`,
        url: `${SITE_URL}/about`,
        mainEntity: organizationSchema(),
    };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}${item.url}`,
        })),
    };
}
