'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    Package,
    FolderOpen,
    ShoppingBag,
    Users,
    LogOut,
    ChevronRight,
    Settings,
    ExternalLink,
    BarChart3,
    Image as ImageIcon,
    Trash2,
    Mail,
    Tags,
    MessageSquare,
    Search,
    Ticket,
} from 'lucide-react';

import {
    AdminNotificationsProvider,
    useAdminNotifications,
} from '@/components/admin/AdminNotificationsProvider';
import { formatAdminAttentionCount } from '@/lib/utils/admin-notifications';
import { cn } from '@/lib/utils';

type NavBadgeKey = 'orders' | 'contacts' | 'recycleBin';

const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { label: 'Attributes', href: '/admin/attributes', icon: Tags },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, badgeKey: 'orders' as NavBadgeKey },
    { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Contacts', href: '/admin/contacts', icon: MessageSquare, badgeKey: 'contacts' as NavBadgeKey },
    { label: 'Email Templates', href: '/admin/emails', icon: Mail },
    { label: 'Search Settings', href: '/admin/search-settings', icon: Search },
    { label: 'Recycle Bin', href: '/admin/trash', icon: Trash2, badgeKey: 'recycleBin' as NavBadgeKey },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

function getBadgeCount(
    badgeKey: NavBadgeKey | undefined,
    summary: ReturnType<typeof useAdminNotifications>['summary']
) {
    if (!badgeKey) return 0;

    switch (badgeKey) {
        case 'orders':
            return summary.orders.newCount;
        case 'contacts':
            return summary.contacts.newCount;
        case 'recycleBin':
            return summary.recycleBin.totalCount;
        default:
            return 0;
    }
}

function AttentionBadge({
    count,
    active = false,
    className,
}: {
    count: number;
    active?: boolean;
    className?: string;
}) {
    if (count <= 0) {
        return null;
    }

    return (
        <span
            className={cn(
                'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                active
                    ? 'bg-white/15 text-white ring-1 ring-white/20'
                    : 'bg-neutral-900 text-white',
                className
            )}
        >
            {formatAdminAttentionCount(count)}
        </span>
    );
}

function AdminLayoutShell({
    children,
    pathname,
}: {
    children: React.ReactNode;
    pathname: string;
}) {
    const { summary } = useAdminNotifications();

    return (
        <div className="flex min-h-screen flex-col bg-[#FAFAFA] md:flex-row">
            <aside className="fixed left-0 top-0 z-40 hidden h-full w-[260px] flex-col border-r border-neutral-200/60 bg-white md:flex">
                <div className="flex h-[72px] items-center border-b border-neutral-100 px-7">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded bg-[#2E4737] text-[13px] font-bold tracking-widest text-white">
                            Y
                        </div>
                        <div>
                            <span className="text-[13px] font-semibold tracking-wide text-neutral-900 uppercase">
                                Yoglivya
                            </span>
                            <p className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                                Admin Portal
                            </p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 space-y-0.5 px-4 py-5">
                    <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
                        Menu
                    </p>
                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.href);
                        const badgeCount = getBadgeCount(item.badgeKey, summary);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-neutral-900 text-white shadow-sm'
                                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'h-[18px] w-[18px]',
                                        isActive
                                            ? 'text-white'
                                            : 'text-neutral-400 group-hover:text-neutral-600'
                                    )}
                                    strokeWidth={isActive ? 2 : 1.5}
                                />
                                {item.label}
                                <AttentionBadge
                                    count={badgeCount}
                                    active={isActive}
                                    className="ml-auto"
                                />
                                {isActive && (
                                    <ChevronRight
                                        className={cn(
                                            'h-3.5 w-3.5 text-neutral-400',
                                            !item.badgeKey && 'ml-auto'
                                        )}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-neutral-100 p-4">
                    <Link
                        href="/"
                        target="_blank"
                        className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Store
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/admin/login' })}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-neutral-200/60 bg-white/90 px-4 backdrop-blur-xl md:hidden">
                <Link href="/admin" className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center bg-black text-[9px] font-bold tracking-widest text-white">
                        E
                    </div>
                    <span className="text-[13px] font-semibold tracking-wide text-neutral-900 uppercase">
                        Admin
                    </span>
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        target="_blank"
                        className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 hover:text-neutral-600"
                    >
                        Store
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/admin/login' })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Sign Out"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <main className="flex-1 pb-20 md:ml-[260px] md:pb-0">
                <div className="mx-auto max-w-[1400px] p-5 md:p-8">
                    {children}
                </div>
            </main>

            <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-neutral-200/60 bg-white/95 pb-safe pt-1 backdrop-blur-xl md:hidden">
                {navItems.slice(0, 5).map((item) => {
                    const isActive =
                        item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname.startsWith(item.href);
                    const badgeCount = getBadgeCount(item.badgeKey, summary);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex h-full w-full flex-col items-center justify-center gap-0.5 transition-colors',
                                isActive
                                    ? 'text-neutral-900'
                                    : 'text-neutral-400 hover:text-neutral-600'
                            )}
                        >
                            <div className="relative">
                                <item.icon
                                    className="h-5 w-5"
                                    strokeWidth={isActive ? 2.5 : 1.5}
                                />
                                {item.badgeKey === 'orders' && (
                                    <AttentionBadge
                                        count={badgeCount}
                                        active={false}
                                        className="absolute -right-4 -top-2 h-4 min-w-[18px] px-1 text-[9px]"
                                    />
                                )}
                            </div>
                            <span
                                className={cn(
                                    'text-[9px] font-medium uppercase tracking-wider',
                                    isActive && 'font-bold'
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <AdminNotificationsProvider>
            <AdminLayoutShell pathname={pathname}>{children}</AdminLayoutShell>
        </AdminNotificationsProvider>
    );
}
