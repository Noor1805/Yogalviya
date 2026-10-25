'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface CallbackFormProps {
    productName?: string;
    className?: string;
}

export default function CallbackForm({ productName, className }: CallbackFormProps) {
    const defaultText = `I'd like a callback regarding ${productName}`;
    const contactHref = productName
        ? `/contact?message=${encodeURIComponent(defaultText)}`
        : `/contact`;

    return (
        <Button
            variant="outline"
            className={`rounded-none border-neutral-200 text-neutral-500 font-bold uppercase tracking-[0.2em] text-[10px] h-12 transition-all duration-500 hover:bg-black hover:text-white hover:border-black ${className || ''}`}
            asChild
        >
            <Link href={contactHref}>
                <Phone className="mr-2 h-3.5 w-3.5" strokeWidth={1} />
                Contact Concierge
            </Link>
        </Button>
    );
}
