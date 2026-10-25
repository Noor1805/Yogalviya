'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const footerSections = [
    {
        title: 'SHOP',
        links: [
            { label: 'All Products', href: '/products' },
            { label: 'Yoga Props', href: '/products/yoga-props' },
            { label: 'Yoga Mats', href: '/products/yoga-mats' },
            { label: 'Bestsellers', href: '/products?sort=bestseller' },
            { label: 'New Arrivals', href: '/products?sort=new' },
        ],
    },
    {
        title: 'ABOUT',
        links: [
            { label: 'Our Story', href: '/about#story' },
            { label: 'Our Philosophy', href: '/about#purpose' },
            { label: 'Everyday Rituals', href: '/about#everyday' },
            { label: 'Values & Principles', href: '/about#values' },
        ],
    },
    {
        title: 'HELP',
        links: [
            { label: 'Contact Us', href: '/contact' },
            { label: 'Shipping & Delivery', href: '/contact#faq' },
            { label: 'Returns & Refunds', href: '/contact#faq' },
            { label: 'FAQs', href: '/contact#faq' },
            { label: 'Track Order', href: '/account/orders' },
        ],
    },
    {
        title: 'BUSINESS',
        links: [
            { label: 'Bulk / Wholesale', href: '/contact' },
            { label: 'Studio Orders', href: '/contact' },
            { label: 'Corporate Wellness', href: '/contact' },
        ],
    },
    {
        title: 'LEGAL',
        links: [
            { label: 'Privacy Policy', href: '/contact' },
            { label: 'Terms & Conditions', href: '/contact' },
            { label: 'Refund Policy', href: '/contact' },
        ],
    },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (title: string) => {
        setOpenSection((prev) => (prev === title ? null : title));
    };

    return (
        <footer className="bg-[#26352b] text-[#eeeeee] pt-14 pb-8 px-5 sm:px-8 lg:px-12 border-t border-[#1c2720]">
            <div className="max-w-[1240px] mx-auto">
                
                {/* Desktop Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.8fr_repeat(5,1fr)] gap-8 lg:gap-7 pb-12 border-b border-[#ffffff1a]">
                    
                    {/* Brand Column */}
                    <div className="pr-4">
                        <Link href="/" className="inline-block group">
                            <h3 
                                className="text-[25px] tracking-[0.14em] uppercase text-white font-normal"
                                style={{ fontFamily: 'Georgia, serif' }}
                            >
                                YOGLIVYA
                            </h3>
                        </Link>
                        <p className="mt-3.5 text-[11.5px] leading-[1.8] text-[#c4c9c1] max-w-[280px]">
                            Premium yoga props and wellness essentials designed for a considered daily practice.
                        </p>
                        <div className="mt-5 flex items-center gap-3 text-[11px] text-[#a08758] tracking-widest uppercase font-semibold">
                            <span>Living the yogic way</span>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    {footerSections.map((sec) => (
                        <div key={sec.title} className="hidden md:block">
                            <h4 className="text-[10px] tracking-[0.14em] uppercase text-white font-medium mb-3.5">
                                {sec.title}
                            </h4>
                            <ul className="space-y-2.5">
                                {sec.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-[11px] text-[#b8beb6] hover:text-white transition-colors duration-200 block py-0.5"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Mobile Accordion Navigation */}
                    <div className="block md:hidden space-y-2 pt-2">
                        {footerSections.map((sec) => {
                            const isOpen = openSection === sec.title;
                            return (
                                <div key={sec.title} className="border-b border-[#ffffff15] pb-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleSection(sec.title)}
                                        className="w-full flex items-center justify-between py-2 text-[11px] tracking-[0.12em] font-medium text-white uppercase"
                                    >
                                        <span>{sec.title}</span>
                                        <ChevronDown
                                            className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <ul className="pl-2 pb-2 space-y-2 mt-1">
                                            {sec.links.map((link) => (
                                                <li key={link.label}>
                                                    <Link
                                                        href={link.href}
                                                        className="text-[11px] text-[#b8beb6] hover:text-white block py-1"
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#9aa58e]">
                    <p>© {currentYear} Yoglivya. All rights reserved.</p>
                    <p className="tracking-[0.1em] uppercase">Practice with purpose · Mindful everyday</p>
                    <p className="text-[#a08758]">Crafted for conscious living</p>
                </div>
            </div>
        </footer>
    );
}
