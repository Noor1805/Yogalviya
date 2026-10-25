'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: string;
  badge: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  image: string;
  alt: string;
}

const slides: Slide[] = [
  {
    id: 'slide-1',
    badge: 'Living the Yogic Way · Conscious Movement',
    title: 'Practice with purpose.',
    titleAccent: 'Every breath, every stretch.',
    subtitle:
      'Premium yoga props, non-slip mats and wellness essentials handcrafted to bring deep alignment and intention to your daily ritual.',
    primaryCta: {
      label: 'Shop Collection',
      href: '/products',
    },
    secondaryCta: {
      label: 'Explore Yoga Props',
      href: '/products/yoga-props',
    },
    image: '/images/home/yoga-practice-1.png',
    alt: 'Woman stretching during a mindful yoga practice in a bright studio',
  },
  {
    id: 'slide-2',
    badge: '100% Sustainable & Renewable · Earth First',
    title: 'Grounded in nature,',
    titleAccent: 'crafted for stillness.',
    subtitle:
      'Eco-friendly cork blocks, organic buckwheat bolsters, and biodegradable natural rubber mats that honor your practice and our planet.',
    primaryCta: {
      label: 'Explore Meditation',
      href: '/products/meditation',
    },
    secondaryCta: {
      label: 'Our Story',
      href: '/about',
    },
    image: '/images/home/yoga-practice-2.png',
    alt: 'Woman meditating in a serene outdoor-inspired space',
  },
  {
    id: 'slide-3',
    badge: 'Studio-Grade Durability · Certified Quality',
    title: 'Master your alignment.',
    titleAccent: 'Support that elevates you.',
    subtitle:
      'Tested with master yoga teachers: heavy-duty woven cotton straps, solid zinc D-rings, and Iyengar ropes made to withstand years of intense daily practice.',
    primaryCta: {
      label: 'Discover Bestsellers',
      href: '#bestsellers',
    },
    secondaryCta: {
      label: 'View All Props',
      href: '/products',
    },
    image: '/images/home/yoga-practice-3.png',
    alt: 'Group yoga class practicing together in a sunlit studio',
  },
];

const AUTOPLAY_INTERVAL = 10000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Keep the hero rotating automatically, including while the pointer is over it.
  useEffect(() => {
    const timer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartXRef.current = null;
  };

  const activeSlide = slides[current];

  return (
    <section
      aria-label="Hero Carousel"
      className="relative w-full overflow-hidden bg-[#1c211d] select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative w-full h-[460px] sm:h-[500px] md:h-[540px] lg:h-[580px] xl:h-[620px] max-h-[680px]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="absolute inset-0"
          >
            {/* Background Image with subtle zoom */}
            <motion.div
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6.5, ease: 'easeOut' }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={activeSlide.image}
                alt={activeSlide.alt}
                fill
                priority={current === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </motion.div>

            {/* Gradient Overlays for optimal readability and serene mood */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

            {/* Content Container */}
            <div className="relative z-10 mx-auto h-full max-w-[1280px] px-6 sm:px-10 lg:px-14 flex flex-col justify-center">
              <div className="max-w-2xl text-white">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 mb-4 sm:mb-5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#e8dfc9] text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.22em] font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a86a] animate-pulse" />
                  {activeSlide.badge}
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-[38px] sm:text-[52px] md:text-[62px] lg:text-[72px] font-normal leading-[1.03] text-white tracking-tight"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {activeSlide.title}
                  {activeSlide.titleAccent && (
                    <span className="block text-[#e3ded3] font-light italic mt-1 text-[32px] sm:text-[44px] md:text-[54px] lg:text-[62px]">
                      {activeSlide.titleAccent}
                    </span>
                  )}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                  className="mt-4 sm:mt-5 text-[13px] sm:text-[14.5px] md:text-[15.5px] text-white/85 leading-[1.75] max-w-xl font-light"
                >
                  {activeSlide.subtitle}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.6 }}
                  className="mt-7 sm:mt-9 flex flex-wrap items-center gap-3.5 sm:gap-4"
                >
                  <Link
                    href={activeSlide.primaryCta.href}
                    className="inline-flex items-center justify-center px-7 py-3.5 sm:px-8 sm:py-4 bg-[#26352b] text-white text-[10.5px] sm:text-[11.5px] tracking-[0.16em] uppercase font-semibold border border-white/20 shadow-xl transition-all duration-300 hover:bg-white hover:text-[#1c211d] hover:border-white active:scale-95"
                  >
                    {activeSlide.primaryCta.label}
                  </Link>

                  {activeSlide.secondaryCta && (
                    <Link
                      href={activeSlide.secondaryCta.href}
                      className="inline-flex items-center justify-center px-6 py-3.5 sm:px-7 sm:py-4 bg-transparent text-white text-[10.5px] sm:text-[11.5px] tracking-[0.16em] uppercase font-medium border border-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white active:scale-95"
                    >
                      {activeSlide.secondaryCta.label}
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-6 pointer-events-none">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="pointer-events-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/25 text-white/80 border border-white/15 backdrop-blur-md transition-all duration-200 hover:bg-black/60 hover:text-white hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="pointer-events-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/25 text-white/80 border border-white/15 backdrop-blur-md transition-all duration-200 hover:bg-black/60 hover:text-white hover:scale-105 active:scale-95"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

      </div>
    </section>
  );
}
