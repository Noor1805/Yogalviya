import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, aboutPageSchema } from '@/lib/utils/seo';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = buildMetadata({
  title: 'About Yoglivya | The Path To Enlightenment',
  description:
    'Discover Yoglivya’s approach to yoga, meditation and self-inquiry, inspired by India’s living yoga heritage and shaped around personal practice.',
  path: '/about',
  keywords: [
    'about Yoglivya',
    'mindful yoga props',
    'The Path To Enlightenment',
    'yoga essentials India',
    'Yoglivya philosophy',
  ],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutPageSchema()} />

      <main className="bg-[#f7f5ee] text-[#202c24] overflow-x-hidden selection:bg-[#26352b] selection:text-[#f7f5ee]">
        {/* ════ SECTION 01 — HERO ════ */}
        <section className="min-h-[calc(100vh-78px)] grid grid-cols-1 lg:grid-cols-[43%_57%] border-b border-[#263b2d]/15">
          {/* Left Hero Copy */}
          <div className="px-6 py-12 md:px-12 lg:px-16 xl:px-24 flex flex-col justify-center items-start relative">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#737e65] font-bold mb-5">
              ABOUT YOGLIVYA
            </span>
            <h1
              className="text-[44px] sm:text-[56px] lg:text-[68px] leading-[1.03] tracking-[-0.04em] font-normal mb-5 max-w-[600px] text-[#202c24]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Essentials for practice.<br />
              <em className="italic text-[#737e65] font-normal">Space for something deeper.</em>
            </h1>
            <p
              className="text-[20px] sm:text-[24px] lg:text-[26px] leading-[1.35] mb-4 text-[#202c24]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Yoga, in the way you live it.
            </p>
            <p className="text-[14px] leading-[1.85] text-[#666b61] max-w-[460px] mb-8">
              Yoglivya brings together yoga and meditation essentials for movement, stillness and the moments in between. Inspired by India’s living yoga heritage, our perspective reaches beyond the physical practice to breath, attention and self-inquiry.
            </p>
            <a
              href="#purpose"
              className="inline-flex items-center gap-7 px-6 py-4 bg-[#26352b] text-[#fffdf7] text-[10px] tracking-[0.16em] uppercase border border-[#26352b] hover:bg-transparent hover:text-[#26352b] transition-all duration-200"
            >
              <span>Explore Our Approach</span>
              <span className="text-[17px] leading-none">↓</span>
            </a>
            <div className="mt-12 lg:mt-16 text-[10px] tracking-[0.14em] text-[#737e65] uppercase">
              Your practice. Your pace. Your path.
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-[calc(100vh-78px)] bg-[#d6c9b2]">
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1800&q=85"
              alt="Practitioner in a peaceful, sunlit yoga studio"
              className="w-full h-full object-cover object-[center_48%]"
            />
            <div className="absolute right-[5%] top-[13%] border-l border-white/75 pl-4 text-white text-[10px] leading-[2.2] tracking-[0.2em] uppercase drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
              Movement<br />
              Breath<br />
              Self-Inquiry
            </div>
          </div>
        </section>

        {/* ════ SECTION 02 — OUR PURPOSE ════ */}
        <section id="purpose" className="py-16 md:py-24 px-[7%] border-b border-[#263b2d]/15">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-[8%] items-center">
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#737e65] font-bold mb-4">
                OUR PURPOSE
              </div>
              <h2
                className="text-[34px] sm:text-[44px] lg:text-[52px] font-normal tracking-[-0.035em] leading-[1.12] mb-5 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Make room for practice.<br />
                Let it become your own.
              </h2>
              <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[560px]">
                Our purpose is to help you bring yoga into everyday life through useful essentials and a thoughtful approach to practice. Whether you are beginning or returning, Yoglivya offers a place to explore what supports your own routine.
              </p>
            </div>
            <div className="lg:border-l lg:border-[#263b2d]/18 lg:pl-8">
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#737e65] font-bold mb-4">
                WHAT GUIDES US
              </div>
              <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[560px]">
                We value usefulness, clear information and room for individual choice. A product should have a clear role in your practice. A brand should help you understand that role and leave space for your own experience.
              </p>
            </div>
          </div>

          {/* ════ SECTION 03 — THREE PRINCIPLES ════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 md:mt-16 pt-8 border-t border-[#263b2d]/15">
            <article className="pt-2">
              <div
                className="text-[30px] text-[#a08758] mb-3"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                01
              </div>
              <h3
                className="text-[21px] font-normal mb-2 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Begin where you are
              </h3>
              <p className="text-[12.5px] leading-[1.75] text-[#666b61] max-w-[280px]">
                There is room for different bodies, routines and levels of experience. You do not need to fit an image of yoga to begin exploring it.
              </p>
            </article>

            <article className="pt-2">
              <div
                className="text-[30px] text-[#a08758] mb-3"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                02
              </div>
              <h3
                className="text-[21px] font-normal mb-2 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Choose with intention
              </h3>
              <p className="text-[12.5px] leading-[1.75] text-[#666b61] max-w-[280px]">
                Consider what you need, how you will use it and what belongs in your practice. A thoughtful choice starts with understanding the product.
              </p>
            </article>

            <article className="pt-2">
              <div
                className="text-[30px] text-[#a08758] mb-3"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                03
              </div>
              <h3
                className="text-[21px] font-normal mb-2 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Make space to notice
              </h3>
              <p className="text-[12.5px] leading-[1.75] text-[#666b61] max-w-[280px]">
                Alongside movement, leave room for attention. Practice can include a pause, a breath and time to observe your experience.
              </p>
            </article>
          </div>
        </section>

        {/* ════ SECTION 04 — BRAND STORY ════ */}
        <section id="story" className="grid grid-cols-1 lg:grid-cols-2 min-h-[560px] bg-[#eeece1]">
          <div className="min-h-[380px] lg:min-h-[560px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1400&q=85"
              alt="Yoga essentials and practice materials"
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="p-8 sm:p-12 lg:p-20 xl:p-24 flex flex-col items-start justify-center">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#737e65] font-bold mb-4">
              THE YOGLIVYA PERSPECTIVE
            </span>
            <h2
              className="text-[36px] sm:text-[44px] lg:text-[54px] font-normal leading-[1.08] tracking-[-0.035em] mb-6 text-[#202c24]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Inspired by tradition.<br />
              Part of everyday practice.
            </h2>
            <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[480px] mb-4">
              Yoglivya takes inspiration from India’s living yoga heritage and its many approaches to practice. We are drawn to the relationship between movement, meditation and the questions that encourage us to look inward.
            </p>
            <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[480px] mb-7">
              That perspective shapes the brand we are building: a place to discover physical practice essentials while staying connected to the meaning behind their use. The products have a practical role. The experience of practice remains your own.
            </p>
            <a
              href="#values"
              className="text-[10px] tracking-[0.16em] uppercase text-[#26352b] border-b border-[#26352b] pb-2 inline-flex items-center gap-4 hover:opacity-75 transition-opacity"
            >
              <span>The Values That Guide Us</span>
              <span className="text-[14px]">↓</span>
            </a>
          </div>
        </section>

        {/* ════ SECTION 05 — TAGLINE MEANING ════ */}
        <section className="py-16 md:py-24 px-[7%] bg-[#faf8f3] border-b border-[#263b2d]/15">
          <div className="max-w-[780px] mx-auto text-center">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#827a68] font-bold mb-4 block">
              THE PATH TO ENLIGHTENMENT
            </span>
            <h2
              className="text-[34px] sm:text-[44px] font-normal leading-[1.15] text-[#202c24] mb-6"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              An invitation to explore within.
            </h2>
            <p className="text-[14px] sm:text-[15px] leading-[1.9] text-[#555a50] mb-5">
              For Yoglivya, “The Path To Enlightenment” expresses a direction: curiosity about ourselves, attention to our experience and a willingness to keep learning.
            </p>
            <p className="text-[14px] sm:text-[15px] leading-[1.9] text-[#555a50] mb-8">
              We use these words with humility. They are not a promise attached to a product or a destination we can define for everyone. Our role is to offer essentials for practice and make space for the questions that give it personal meaning.
            </p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#a08758] font-semibold">
              The essentials are ours to offer. The path is yours to explore.
            </p>
          </div>
        </section>

        {/* ════ SECTION 06 — MEDITATION AND SELF-INQUIRY ════ */}
        <section className="py-16 md:py-24 px-[7%] bg-[#f2efe6] border-b border-[#263b2d]/15">
          <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#737e65] font-bold mb-4 block">
                A PRACTICE THAT TURNS INWARD
              </span>
              <h2
                className="text-[34px] sm:text-[44px] font-normal leading-[1.15] text-[#202c24] mb-6"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                From doing to noticing.
              </h2>
              <p className="text-[14px] leading-[1.9] text-[#555a50] mb-4">
                Our view of practice includes moments when there is less to do and more to notice. Meditation and self-inquiry belong in that space: an invitation to pay attention to experience and explore the questions it brings.
              </p>
              <p className="text-[14px] leading-[1.9] text-[#555a50] mb-8">
                At Yoglivya, we want this quieter dimension of practice to sit alongside movement. We make room for curiosity, without asking you to adopt a single belief or measure yourself against someone else’s journey.
              </p>
              <Link
                href="/products/meditation"
                className="inline-flex items-center gap-4 px-6 py-3.5 bg-[#26352b] text-white text-[10px] tracking-[0.14em] uppercase hover:bg-[#35483a] transition-colors"
              >
                <span>Explore Meditation Essentials</span>
                <span className="text-[14px]">↗</span>
              </Link>
            </div>

            {/* Three prompts */}
            <div className="space-y-4">
              <div className="bg-white p-6 border border-[#e2decfa0] shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#a08758] font-bold block mb-1">
                  Attention
                </span>
                <p
                  className="text-[18px] text-[#202c24]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  What am I noticing in this moment?
                </p>
              </div>

              <div className="bg-white p-6 border border-[#e2decfa0] shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#a08758] font-bold block mb-1">
                  Self-Inquiry
                </span>
                <p
                  className="text-[18px] text-[#202c24]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  What can I learn about my own patterns?
                </p>
              </div>

              <div className="bg-white p-6 border border-[#e2decfa0] shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#a08758] font-bold block mb-1">
                  Everyday Awareness
                </span>
                <p
                  className="text-[18px] text-[#202c24]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Where could I bring a little more attention today?
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════ SECTION 07 — EVERYDAY PRACTICE ════ */}
        <section id="everyday" className="py-16 md:py-24 px-[7%] bg-[#f0eee4]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.75fr] gap-6 lg:gap-[8%] items-end mb-12">
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#737e65] font-bold mb-3">
                PRACTICE, YOUR WAY
              </div>
              <h2
                className="text-[34px] sm:text-[42px] lg:text-[52px] font-normal leading-[1.1] tracking-[-0.035em] text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Small moments.<br />
                A place in your day.
              </h2>
            </div>
            <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[470px]">
              Your practice can take different forms on different days. Make room for movement, a quiet pause or a more considered choice, without needing every day to look the same.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <article className="group">
              <div className="h-[260px] sm:h-[300px] lg:h-[340px] overflow-hidden bg-[#ddd5c4]">
                <img
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=85"
                  alt="Make room to move"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <h3
                className="text-[22px] font-normal mt-5 mb-2 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Make room to move
              </h3>
              <p className="text-[13px] leading-[1.8] text-[#666b61] max-w-[330px]">
                Find a rhythm that works with your day, whether you practise at home, in a class or outdoors.
              </p>
            </article>

            <article className="group">
              <div className="h-[260px] sm:h-[300px] lg:h-[340px] overflow-hidden bg-[#ddd5c4]">
                <img
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=85"
                  alt="Leave space for stillness"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <h3
                className="text-[22px] font-normal mt-5 mb-2 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Leave space for stillness
              </h3>
              <p className="text-[13px] leading-[1.8] text-[#666b61] max-w-[330px]">
                Let a quiet moment have a place in your routine, without needing to fill it with another task.
              </p>
            </article>

            <article className="group">
              <div className="h-[260px] sm:h-[300px] lg:h-[340px] overflow-hidden bg-[#ddd5c4]">
                <img
                  src="https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=85"
                  alt="Choose what serves you"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <h3
                className="text-[22px] font-normal mt-5 mb-2 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Choose what serves you
              </h3>
              <p className="text-[13px] leading-[1.8] text-[#666b61] max-w-[330px]">
                Bring together the essentials you understand, use and want to return to.
              </p>
            </article>
          </div>
        </section>

        {/* ════ SECTION 08 — STATEMENT BAND ════ */}
        <section className="py-16 md:py-24 px-6 md:px-[8%] flex items-center justify-center text-center bg-[#e7e2d3]">
          <div className="max-w-[850px]">
            <div
              className="text-[54px] leading-[0.8] text-[#737e65]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              “
            </div>
            <blockquote
              className="text-[28px] sm:text-[36px] lg:text-[42px] leading-[1.25] font-normal tracking-[-0.025em] my-6 text-[#202c24]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Your practice does not need to look like anyone else’s to belong in your life.
            </blockquote>
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#737e65] m-0 font-medium">
              A YOGLIVYA REMINDER
            </p>
          </div>
        </section>

        {/* ════ SECTION 09 — VALUES ════ */}
        <section id="values" className="py-20 md:py-24 px-[7%] bg-[#26352b] text-[#f7f5ee]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#c6cbb8] font-bold mb-3">
                OUR VALUES
              </div>
              <h2
                className="text-[34px] sm:text-[44px] lg:text-[50px] font-normal leading-[1.1] text-[#f7f5ee]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Thoughtful choices.<br />
                A clear purpose.
              </h2>
            </div>
            <p className="max-w-[380px] text-[13px] leading-[1.8] text-[#d4d8ce]">
              These principles guide the brand we are building and the way we want to be useful to your practice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-white/25">
            <article className="pr-4 lg:border-r lg:border-white/20">
              <div
                className="text-[25px] text-[#d6c29b] mb-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                01
              </div>
              <h3
                className="text-[20px] font-normal mb-2 text-[#f7f5ee]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Respect for tradition
              </h3>
              <p className="text-[12px] leading-[1.7] text-[#d4d8ce]">
                We approach yoga’s Indian roots and diverse traditions with respect, curiosity and a willingness to keep learning.
              </p>
            </article>

            <article className="pr-4 lg:border-r lg:border-white/20">
              <div
                className="text-[25px] text-[#d6c29b] mb-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                02
              </div>
              <h3
                className="text-[20px] font-normal mb-2 text-[#f7f5ee]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Practical usefulness
              </h3>
              <p className="text-[12px] leading-[1.7] text-[#d4d8ce]">
                We value essentials with a clear role, helping you choose around your practice and everyday needs.
              </p>
            </article>

            <article className="pr-4 lg:border-r lg:border-white/20">
              <div
                className="text-[25px] text-[#d6c29b] mb-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                03
              </div>
              <h3
                className="text-[20px] font-normal mb-2 text-[#f7f5ee]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Clarity in every choice
              </h3>
              <p className="text-[12px] leading-[1.7] text-[#d4d8ce]">
                We believe product information should be understandable, with claims grounded in what can be shown.
              </p>
            </article>

            <article className="pr-4">
              <div
                className="text-[25px] text-[#d6c29b] mb-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                04
              </div>
              <h3
                className="text-[20px] font-normal mb-2 text-[#f7f5ee]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Room for your own path
              </h3>
              <p className="text-[12px] leading-[1.7] text-[#d4d8ce]">
                We welcome different starting points and personal experiences, without prescribing one way to practise.
              </p>
            </article>
          </div>
        </section>

        {/* ════ SECTION 10 — CLOSING CTA ════ */}
        <section className="py-16 md:py-24 px-[7%] grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-[9%] items-center">
          <div className="h-[320px] sm:h-[390px] overflow-hidden bg-[#e0ded6]">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85"
              alt="Quiet reflection with yoga practice essentials"
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#737e65] font-bold mb-3 block">
              BEGIN WITH WHAT YOU NEED
            </span>
            <h2
              className="text-[34px] sm:text-[44px] lg:text-[52px] font-normal leading-[1.1] tracking-[-0.035em] mb-5 text-[#202c24]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Find your essentials.<br />
              Make the practice yours.
            </h2>
            <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[540px] mb-7">
              Explore yoga and meditation essentials for the way you practise today, with room for your practice to change over time.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-6 px-6 py-4 bg-[#26352b] text-[#fffdf7] text-[10px] tracking-[0.16em] uppercase border border-[#26352b] hover:bg-transparent hover:text-[#26352b] transition-all duration-200"
              >
                <span>Shop All Essentials</span>
                <span className="text-[16px] leading-none">↗</span>
              </Link>
              <Link
                href="/contact"
                className="text-[11px] tracking-[0.06em] text-[#26352b] underline hover:text-[#737e65] transition-colors"
              >
                Have a question? Contact us.
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
