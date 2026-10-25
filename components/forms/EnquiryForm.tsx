'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { enquirySchema, Enquiry } from '@/types/enquiry';
import { Loader2 } from 'lucide-react';

interface EnquiryFormProps {
    productName?: string;
}

export default function EnquiryForm({ productName }: EnquiryFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Enquiry>({
        resolver: zodResolver(enquirySchema),
        defaultValues: {
            product: productName || '',
            quantity: 0,
            honeypot: '',
        },
    });

    async function onSubmit(data: Enquiry) {
        setIsSubmitting(true);
        setError('');

        try {
            // Generate unique event ID for Meta CAPI deduplication
            const eventId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            const payload = { ...data, eventId };

            const res = await fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (result.success) {
                // Fire client-side Meta Lead Event
                if (typeof window !== 'undefined' && (window as any).fbq) {
                    (window as any).fbq('track', 'Lead', { eventID: eventId });
                }
                router.push('/thank-you?type=enquiry');
            } else {
                setError(result.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Honeypot */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
                <input type="text" {...register('honeypot')} tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <fieldset className="space-y-2 border-none p-0">
                    <Label htmlFor="enquiry-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">Full Name *</Label>
                    <Input id="enquiry-name" {...register('name')} placeholder="Name" className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0 h-12" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </fieldset>
                <fieldset className="space-y-2 border-none p-0">
                    <Label htmlFor="enquiry-company" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">Company *</Label>
                    <Input id="enquiry-company" {...register('company')} placeholder="Company" className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0 h-12" />
                    {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
                </fieldset>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <fieldset className="space-y-2 border-none p-0">
                    <Label htmlFor="enquiry-email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">Email *</Label>
                    <Input id="enquiry-email" type="email" {...register('email')} placeholder="Email" className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0 h-12" />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </fieldset>
                <fieldset className="space-y-2 border-none p-0">
                    <Label htmlFor="enquiry-country" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">Country *</Label>
                    <Input id="enquiry-country" {...register('country')} placeholder="Country" className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0 h-12" />
                    {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
                </fieldset>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <fieldset className="space-y-2 border-none p-0">
                    <Label htmlFor="enquiry-quantity" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">Interest level *</Label>
                    <Input
                        id="enquiry-quantity"
                        type="number"
                        {...register('quantity', { valueAsNumber: true })}
                        placeholder="Quantity"
                        className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0 h-12"
                    />
                    {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
                </fieldset>
                <fieldset className="space-y-2 border-none p-0">
                    <Label htmlFor="enquiry-product" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">Besoke Piece *</Label>
                    <Input id="enquiry-product" {...register('product')} placeholder="Product name" readOnly={!!productName} className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0 h-12" />
                    {errors.product && <p className="text-xs text-red-500">{errors.product.message}</p>}
                </fieldset>
            </div>

            <div className="space-y-2">
                <Label htmlFor="enquiry-message" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">Special Requirements</Label>
                <Textarea
                    id="enquiry-message"
                    {...register('message')}
                    rows={4}
                    placeholder="Describe sizing, fabric preferences, or deadline..."
                    className="rounded-none border-neutral-200 bg-white focus:border-black focus:ring-0 min-h-[100px]"
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-none bg-black py-8 text-[12px] font-bold uppercase tracking-[0.3em] text-white shadow-none transition-all duration-500 hover:bg-neutral-800"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    'Send Enquiry'
                )}
            </Button>

        </form>
    );
}
