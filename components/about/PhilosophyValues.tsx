'use client';

import { Gem, Heart, Shield, Sparkles, Award, Leaf } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const values = [
    {
        icon: Gem,
        title: 'Exceptional Quality',
        description: 'We source only the finest fabrics and materials from trusted artisans worldwide, ensuring every piece meets our exacting standards.',
    },
    {
        icon: Heart,
        title: 'Passion & Dedication',
        description: 'Every garment is crafted with love and attention to detail, reflecting our deep passion for fashion and commitment to excellence.',
    },
    {
        icon: Shield,
        title: 'Integrity & Trust',
        description: 'We build lasting relationships with our clients through transparency, honesty, and unwavering commitment to delivering on our promises.',
    },
    {
        icon: Sparkles,
        title: 'Innovation & Creativity',
        description: 'We continuously push boundaries, blending traditional craftsmanship with modern techniques to create innovative, timeless designs.',
    },
    {
        icon: Award,
        title: 'Excellence in Service',
        description: 'From consultation to delivery, we provide a luxury experience that exceeds expectations at every touchpoint.',
    },
    {
        icon: Leaf,
        title: 'Sustainable Practices',
        description: 'We are committed to ethical fashion, minimizing our environmental impact while supporting sustainable production methods.',
    },
];

export default function PhilosophyValues() {
    return (
        <section className="bg-neutral-950 py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <AnimatedSection className="text-center mb-16 sm:mb-24">
                    <span className="text-[#C5A572] text-xs uppercase tracking-[0.3em]">What We Stand For</span>
                    <h2 className="mt-4 text-5xl sm:text-7xl font-black text-white tracking-tight">
                        Our <span className="font-serif italic font-light text-[#C5A572]">Philosophy</span>
                    </h2>
                    <div className="mx-auto mt-6 w-20 h-px bg-[#C5A572]" />
                    <p className="mt-8 max-w-2xl mx-auto text-white/60 font-light text-base sm:text-lg leading-relaxed">
                        Our values guide every decision we make, from fabric selection to the final stitch, ensuring each piece embodies the luxury and quality our clients deserve.
                    </p>
                </AnimatedSection>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                    {values.map((value, index) => (
                        <AnimatedSection key={value.title} delay={index * 0.1}>
                            <div className="group h-full p-8 sm:p-10 border border-white/10 hover:border-[#C5A572]/50 transition-all duration-500 bg-black">
                                {/* Icon */}
                                <div className="w-16 h-16 flex items-center justify-center border border-[#C5A572]/30 text-[#C5A572] group-hover:bg-[#C5A572] group-hover:text-black transition-all duration-500">
                                    <value.icon className="w-8 h-8" />
                                </div>

                                {/* Content */}
                                <h3 className="mt-6 text-xl sm:text-2xl font-bold text-white tracking-tight">
                                    {value.title}
                                </h3>
                                <div className="mt-4 w-12 h-px bg-[#C5A572]" />
                                <p className="mt-4 text-white/60 font-light leading-relaxed text-sm sm:text-base">
                                    {value.description}
                                </p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}
