import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Customer from '@/lib/models/Customer';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { EmailService } from '@/lib/services/email.service';

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
            scope: 'customer-reset-password',
            key: getClientIp(request),
            limit: 10,
            windowMs: 60 * 60 * 1000,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many reset attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const validation = resetPasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload', details: validation.error.format() },
                { status: 400 }
            );
        }

        await dbConnect();

        const { token, password } = validation.data;
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const customer = await Customer.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'Invalid or expired token. Please request a new link.' },
                { status: 400 }
            );
        }

        customer.passwordHash = await bcrypt.hash(password, 10);
        customer.resetPasswordToken = undefined;
        customer.resetPasswordExpires = undefined;
        await customer.save();

        const appOrigin = resolveRequestOrigin(request);

        const sent = await EmailService.sendTemplatedEmail(customer.email, 'password_changed', {
            customerName: customer.name || 'there',
            loginUrl: `${appOrigin}/login`,
            supportEmail: getSupportEmail(),
        });

        if (!sent) {
            console.warn('[Email Trigger Failed] Customer password changed email was not delivered.');
        }

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully.',
        });
    } catch (error) {
        console.error('Customer reset password error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
        );
    }
}
