'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface OrderInfo {
  orderNumber: string;
  status: string;
  createdAt: string;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
  items: { name: string; quantity: number }[];
}

const STATUS_STEPS = [
  { key: 'received', label: 'Order received' },
  { key: 'preparing', label: 'Preparing your order' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'transit', label: 'In transit' },
  { key: 'delivered', label: 'Delivered' },
];

function mapStatusToStep(status: string): number {
  switch (status.toLowerCase()) {
    case 'pending':
    case 'paid':
      return 0; // Order received
    case 'processing':
    case 'packed':
      return 1; // Preparing your order
    case 'shipped':
      return 2; // Dispatched
    case 'out_for_delivery':
      return 3; // In transit
    case 'delivered':
    case 'completed':
      return 4; // Delivered
    default:
      return 0;
  }
}

export default function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderInfo | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'We couldn’t find an order with those details. Please check them and try again.');
      }

      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'We couldn’t find an order with those details. Please check them and try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeStep = order ? mapStatusToStep(order.status) : 0;
  const isCancelled = order?.status === 'cancelled' || order?.status === 'cancel_approved';

  return (
    <main className="bg-white text-[#1c211d] font-sans">
      <section className="bg-[#f5f3ed] py-16 md:py-20 px-6 border-b border-[#e7e5df]">
        <div className="max-w-[840px] mx-auto text-center">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#827a68] font-bold mb-3 block">
            ORDER LOOKUP
          </span>
          <h1
            className="text-[36px] sm:text-[46px] font-normal text-[#1c211d] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Follow your order.
          </h1>
          <p className="text-[14px] sm:text-[15px] leading-[1.8] text-[#686860] max-w-[600px] mx-auto">
            Enter your order details to check the latest available status.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 px-6">
        <div className="max-w-[640px] mx-auto">
          <form
            onSubmit={handleTrack}
            className="border border-[#e7e5df] p-6 sm:p-10 bg-white"
          >
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Order number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. #ORD-1793442220-91B0"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Email address used at checkout *
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 py-3.5 bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase hover:bg-[#35483a] disabled:opacity-60 transition-colors"
              >
                <span>{loading ? 'Finding order...' : 'Find My Order'}</span>
                <span className="text-[14px]">↗</span>
              </button>
            </div>

            {error && (
              <div className="mt-5 p-4 bg-[#fff5f5] border-l-4 border-[#e53e3e] text-[#c53030] text-[12px] leading-relaxed">
                {error}
              </div>
            )}
          </form>

          {/* Result Card */}
          {order && (
            <div className="mt-8 border border-[#e7e5df] p-6 sm:p-8 bg-[#faf9f6]">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#e7e5df]">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#827a68] font-bold block">
                    Order Reference
                  </span>
                  <span
                    className="text-[18px] text-[#1c211d] font-normal"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {order.orderNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#827a68] block">
                    Placed on
                  </span>
                  <span className="text-[12px] text-[#1c211d]">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              {isCancelled ? (
                <div className="my-6 p-4 bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-center text-[12px]">
                  This order has been cancelled.
                </div>
              ) : (
                <div className="my-8">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {STATUS_STEPS.map((step, idx) => {
                      const isComplete = idx <= activeStep;
                      const isCurrent = idx === activeStep;
                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mb-2 transition-colors ${
                              isComplete
                                ? 'bg-[#26352b] text-white'
                                : 'bg-[#e7e5df] text-[#827a68]'
                            } ${isCurrent ? 'ring-2 ring-[#a08758]' : ''}`}
                          >
                            {idx + 1}
                          </div>
                          <span
                            className={`text-[10px] leading-tight ${
                              isCurrent
                                ? 'font-bold text-[#1c211d]'
                                : isComplete
                                ? 'text-[#1c211d]'
                                : 'text-[#a1a19a]'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items in order */}
              <div className="border-t border-[#e7e5df] pt-4 mt-6">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#827a68] font-bold block mb-2">
                  Items in this order
                </span>
                <ul className="divide-y divide-[#ece9e1]">
                  {order.items.map((item, i) => (
                    <li key={i} className="py-2 flex justify-between text-[12.5px] text-[#40443d]">
                      <span>{item.name}</span>
                      <span className="text-[#827a68]">Qty: {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {order.trackingNumber && (
                <div className="border-t border-[#e7e5df] pt-4 mt-4 text-[12px] text-[#40443d]">
                  <span className="font-semibold">Tracking Number:</span> {order.trackingNumber}
                  {order.trackingCarrier && ` (${order.trackingCarrier})`}
                </div>
              )}
            </div>
          )}

          <div className="mt-10 text-center text-[12px] text-[#77766f]">
            Need help finding your order?{' '}
            <Link href="/contact" className="text-[#26352b] underline hover:text-[#35483a]">
              Contact us with your purchase details.
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
