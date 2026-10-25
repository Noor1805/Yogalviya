import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Customer from '@/lib/models/Customer';
import { z } from 'zod';
import { EmailService } from '@/lib/services/email.service';
import { checkRateLimit } from '@/lib/security';

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(10, "Password must be at least 10 characters"),
    phone: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const requestUrl = new URL(req.url);
        const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
        const host = forwardedHost || req.headers.get('host') || requestUrl.host;
        const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
        const protocol = forwardedProto || requestUrl.protocol.replace(/:$/, '');
        const appOrigin = `${protocol}://${host}`.replace(/\/$/, '');
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const rateLimitResult = checkRateLimit({
            scope: 'customer-register',
            key: `${clientIp}:${requestUrl.pathname}`,
            limit: 5,
            windowMs: 60 * 60 * 1000,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.' },
                { status: 429 }
            );
        }

        await dbConnect();
        const body = await req.json();
        
        const validated = registerSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const { name, email, password, phone } = validated.data;

        const normalizedEmail = email.toLowerCase().trim();
        const existingCustomer = await Customer.findOne({ email: normalizedEmail });

        if (existingCustomer) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        const customer = new Customer({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone || '',
            passwordHash,
        });

        await customer.save();

        const sent = await EmailService.sendTemplatedEmail(customer.email, 'account_created', {
            customerName: customer.name || 'there',
            loginUrl: `${appOrigin}/login`,
        });

        if (!sent) {
            console.warn('[Email Trigger Failed] Account created email was not delivered.');
        }

        return NextResponse.json({ success: true, message: 'Account created successfully. Please login.' });
    } catch (error: unknown) {
        console.error('Registration API Error:', error);
        return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
}
