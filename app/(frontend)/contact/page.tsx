'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

const FAQS = [
  {
    q: 'How can I track my order?',
    a: 'Once your order has been dispatched, use the tracking details shared in your shipping confirmation email or SMS. If you need help, send us your order number through the contact form.',
  },
  {
    q: 'How do I choose the right yoga prop?',
    a: 'The right prop depends on your practice, comfort, and the support you need. Tell us which product you’re considering and how you practise, and our team will gladly help you compare options.',
  },
  {
    q: 'Do you accept bulk or studio orders?',
    a: 'Yes! For yoga studio setups, wholesale, or corporate wellness orders, select "Bulk / studio orders" in the contact form and share the products and quantities you have in mind.',
  },
  {
    q: 'How can I ask about a return or refund?',
    a: 'Choose "Returns & refunds" in the contact form and include your order number plus a short description of the issue. Our team will review and guide you through our simple resolution process.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    order: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.topic || !formData.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const fullMessage = formData.order.trim()
        ? `[Order Reference: ${formData.order.trim()}]\n\n${formData.message.trim()}`
        : formData.message.trim();

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          subject: formData.topic,
          message: fullMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setSubmitted(true);
      toast.success('Thank you! Your message has been sent.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        topic: '',
        order: '',
        message: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <main className="bg-white text-[#1c211d] font-sans">
      {/* ════ HERO SECTION ════ */}
      <section className="relative overflow-hidden bg-[#f5f3ed] py-16 md:py-24 px-6 md:px-[6%]">
        {/* Subtle circular decorative accents */}
        <div className="absolute right-[-90px] top-[-180px] w-[390px] h-[390px] rounded-full border border-[#26352b]/12 pointer-events-none" />
        <div className="absolute right-[10px] top-[-110px] w-[250px] h-[250px] rounded-full border border-[#a08758]/20 pointer-events-none" />

        <div className="max-w-[1240px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-semibold mb-4">
              We’re here for you
            </div>
            <h1
              className="text-[42px] sm:text-[54px] lg:text-[70px] font-normal leading-[1.02] tracking-[-0.035em] text-[#1c211d] mb-6 max-w-[680px]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Let’s make your practice feel right.
            </h1>
            <p className="text-[14px] leading-[1.9] text-[#686860] max-w-[530px] mb-8">
              Questions about a product, an order, or finding the right support for your practice? We’d love to help you find what you need.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase hover:bg-[#35483a] transition-colors"
              >
                <span>Get in touch</span>
                <span className="text-[14px]">↗</span>
              </a>
              <a
                href="#faq"
                className="text-[11px] tracking-[0.04em] text-[#1c211d] border-b border-[#9b9a90] pb-1 hover:text-[#26352b]"
              >
                Explore FAQs
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
              {/* Outer decorative art frame */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 border border-[#26352b]/25 pointer-events-none -z-10" />
              <div className="absolute bottom-0 left-0 bg-white p-4 sm:p-5 shadow-[0_8px_30px_rgba(28,33,29,0.08)]">
                <strong
                  className="block text-[18px] sm:text-[20px] font-normal leading-tight text-[#1c211d]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Mindful support, always.
                </strong>
                <span className="text-[10px] tracking-[0.12em] text-[#77766f] uppercase block mt-1">
                  Here to help you feel your best
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ SECTION CONTACT FORM & INFO ════ */}
      <section id="contact-form" className="max-w-[1240px] mx-auto px-6 py-16 md:py-24">
        <div className="mb-10">
          <div className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-semibold mb-2">
            Contact Yoglivya
          </div>
          <h2
            className="text-[32px] sm:text-[40px] font-normal leading-[1.12] text-[#1c211d] mb-3"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            How can we help?
          </h2>
          <p className="text-[14px] leading-[1.8] text-[#77766f] max-w-[590px]">
            Send us a message and our team will get back to you. Choose a topic so we can direct your enquiry to the right place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-8 items-stretch">
          {/* Left Info Panel */}
          <aside className="bg-[#26352b] text-white p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute right-[-115px] bottom-[-120px] w-[260px] h-[260px] rounded-full border border-white/10 pointer-events-none" />

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
                From choosing your first yoga prop to checking an order, we’re happy to help you along the way.
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
                      Email us
                    </small>
                    <a href="mailto:hello@yoglivya.com" className="text-[13px] text-white hover:underline">
                      hello@yoglivya.com
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-[40px_1fr] gap-3.5 items-start">
                  <div className="h-[38px] w-[38px] border border-white/30 flex items-center justify-center text-[#d9d1bd]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 16.5v3a1.5 1.5 0 0 1-1.7 1.5A17.5 17.5 0 0 1 3 4.2 1.5 1.5 0 0 1 4.5 2.5h3A1.5 1.5 0 0 1 9 3.8l.6 2.8a1.5 1.5 0 0 1-.4 1.4L7.5 9.7a14 14 0 0 0 6.8 6.8l1.7-1.7a1.5 1.5 0 0 1 1.4-.4l2.8.6a1.5 1.5 0 0 1 .8 1.5Z" />
                    </svg>
                  </div>
                  <div>
                    <small className="block text-[#c4c9c1] uppercase text-[9px] tracking-[0.14em] mb-1">
                      Call us
                    </small>
                    <a href="tel:+919876543210" className="text-[13px] text-white hover:underline">
                      +91 98765 43210
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

          {/* Right Contact Form */}
          <form
            onSubmit={handleSubmit}
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
              <span className="text-[26px] text-[#737e65] leading-none" aria-hidden="true">
                ✳
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Full name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white focus:ring-2 focus:ring-[#737e65]/20 transition-all"
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white focus:ring-2 focus:ring-[#737e65]/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white focus:ring-2 focus:ring-[#737e65]/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="topic" className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  What can we help with? *
                </label>
                <select
                  id="topic"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white focus:ring-2 focus:ring-[#737e65]/20 transition-all"
                >
                  <option value="" disabled>Select a topic</option>
                  <option value="Product enquiry">Product enquiry</option>
                  <option value="Order status">Order status</option>
                  <option value="Shipping & delivery">Shipping & delivery</option>
                  <option value="Returns & refunds">Returns & refunds</option>
                  <option value="Bulk / studio orders">Bulk / studio orders</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-2">
                <label htmlFor="order" className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Order number <span className="normal-case tracking-normal font-normal text-[#9a9a90]">(if applicable)</span>
                </label>
                <input
                  id="order"
                  type="text"
                  placeholder="e.g. YGV-1024"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full h-[46px] border border-[#deded5] bg-[#fbfaf7] px-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white focus:ring-2 focus:ring-[#737e65]/20 transition-all"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-2">
                <label htmlFor="message" className="text-[10px] tracking-[0.09em] uppercase text-[#50554e] font-semibold">
                  Your message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Tell us a little about how we can help..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-[#deded5] bg-[#fbfaf7] p-3.5 text-[12px] text-[#1c211d] outline-none focus:border-[#737e65] focus:bg-white focus:ring-2 focus:ring-[#737e65]/20 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[174px] inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#26352b] text-white text-[10px] tracking-[0.12em] uppercase hover:bg-[#35483a] disabled:opacity-60 transition-colors"
              >
                <span>{loading ? 'Sending...' : 'Send message'}</span>
                <span className="text-[14px]">↗</span>
              </button>
              <div className="text-[10px] text-[#8b8b82] leading-[1.6] max-w-[210px]">
                Your details are used only to respond to your enquiry.
              </div>
            </div>

            {submitted && (
              <div className="mt-4 p-3 bg-[#f0f2eb] border-l-4 border-[#737e65] text-[#26352b] text-[12px]">
                Thank you! Your message has been received. Our team will get back to you shortly.
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ════ SERVICE PROMISES / TRUST STRIP ════ */}
      <section className="border-y border-[#e7e5df] py-8 px-6 md:px-[6%] bg-white">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5 justify-center md:justify-start">
            <svg className="w-6 h-6 text-[#a08758] flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6Z" />
              <path d="m8 12 2.5 2.5L16 9" />
            </svg>
            <div>
              <strong className="block text-[15px] font-normal text-[#1c211d]" style={{ fontFamily: 'Georgia, serif' }}>
                Thoughtful support
              </strong>
              <span className="text-[10px] text-[#77766f]">Real help for your practice</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center md:justify-start">
            <svg className="w-6 h-6 text-[#a08758] flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
            <div>
              <strong className="block text-[15px] font-normal text-[#1c211d]" style={{ fontFamily: 'Georgia, serif' }}>
                Pan-India delivery
              </strong>
              <span className="text-[10px] text-[#77766f]">We deliver across India</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center md:justify-start">
            <svg className="w-6 h-6 text-[#a08758] flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 12a8 8 0 0 1 14-5l2 2" />
              <path d="M20 4v5h-5M20 12a8 8 0 0 1-14 5l-2-2" />
              <path d="M4 20v-5h5" />
            </svg>
            <div>
              <strong className="block text-[15px] font-normal text-[#1c211d]" style={{ fontFamily: 'Georgia, serif' }}>
                Easy order assistance
              </strong>
              <span className="text-[10px] text-[#77766f]">We’re here if you need us</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════ FAQ SECTION ════ */}
      <section id="faq" className="bg-[#faf9f6] py-16 md:py-24 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-10">
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-semibold mb-2">
              A little help
            </div>
            <h2
              className="text-[32px] sm:text-[38px] font-normal text-[#1c211d] mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Frequently asked questions
            </h2>
            <p className="text-[12px] text-[#77766f]">Quick answers to the things customers ask us most.</p>
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

      {/* ════ BOTTOM CTA ════ */}
      <section className="py-12 px-6">
        <div className="max-w-[1240px] mx-auto bg-[#f5f3ed] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2
              className="text-[26px] sm:text-[31px] font-normal text-[#1c211d] mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Need a little guidance?
            </h2>
            <p className="text-[12px] text-[#77766f]">We’re happy to help you find the right fit for your practice.</p>
          </div>
          <a
            href="#contact-form"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase hover:bg-[#35483a] transition-colors"
          >
            <span>Talk to our team</span>
            <span className="text-[14px]">↗</span>
          </a>
        </div>
      </section>
    </main>
  );
}
