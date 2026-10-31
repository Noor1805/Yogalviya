import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/utils/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions | Yoglivya',
  description:
    'Read the terms that apply to using the Yoglivya website and placing an order.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <main className="bg-white text-[#1c211d] font-sans">
      <section className="bg-[#f5f3ed] py-16 md:py-20 px-6 border-b border-[#e7e5df]">
        <div className="max-w-[840px] mx-auto text-center">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#827a68] font-bold mb-3 block">
            TERMS OF SERVICE
          </span>
          <h1
            className="text-[36px] sm:text-[46px] font-normal text-[#1c211d] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Terms &amp; Conditions
          </h1>
          <p className="text-[14px] sm:text-[15px] leading-[1.8] text-[#686860] max-w-[600px] mx-auto">
            These terms describe the conditions that apply when you use the Yoglivya website or place an order with us.
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
              1. General &amp; Website Use
            </h2>
            <p>
              By accessing and using Yoglivya, you agree to comply with and be bound by these Terms and Conditions. Our platform is intended for personal, non-commercial use by customers seeking yoga and meditation essentials.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              2. Products, Pricing and Availability
            </h2>
            <p>
              We make every effort to display product dimensions, materials, and colors accurately. All prices are listed in Indian Rupees (INR) and are subject to change without prior notice. Products remain subject to stock availability at the time of order confirmation.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              3. Order Acceptance &amp; Payment
            </h2>
            <p>
              Placing an order constitutes an offer to purchase. An order confirmation email signifies receipt of your order but does not constitute final binding acceptance until dispatch. We accept recognized credit/debit cards, UPI, net banking, and Cash on Delivery where serviceable.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              4. Practice Essentials &amp; Intended Use
            </h2>
            <p>
              Yoglivya products are designed to support mindful movement and meditation. Customers are advised to practice within their capabilities and seek qualified instruction for specialized postures or prop installation (such as wall ropes or aerial equipment).
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              5. Intellectual Property
            </h2>
            <p>
              All trademarks, product photography, editorial text, logos, and website assets remain the property of Yoglivya and are protected by applicable intellectual property laws.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              6. Contact &amp; Questions
            </h2>
            <p>
              For any questions regarding these terms, please contact our team at{' '}
              <a href="mailto:contact@yoglivya.com" className="text-[#26352b] underline">
                contact@yoglivya.com
              </a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
