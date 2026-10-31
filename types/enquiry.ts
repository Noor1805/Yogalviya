import { z } from 'zod';

export const enquirySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    company: z.string().optional(),
    email: z.string().email('Please enter a valid email address'),
    country: z.string().min(2, 'Please select your country'),
    phone: z.string().optional(),
    quantity: z.number().optional(),
    product: z.string().min(1, 'Please select a piece'),
    message: z.string().optional(),
    honeypot: z.string().max(0, 'Bot detected'),
});

export type Enquiry = z.infer<typeof enquirySchema>;

export const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    company: z.string().optional(),
    phone: z.string().optional(),
    subject: z.string().min(2, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
    honeypot: z.string().max(0, 'Bot detected'),
});

export type ContactMessage = z.infer<typeof contactSchema>;

export const callbackSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(5, 'Please enter a valid phone number'),
    preferredTime: z.string().optional(),
    product: z.string().optional(),
});

export type CallbackRequest = z.infer<typeof callbackSchema>;

export const quoteSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(5, 'Please enter a valid phone number'),
    country: z.string().min(2, 'Please select your country'),
    product: z.string().min(1, 'Piece name is required'),
    brandingType: z.enum(['Yoglivya Branded', 'White Label', 'Custom Branding']).optional(),
});

export type QuoteRequest = z.infer<typeof quoteSchema>;
