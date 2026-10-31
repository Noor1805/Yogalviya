import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/utils/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Returns, Refunds & Cancellations | Yoglivya',
  description:
    'Read Yoglivya’s return eligibility, cancellation process and refund information, and find out how to request help with an order.',
  path: '/returns',
});

export default function ReturnsPage() {
  return (
    <main className="bg-white text-[#1c211d] font-sans">
      <section className="bg-[#f5f3ed] py-16 md:py-20 px-6 border-b border-[#e7e5df]">
        <div className="max-w-[840px] mx-auto text-center">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#827a68] font-bold mb-3 block">
            CUSTOMER ASSURANCE
          </span>
          <h1
            className="text-[36px] sm:text-[46px] font-normal text-[#1c211d] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Returns &amp; Refunds
          </h1>
          <p className="text-[14px] sm:text-[15px] leading-[1.8] text-[#686860] max-w-[600px] mx-auto">
            Read the information below before requesting a return, refund or cancellation. For help with an order, contact us with your order number and the details of your request.
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
              Return Eligibility
            </h2>
            <p>
              To qualify for a return or exchange, products must be unused, in their original condition, and in their complete original packaging with tags and seals intact. For hygiene reasons, intimate wellness accessories (such as neti products or personal care potlis) cannot be returned once unsealed.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Requesting a Return
            </h2>
            <p>
              To initiate a return, please get in touch via{' '}
              <a href="mailto:contact@yoglivya.com" className="text-[#26352b] underline">
                contact@yoglivya.com
              </a>{' '}
              or submit our{' '}
              <Link href="/contact" className="text-[#26352b] underline">
                Contact form
              </Link>{' '}
              within 7 days of receiving your delivery. Please include your order number, reason for return, and clear photographs of the product and its packaging.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Damaged, Incorrect or Missing Items
            </h2>
            <p>
              In the unlikely event that an item arrives damaged during transit, defective, or incorrect, please notify us within 48 hours of delivery with photos of the package and item. We will arrange a replacement or complete refund promptly at no extra charge.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Refund Process
            </h2>
            <p>
              Once your returned item arrives at our inspection facility and is verified, an approval notice is sent. Approved refunds are processed to your original payment method within 5–7 business days. For Cash on Delivery orders, refunds are transferred via bank transfer or UPI once account details are verified.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Cancellations
            </h2>
            <p>
              Orders can be cancelled before they enter dispatch. If you need to modify or cancel an order, reach out to our team immediately with your order ID. If the shipment has already left our facility, the standard return procedure will apply upon delivery.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
