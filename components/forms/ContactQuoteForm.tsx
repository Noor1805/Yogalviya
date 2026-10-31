'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { quoteSchema, QuoteRequest } from '@/types/enquiry';
import { Loader2, ArrowRight, ChevronDown } from 'lucide-react';

export default function ContactQuoteForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<QuoteRequest>({
        resolver: zodResolver(quoteSchema),
        defaultValues: {
            product: 'yoga-props',
            country: 'Not Specified', // Default value to pass validation
        },
    });

    async function onSubmit(data: QuoteRequest) {
        setIsSubmitting(true);
        setError('');

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit');
            }

            // Fire client-side Meta Lead Event
            if (typeof window !== 'undefined' && (window as any).fbq) {
                (window as any).fbq('track', 'Contact', { eventID: eventId });
            }

            router.push('/thank-you?type=enquiry');
        } catch {
            setError('There was a problem submitting your enquiry. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 group/form">
              <div className="flex flex-col border-b-[2px] border-black pb-2 focus-within:border-gray-400 transition-colors">
                <label className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                  Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Enter your name"
                  className="bg-transparent border-none focus:ring-0 p-0 text-[13px] text-black w-full outline-none font-medium placeholder:text-gray-200"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col border-b-[2px] border-black pb-2 focus-within:border-gray-400 transition-colors">
                <label className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  className="bg-transparent border-none focus:ring-0 p-0 text-[13px] text-black w-full outline-none font-medium placeholder:text-gray-200"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col border-b-[2px] border-black pb-2 relative focus-within:border-gray-400 transition-colors">
                <label className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                  Interested in
                </label>
                <select {...register('product')} className="appearance-none bg-transparent border-none focus:ring-0 p-0 text-[13px] text-black w-full cursor-pointer pr-8 outline-none font-medium">
                  <option value="yoga-props">Yoga Props & Mats</option>
                  <option value="studio-orders">Studio Wholesale Orders</option>
                  <option value="collaboration">Collaborations & Partnerships</option>
                </select>
                <ChevronDown className="absolute right-0 bottom-2 w-4 h-4 text-black pointer-events-none" />
                {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product.message}</p>}
              </div>

              <div className="flex flex-col border-b-[2px] border-black pb-2 focus-within:border-gray-400 transition-colors">
                <label className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+1 (000) 000-0000"
                  className="bg-transparent border-none focus:ring-0 p-0 text-[13px] text-black w-full outline-none font-medium placeholder:text-gray-200"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              <div className="md:col-span-2 flex flex-col border-b-[2px] border-black pb-2 focus-within:border-gray-400 transition-colors">
                <label className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                  Message
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your requirements..."
                  className="bg-transparent border-none focus:ring-0 p-0 text-[13px] text-black w-full resize-none min-h-[30px] outline-none font-medium placeholder:text-gray-200"
                />
              </div>

              {error && <p className="md:col-span-2 text-sm text-red-500">{error}</p>}

              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white px-8 py-3.5 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-gray-900 transition-all active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
        </form>
    );
}
