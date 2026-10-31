'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const ALL_FAQS = [
  {
    q: 'How do I choose a product for my practice?',
    a: 'Start with what you need it for, then compare the dimensions, materials and intended use on the product page. If a detail is unclear, contact us with the product name and your question.',
  },
  {
    q: 'I’m new to yoga. Where should I begin shopping?',
    a: 'Browse by product type and consider what your class or teacher recommends. You do not need to buy every accessory at once. Choose around the practice you plan to follow.',
  },
  {
    q: 'How do I choose a size or length?',
    a: 'Check the measurements on the product page and compare them with your intended use. For props used in a class or specific setup, ask your teacher which size is appropriate.',
  },
  {
    q: 'Are all products available in every colour and size?',
    a: 'Available options depend on the product. Choose the relevant listing to see its current variants and availability.',
  },
  {
    q: 'How should I care for my product?',
    a: 'Follow the instructions supplied with that item. Materials can require different care, so contact us if the guidance for your product is unclear.',
  },
  {
    q: 'Where do you deliver?',
    a: 'Please see Shipping & Delivery for our confirmed delivery areas and any exclusions.',
  },
  {
    q: 'Is cash on delivery available?',
    a: 'Please check the payment options available for your order at checkout based on pin code eligibility.',
  },
  {
    q: 'How can I track my order?',
    a: 'Use the tracking information provided for your dispatched order. If you cannot locate it, contact us with your order number and the email address used at checkout.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Contact us with your order number and the change you need. Please see our published cancellation terms for eligibility and any restrictions.',
  },
  {
    q: 'Can I return an item?',
    a: 'Please read Returns & Refunds for eligibility, exclusions and the steps for requesting a return.',
  },
  {
    q: 'Do you supply studios or groups?',
    a: 'You can enquire about Yoglivya-branded products through our Business & Bulk Enquiries form. Include the products and approximate quantities you are considering.',
  },
  {
    q: 'Does “The Path To Enlightenment” describe a product benefit?',
    a: 'It expresses Yoglivya’s interest in awareness, self-inquiry and personal practice. It is not a promise that a product will create a spiritual or health outcome.',
  },
];

export default function FaqClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <main className="bg-white text-[#1c211d] font-sans">
      <section className="bg-[#f5f3ed] py-16 md:py-20 px-6 border-b border-[#e7e5df]">
        <div className="max-w-[840px] mx-auto text-center">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#827a68] font-bold mb-3 block">
            HELP &amp; ADVICE
          </span>
          <h1
            className="text-[36px] sm:text-[46px] font-normal text-[#1c211d] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Questions, answered.
          </h1>
          <p className="text-[14px] sm:text-[15px] leading-[1.8] text-[#686860] max-w-[600px] mx-auto">
            A starting point for choosing your essentials and getting help with an order.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="border-t border-[#e7e5df]">
            {ALL_FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border-b border-[#e7e5df]">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full py-5 flex justify-between items-center text-left transition-colors"
                  >
                    <span
                      className="text-[17px] sm:text-[18px] font-normal text-[#1c211d]"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {item.q}
                    </span>
                    <span
                      className={`text-[20px] text-[#a08758] transition-transform duration-200 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    >
                      ＋
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pb-5 pr-8 text-[13.5px] leading-[1.85] text-[#5c6158]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-16 bg-[#faf9f6] p-8 border border-[#e7e5df] text-center">
            <h3
              className="text-[20px] font-normal text-[#1c211d] mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Still have a question?
            </h3>
            <p className="text-[13px] text-[#77766f] mb-6">
              Our team is here to help you understand your options for your practice.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase hover:bg-[#35483a] transition-colors"
            >
              <span>Contact Our Team</span>
              <span className="text-[14px]">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
