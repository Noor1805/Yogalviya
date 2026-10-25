'use server';

import { contactSchema } from '@/types/enquiry';
import { sendMetaEvent } from '@/lib/meta-capi';
import { headers } from 'next/headers';

export async function submitContactForm(formData: FormData) {
    const raw = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        company: formData.get('company') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        subject: formData.get('subject') as string,
        message: formData.get('message') as string,
        honeypot: (formData.get('honeypot') as string) || '',
    };

    const result = contactSchema.safeParse(raw);

    if (!result.success) {
        console.error('Contact form validation errors:', result.error.flatten().fieldErrors);
        return {
            success: false,
            errors: result.error.flatten().fieldErrors,
        };
    }

    // Save directly to the database
    try {
        const dbConnect = (await import('@/lib/db')).default;
        const Enquiry = (await import('@/lib/models/Enquiry')).default;

        await dbConnect();

        await Enquiry.create({
            name: result.data.name,
            email: result.data.email,
            company: result.data.company || '',
            phone: result.data.phone || '',
            message: `Subject: ${result.data.subject}\n\n${result.data.message}`,
            targetCountry: '',
            country: '',
            quantity: 0,
            product: 'General Contact', // Required by Enquiry schema
            type: 'contact',
        });

        // Trigger Server-Side Conversion (CAPI) if an eventId was provided by client
        const eventId = formData.get('eventId') as string;
        if (eventId) {
            const reqHeaders = await headers();
            sendMetaEvent({
                email: result.data.email,
                phone: result.data.phone || undefined,
                eventName: 'Lead',
                eventId,
                sourceUrl: reqHeaders.get('referer') || `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Contact form error:', error);
        return { success: false, errors: { form: ['Database error. Please try again later.'] } };
    }
}
