import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { buildMetadata, aboutPageSchema } from '@/lib/utils/seo';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = buildMetadata({
  title: 'About Us — Thoughtful Yoga Essentials',
  description:
    'Discover Yoglivya — thoughtful yoga essentials and props designed for a more mindful everyday life.',
  path: '/about',
  keywords: [
    'about Yoglivya',
    'mindful yoga props',
    'sustainable yoga brand',
    'eco friendly yoga essentials India',
    'Yoglivya story',
  ],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutPageSchema()} />

      <main className="bg-[#f7f5ee] text-[#202c24] overflow-x-hidden selection:bg-[#26352b] selection:text-[#f7f5ee]">
        {/* ════ HERO SECTION ════ */}
        <section className="min-h-[calc(100vh-78px)] grid grid-cols-1 lg:grid-cols-[43%_57%] border-b border-[#263b2d]/15">
          {/* Left Hero Copy */}
          <div className="px-6 py-12 md:px-12 lg:px-16 xl:px-24 flex flex-col justify-center items-start relative">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#737e65] font-bold mb-5">
              A little about us
            </span>
            <h1
              className="text-[44px] sm:text-[56px] lg:text-[70px] leading-[1.03] tracking-[-0.04em] font-normal mb-5 max-w-[600px] text-[#202c24]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              More than<br />
              yoga <em className="italic text-[#737e65] font-normal">products.</em>
            </h1>
            <p
              className="text-[20px] sm:text-[24px] lg:text-[26px] leading-[1.35] mb-4 text-[#202c24]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              A mindful way of living.
            </p>
            <p className="text-[14px] leading-[1.85] text-[#666b61] max-w-[440px] mb-8">
              At Yoglivya, we believe wellness lives in the little things — the breath you take, the time you make for yourself, and the tools that support your practice. We bring thoughtful yoga essentials into everyday life, helping you find a little more balance, one day at a time.
            </p>
            <a
              href="#story"
              className="inline-flex items-center gap-7 px-6 py-4 bg-[#26352b] text-[#fffdf7] text-[10px] tracking-[0.16em] uppercase border border-[#26352b] hover:bg-transparent hover:text-[#26352b] transition-all duration-200"
            >
              <span>Discover our story</span>
              <span className="text-[17px] leading-none">↗</span>
            </a>
            <div className="mt-12 lg:mt-16 text-[10px] tracking-[0.14em] text-[#737e65] uppercase">
              Move gently · Live mindfully
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-[calc(100vh-78px)] bg-[#d6c9b2]">
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1800&q=85"
              alt="Woman practising yoga in a peaceful, sunlit space"
              className="w-full h-full object-cover object-[center_48%]"
            />
            <div className="absolute right-[5%] top-[13%] border-l border-white/75 pl-4 text-white text-[10px] leading-[2.2] tracking-[0.2em] uppercase drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
              Practice<br />
              Breathe<br />
              Find your balance
            </div>
          </div>
        </section>

        {/* ════ SECTION 02 — OUR PURPOSE & VALUES ════ */}
        <section id="purpose" className="py-16 md:py-24 px-[7%] border-b border-[#263b2d]/15">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-[8%] items-center">
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#737e65] font-bold mb-4">
                Our purpose
              </div>
              <h2
                className="text-[34px] sm:text-[44px] lg:text-[52px] font-normal tracking-[-0.035em] leading-[1.12] mb-5 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Small rituals.<br />
                A more balanced life.
              </h2>
              <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[560px]">
                Yoga is more than a pose — it is a way to reconnect with yourself. Our aim is to make that feeling easier to bring into your everyday, with considered essentials designed to support your own pace and practice.
              </p>
            </div>
            <div className="lg:border-l lg:border-[#263b2d]/18 lg:pl-8">
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#737e65] font-bold mb-4">
                What matters to us
              </div>
              <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[560px]">
                Useful over excessive. Thoughtful over trend-led. We believe the things you bring into your space should feel good to use, be made with care, and encourage habits that last.
              </p>
            </div>
          </div>

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
                Mindful by nature
              </h3>
              <p className="text-[12px] leading-[1.75] text-[#666b61] max-w-[260px]">
                Simple essentials that make room for a calmer daily routine.
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
                Wellness for all
              </h3>
              <p className="text-[12px] leading-[1.75] text-[#666b61] max-w-[260px]">
                A welcoming approach to movement, wherever you are in your journey.
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
                Thoughtfully chosen
              </h3>
              <p className="text-[12px] leading-[1.75] text-[#666b61] max-w-[260px]">
                Practical, considered products that put purpose before excess.
              </p>
            </article>
          </div>
        </section>

        {/* ════ SECTION 03 — THE YOGLIVYA STORY ════ */}
        <section id="story" className="grid grid-cols-1 lg:grid-cols-2 min-h-[560px] bg-[#eeece1]">
          <div className="min-h-[380px] lg:min-h-[560px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1400&q=85"
              alt="Yoga mat and wellness essentials in warm natural light"
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="p-8 sm:p-12 lg:p-20 xl:p-24 flex flex-col items-start justify-center">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#737e65] font-bold mb-4">
              The Yoglivya story
            </span>
            <h2
              className="text-[36px] sm:text-[44px] lg:text-[54px] font-normal leading-[1.08] tracking-[-0.035em] mb-6 text-[#202c24]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Rooted in tradition.<br />
              Made for today.
            </h2>
            <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[470px] mb-4">
              Yoglivya brings the timeless spirit of yoga into modern everyday life. We are building a space for people who want to slow down, move with intention, and make their wellbeing a meaningful part of their routine.
            </p>
            <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[470px] mb-7">
              Whether you are unrolling your mat for the first time or returning to a practice you love, we want the journey to feel personal, approachable, and yours.
            </p>
            <a
              href="#values"
              className="text-[10px] tracking-[0.16em] uppercase text-[#26352b] border-b border-[#26352b] pb-2 inline-flex items-center gap-4 hover:opacity-75 transition-opacity"
            >
              <span>The values we live by</span>
              <span className="text-[14px]">↗</span>
            </a>
          </div>
        </section>

        {/* ════ SECTION 04 — MINDFULNESS, YOUR WAY ════ */}
        <section id="everyday" className="py-16 md:py-24 px-[7%] bg-[#f0eee4]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.75fr] gap-6 lg:gap-[8%] items-end mb-12">
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#737e65] font-bold mb-3">
                Mindfulness, your way
              </div>
              <h2
                className="text-[34px] sm:text-[42px] lg:text-[52px] font-normal leading-[1.1] tracking-[-0.035em] text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Wellbeing lives<br />
                in the little things.
              </h2>
            </div>
            <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[470px]">
              There is no single way to build a mindful life. It can begin with a few quiet minutes, a stretch between busy moments, or simply making room to breathe. We believe the everyday rituals matter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <article className="group">
              <div className="h-[260px] sm:h-[300px] lg:h-[340px] overflow-hidden bg-[#ddd5c4]">
                <img
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=85"
                  alt="A peaceful yoga practice in soft daylight"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <h3
                className="text-[22px] font-normal mt-5 mb-2 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Find your rhythm
              </h3>
              <p className="text-[13px] leading-[1.8] text-[#666b61] max-w-[330px]">
                Make movement your own. A little practice, at your own pace, can be a meaningful place to start.
              </p>
            </article>

            <article className="group">
              <div className="h-[260px] sm:h-[300px] lg:h-[340px] overflow-hidden bg-[#ddd5c4]">
                <img
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=85"
                  alt="Quiet meditation and reflection"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <h3
                className="text-[22px] font-normal mt-5 mb-2 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Make room to pause
              </h3>
              <p className="text-[13px] leading-[1.8] text-[#666b61] max-w-[330px]">
                Give yourself a moment away from the noise and return to what feels important.
              </p>
            </article>

            <article className="group">
              <div className="h-[260px] sm:h-[300px] lg:h-[340px] overflow-hidden bg-[#ddd5c4]">
                <img
                  src="https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=85"
                  alt="Yoga essentials ready for a daily routine"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <h3
                className="text-[22px] font-normal mt-5 mb-2 text-[#202c24]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Choose with intention
              </h3>
              <p className="text-[13px] leading-[1.8] text-[#666b61] max-w-[330px]">
                Surround yourself with useful, thoughtful essentials that support the rituals you want to keep.
              </p>
            </article>
          </div>
        </section>

        {/* ════ SECTION 05 — QUOTE BAND ════ */}
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
              You don’t have to change your whole life to feel better. Sometimes, you just need a little space to begin.
            </blockquote>
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#737e65] m-0 font-medium">
              A Yoglivya reminder
            </p>
          </div>
        </section>

        {/* ════ SECTION 06 — OUR VALUES / PRINCIPLES ════ */}
        <section id="values" className="py-20 md:py-24 px-[7%] bg-[#26352b] text-[#f7f5ee]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#c6cbb8] font-bold mb-3">
                Our values
              </div>
              <h2
                className="text-[34px] sm:text-[44px] lg:text-[50px] font-normal leading-[1.1] text-[#f7f5ee]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Good intentions,<br />
                in every detail.
              </h2>
            </div>
            <p className="max-w-[340px] text-[13px] leading-[1.8] text-[#d4d8ce]">
              Our choices begin with a simple question: does this help make mindful living feel more natural, useful, and accessible?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-white/25">
            <article className="pr-4 lg:border-r lg:border-white/20">
              <div
                className="text-[25px] text-[#d6c29b] mb-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                ✳
              </div>
              <h3
                className="text-[20px] font-normal mb-2 text-[#f7f5ee]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Authenticity
              </h3>
              <p className="text-[12px] leading-[1.7] text-[#d4d8ce]">
                Respect for yoga’s roots and the many ways people practise.
              </p>
            </article>

            <article className="pr-4 lg:border-r lg:border-white/20">
              <div
                className="text-[25px] text-[#d6c29b] mb-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                ◇
              </div>
              <h3
                className="text-[20px] font-normal mb-2 text-[#f7f5ee]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Quality
              </h3>
              <p className="text-[12px] leading-[1.7] text-[#d4d8ce]">
                Careful choices, with function and lasting use in mind.
              </p>
            </article>

            <article className="pr-4 lg:border-r lg:border-white/20">
              <div
                className="text-[25px] text-[#d6c29b] mb-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                ○
              </div>
              <h3
                className="text-[20px] font-normal mb-2 text-[#f7f5ee]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Accessibility
              </h3>
              <p className="text-[12px] leading-[1.7] text-[#d4d8ce]">
                A thoughtful welcome for beginners and experienced practitioners alike.
              </p>
            </article>

            <article className="pr-4">
              <div
                className="text-[25px] text-[#d6c29b] mb-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                ⌁
              </div>
              <h3
                className="text-[20px] font-normal mb-2 text-[#f7f5ee]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Conscious living
              </h3>
              <p className="text-[12px] leading-[1.7] text-[#d4d8ce]">
                Less noise, more intention, and more considered everyday choices.
              </p>
            </article>
          </div>
        </section>

        {/* ════ SECTION 07 — COMMITMENT ════ */}
        <section className="py-16 md:py-24 px-[7%] grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-[9%] items-center">
          <div className="h-[320px] sm:h-[390px] overflow-hidden bg-[#e0ded6]">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85"
              alt="A quiet moment of meditation in nature"
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#737e65] font-bold mb-3 block">
              A gentler everyday
            </span>
            <h2
              className="text-[34px] sm:text-[44px] lg:text-[52px] font-normal leading-[1.1] tracking-[-0.035em] mb-5 text-[#202c24]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Make space for<br />
              what matters.
            </h2>
            <p className="text-[14px] leading-[1.9] text-[#666b61] max-w-[540px] mb-7">
              Wellness does not have to be complicated. Start with a breath, a stretch, a few quiet minutes — and the small things that help you return to yourself. We are here to support your practice, wherever it takes you.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-6 px-6 py-4 bg-[#26352b] text-[#fffdf7] text-[10px] tracking-[0.16em] uppercase border border-[#26352b] hover:bg-transparent hover:text-[#26352b] transition-all duration-200"
            >
              <span>Explore Yoglivya</span>
              <span className="text-[16px] leading-none">↗</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
