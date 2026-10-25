import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { auth } from '@/lib/auth';
import { getVerifiedAdminSession } from '@/lib/admin-session';

type SessionUserRole = 'admin' | 'customer';

type AuthResult =
  | {
      ok: true;
      session: Session;
      user: {
        id?: string;
        email?: string | null;
        name?: string | null;
        role: SessionUserRole;
      };
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireRole(role: SessionUserRole): Promise<AuthResult> {
  const session = role === 'admin' ? await getVerifiedAdminSession() : await auth();
  const user = session?.user as
    | {
        id?: string;
        email?: string | null;
        name?: string | null;
        role?: string;
      }
    | undefined;

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (user?.role !== role) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return {
    ok: true,
    session: session as Session,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
    },
  };
}
