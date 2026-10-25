import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';
import bcrypt from 'bcryptjs';
import { resetPasswordSchema } from '@/lib/validations/auth';
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
        const body = await request.json();
        const validation = resetPasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { token, password } = validation.data;

        await dbConnect();

        // Hash the token from the request to compare with the one in DB
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find admin with valid token and not expired
        const admin = await Admin.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!admin) {
            return NextResponse.json(
                { error: 'Invalid or expired token. Please request a new link.' },
                { status: 400 }
            );
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        admin.passwordHash = await bcrypt.hash(password, salt);

        // Clear token fields
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;

        await admin.save();

        const appOrigin = resolveRequestOrigin(request);

        const sent = await EmailService.sendTemplatedEmail(admin.email, 'password_changed', {
            customerName: admin.name || 'there',
            loginUrl: `${appOrigin}/admin/login`,
            supportEmail: getSupportEmail(),
        });

        if (!sent) {
            console.warn('[Email Trigger Failed] Admin password changed email was not delivered.');
        }

        return NextResponse.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
        );
    }
}
