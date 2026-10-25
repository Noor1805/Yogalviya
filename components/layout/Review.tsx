'use client';

import { useEffect, useRef } from 'react';
import Container from '@/components/layout/Container';

const reviews = [
  { quote: "Every piece feels timeless and modern — truly something I'll cherish for years.", stars: 5, name: 'Elena Fischer', role: 'Creative Director', img: '/images/product/pr1.jpg' },
  { quote: "Handcrafted with care and integrity. Every purchase feels deeply meaningful.", stars: 5, name: 'Lucas Meyer', role: 'Digital Nomad', img: '/images/product/pr2.jpg' },
  { quote: "From packaging to product, everything exudes luxury. Compliments every time.", stars: 5, name: 'Sofia Müller', role: 'Fashion Editor', img: '/images/product/pr3.jpg' },
  { quote: "The craftsmanship is exquisite. You can feel the quality in every stitch.", stars: 5, name: 'Amelia Rossi', role: 'Fashion Editor', img: '/images/product/pr4.jpg' },
  { quote: "Exceptional service and beautiful design — comfortable, stylish, my new favorite.", stars: 5, name: 'Marco Ricci', role: 'Stylist', img: '/images/product/pr1.jpg' },
];

function AnimatedGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
          card.style.opacity = '1';
          card.style.transform = 'translateX(0) translateY(0)';
        });
        io.disconnect();
      }
    }, { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}

function CardInner({ review, translateStart, delay = 0 }: {
  review: typeof reviews[0];
  translateStart: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = translateStart;
    el.style.transition = `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`;
  }, []);

  return (
    <div ref={ref} data-card className="bg-white p-6 md:p-8 w-full max-w-[380px]">
      <p className="text-[13px] md:text-[14px] text-gray-700 leading-relaxed mb-7" style={{ fontFamily: 'Georgia, serif' }}>
        "{review.quote}"
      </p>
      <div className="text-[13px] md:text-[14px] text-black mb-5">{'★'.repeat(review.stars)}</div>
      <div className="flex items-center gap-3">
        <img src={review.img} alt="" className="w-10 h-10 md:w-12 md:h-12 object-cover object-top grayscale shrink-0" />
        <div>
          <p className="text-[12px] md:text-[13px] font-bold text-black">{review.name}</p>
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-gray-400">{review.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewSection() {
  return (
    <section className="bg-gray-50" style={{ minHeight: '320vh' }}>

      {/* Sticky heading */}
      <div className="sticky top-0 h-screen flex items-center justify-center z-0 pointer-events-none">
        <h2
          className="text-center text-black leading-tight px-6"
          style={{ fontSize: 'clamp(40px, 6vw, 80px)', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}
        >
          What our Clients<br />are saying about Almina Couture
        </h2>
      </div>

      {/* Cards */}
      <div className="relative z-10">
        <Container>
          <div className="flex flex-col gap-12 md:gap-28 pt-[100vh] pb-40">

            {/* Group 1 — 1 center */}
            <AnimatedGroup>
              <div className="flex justify-center">
                <CardInner review={reviews[0]} translateStart="translateY(100px)" delay={0} />
              </div>
            </AnimatedGroup>

            {/* Group 2 — left + right */}
            <AnimatedGroup>
              <div className="flex flex-col md:flex-row items-center md:justify-between gap-12 md:gap-0">
                <CardInner review={reviews[1]} translateStart="translateY(50px)" delay={0} />
                <CardInner review={reviews[2]} translateStart="translateY(50px)" delay={0.12} />
              </div>
            </AnimatedGroup>

            {/* Group 3 — left + right */}
            <AnimatedGroup>
              <div className="flex flex-col md:flex-row items-center md:justify-between gap-12 md:gap-0">
                <CardInner review={reviews[3]} translateStart="translateY(50px)" delay={0} />
                <CardInner review={reviews[4]} translateStart="translateY(50px)" delay={0.12} />
              </div>
            </AnimatedGroup>

            {/* Group 4 — 1 center */}
            <AnimatedGroup>
              <div className="flex justify-center">
                <CardInner review={reviews[0]} translateStart="translateY(100px)" delay={0} />
              </div>
            </AnimatedGroup>

          </div>
        </Container>
      </div>

    </section>
  );
}