'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from './AnimatedSection';

const steps = [
    {
        number: '01',
        title: 'Design & Concept',
        description: 'Our designers sketch initial concepts, drawing inspiration from heritage aesthetics, contemporary trends, and client feedback to create unique patterns.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        label: 'Sketching',
    },
    {
        number: '02',
        title: 'Fabric Selection',
        description: 'We source the finest fabrics from trusted suppliers worldwide, carefully selecting each material for its quality, texture, and durability.',
        image: 'https://images.unsplash.com/photo-1558171813-4c088753af1f?w=800&q=80',
        label: 'Sourcing',
    },
    {
        number: '03',
        title: 'Expert Crafting',
        description: 'Our master artisans bring designs to life using traditional techniques combined with modern precision, ensuring every stitch meets our exacting standards.',
        image: 'https://images.unsplash.com/photo-1537832816515-883919ab027e?w=800&q=80',
        label: 'Crafting',
    },
    {
        number: '04',
        title: 'Quality Assurance',
        description: 'Each piece undergoes rigorous quality checks, from initial cut to final finishing, ensuring only the finest garments reach our clients.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        label: 'Inspection',
    },
];

export default function CraftsmanshipShowcase() {
    return (
        <section className="bg-black py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <AnimatedSection className="text-center mb-16 sm:mb-24">
                    <span className="text-[#C5A572] text-xs uppercase tracking-[0.3em]">The Art of Creation</span>
                    <h2 className="mt-4 text-5xl sm:text-7xl font-black text-white tracking-tight">
                        Our <span className="font-serif italic font-light text-[#C5A572]">Craftsmanship</span>
                    </h2>
                    <div className="mx-auto mt-6 w-20 h-px bg-[#C5A572]" />
                    <p className="mt-8 max-w-2xl mx-auto text-white/60 font-light text-base sm:text-lg leading-relaxed">
                        Every Yoglivya product undergoes a meticulous process, combining sustainable natural materials with mindful ergonomic engineering.
                    </p>
                </AnimatedSection>

                {/* Steps */}
                <div className="space-y-24 sm:space-y-32">
                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                                index % 2 === 1 ? 'lg:direction-rtl' : ''
                            }`}
                        >
                            {/* Image */}
                            <AnimatedSection direction={index % 2 === 0 ? 'left' : 'right'}>
                                <div className="relative aspect-[4/3] overflow-hidden group">
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 border border-white/10" />

                                    {/* Step Number Overlay */}
                                    <div className="absolute top-6 left-6 bg-black/80 px-4 py-2">
                                        <span className="text-[#C5A572] font-serif text-2xl">{step.number}</span>
                                    </div>
                                </div>
                            </AnimatedSection>

                            {/* Content */}
                            <AnimatedSection direction={index % 2 === 0 ? 'right' : 'left'}>
                                <div className={index % 2 === 1 ? 'lg:text-right' : ''}>
                                    <span className="text-[#C5A572] text-xs uppercase tracking-[0.3em]">
                                        Step {step.number} — {step.label}
                                    </span>
                                    <h3 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                        {step.title}
                                    </h3>
                                    <div className={`mt-6 w-16 h-px bg-[#C5A572] ${index % 2 === 1 ? 'lg:ml-auto' : ''}`} />
                                    <p className="mt-6 text-white/60 font-light leading-relaxed text-base sm:text-lg max-w-lg">
                                        {step.description}
                                    </p>

                                    {/* Decorative Element */}
                                    <div className={`mt-8 flex items-center gap-3 ${index % 2 === 1 ? 'lg:justify-end' : ''}`}>
                                        <span className="text-[#C5A572] text-xl">✦</span>
                                        <div className="w-12 h-px bg-[#C5A572]" />
                                        <span className="text-[#C5A572] text-xl">✦</span>
                                    </div>
                                </div>
                            </AnimatedSection>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
