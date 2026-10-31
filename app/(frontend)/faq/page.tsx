import { Metadata } from 'next';
import { buildMetadata } from '@/lib/utils/seo';
import FaqClient from './FaqClient';

export const metadata: Metadata = buildMetadata({
  title: 'Frequently Asked Questions | Yoglivya',
  description:
    'Find answers to common questions about Yoglivya products, orders and support, with links to delivery and returns information.',
  path: '/faq',
  keywords: [
    'yoga props FAQ',
    'Yoglivya questions',
    'yoga order tracking FAQ',
    'yoga mats delivery',
  ],
});

export default function FaqPage() {
  return <FaqClient />;
}
