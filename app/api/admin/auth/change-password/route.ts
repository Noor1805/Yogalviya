import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';
import bcrypt from 'bcryptjs';
import { changePasswordSchema } from '@/lib/validations/auth';
import { requireRole } from '@/lib/authz';

export async function POST(request: NextRequest) {
    const authResult = await requireRole('admin');
    if (!authResult.ok) {
        return authResult.response;
    }

    try {
        const body = await request.json();
        const validation = changePasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = validation.data;

        await dbConnect();

        // Find the admin
        const admin = await Admin.findById(authResult.user.id);
        if (!admin) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        admin.passwordHash = await bcrypt.hash(newPassword, salt);

        await admin.save();

        return NextResponse.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Failed to change password' },
            { status: 500 }
        );
    }
}
