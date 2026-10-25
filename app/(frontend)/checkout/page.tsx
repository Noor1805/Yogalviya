import { buildMetadata } from '@/lib/utils/seo';
import CheckoutPageClient from '@/components/checkout/CheckoutPageClient';

export const metadata = buildMetadata({
  title: 'Checkout',
  description:
    'Complete your Yoglivya order with secure payment, delivery preferences, and a refined shopping bag summary.',
  path: '/checkout',
  keywords: ['yoga checkout', 'secure checkout', 'yoglivya order summary', 'mindful shopping'],
});

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
