import { Metadata } from 'next';
import { buildMetadata } from '@/lib/utils/seo';
import ContactClient from './ContactClient';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Yoglivya | Product & Order Support',
  description:
    'Contact Yoglivya with product questions, order enquiries or requests for Yoglivya-branded bulk purchases for studios, classes and organisations.',
  path: '/contact',
  keywords: [
    'contact Yoglivya',
    'yoga customer support India',
    'bulk yoga props studio order',
    'yoga essentials support',
  ],
});

export default function ContactPage() {
  return <ContactClient />;
}
