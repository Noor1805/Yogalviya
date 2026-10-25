'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, CreditCard, Heart, Loader2, LogOut, MapPin, Package, RefreshCcw, Shield } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useWishlistStore } from '@/store/wishlist';

interface AccountProfile {
    addresses: Array<{ label?: string; city: string; country: string; isDefault: boolean }>;
    savedPaymentMethods: Array<{ id: string; brand: string; last4: string; provider: string; isDefault: boolean }>;
}

interface AccountOrder {
    _id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    totalInCents: number;
    currency: 'USD' | 'INR';
    lineItems: Array<{ name: string; quantity: number }>;
}

const formatMoney = (amountInCents: number, currency: 'USD' | 'INR') =>
    new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency,
    }).format(amountInCents / 100);

export default function AccountOverviewPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const wishlistCount = useWishlistStore((state) => state.items.length);
    const [orders, setOrders] = useState<AccountOrder[]>([]);
    const [profile, setProfile] = useState<AccountProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [ordersRes, profileRes] = await Promise.all([
                    fetch('/api/customer/orders'),
                    fetch('/api/customer/profile'),
                ]);

                const [ordersData, profileData] = await Promise.all([ordersRes.json(), profileRes.json()]);

                if (ordersData.success) {
                    setOrders(ordersData.data);
                }

                if (profileData.success) {
                    setProfile(profileData.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const stats = useMemo(() => {
        const activeStatuses = new Set(['pending', 'paid', 'processing', 'shipped', 'delivered', 'return_requested', 'replace_requested']);

        return {
            totalOrders: orders.length,
            activeOrders: orders.filter((order) => activeStatuses.has(order.status)).length,
            openSupportCases: orders.filter((order) => ['return_requested', 'replace_requested'].includes(order.status)).length,
            savedAddresses: profile?.addresses.length ?? 0,
        };
    }, [orders, profile]);

    const recentOrders = orders.slice(0, 3);
    const defaultAddress = profile?.addresses.find((address) => address.isDefault) || profile?.addresses[0];
    const defaultPayment = profile?.savedPaymentMethods.find((method) => method.isDefault) || profile?.savedPaymentMethods[0];
    const firstName = session?.user?.name?.split(' ')[0] || 'Customer';

    const mobileQuickActions = [
        {
            label: 'Orders',
            href: '/account/orders',
            value: stats.activeOrders,
            hint: stats.totalOrders > 0 ? `${stats.totalOrders} total purchases` : 'Track every purchase',
            icon: Package,
        },
        {
            label: 'Wishlist',
            href: '/account/wishlist',
            value: wishlistCount,
            hint: wishlistCount > 0 ? `${wishlistCount} saved item${wishlistCount === 1 ? '' : 's'}` : 'Saved for later',
            icon: Heart,
        },
        {
            label: 'Support',
            href: '/account/orders',
            value: stats.openSupportCases,
            hint: stats.openSupportCases > 0 ? 'Active return requests' : 'Returns and replacements',
            icon: Shield,
        },
        {
            label: 'Addresses',
            href: '/account/addresses',
            value: stats.savedAddresses,
            hint: stats.savedAddresses > 0 ? 'Saved for faster checkout' : 'Add your first address',
            icon: MapPin,
        },
    ];

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-neutral-300" />
            </div>
        );
    }

    return (
        <>
            <div className="hidden animate-fade-in-up space-y-10 lg:block">
                <section className="rounded-[28px] border border-neutral-200/70 bg-[linear-gradient(135deg,#141414_0%,#252525_60%,#3d342d_100%)] px-6 py-7 text-white sm:px-8">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">Overview</p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back, {firstName}.</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                        Review recent purchases, manage delivery details, and keep your account preferences up to date from a single, streamlined dashboard.
                    </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Total Orders', value: stats.totalOrders, hint: 'Lifetime purchases', icon: Package },
                        { label: 'Active Orders', value: stats.activeOrders, hint: 'Processing and in transit', icon: RefreshCcw },
                        { label: 'Open Support Cases', value: stats.openSupportCases, hint: 'Returns and replacements', icon: Shield },
                        { label: 'Saved Addresses', value: stats.savedAddresses, hint: 'Shipping and billing', icon: MapPin },
                    ].map((item) => (
                        <div key={item.label} className="rounded-[26px] border border-neutral-200/70 bg-neutral-50 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">{item.label}</p>
                                <item.icon className="h-4 w-4 text-neutral-400" />
                            </div>
                            <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">{item.value}</p>
                            <p className="mt-2 text-sm text-neutral-500">{item.hint}</p>
                        </div>
                    ))}
                </section>

                <section className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
                    <div className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-neutral-900">Recent orders</h2>
                                <p className="mt-1 text-sm text-neutral-500">Track your latest purchases and current delivery progress.</p>
                            </div>
                            <Link href="/account/orders" className="inline-flex items-center text-sm font-semibold text-neutral-900">
                                View all <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="mt-6 space-y-4">
                            {recentOrders.length === 0 ? (
                                <div className="rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-5 py-8 text-sm text-neutral-500">
                                    You have not placed any orders yet. Once your first purchase is confirmed, it will appear here with tracking and support options.
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <Link
                                        key={order._id}
                                        href={`/account/orders/${order._id}`}
                                        className="flex flex-col gap-4 rounded-[24px] border border-neutral-200 bg-neutral-50 p-5 transition-colors hover:border-neutral-900"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Order #{order.orderNumber}</p>
                                                <p className="mt-2 text-lg font-semibold text-neutral-900">
                                                    {order.lineItems[0]?.name || 'Order item'}
                                                    {order.lineItems.length > 1 ? ` +${order.lineItems.length - 1} more` : ''}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold capitalize text-neutral-900">{order.status.replace(/_/g, ' ')}</p>
                                                <p className="mt-1 text-sm text-neutral-500">{formatMoney(order.totalInCents, order.currency)}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span>{order.lineItems.reduce((sum, item) => sum + item.quantity, 0)} item(s)</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-neutral-900">Account settings</h2>
                            <div className="mt-5 grid gap-3">
                                <Link href="/account/personal-info" className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-4 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900">
                                    <span className="flex items-center gap-3">
                                        <Shield className="h-4 w-4 text-neutral-400" />
                                        Profile details & password
                                    </span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                                <Link href="/account/addresses" className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-4 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900">
                                    <span className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-neutral-400" />
                                        Address book
                                    </span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                                <Link href="/account/payments" className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-4 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900">
                                    <span className="flex items-center gap-3">
                                        <CreditCard className="h-4 w-4 text-neutral-400" />
                                        Payment preferences
                                    </span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-neutral-900">Saved preferences</h2>
                            <div className="mt-5 space-y-4">
                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Default address</p>
                                    {defaultAddress ? (
                                        <>
                                            <p className="mt-3 text-base font-semibold text-neutral-900">{defaultAddress.label || 'Primary address'}</p>
                                            <p className="mt-1 text-sm text-neutral-500">
                                                {defaultAddress.city}, {defaultAddress.country}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="mt-3 text-sm text-neutral-500">No default address saved yet.</p>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Default payment profile</p>
                                    {defaultPayment ? (
                                        <>
                                            <p className="mt-3 text-base font-semibold capitalize text-neutral-900">{defaultPayment.brand}</p>
                                            <p className="mt-1 text-sm text-neutral-500">
                                                {defaultPayment.provider.toUpperCase()} ending in {defaultPayment.last4}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="mt-3 text-sm text-neutral-500">No payment preference saved yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="animate-fade-in-up lg:hidden">
                <section className="border-b border-neutral-100 pb-6">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">My Account</p>
                    <h1 className="mt-3 text-[2rem] font-semibold tracking-tight text-neutral-950">Hi, {firstName}</h1>
                    <p className="mt-1 text-sm text-neutral-500">{session?.user?.email}</p>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-600">
                        A cleaner account hub for orders, saved items, delivery details, and account settings.
                    </p>
                </section>

                <section className="mt-6">
                    <div className="grid grid-cols-2 gap-3">
                        {mobileQuickActions.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4 transition-transform duration-150 active:scale-[0.98]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="rounded-full border border-neutral-200 bg-white p-2.5">
                                        <item.icon className="h-4 w-4 text-neutral-700" />
                                    </div>
                                    <span className="text-lg font-semibold tracking-tight text-neutral-950">{item.value}</span>
                                </div>
                                <p className="mt-8 text-base font-semibold text-neutral-950">{item.label}</p>
                                <p className="mt-1 text-sm leading-5 text-neutral-500">{item.hint}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="mt-8 rounded-[28px] border border-neutral-200 bg-white shadow-sm">
                    <div className="border-b border-neutral-100 px-5 py-4">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-400">Account Essentials</h2>
                    </div>
                    <div>
                        {[
                            { label: 'Profile & Security', href: '/account/personal-info', icon: Shield },
                            { label: 'Address Book', href: '/account/addresses', icon: MapPin },
                            { label: 'Payment Preferences', href: '/account/payments', icon: CreditCard },
                        ].map((item, index) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-5 py-4 text-sm font-medium text-neutral-800 transition-opacity active:opacity-70 ${
                                    index !== 2 ? 'border-b border-neutral-100' : ''
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <item.icon className="h-4 w-4 text-neutral-400" />
                                    {item.label}
                                </span>
                                <ChevronRight className="h-4 w-4 text-neutral-400" />
                            </Link>
                        ))}
                    </div>
                </section>

                <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-full px-4 py-4 text-sm font-semibold text-red-600 transition-opacity active:opacity-70"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </>
    );
}
