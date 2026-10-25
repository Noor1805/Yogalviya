'use client';

import { usePathname } from 'next/navigation';

export default function FrontendWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide the wrapped components on admin routes
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return <>{children}</>;
}
