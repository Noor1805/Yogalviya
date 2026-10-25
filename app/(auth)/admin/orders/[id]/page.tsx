import OrderManagementDetailClient from './OrderManagementDetailClient';

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <OrderManagementDetailClient params={params} />;
}
