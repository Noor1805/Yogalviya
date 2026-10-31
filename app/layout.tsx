import type { Metadata } from 'next';
import { Inter, DM_Sans, Space_Grotesk, Instrument_Serif } from 'next/font/google';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400'],
  style: ['normal', 'italic'],
});

import { Suspense } from 'react';
import './globals.css';
import StoreHeader from '@/components/layout/StoreHeader';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import FrontendWrapper from '@/components/layout/FrontendWrapper';
import SmoothScroll from '@/components/layout/SmoothScroll';
import JsonLd from '@/components/seo/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/utils/seo';
import { auth } from '@/lib/auth';
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import MetaPixel from '@/components/analytics/MetaPixel';
import AppProviders from '@/components/providers/AppProviders';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Yoga & Meditation Essentials | Yoglivya',
    template: '%s | Yoglivya',
  },
  description:
    'Explore Yoglivya yoga mats, props and meditation essentials for movement, stillness and everyday practice. Find what suits your routine.',
  keywords: [
    'yoga mats',
    'yoga props',
    'meditation essentials',
    'yoga belts and ropes',
    'mindful practice India'
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Yoglivya',
    title: 'Yoglivya — Mindful Yoga & Wellness Essentials',
    description:
      'Discover mindful yoga mats, organic cork blocks, meditation bolsters, and breathable activewear handcrafted for your conscious wellness journey.',
    images: ['/images/og-default.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  verification: {
    google: 'z9szEHccW08BQovCXE1AjpIkBidMxg6-71AuIzpjFsw',
  },
  robots: {
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
      </head>
      <body className="min-h-screen bg-white font-sans text-black antialiased" suppressHydrationWarning>
        <Toaster richColors position="top-right" />
        <AppProviders session={session}>
          <SmoothScroll>
            <FrontendWrapper>
              <StoreHeader />
            </FrontendWrapper>

            <main className="min-h-[calc(100vh-4rem)]">{children}</main>

            <FrontendWrapper>
              <Footer />
              <MobileNav />
            </FrontendWrapper>
            <Analytics />
            <SpeedInsights />
            <Suspense fallback={null}>
              <MetaPixel />
            </Suspense>
          </SmoothScroll>
        </AppProviders>
      </body>
    </html>
  );
}
