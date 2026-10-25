'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CallToAction() {
    return (
        <section className="relative py-32 sm:py-40 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
                    alt="Yoglivya Yoga"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/80" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="text-[#C69F68] font-serif italic text-2xl sm:text-3xl">
                        Mindful Movement
                    </span>

                    <h2 className="mt-6 text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight">
                        Discover Your
                        <span className="block font-serif italic font-light text-[#C69F68] mt-2">
                            Daily Flow
                        </span>
                    </h2>

                    <div className="mx-auto mt-8 w-24 h-px bg-[#C69F68]" />

                    <p className="mt-8 max-w-2xl mx-auto text-white/70 font-light text-base sm:text-lg leading-relaxed">
                        Explore our curated selection of organic yoga mats, grounding props, and mindful wellness essentials designed for lifelong practice.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="/products"
                            className="group inline-flex items-center gap-3 px-10 py-5 bg-[#2E4737] text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
                        >
                            Shop Essentials
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>

                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-3 px-10 py-5 border border-white text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
                        >
                            Studio Inquiries
                        </Link>
                    </div>

                    {/* Decorative Elements */}
                    <div className="mt-16 flex items-center justify-center gap-4">
                        <span className="text-[#C69F68] text-2xl animate-float">✦</span>
                        <span className="text-white/60 text-xs uppercase tracking-[0.3em]">Conscious Wellness</span>
                        <span className="text-[#C69F68] text-2xl animate-float">✦</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
