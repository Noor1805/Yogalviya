'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const testimonials = [
    {
        quote: "Yoglivya has redefined what intentional practice means to me. The attention to detail and quality of craftsmanship is unparalleled.",
        author: "Sarah Mitchell",
        role: "Yoga Practitioner & Wellness Editor",
        logo: "Vogue",
    },
    {
        quote: "Every prop I've owned from Yoglivya has become a timeless staple in my daily sadhana. The grip and support are exceptional.",
        author: "Elena Rodriguez",
        role: "Movement Guide",
        logo: "Elle",
    },
    {
        quote: "The level of organic consideration and care that goes into each prop is remarkable. This is mindful living at its finest.",
        author: "James Chen",
        role: "Mindful Lifestyle Blogger",
        logo: "GQ",
    },
];

const pressQuotes = [
    {
        quote: "Yoglivya represents the future of mindful living — sustainable, non-toxic, and thoughtfully crafted.",
        publication: "Vogue India",
    },
    {
        quote: "A masterclass in organic craft and ergonomic support. Yoglivya is setting new standards in conscious yoga lifestyle.",
        publication: "Harper's Bazaar",
    },
    {
        quote: "The perfect blend of tradition and timeless simplicity. Yoglivya is an authentic wellness brand to celebrate.",
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
