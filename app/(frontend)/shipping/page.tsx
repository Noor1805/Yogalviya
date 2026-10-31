import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/utils/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Shipping & Delivery | Yoglivya',
  description:
    'Read Yoglivya’s delivery information, including confirmed shipping areas, processing times, charges and order tracking guidance.',
  path: '/shipping',
});

export default function ShippingPage() {
  return (
    <main className="bg-white text-[#1c211d] font-sans">
      <section className="bg-[#f5f3ed] py-16 md:py-20 px-6 border-b border-[#e7e5df]">
        <div className="max-w-[840px] mx-auto text-center">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#827a68] font-bold mb-3 block">
            DELIVERY INFORMATION
          </span>
          <h1
            className="text-[36px] sm:text-[46px] font-normal text-[#1c211d] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Shipping &amp; Delivery
          </h1>
          <p className="text-[14px] sm:text-[15px] leading-[1.8] text-[#686860] max-w-[600px] mx-auto">
            Find out where we deliver, how orders are dispatched and what to expect after placing an order.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 px-6">
        <div className="max-w-[760px] mx-auto space-y-10 text-[#40443d] leading-[1.85] text-[14px]">
          <div>
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Delivery Areas
            </h2>
            <p>
              We deliver across India to serviceable pin codes. During checkout, please enter your postal PIN code to verify delivery availability and shipping options for your specific location.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Processing Your Order
            </h2>
            <p>
              Orders are normally prepared and dispatched within 1–2 business days (Monday through Saturday, excluding national public holidays). Orders received on Sundays or holidays are processed on the next working day.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Delivery Estimates
            </h2>
            <p>
              Estimated transit times are typically 3–5 business days depending on your destination city and region. Dispatched tracking links provide real-time updates as your parcel makes its way to you.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Delivery Charges
            </h2>
            <p>
              Applicable shipping charges and any complimentary delivery promotions are calculated and clearly shown in your shopping bag and at checkout before payment is requested.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Payment and COD
            </h2>
            <p>
              We support secure online payments and Cash on Delivery (COD) on eligible orders. Available payment methods for your area are displayed during checkout.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Tracking Your Order
            </h2>
            <p>
              When your order dispatches, you will receive an email and notification containing carrier details and a direct tracking number. You can also visit our{' '}
              <Link href="/track-order" className="text-[#26352b] underline hover:text-[#737e65]">
                Track Your Order
              </Link>{' '}
              page.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Delivery Assistance
            </h2>
            <p>
              If you need help with an order in transit, an address update, or a missing package, please contact our support team at{' '}
              <a href="mailto:contact@yoglivya.com" className="text-[#26352b] underline">
                contact@yoglivya.com
              </a>{' '}
              or through our{' '}
              <Link href="/contact" className="text-[#26352b] underline">
                Contact page
              </Link>{' '}
              with your order reference.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
