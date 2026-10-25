'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { name: 'Overview', href: '/admin/analytics' },
    { name: 'Top Products', href: '/admin/analytics/top-products' },
    { name: 'Top Categories', href: '/admin/analytics/top-categories' },
];

export function AnalyticsTabs() {
    const pathname = usePathname();

    return (
        <div className="mb-8 border-b border-neutral-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`
                                whitespace-nowrap border-b-2 py-4 px-1 text-[13px] font-medium transition-colors
                                ${isActive
                                    ? 'border-neutral-900 text-neutral-900'
                                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                                }
                            `}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
