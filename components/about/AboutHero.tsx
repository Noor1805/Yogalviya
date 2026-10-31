'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';

export default function AboutHero() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
        >
            {/* Background Image with Parallax */}
            <motion.div style={{ y, opacity }} className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
                    alt="Yoglivya Atelier"
                    fill
                    className="object-cover opacity-70"
                    priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 sm:px-6">
                {/* Brand Name */}
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[clamp(60px,16vw,170px)] font-black uppercase tracking-tighter text-white leading-none"
                >
                    YOGLIVYA
                </motion.h1>

                {/* Subtitle with Gold Accent */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-4 sm:mt-6"
                >
                    <p className="font-serif italic text-[clamp(20px,3.5vw,40px)] text-[#C69F68] tracking-wide">
                        MINDFUL WELLNESS
                    </p>
                </motion.div>

                {/* Decorative Line */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '120px' }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto mt-6 sm:mt-8 h-px bg-[#C69F68]"
                />

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-6 sm:mt-8 font-serif text-[clamp(14px,2vw,20px)] text-white/80 font-light tracking-wide max-w-2xl mx-auto leading-relaxed"
                >
                    Where Conscious Practice Meets Sustainable Living
                </motion.p>

                {/* Decorative Stars */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="mt-8 sm:mt-12 flex items-center justify-center gap-4"
                >
                    <span className="text-[#C5A572] text-2xl sm:text-3xl animate-float">✦</span>
                    <span className="text-white/60 text-xs sm:text-sm uppercase tracking-[0.3em]">
                        Est. 2020
                    </span>
                    <span className="text-[#C5A572] text-2xl sm:text-3xl animate-float">✦</span>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-2 text-white/60"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
                    <ArrowDown className="w-4 h-4" />
                </motion.div>
            </motion.div>
        </section>
    );
}
