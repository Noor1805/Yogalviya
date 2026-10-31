'use client';

import Image from 'next/image';
import AnimatedSection from './AnimatedSection';

const team = [
    {
        name: 'Aarohi Patel',
        role: 'Founder & Holistic Director',
        bio: 'With over 15 years of immersion in yogic traditions and natural textiles, Aarohi brings her mindful vision to every Yoglivya piece.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    },
    {
        name: 'Rajesh Kumar',
        role: 'Master Tailor',
        bio: 'A third-generation tailor, Rajesh specializes in traditional hand-stitching techniques that give each garment its distinctive quality.',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80',
    },
    {
        name: 'Priya Sharma',
        role: 'Lead Designer',
        bio: 'Priya combines contemporary aesthetics with timeless elegance, creating designs that resonate with modern luxury clients.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80',
    },
    {
        name: 'Aisha Mohammed',
        role: 'Textile Specialist',
        bio: 'Aisha sources the finest fabrics from around the world, ensuring every material meets our exacting quality standards.',
        image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&q=80',
    },
];

export default function TeamArtisans() {
    return (
        <section className="bg-neutral-950 py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <AnimatedSection className="text-center mb-16 sm:mb-24">
                    <span className="text-[#C5A572] text-xs uppercase tracking-[0.3em]">The People Behind the Brand</span>
                    <h2 className="mt-4 text-5xl sm:text-7xl font-black text-white tracking-tight">
                        Our <span className="font-serif italic font-light text-[#C5A572]">Artisans</span>
                    </h2>
                    <div className="mx-auto mt-6 w-20 h-px bg-[#C5A572]" />
                    <p className="mt-8 max-w-2xl mx-auto text-white/60 font-light text-base sm:text-lg leading-relaxed">
                        Meet the talented individuals who bring our vision to life with their expertise, dedication, and passion for luxury craftsmanship.
                    </p>
                </AnimatedSection>

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member, index) => (
                        <AnimatedSection key={member.name} delay={index * 0.1}>
                            <div className="group">
                                {/* Image */}
                                <div className="relative aspect-[3/4] overflow-hidden mb-6">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 border border-white/10 group-hover:border-[#C5A572]/50 transition-colors duration-500" />

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                        <span className="text-[#C5A572] font-serif italic text-xl">View Profile</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                    {member.name}
                                </h3>
                                <p className="mt-2 text-[#C5A572] text-sm uppercase tracking-wider">
                                    {member.role}
                                </p>
                                <p className="mt-3 text-white/60 font-light text-sm leading-relaxed">
                                    {member.bio}
                                </p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>

                {/* Join Our Team CTA */}
                <AnimatedSection className="mt-20 text-center">
                    <div className="p-12 border border-white/10 bg-black">
                        <span className="text-[#C5A572] font-serif italic text-2xl">Join Our Family</span>
                        <p className="mt-4 text-white/60 font-light max-w-xl mx-auto leading-relaxed">
                            We're always looking for talented individuals who share our passion for luxury craftsmanship and excellence.
                        </p>
                        <button className="mt-8 px-8 py-4 bg-[#C5A572] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors duration-300">
                            View Careers
                        </button>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
