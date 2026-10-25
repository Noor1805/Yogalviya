'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const testimonials = [
    {
        quote: "Almina Couture has redefined what luxury means to me. The attention to detail and quality of craftsmanship is unparalleled.",
        author: "Sarah Mitchell",
        role: "Fashion Editor, Vogue",
        logo: "Vogue",
    },
    {
        quote: "Every piece I've owned from Almina Couture has become a timeless staple in my wardrobe. The quality is exceptional.",
        author: "Elena Rodriguez",
        role: "Style Consultant",
        logo: "Elle",
    },
    {
        quote: "The level of personalization and care that goes into each garment is remarkable. This is luxury fashion at its finest.",
        author: "James Chen",
        role: "Luxury Lifestyle Blogger",
        logo: "GQ",
    },
];

const pressQuotes = [
    {
        quote: "Almina Couture represents the future of luxury fashion — sustainable, ethical, and absolutely beautiful.",
        publication: "Vogue India",
    },
    {
        quote: "A masterclass in craftsmanship and design. Almina Couture is setting new standards in the luxury fashion industry.",
        publication: "Harper's Bazaar",
    },
    {
        quote: "The perfect blend of tradition and innovation. Almina Couture is a brand to watch.",
        publication: "Elle Decor",
    },
];

export default function TestimonialsPress() {
    return (
        <section className="bg-black py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <AnimatedSection className="text-center mb-16 sm:mb-24">
                    <span className="text-[#C5A572] text-xs uppercase tracking-[0.3em]">What People Say</span>
                    <h2 className="mt-4 text-5xl sm:text-7xl font-black text-white tracking-tight">
                        Testimonials & <span className="font-serif italic font-light text-[#C5A572]">Press</span>
                    </h2>
                    <div className="mx-auto mt-6 w-20 h-px bg-[#C5A572]" />
                </AnimatedSection>

                {/* Client Testimonials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-24">
                    {testimonials.map((testimonial, index) => (
                        <AnimatedSection key={testimonial.author} delay={index * 0.15}>
                            <div className="h-full p-8 sm:p-10 border border-white/10 bg-neutral-950 hover:border-[#C5A572]/30 transition-colors duration-500">
                                {/* Quote Icon */}
                                <Quote className="w-10 h-10 text-[#C5A572]/40 mb-6" />

                                {/* Quote */}
                                <p className="text-white/80 font-light leading-relaxed text-sm sm:text-base italic">
                                    "{testimonial.quote}"
                                </p>

                                {/* Author */}
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <p className="text-white font-bold text-base">{testimonial.author}</p>
                                    <p className="mt-1 text-[#C5A572] text-sm">{testimonial.role}</p>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>

                {/* Press Section */}
                <AnimatedSection>
                    <div className="p-12 sm:p-16 border border-white/10 bg-neutral-950">
                        <h3 className="text-center text-3xl sm:text-4xl font-bold text-white tracking-tight mb-12">
                            As Featured <span className="font-serif italic font-light text-[#C5A572]">In</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {pressQuotes.map((press, index) => (
                                <div key={index} className="text-center">
                                    <p className="text-white/70 font-light italic leading-relaxed text-sm sm:text-base">
                                        "{press.quote}"
                                    </p>
                                    <p className="mt-6 text-[#C5A572] font-bold uppercase tracking-widest text-sm">
                                        — {press.publication}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* Logos/Features Strip */}
                <AnimatedSection className="mt-16">
                    <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-16 opacity-50">
                        {['Vogue', 'Elle', 'GQ', 'Harper\'s Bazaar', 'Vanity Fair'].map((publication) => (
                            <span
                                key={publication}
                                className="text-white text-2xl sm:text-3xl font-serif italic tracking-wide"
                            >
                                {publication}
                            </span>
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
