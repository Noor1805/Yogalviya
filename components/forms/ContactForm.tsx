'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Please fix the errors below');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setIsSuccess(true);
            toast.success('Message sent successfully!');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

            setTimeout(() => setIsSuccess(false), 5000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to send message');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-serif text-2xl text-black italic mb-3">Message Sent!</h3>
                <p className="text-sm text-neutral-500">
                    Thank you for reaching out. Our concierge team will respond within 24 hours.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Email */}
            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 mb-2">
                        Full Name *
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={`w-full h-12 px-4 text-sm border ${errors.name ? 'border-red-500' : 'border-neutral-200'} bg-white focus:border-black focus:ring-0 outline-none transition-colors`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 mb-2">
                        Email *
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={`w-full h-12 px-4 text-sm border ${errors.email ? 'border-red-500' : 'border-neutral-200'} bg-white focus:border-black focus:ring-0 outline-none transition-colors`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
            </div>

            {/* Phone */}
            <div>
                <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 mb-2">
                    Phone <span className="text-neutral-400">(Optional)</span>
                </label>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    className="w-full h-12 px-4 text-sm border border-neutral-200 bg-white focus:border-black focus:ring-0 outline-none transition-colors"
                />
            </div>

            {/* Subject */}
            <div>
                <label htmlFor="subject" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 mb-2">
                    Subject *
                </label>
                <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className={`w-full h-12 px-4 text-sm border ${errors.subject ? 'border-red-500' : 'border-neutral-200'} bg-white focus:border-black focus:ring-0 outline-none transition-colors`}
                />
                {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
            </div>

            {/* Message */}
            <div>
                <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 mb-2">
                    Message *
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your enquiry..."
                    rows={6}
                    className={`w-full px-4 py-3 text-sm border ${errors.message ? 'border-red-500' : 'border-neutral-200'} bg-white focus:border-black focus:ring-0 outline-none transition-colors resize-none`}
                />
                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        Send Message
                    </>
                )}
            </button>

            <p className="text-center text-[10px] uppercase tracking-widest text-neutral-400">
                Our concierge team will respond within 24 hours
            </p>
        </form>
    );
}
