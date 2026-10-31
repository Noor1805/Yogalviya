import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/utils/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy | Yoglivya',
  description:
    'Learn how Yoglivya handles personal information and find contact details for privacy enquiries.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <main className="bg-white text-[#1c211d] font-sans">
      <section className="bg-[#f5f3ed] py-16 md:py-20 px-6 border-b border-[#e7e5df]">
        <div className="max-w-[840px] mx-auto text-center">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#827a68] font-bold mb-3 block">
            LEGAL &amp; PRIVACY
          </span>
          <h1
            className="text-[36px] sm:text-[46px] font-normal text-[#1c211d] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Privacy Policy
          </h1>
          <p className="text-[14px] sm:text-[15px] leading-[1.8] text-[#686860] max-w-[600px] mx-auto">
            This policy explains how Yoglivya handles personal information in connection with our website, store and services.
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
              1. Information We Collect
            </h2>
            <p>
              When you browse our website, create an account, purchase products, or reach out to us, we may collect information including your name, email address, delivery postal address, telephone number, payment confirmation details, and device or browser data.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              2. How We Use Information
            </h2>
            <p>
              We collect information to process and fulfill your orders, provide customer service and delivery updates, protect against fraudulent transactions, and—only with your consent—send you our newsletter and mindful practice guides.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              3. Data Security and Protection
            </h2>
            <p>
              We employ encryption and secure technologies to safeguard your data. We do not sell, rent, or trade your personal information to third parties. We share information only with trusted service partners (such as logistics carriers and payment gateways) strictly necessary to fulfill your orders.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              4. Cookies and Session Technologies
            </h2>
            <p>
              We use necessary functional cookies to remember items in your shopping bag, preserve sign-in sessions, and understand site traffic. You can manage or disable cookie preferences in your browser settings at any time.
            </p>
          </div>

          <div className="border-t border-[#e7e5df] pt-8">
            <h2
              className="text-[22px] font-normal text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              5. Your Rights &amp; Enquiries
            </h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any time. If you have questions about our privacy practices, please contact us at{' '}
              <a href="mailto:contact@yoglivya.com" className="text-[#26352b] underline">
                contact@yoglivya.com
              </a>{' '}
              or write through our{' '}
              <Link href="/contact" className="text-[#26352b] underline">
                Contact page
              </Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
