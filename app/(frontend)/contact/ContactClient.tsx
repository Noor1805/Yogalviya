'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

const FAQS = [
  {
    q: 'How do I choose a product for my practice?',
    a: 'Start with what you need it for, then compare the dimensions, materials and intended use on the product page. If a detail is unclear, contact us with the product name and your question.',
  },
  {
    q: 'I’m new to yoga. Where should I begin shopping?',
    a: 'Browse by product type and consider what your class or teacher recommends. You do not need to buy every accessory at once. Choose around the practice you plan to follow.',
  },
  {
    q: 'Where do you deliver?',
    a: 'Please see Shipping & Delivery for our confirmed delivery areas and any exclusions.',
  },
  {
    q: 'Do you supply studios or groups?',
    a: 'You can enquire about Yoglivya-branded products through our Business & Bulk Enquiries form below. Include the products and approximate quantities you are considering.',
  },
  {
    q: 'Does “The Path To Enlightenment” describe a product benefit?',
    a: 'It expresses Yoglivya’s interest in awareness, self-inquiry and personal practice. It is not a promise that a product will create a spiritual or health outcome.',
  },
];

export default function ContactClient() {
  // Support Form State
  const [supportData, setSupportData] = useState({
    name: '',
    email: '',
    order: '',
    topic: '',
    message: '',
  });
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // Bulk Enquiry Form State
  const [bulkData, setBulkData] = useState({
    name: '',
    organisation: '',
    email: '',
    phone: '',
    country: '',
    enquiryType: '',
    products: '',
    quantity: '',
    timing: '',
    details: '',
  });
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSubmitted, setBulkSubmitted] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supportData.name.trim() || !supportData.email.trim() || !supportData.topic || !supportData.message.trim()) {
      toast.error('Please complete the highlighted fields.');
      return;
    }

    setSupportLoading(true);

    try {
      const fullMessage = supportData.order.trim()
        ? `[Order Number: ${supportData.order.trim()}]\n\n${supportData.message.trim()}`
        : supportData.message.trim();

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supportData.name.trim(),
          email: supportData.email.trim(),
          subject: supportData.topic,
          message: fullMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Your message could not be sent. Please try again.');
      }

      setSupportSubmitted(true);
      toast.success('Thank you. Your message has been received.');
      setSupportData({
        name: '',
        email: '',
        order: '',
        topic: '',
        message: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Your message could not be sent. Please try again.');
    } finally {
      setSupportLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bulkData.name.trim() || !bulkData.email.trim() || !bulkData.enquiryType || !bulkData.products.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setBulkLoading(true);

    try {
      const messageBody = [
        bulkData.organisation.trim() ? `Organisation: ${bulkData.organisation.trim()}` : null,
        bulkData.country.trim() ? `Country / Region: ${bulkData.country.trim()}` : null,
        `Enquiry Type: ${bulkData.enquiryType}`,
        `Products of interest: ${bulkData.products.trim()}`,
        bulkData.quantity.trim() ? `Approximate quantity: ${bulkData.quantity.trim()}` : null,
        bulkData.timing.trim() ? `Preferred timing: ${bulkData.timing.trim()}` : null,
        `\nAdditional details:\n${bulkData.details.trim() || 'No additional details provided.'}`,
      ]
        .filter(Boolean)
        .join('\n');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bulkData.name.trim(),
          email: bulkData.email.trim(),
          phone: bulkData.phone.trim() || undefined,
          subject: `[Bulk / Business Enquiry] ${bulkData.enquiryType}`,
          message: messageBody,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Your business enquiry could not be sent. Please try again.');
      }

      setBulkSubmitted(true);
      toast.success('Thank you. Your business enquiry has been received.');
      setBulkData({
        name: '',
        organisation: '',
        email: '',
        phone: '',
        country: '',
        enquiryType: '',
        products: '',
        quantity: '',
        timing: '',
        details: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <main className="bg-white text-[#1c211d] font-sans">
      {/* ════ HERO SECTION ════ */}
      <section className="relative overflow-hidden bg-[#f5f3ed] py-16 md:py-24 px-6 md:px-[6%]">
        <div className="max-w-[1240px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#827a68] font-bold mb-4">
              CONTACT YOGLIVYA
            </div>
            <h1
              className="text-[42px] sm:text-[54px] lg:text-[68px] font-normal leading-[1.02] tracking-[-0.035em] text-[#1c211d] mb-6 max-w-[680px]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              How can we help?
            </h1>
            <p className="text-[14px] leading-[1.9] text-[#686860] max-w-[530px] mb-8">
              Have a question about a product, an order or your Yoglivya experience? Send us a message with the details so we can understand what you need.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase hover:bg-[#35483a] transition-colors"
              >
                <span>Customer Support</span>
                <span className="text-[14px]">↓</span>
              </a>
              <a
                href="#bulk"
                className="text-[11px] tracking-[0.04em] text-[#1c211d] border-b border-[#9b9a90] pb-1 hover:text-[#26352b]"
              >
                Business &amp; Bulk Enquiries
              </a>
            </div>
          </div>

          <div className="relative min-h-[280px] sm:min-h-[320px] flex justify-center items-center">
            <div className="relative w-full max-w-[420px]">
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#e4dfd5]">
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=85"
                  alt="A calm yoga practice in warm natural light"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 translate-x-4 translate-y-4 border border-[#26352b]/25 pointer-events-none -z-10" />
              <div className="absolute bottom-0 left-0 bg-white p-4 sm:p-5 shadow-[0_8px_30px_rgba(28,33,29,0.08)]">
                <strong
                  className="block text-[18px] sm:text-[20px] font-normal leading-tight text-[#1c211d]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Thoughtful support, always.
                </strong>
                <span className="text-[10px] tracking-[0.12em] text-[#77766f] uppercase block mt-1">
                  Here to help with your practice
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ QUICK LINKS STRIP ════ */}
      <section className="border-b border-[#e7e5df] py-8 px-6 md:px-[6%] bg-white">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[13px] font-medium text-[#1c211d]">
            Looking for a quick answer?
          </div>
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-[11px] tracking-[0.08em] uppercase text-[#737e65] font-semibold">
            <Link href="/shipping" className="hover:text-[#26352b] transition-colors underline-offset-4 hover:underline">
              Shipping &amp; Delivery
            </Link>
            <Link href="/returns" className="hover:text-[#26352b] transition-colors underline-offset-4 hover:underline">
              Returns &amp; Refunds
            </Link>
            <Link href="/track-order" className="hover:text-[#26352b] transition-colors underline-offset-4 hover:underline">
              Track Your Order
            </Link>
            <Link href="/faq" className="hover:text-[#26352b] transition-colors underline-offset-4 hover:underline">
              FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* ════ CUSTOMER SUPPORT — PRIMARY SECTION ════ */}
      <section id="contact-form" className="max-w-[1240px] mx-auto px-6 py-16 md:py-24">
        <div className="mb-10">
          <div className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold mb-2">
            CUSTOMER SUPPORT
          </div>
          <h2
            className="text-[32px] sm:text-[40px] font-normal leading-[1.12] text-[#1c211d] mb-3"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Let’s start with your question.
          </h2>
          <p className="text-[14px] leading-[1.8] text-[#77766f] max-w-[590px]">
            For an existing order, please include your order number and the email address used at checkout. For a product question, include its name or a link to the listing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-8 items-stretch">
          {/* Left Info Panel */}
          <aside className="bg-[#26352b] text-white p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#c7b995] font-semibold mb-3">
                Reach out anytime
              </div>
              <h3
                className="text-[26px] sm:text-[30px] font-normal leading-[1.2] mb-4 text-white"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Good things start with a conversation.
              </h3>
              <p className="text-[12px] leading-[1.85] text-[#d2d8d1] max-w-[330px]">
                From choosing your practice essentials to checking an order, we’re happy to help you along the way.
              </p>

              <div className="grid gap-6 mt-10 relative z-10">
                <div className="grid grid-cols-[40px_1fr] gap-3.5 items-start">
                  <div className="h-[38px] w-[38px] border border-white/30 flex items-center justify-center text-[#d9d1bd]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="5" width="18" height="14" rx="1" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </div>
                  <div>
                    <small className="block text-[#c4c9c1] uppercase text-[9px] tracking-[0.14em] mb-1">
                      Support Email
                    </small>
                    <a href="mailto:contact@yoglivya.com" className="text-[13px] text-white hover:underline">
                      contact@yoglivya.com
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-[40px_1fr] gap-3.5 items-start">
                  <div className="h-[38px] w-[38px] border border-white/30 flex items-center justify-center text-[#d9d1bd]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </div>
                  <div>
                    <small className="block text-[#c4c9c1] uppercase text-[9px] tracking-[0.14em] mb-1">
                      Support hours
                    </small>
                    <span className="text-[12px] leading-[1.6] text-white">
                      Monday – Saturday<br />
                      10:00 AM – 6:00 PM IST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 mt-8 pt-5 text-[11px] text-[#d2d8d1] leading-[1.7] relative z-10">
              For order-related questions, please include your order number in the message so we can assist you faster.
            </div>
          </aside>

          {/* Right Support Form */}
          <form
            onSubmit={handleSupportSubmit}
            className="border border-[#e7e5df] p-6 sm:p-10 bg-white"
          >
            <div className="flex justify-between items-start gap-4 mb-7">
              <div>
                <h3
                  className="text-[24px] sm:text-[27px] font-normal leading-tight text-[#1c211d] mb-1.5"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Send us a message
                </h3>
                <p className="text-[11px] text-[#77766f]">Fields marked with * are required.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={supportData.name}
                  onChange={(e) => setSupportData({ ...supportData, name: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Email address *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={supportData.email}
                  onChange={(e) => setSupportData({ ...supportData, email: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="order" className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Order number <span className="normal-case tracking-normal font-normal text-[#9a9a90]">(optional)</span>
                </label>
                <input
                  id="order"
                  type="text"
                  placeholder="e.g. #ORD-12345"
                  value={supportData.order}
                  onChange={(e) => setSupportData({ ...supportData, order: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="topic" className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  What can we help with? *
                </label>
                <select
                  id="topic"
                  required
                  value={supportData.topic}
                  onChange={(e) => setSupportData({ ...supportData, topic: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white transition-all"
                >
                  <option value="" disabled>Select an option</option>
                  <option value="Product question">Product question</option>
                  <option value="Order or delivery">Order or delivery</option>
                  <option value="Return or refund">Return or refund</option>
                  <option value="Account or payment">Account or payment</option>
                  <option value="Something else">Something else</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-2">
                <label htmlFor="message" className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Your message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Tell us what you need help with."
                  value={supportData.message}
                  onChange={(e) => setSupportData({ ...supportData, message: e.target.value })}
                  className="w-full border border-[#deded5] bg-[#fbfaf7] p-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
              <button
                type="submit"
                disabled={supportLoading}
                className="w-full sm:w-auto min-w-[174px] inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase hover:bg-[#35483a] disabled:opacity-60 transition-colors"
              >
                <span>{supportLoading ? 'Sending...' : 'Send Message'}</span>
                <span className="text-[14px]">↗</span>
              </button>
              <div className="text-[10px] text-[#8b8b82] leading-[1.6] max-w-[240px]">
                Learn how we handle your information in our{' '}
                <Link href="/privacy" className="underline hover:text-[#26352b]">
                  Privacy Policy
                </Link>.
              </div>
            </div>

            {supportSubmitted && (
              <div className="mt-4 p-3 bg-[#f0f2eb] border-l-4 border-[#737e65] text-[#26352b] text-[12px]">
                Thank you. Your message has been received.
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ════ BUSINESS & BULK ENQUIRIES — SECONDARY SECTION ════ */}
      <section id="bulk" className="bg-[#f7f5ee] py-16 md:py-24 px-6 md:px-[6%] border-t border-[#e7e5df]">
        <div className="max-w-[1240px] mx-auto">
          <div className="mb-10">
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#827a68] font-bold mb-2">
              FOR STUDIOS, CLASSES &amp; ORGANISATIONS
            </div>
            <h2
              className="text-[32px] sm:text-[40px] font-normal leading-[1.12] text-[#1c211d] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Yoglivya essentials for your group.
            </h2>
            <p className="text-[14px] leading-[1.8] text-[#77766f] max-w-[680px]">
              Considering Yoglivya-branded products for a studio, class, workshop or organisation? Tell us which products you are interested in and the approximate quantities. We can discuss availability and the next steps for your enquiry.
            </p>
          </div>

          <form
            onSubmit={handleBulkSubmit}
            className="border border-[#deded5] p-6 sm:p-10 bg-white"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={bulkData.name}
                  onChange={(e) => setBulkData({ ...bulkData, name: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Business or organisation <span className="normal-case font-normal text-[#9a9a90]">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Studio or Company name"
                  value={bulkData.organisation}
                  onChange={(e) => setBulkData({ ...bulkData, organisation: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Work email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="work@organisation.com"
                  value={bulkData.email}
                  onChange={(e) => setBulkData({ ...bulkData, email: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Phone <span className="normal-case font-normal text-[#9a9a90]">(optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91"
                  value={bulkData.phone}
                  onChange={(e) => setBulkData({ ...bulkData, phone: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Country or region
                </label>
                <input
                  type="text"
                  placeholder="India"
                  value={bulkData.country}
                  onChange={(e) => setBulkData({ ...bulkData, country: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Enquiry type *
                </label>
                <select
                  required
                  value={bulkData.enquiryType}
                  onChange={(e) => setBulkData({ ...bulkData, enquiryType: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                >
                  <option value="" disabled>Select enquiry type</option>
                  <option value="Studio or class order">Studio or class order</option>
                  <option value="Workshop or event">Workshop or event</option>
                  <option value="Organisation order">Organisation order</option>
                  <option value="Other business enquiry">Other business enquiry</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Products of interest *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cotton Yoga Belts, Cork Blocks, Bolsters"
                  value={bulkData.products}
                  onChange={(e) => setBulkData({ ...bulkData, products: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Approximate quantity
                </label>
                <input
                  type="text"
                  placeholder="e.g. 25 units"
                  value={bulkData.quantity}
                  onChange={(e) => setBulkData({ ...bulkData, quantity: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-3">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Preferred timing <span className="normal-case font-normal text-[#9a9a90]">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Within 2–3 weeks"
                  value={bulkData.timing}
                  onChange={(e) => setBulkData({ ...bulkData, timing: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-3">
                <label className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Additional details
                </label>
                <textarea
                  rows={4}
                  placeholder="Share any specific requirements or dimensions."
                  value={bulkData.details}
                  onChange={(e) => setBulkData({ ...bulkData, details: e.target.value })}
                  className="w-full border border-[#deded5] bg-[#fbfaf7] p-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
              <button
                type="submit"
                disabled={bulkLoading}
                className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase hover:bg-[#35483a] disabled:opacity-60 transition-colors"
              >
                <span>{bulkLoading ? 'Sending...' : 'Send a Bulk Enquiry'}</span>
                <span className="text-[14px]">↗</span>
              </button>
              <div className="text-[11px] text-[#77766f]">
                Shopping for yourself?{' '}
                <Link href="/products" className="text-[#26352b] underline font-medium hover:text-[#35483a]">
                  Explore the retail collection.
                </Link>
              </div>
            </div>

            {bulkSubmitted && (
              <div className="mt-4 p-3 bg-[#f0f2eb] border-l-4 border-[#737e65] text-[#26352b] text-[12px]">
                Thank you. Your business enquiry has been received.
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ════ FAQ SECTION ════ */}
      <section id="faq" className="bg-[#faf9f6] py-16 md:py-24 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-10">
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-bold mb-2">
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2
              className="text-[32px] sm:text-[38px] font-normal text-[#1c211d] mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Questions, answered.
            </h2>
            <p className="text-[12px] text-[#77766f]">A starting point for choosing your essentials and getting help with an order.</p>
          </div>

          <div className="border-t border-[#e7e5df]">
            {FAQS.map((item, idx) => {
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
                    <div className="pb-5 pr-8 text-[13px] leading-[1.8] text-[#77766f]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
