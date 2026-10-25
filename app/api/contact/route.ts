import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/lib/models/Contact';
import { z } from 'zod';
import { EmailService } from '@/lib/services/email.service';
import { checkRateLimit, getClientIp } from '@/lib/security';

const contactSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    subject: z.string().min(1, 'Subject is required').max(200),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

// POST - Public contact form submission
export async function POST(request: NextRequest) {
    try {
        const rateLimitResult = checkRateLimit({
            scope: 'contact-form',
            key: getClientIp(request),
            limit: 5,
            windowMs: 10 * 60 * 1000,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many messages sent. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();

        // Validate input
        const validation = contactSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.format() },
                { status: 400 }
            );
        }

        await dbConnect();

        // Create contact submission
        const submission = await Contact.create({
            ...validation.data,
            status: 'new',
        });

        const { name, email, phone, subject, message } = validation.data;

        EmailService.sendTemplatedEmail(email, 'contact_auto_reply', { customerName: name }).catch((err) =>
            console.error('[Email Trigger Failed] Contact auto-reply:', err)
        );

        EmailService.sendContactNotificationEmail({
            contactId: String(submission._id),
            name,
            email,
            phone,
            subject,
            message,
            submittedAt: submission.createdAt,
        }).catch((err) => console.error('[Email Trigger Failed] Contact admin notification:', err));

        return NextResponse.json(
            { success: true, message: 'Message sent successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Contact submission error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
