'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ArrowLeft, CreditCard, Heart, LogOut, MapPin, Package, Shield, User } from 'lucide-react';

const navItems = [
    { name: 'Overview', href: '/account', icon: User },
    { name: 'Orders', href: '/account/orders', icon: Package },
    { name: 'Personal Details', href: '/account/personal-info', icon: Shield },
    { name: 'Addresses', href: '/account/addresses', icon: MapPin },
    { name: 'Payment Methods', href: '/account/payments', icon: CreditCard },
    { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const isAccountHome = pathname === '/account';
    const isWishlistPage = pathname === '/account/wishlist';

    // Show loading state while session is being checked
    if (status === 'loading') {
        return (
            <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
                <p className="mt-4 text-sm text-neutral-500">Loading...</p>
            </div>
        );
    }

    if (!session || (session.user as { role?: string } | undefined)?.role !== 'customer') {
        if (isWishlistPage) {
            return (
                <div className="min-h-[60vh] bg-white">
                    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
                </div>
            );
        }

        return (
            <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
                <div className="rounded-full border border-neutral-200 bg-neutral-50 p-5">
                    <Shield className="h-10 w-10 text-neutral-400" />
                </div>
                <h1 className="mt-6 text-3xl font-semibold tracking-tight text-neutral-900">Secure customer account</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                    Sign in to access your orders, address book, payment preferences, and eligible after-sales support requests.
                </p>
                <Link
                    href="/login"
                    className="mt-8 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white lg:bg-[linear-gradient(180deg,#f6f3ee_0%,#ffffff_24rem)]">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                <section className="hidden overflow-hidden rounded-[32px] border border-neutral-200/70 bg-neutral-950 text-white shadow-[0_35px_120px_rgba(0,0,0,0.14)] lg:block">
                    <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.8fr] lg:px-10 lg:py-10">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">My Account</p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Manage your orders, addresses, and account details in one place.</h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
                                Review recent purchases, track active deliveries, update delivery information, and submit eligible return or replacement requests with ease.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Account profile</p>
                                <p className="mt-3 text-lg font-semibold">{session.user?.name}</p>
                                <p className="mt-1 text-sm text-white/55">{session.user?.email}</p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Support policy</p>
                                <p className="mt-3 text-sm leading-6 text-white/65">
                                    Orders may be cancelled before shipment. Eligible delivered items can be returned or replaced within 7 days, subject to review with image and video proof.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {!isAccountHome ? (
                    <div className="mb-5 lg:hidden">
                        <Link
                            href="/account"
                            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors active:opacity-70"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Account Home
                        </Link>
                    </div>
                ) : null}

                <div className="mt-0 lg:mt-8 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
                    <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block lg:self-start">
                        <div className="rounded-[28px] border border-neutral-200/70 bg-white p-5 shadow-sm">
                            <nav className="space-y-1.5" aria-label="Account">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/account');
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-neutral-900 text-white'
                                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                            }`}
                                        >
                                            <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="rounded-[28px] border border-neutral-200/70 bg-white p-5 shadow-sm">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Account actions</p>
                            <button
                                onClick={async () => {
                                    await signOut({ redirect: false });
                                    router.push('/');
                                    router.refresh();
                                }}
                                className="mt-4 flex w-full items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                            >
                                <span className="flex items-center gap-3">
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </span>
                            </button>
                        </div>
                    </aside>

                    <main className="min-w-0">
                        <div className="p-0 lg:rounded-[32px] lg:border lg:border-neutral-200/70 lg:bg-white lg:p-8 lg:shadow-sm">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
}
