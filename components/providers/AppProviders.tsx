'use client';

import type { ReactNode } from 'react';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { CurrencyProvider } from '@/lib/utils/currency';

export default function AppProviders({
    children,
    session,
}: {
    children: ReactNode;
    session?: Session | null;
}) {
    return (
        <SessionProvider
            session={session}
            basePath="/api/auth"
            refetchInterval={0}
            refetchOnWindowFocus={false}
            refetchWhenOffline={false}
        >
            <CurrencyProvider>{children}</CurrencyProvider>
        </SessionProvider>
    );
}
