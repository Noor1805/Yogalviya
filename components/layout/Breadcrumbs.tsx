'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/utils/seo';

interface BreadcrumbItem {
    name: string;
    href: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <>
            <JsonLd data={breadcrumbSchema(items.map((i) => ({ name: i.name, url: i.href })))} />
            <nav aria-label="Breadcrumb" className="animate-fade-in">
                <ol className="flex flex-wrap items-center gap-1.5 text-sm">
                    {items.map((item, idx) => (
                        <li key={item.href} className="flex items-center gap-1.5">
                            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />}
                            {idx === items.length - 1 ? (
                                <span className="font-bold uppercase tracking-widest text-[10px] text-black italic">{item.name}</span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 transition-colors duration-200 hover:text-black"
                                >
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}
