import { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { buildMetadata } from '@/lib/utils/seo';
import { CheckCircle, ArrowRight, Leaf } from 'lucide-react';

export const metadata: Metadata = buildMetadata({
    title: 'Thank You',
    description: 'Thank you for your submission. Our team will get back to you shortly.',
    path: '/thank-you',
});

interface ThankYouPageProps {
    searchParams: Promise<{ type?: string }>;
}

const messages: Record<string, { title: string; description: string }> = {
    enquiry: {
        title: 'Enquiry Received!',
        description:
            'We have received your private enquiry. Our concierge team will review your request and respond with artisanal details within 24 hours.',
    },
    contact: {
        title: 'Message Sent!',
        description:
            'Thank you for reaching out. Our team will read your message and get back to you within one business day.',
    },
    callback: {
        title: 'Callback Requested!',
        description:
            'We have noted your callback request. A team member will call you at your preferred time.',
    },
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
    const { type } = await searchParams;
    const msg = messages[type || ''] || messages.contact;

    return (
        <section className="flex min-h-[70vh] items-center bg-cream-50 py-20">
            <Container>
                <div className="mx-auto max-w-lg text-center">
                    {/* Animated Success Icon */}
                    <div className="relative mx-auto mb-8">
                        <div className="absolute inset-0 mx-auto h-20 w-20 rounded-full bg-sage-200/50 blur-xl animate-pulse-soft" />
                        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage-100 animate-scale-in">
                            <CheckCircle className="h-10 w-10 text-sage-600" />
                        </div>
                    </div>

                    <h1 className="animate-fade-in-up delay-200 font-[var(--font-dm-sans)] text-3xl font-bold text-sage-900 sm:text-4xl">
                        {msg.title}
                    </h1>
                    <p className="animate-fade-in-up delay-300 mt-5 text-lg leading-relaxed text-sage-600">
                        {msg.description}
                    </p>

                    <div className="animate-fade-in-up delay-400 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="rounded-xl bg-sage-800 px-8 font-semibold text-white shadow-md transition-all duration-300 hover:bg-sage-700 hover:shadow-lg active:scale-[0.98]"
                        >
                            <Link href="/products">
                                Browse Products
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="rounded-xl border-sage-300 px-8 font-semibold text-sage-700 transition-all hover:bg-sage-50 active:scale-[0.98]"
                        >
                            <Link href="/">Go Home</Link>
                        </Button>
                    </div>

                    {/* Decorative */}
                    <div className="animate-fade-in delay-500 mt-12 flex items-center justify-center gap-2 text-sm text-sage-400">
                        <Leaf className="h-4 w-4" />
                        <span>Yoglivya — Mindful Yoga & Wellness</span>
                    </div>
                </div>
            </Container>
        </section>
    );
}
