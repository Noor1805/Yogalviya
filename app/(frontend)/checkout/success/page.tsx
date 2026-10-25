'use client';

import { Suspense, useLayoutEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck, Calendar } from 'lucide-react';
import Container from '@/components/layout/Container';
import { useCartStore } from '@/store/cart';
import { consumeCheckoutSuccessCartClear } from '@/lib/utils/checkout-success';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const gateway = searchParams.get('gateway');

  useLayoutEffect(() => {
    if (!consumeCheckoutSuccessCartClear(orderNumber)) {
      return;
    }

    useCartStore.getState().clearCart();
  }, [orderNumber]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.4em] text-neutral-400">Order Confirmed</p>
      <h1 className="mb-6 text-[3rem] font-black uppercase leading-none tracking-[-0.04em] sm:text-[4.5rem]">
        Thank You.
      </h1>

      <div className="max-w-xl space-y-6 text-neutral-500">
        <p className="text-lg leading-relaxed">
          Your order <span className="font-semibold text-neutral-900">#{orderNumber}</span> has been successfully placed. 
          {gateway === 'cod'
            ? ' We will confirm shipment details shortly.'
            : ' Payment verification is being finalized securely on the server, and your order email will arrive shortly.'}
        </p>
      </div>

      <div className="mt-8 sm:mt-12 grid w-full max-w-4xl gap-4 sm:gap-6 sm:grid-cols-3">
        {[
          { icon: Package, title: 'Processing', desc: 'We are preparing your items' },
          { icon: Truck, title: 'Shipping', desc: 'Handled by our premium partners' },
          { icon: Calendar, title: 'Delivery', desc: 'Arriving within 5-7 business days' },
        ].map((item, i) => (
          <div key={i} className="flex flex-row sm:flex-col items-center sm:justify-start justify-start gap-4 sm:gap-0 rounded-[20px] sm:rounded-[32px] border border-neutral-100 bg-white p-5 sm:p-8 transition-shadow hover:shadow-xl hover:shadow-neutral-100/50 text-left sm:text-center">
            <div className="sm:mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-neutral-50 text-neutral-900">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="mb-1 sm:mb-2 text-xs sm:text-sm font-bold uppercase tracking-[0.1em] text-neutral-900">{item.title}</h3>
              <p className="text-[11px] sm:text-xs leading-relaxed text-neutral-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 sm:mt-16 flex w-full flex-col items-center gap-4 sm:gap-6 sm:w-auto sm:flex-row">
        <Link 
          href="/products"
          className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-full sm:rounded-none bg-neutral-900 px-10 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-black hover:px-12"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Link>
        <Link 
          href="/account/orders"
          className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-full sm:rounded-none border border-neutral-200 bg-white px-10 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900 transition-all hover:border-neutral-900 hover:bg-neutral-50"
        >
          View My Orders
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="bg-[#fbfbf8] pb-32 pt-20">
      <Container>
        <Suspense fallback={<div>Loading order details...</div>}>
          <SuccessContent />
        </Suspense>
      </Container>
    </main>
  );
}
