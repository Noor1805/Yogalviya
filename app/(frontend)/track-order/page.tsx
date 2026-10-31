import { Metadata } from 'next';
import { buildMetadata } from '@/lib/utils/seo';
import TrackOrderClient from './TrackOrderClient';

export const metadata: Metadata = buildMetadata({
  title: 'Track Your Order | Yoglivya',
  description:
    'Follow your Yoglivya order status. Enter your order number and email to check dispatch, shipment, and transit updates.',
  path: '/track-order',
  keywords: [
    'track Yoglivya order',
    'yoga order status',
    'check delivery progress',
  ],
});

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
