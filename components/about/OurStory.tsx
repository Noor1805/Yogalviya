'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from './AnimatedSection';
import { useCounter } from '@/hooks/useCounter';

function CounterStat({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
    const { count, ref } = useCounter(value, 2500);

    return (
        <div ref={ref} className="text-center">
            <p className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                {count}{suffix}
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/60 font-light">
                {label}
            </p>
        </div>
    );
}

export default function OurStory() {
    return (
        <section className="bg-black py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <AnimatedSection className="text-center mb-16 sm:mb-24">
                    <span className="text-[#C5A572] text-xs uppercase tracking-[0.3em]">Our Journey</span>
                    <h2 className="mt-4 text-5xl sm:text-7xl font-black text-white tracking-tight">
                        Our <span className="font-serif italic font-light text-[#C5A572]">Story</span>
                    </h2>
                    <div className="mx-auto mt-6 w-20 h-px bg-[#C5A572]" />
                </AnimatedSection>

                {/* Story Block 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 sm:mb-32">
                    <AnimatedSection direction="left">
                        <div className="relative aspect-[4/5] overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1558171813-4c088753af1f?w=800&q=80"
                                alt="Yoglivya beginning"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 border border-white/10" />
                        </div>
                    </AnimatedSection>

                    <AnimatedSection direction="right">
                        <div>
                            <span className="text-[#C69F68] font-serif italic text-2xl sm:text-3xl">The Beginning</span>
                            <h3 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                Where Mindful Practice Begins
                            </h3>
                            <div className="mt-6 w-16 h-px bg-[#C69F68]" />
                            <p className="mt-6 text-white/70 leading-relaxed font-light text-base sm:text-lg">
                                Founded in 2020, Yoglivya was born from a deep devotion to mindful movement, breath, and conscious living. What began as an intimate search for truly non-toxic, sustainable yoga essentials has evolved into a trusted wellness brand revered for organic craftsmanship.
                            </p>
                            <p className="mt-4 text-white/70 leading-relaxed font-light text-base sm:text-lg">
                                Each piece we create tells a story of dedication, artistry, and the pursuit of perfection. Our designers draw inspiration from heritage techniques while embracing contemporary innovation.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>

                {/* Story Block 2 - Reversed */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 sm:mb-32">
                    <AnimatedSection direction="left" className="order-2 lg:order-1">
                        <div>
                            <span className="text-[#C5A572] font-serif italic text-2xl sm:text-3xl">The Vision</span>
                            <h3 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                Redefining Luxury Fashion
                            </h3>
                            <div className="mt-6 w-16 h-px bg-[#C5A572]" />
                            <p className="mt-6 text-white/70 leading-relaxed font-light text-base sm:text-lg">
                                Our vision extends beyond creating beautiful garments. We believe in crafting experiences that empower individuals to express their unique identity through fashion that transcends trends and seasons.
                            </p>
                            <p className="mt-4 text-white/70 leading-relaxed font-light text-base sm:text-lg">
                                Every stitch, every fabric selection, and every design detail is thoughtfully considered to ensure our clients feel extraordinary in every piece they wear.
                            </p>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection direction="right" className="order-1 lg:order-2">
                        <div className="relative aspect-[4/5] overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1537832816515-883919ab027e?w=800&q=80"
                                alt="Yoglivya vision"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 border border-white/10" />
                        </div>
                    </AnimatedSection>
                </div>

                {/* Stats Section */}
                <AnimatedSection>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 pt-16 sm:pt-24 border-t border-white/10">
                        <CounterStat label="Year Founded" value={2020} />
                        <CounterStat label="Collections" value={48} suffix="+" />
                        <CounterStat label="Happy Clients" value={2500} suffix="+" />
                        <CounterStat label="Master Artisans" value={35} suffix="+" />
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
