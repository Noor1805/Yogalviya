import OrderDetailsClient from './OrderDetailsClient';

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> | { id: string } }) {
  const params = await props.params;
  return <OrderDetailsClient params={params} />;
}
