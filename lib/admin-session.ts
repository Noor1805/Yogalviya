import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';

export async function getVerifiedAdminSession() {
    const session = await auth();

    if (!session?.user) {
        return null;
    }

    const user = session.user as { id?: string; email?: string | null; role?: string };

    if (user.role === 'admin') {
        return session;
    }

    await dbConnect();

    let admin = null;

    if (user.id) {
        admin = await Admin.findById(user.id).select('_id email role').lean();
    }

    if (!admin && user.email) {
        admin = await Admin.findOne({
            email: user.email.toLowerCase().trim(),
        })
            .select('_id email role')
            .lean();
    }

    if (!admin) {
        return null;
    }

    return {
        ...session,
        user: {
            ...session.user,
            id: String(admin._id),
            email: admin.email,
            role: 'admin',
        },
    };
}
