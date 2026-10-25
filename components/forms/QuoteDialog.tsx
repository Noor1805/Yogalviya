'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { quoteSchema, QuoteRequest } from '@/types/enquiry';
import { Loader2, FileText } from 'lucide-react';

interface QuoteDialogProps {
    productName: string;
    variant?: 'default' | 'outline' | 'solid';
    triggerClassName?: string;
    children?: React.ReactNode;
}

export default function QuoteDialog({ productName, variant = 'default', triggerClassName, children }: QuoteDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<QuoteRequest>({
        resolver: zodResolver(quoteSchema),
        defaultValues: {
            product: productName || '',
        },
    });

    async function onSubmit(data: QuoteRequest) {
        setIsSubmitting(true);

        try {
            // Generate unique event ID for Meta CAPI deduplication
            const eventId = `enquiry_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            
            const formData = {
                ...data,
                type: 'enquiry' as const,
                eventId,
            };

            const response = await fetch('/api/enquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit enquiry');
            }

            // Fire client-side Meta Lead Event
            if (typeof window !== 'undefined' && (window as any).fbq) {
                (window as any).fbq('track', 'Contact', { eventID: eventId });
            }

            setOpen(false);
            router.push('/thank-you?type=enquiry');
        } catch (error) {
            console.error('Submit error:', error);
            alert('There was a problem submitting your enquiry. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const triggerProps = variant === 'outline'
        ? { variant: "outline" as const, className: `rounded-none border-neutral-300 text-black transition-all duration-300 hover:bg-neutral-50 hover:border-black active:scale-[0.98] ${triggerClassName || ''}` }
        : variant === 'solid'
            ? { className: `rounded-none bg-black text-white shadow-lg transition-all duration-300 hover:bg-neutral-800 active:scale-[0.98] ${triggerClassName || ''}` }
            : { className: triggerClassName };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button {...triggerProps}>
                    {children ? children : (
                        <>
                            <FileText className="mr-2 h-4 w-4" />
                            Enquire Now
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border-neutral-200 bg-white sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-black">Bespoke Enquiry</DialogTitle>
                    <DialogDescription className="text-neutral-500">
                        Interested in {productName}? Connect with our private concierge for artisanal details and tailoring options.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" suppressHydrationWarning>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="quote-name" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">Full Name *</Label>
                            <Input id="quote-name" {...register('name')} placeholder="Name" className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0" suppressHydrationWarning />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quote-email" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">Email Address *</Label>
                            <Input id="quote-email" type="email" {...register('email')} placeholder="Email" className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0" suppressHydrationWarning />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="quote-phone" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">Phone Number *</Label>
                            <Input id="quote-phone" {...register('phone')} placeholder="Phone" className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0" suppressHydrationWarning />
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quote-country" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">Country *</Label>
                            <Input id="quote-country" {...register('country')} placeholder="Country" className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0" suppressHydrationWarning />
                            {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quote-product" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">Piece Interest *</Label>
                        <Input id="quote-product" {...register('product')} placeholder="e.g. Silk Gown" className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0" suppressHydrationWarning />
                        {errors.product && <p className="text-xs text-red-500">{errors.product.message}</p>}
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-6 w-full rounded-none bg-black py-7 text-[12px] font-bold uppercase tracking-[0.2em] text-white shadow-xl transition-all duration-300 hover:bg-neutral-800 active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Private Enquiry'
                        )}
                    </Button>
                    <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                        Our concierge team will respond within one business day.
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
}
