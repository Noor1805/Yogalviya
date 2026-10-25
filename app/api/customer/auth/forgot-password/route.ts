import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Customer from '@/lib/models/Customer';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { EmailService } from '@/lib/services/email.service';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function normalizeHeaderValue(value?: string | null) {
    const trimmed = value?.split(',')[0]?.trim();
    return trimmed ? trimmed : undefined;
}

function resolveRequestOrigin(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const forwardedHost = normalizeHeaderValue(request.headers.get('x-forwarded-host'));
    const host = forwardedHost ?? normalizeHeaderValue(request.headers.get('host')) ?? requestUrl.host;
    const forwardedProto = normalizeHeaderValue(request.headers.get('x-forwarded-proto'));
    const protocol = forwardedProto ?? requestUrl.protocol.replace(/:$/, '');
    return `${protocol}://${host}`;
}

function getSupportEmail() {
    return (
        process.env.CONTACT_NOTIFICATION_EMAIL?.trim() ||
        process.env.ADMIN_EMAIL?.trim() ||
        process.env.SENDER_EMAIL?.trim() ||
        'our support team'
    );
}

export async function POST(request: NextRequest) {
    try {
        const rateLimitResult = checkRateLimit({
            scope: 'customer-forgot-password',
            key: getClientIp(request),
            limit: 5,
            windowMs: 60 * 60 * 1000,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many reset attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const validation = forgotPasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload', details: validation.error.format() },
                { status: 400 }
            );
        }

        await dbConnect();

        const normalizedEmail = validation.data.email.toLowerCase().trim();
        const customer = await Customer.findOne({ email: normalizedEmail });

        if (!customer) {
            return NextResponse.json({
                success: true,
                message: 'If an account exists, instructions were sent.',
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        customer.resetPasswordToken = resetTokenHash;
        customer.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
        await customer.save();

        const appOrigin = resolveRequestOrigin(request);
        const resetUrl = `${appOrigin}/reset-password?token=${resetToken}`;

        const sent = await EmailService.sendTemplatedEmail(customer.email, 'password_reset', {
            customerName: customer.name || 'there',
            resetUrl,
            expiryHours: '1',
            supportEmail: getSupportEmail(),
        });

        if (!sent) {
            console.warn('[Email Trigger Failed] Customer forgot password email was not delivered.');
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists, instructions were sent.',
            _dev_only_link: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
        });
    } catch (error) {
        console.error('Customer forgot password error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
