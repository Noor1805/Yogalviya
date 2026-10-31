'use client';

import { CheckCircle2, Leaf, Recycle, Heart, Droplets, Trees } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useCounter } from '@/hooks/useCounter';

function StatCounter({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
    const { count, ref } = useCounter(value, 2000);

    return (
        <div ref={ref} className="text-center p-8 border border-[#C5A572]/30 bg-black">
            <p className="text-5xl sm:text-6xl font-black text-[#C5A572] tracking-tight">
                {count}{suffix}
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/60 font-light">
                {label}
            </p>
        </div>
    );
}

const initiatives = [
    {
        icon: Leaf,
        title: 'Organic Fabrics',
        description: 'We prioritize organic and sustainably sourced fabrics, reducing chemical usage and environmental impact.',
    },
    {
        icon: Recycle,
        title: 'Zero Waste Production',
        description: 'Our production process minimizes waste through careful pattern planning and recycling fabric scraps.',
    },
    {
        icon: Heart,
        title: 'Ethical Labor Practices',
        description: 'We ensure fair wages, safe working conditions, and respect for all artisans and workers in our supply chain.',
    },
    {
        icon: Droplets,
        title: 'Water Conservation',
        description: 'Our dyeing and treatment processes use 60% less water than traditional methods.',
    },
    {
        icon: Trees,
        title: 'Carbon Neutral Shipping',
        description: 'We offset 100% of our carbon emissions through reforestation projects and sustainable packaging.',
    },
    {
        icon: CheckCircle2,
        title: 'Certified Sustainable',
        description: 'Our commitment is verified through GOTS, OEKO-TEX, and other leading sustainability certifications.',
    },
];

export default function SustainabilityCommitment() {
    return (
        <section className="bg-neutral-950 py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <AnimatedSection className="text-center mb-16 sm:mb-24">
                    <span className="text-[#C5A572] text-xs uppercase tracking-[0.3em]">Our Responsibility</span>
                    <h2 className="mt-4 text-5xl sm:text-7xl font-black text-white tracking-tight">
                        Sustainability <span className="font-serif italic font-light text-[#C5A572]">Commitment</span>
                    </h2>
                    <div className="mx-auto mt-6 w-20 h-px bg-[#C5A572]" />
                    <p className="mt-8 max-w-2xl mx-auto text-white/60 font-light text-base sm:text-lg leading-relaxed">
                        We believe luxury and sustainability go hand in hand. Our commitment to the environment and ethical practices is woven into every aspect of our business.
                    </p>
                </AnimatedSection>

                {/* Stats */}
                <AnimatedSection className="mb-24">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <StatCounter label="Organic Materials" value={85} suffix="%" />
                        <StatCounter label="Less Water Usage" value={60} suffix="%" />
                        <StatCounter label="Carbon Neutral" value={100} suffix="%" />
                        <StatCounter label="Ethical Factories" value={100} suffix="%" />
                    </div>
                </AnimatedSection>

                {/* Initiatives Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                    {initiatives.map((initiative, index) => (
                        <AnimatedSection key={initiative.title} delay={index * 0.1}>
                            <div className="group h-full p-8 border border-white/10 bg-black hover:border-[#C5A572]/50 transition-all duration-500">
                                {/* Icon */}
                                <div className="w-14 h-14 flex items-center justify-center text-[#C5A572] mb-6">
                                    <initiative.icon className="w-8 h-8" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    {initiative.title}
                                </h3>
                                <div className="mt-4 w-12 h-px bg-[#C5A572]" />
                                <p className="mt-4 text-white/60 font-light leading-relaxed text-sm sm:text-base">
                                    {initiative.description}
                                </p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>

                {/* Commitment Statement */}
                <AnimatedSection className="mt-20">
                    <div className="p-12 sm:p-16 border border-[#C5A572]/30 bg-black text-center">
                        <span className="text-[#C5A572] font-serif italic text-2xl sm:text-3xl">Our Pledge</span>
                        <p className="mt-6 text-white/70 font-light leading-relaxed text-base sm:text-lg max-w-3xl mx-auto">
                            By 2026, Yoglivya commits to achieving 100% sustainable sourcing, zero waste to landfill, and carbon neutrality across our entire supply chain. We believe that true wellness respects both people and planet.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <span className="text-[#C5A572] text-2xl">✦</span>
                            <span className="text-white/60 text-xs uppercase tracking-[0.3em]">Sustainable Luxury</span>
                            <span className="text-[#C5A572] text-2xl">✦</span>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
