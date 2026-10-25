import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';
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
            scope: 'admin-forgot-password',
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

        const { email } = validation.data;

        await dbConnect();

        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (!admin) {
            return NextResponse.json({
                success: true,
                message: 'If an account exists, instructions were sent.',
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        admin.resetPasswordToken = resetTokenHash;
        admin.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

        await admin.save();

        const appOrigin = resolveRequestOrigin(request);
        const resetUrl = `${appOrigin}/admin/reset-password?token=${resetToken}`;

        const sent = await EmailService.sendTemplatedEmail(admin.email, 'password_reset', {
            customerName: admin.name || 'there',
            resetUrl,
            expiryHours: '1',
            supportEmail: getSupportEmail(),
        });

        if (!sent) {
            console.warn('[Email Trigger Failed] Admin forgot password email was not delivered.');
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists, instructions were sent.',
            _dev_only_link: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
