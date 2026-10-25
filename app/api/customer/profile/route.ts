import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Customer from '@/lib/models/Customer';
import bcrypt from 'bcryptjs';

type SessionUser = {
    id?: string;
    role?: string;
};

type AddressInput = {
    label?: string;
    type?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
};

type ProfileUpdatePayload = {
    name?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    addresses?: AddressInput[];
    savedPaymentMethods?: unknown;
};

export async function GET() {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!session || user?.role !== 'customer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const customer = await Customer.findById(session.user!.id).select('-passwordHash');
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: customer });
}

export async function PUT(req: Request) {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!session || user?.role !== 'customer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const data = (await req.json()) as ProfileUpdatePayload;
        const customer = await Customer.findById(session.user!.id);
        
        if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

        // Update basic info
        if (data.name) customer.name = data.name.trim();
        if (data.phone) customer.phone = data.phone;
        
        // Update password if passed
        if (data.newPassword && data.currentPassword) {
            const isValid = await bcrypt.compare(data.currentPassword, customer.passwordHash);
            if (!isValid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            customer.passwordHash = await bcrypt.hash(data.newPassword, 10);
        }

        // Update addresses if passed
        if (data.addresses && Array.isArray(data.addresses)) {
            customer.addresses = data.addresses.map((address, index: number) => ({
                label: (address.label || `Address ${index + 1}`).trim(),
                type: address.type === 'billing' ? 'billing' : 'shipping',
                line1: (address.line1 || '').trim(),
                line2: (address.line2 || '').trim(),
                city: (address.city || '').trim(),
                state: (address.state || '').trim(),
                postalCode: (address.postalCode || '').trim(),
                country: (address.country || '').trim(),
                isDefault: Boolean(address.isDefault),
            }));
        }

        if (data.savedPaymentMethods) {
            return NextResponse.json(
                { error: 'Saved payment methods must be managed by the payment gateway, not the profile API.' },
                { status: 400 }
            );
        }

        await customer.save();
        
        const updated = await Customer.findById(session.user!.id).select('-passwordHash');
        return NextResponse.json({ success: true, data: updated });
    } catch {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
