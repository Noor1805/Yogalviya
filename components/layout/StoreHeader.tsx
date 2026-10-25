'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, 
    Heart,
    LayoutDashboard, 
    LogOut, 
    Package2, 
    Shield,
    ShoppingBag, 
    User, 
    Menu,
    X 
} from 'lucide-react';
import CartSlideOver from '@/components/layout/CartSlideOver';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

const navLinks = [
    { name: 'Shop', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
];

export default function StoreHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const totalItems = useCartStore((state) => state.totalItems());
    const wishlistItems = useWishlistStore((state) => state.items);
    const totalWishlistItems = wishlistItems.length;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const role = (session?.user as { role?: string } | undefined)?.role;
    const accountLinks = useMemo(
        () =>
            role === 'admin'
                ? [
                      { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
                      { label: 'Orders Management', href: '/admin/orders', icon: Package2 },
                  ]
                : [
                      { label: 'Dashboard', href: '/account', icon: LayoutDashboard },
                      { label: 'Your Orders', href: '/account/orders', icon: Package2 },
                      { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
                      { label: 'Profile & Security', href: '/account/personal-info', icon: Shield },
                  ],
        [role]
    );

    return (
        <>
            {/* Top Announcement Bar from Resource */}
            <div className="bg-[#26352b] text-white text-center py-2 px-4 text-[10px] sm:text-[11px] tracking-[0.13em] uppercase font-medium z-50 relative select-none">
                PAN-INDIA DELIVERY · COD AVAILABLE · PREMIUM YOGA & WELLNESS
            </div>

            {/* Main Sticky Header */}
            <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#e7e5df] transition-all duration-200">
                <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    
                    {/* Brand Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 group transition-opacity hover:opacity-80"
                    >
                        <span
                            className="font-serif text-[24px] sm:text-[27px] tracking-[0.14em] text-[#1c211d] font-normal uppercase select-none"
                            style={{ fontFamily: 'Georgia, serif' }}
                        >
                            YOGLIVYA
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-[12.5px] font-medium tracking-[0.03em] text-[#4d514b]">
                        {navLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`relative py-1.5 transition-colors hover:text-[#26352b] ${
                                        active ? 'text-[#26352b] font-semibold' : ''
                                    }`}
                                >
                                    {link.name}
                                    {active && (
                                        <motion.div
                                            layoutId="activeNavIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#26352b]"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Icon Actions */}
                    <div className="flex items-center gap-4 sm:gap-5 text-[#1c211d]">
                        {/* Wishlist Link */}
                        <Link
                            href="/account/wishlist"
                            aria-label="Wishlist"
                            className="relative p-1 text-[#1c211d] hover:text-[#26352b] transition-colors hover:scale-105"
                        >
                            <Heart className="h-[19px] w-[19px]" strokeWidth={1.5} />
                            {mounted && totalWishlistItems > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#a08758] px-1 text-[9px] font-bold text-white shadow-sm">
                                    {totalWishlistItems}
                                </span>
                            )}
                        </Link>

                        {/* User Account Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setAccountMenuOpen(true)}
                            onMouseLeave={() => setAccountMenuOpen(false)}
                        >
                            <button
                                aria-label="Account"
                                className="p-1 text-[#1c211d] hover:text-[#26352b] transition-colors hover:scale-105"
                                onClick={() => {
                                    if (!session) {
                                        router.push('/login');
                                    } else {
                                        setAccountMenuOpen((prev) => !prev);
                                    }
                                }}
                            >
                                <User className="h-[19px] w-[19px]" strokeWidth={1.5} />
                            </button>

                            <AnimatePresence>
                                {accountMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full pt-2 w-64 z-50"
                                    >
                                        <div className="rounded-xl border border-[#e7e5df] bg-white p-3 shadow-xl text-[#1c211d]">
                                            {session ? (
                                                <>
                                                    <div className="rounded-lg bg-[#f5f3ed] p-3 mb-2">
                                                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#77766f]">
                                                            Signed In
                                                        </p>
                                                        <p className="text-[13px] font-semibold text-[#1c211d] truncate">
                                                            {session.user?.name || 'Customer'}
                                                        </p>
                                                        <p className="text-[11px] text-[#77766f] truncate">
                                                            {session.user?.email}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        {accountLinks.map((item) => (
                                                            <Link
                                                                key={item.href}
                                                                href={item.href}
                                                                onClick={() => setAccountMenuOpen(false)}
                                                                className="flex items-center justify-between rounded-md px-3 py-2 text-[12px] text-[#4d514b] hover:bg-[#f5f3ed] hover:text-[#1c211d] transition-colors"
                                                            >
                                                                <span className="flex items-center gap-2.5">
                                                                    <item.icon className="h-3.5 w-3.5" />
                                                                    {item.label}
                                                                </span>
                                                                <ChevronRight className="h-3.5 w-3.5 text-[#77766f]" />
                                                            </Link>
                                                        ))}
                                                        <button
                                                            onClick={() => signOut({ callbackUrl: '/' })}
                                                            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <LogOut className="h-3.5 w-3.5" />
                                                            Sign out
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="p-2 space-y-2 text-center">
                                                    <p className="text-[12px] text-[#77766f]">
                                                        Sign in to view your orders and saved wishlist.
                                                    </p>
                                                    <Link
                                                        href="/login"
                                                        onClick={() => setAccountMenuOpen(false)}
                                                        className="block w-full rounded bg-[#26352b] py-2 text-[11px] font-medium tracking-[0.1em] text-white uppercase hover:bg-[#1c2720] transition-colors"
                                                    >
                                                        Sign In
                                                    </Link>
                                                    <Link
                                                        href="/register"
                                                        onClick={() => setAccountMenuOpen(false)}
                                                        className="block w-full text-[11px] text-[#77766f] hover:text-[#1c211d] transition-colors"
                                                    >
                                                        Create account
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Cart Slide-Over Trigger */}
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new Event('open-cart'));
                                }
                            }}
                            aria-label="Shopping bag"
                            className="relative p-1 text-[#1c211d] hover:text-[#26352b] transition-colors hover:scale-105"
                        >
                            <ShoppingBag className="h-[20px] w-[20px]" strokeWidth={1.5} />
                            {mounted && totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#26352b] px-1 text-[9px] font-bold text-white shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            aria-label="Open mobile menu"
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden p-1 text-[#1c211d] hover:text-[#26352b] transition-colors"
                        >
                            <Menu className="h-6 w-6" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Navigation */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
                        onClick={() => setMobileOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="absolute right-0 top-0 bottom-0 w-[82%] max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div>
                                <div className="flex items-center justify-between pb-6 border-b border-[#e7e5df]">
                                    <span className="font-serif text-[22px] tracking-[0.14em] text-[#1c211d] uppercase">
                                        Yoglivya
                                    </span>
                                    <button
                                        onClick={() => setMobileOpen(false)}
                                        aria-label="Close menu"
                                        className="p-1 text-[#77766f] hover:text-[#1c211d]"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <nav className="mt-8 space-y-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="block text-[15px] font-serif text-[#1c211d] py-1 border-b border-[#f5f3ed] hover:text-[#26352b] transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            <div className="pt-6 border-t border-[#e7e5df] space-y-3">
                                {session ? (
                                    <Link
                                        href="/account"
                                        onClick={() => setMobileOpen(false)}
                                        className="block text-center w-full rounded bg-[#26352b] py-3 text-[11px] font-medium tracking-[0.1em] text-white uppercase"
                                    >
                                        Account Dashboard
                                    </Link>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileOpen(false)}
                                            className="block text-center rounded bg-[#26352b] py-2.5 text-[11px] font-medium tracking-[0.1em] text-white uppercase"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setMobileOpen(false)}
                                            className="block text-center rounded border border-[#26352b] py-2.5 text-[11px] font-medium tracking-[0.1em] text-[#26352b] uppercase"
                                        >
                                            Register
                                        </Link>
                                    </div>
                                )}
                                <p className="text-[10px] text-center text-[#77766f] uppercase tracking-wider">
                                    Living the Yogic Way
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Cart Slide-Over */}
            <CartSlideOver />
        </>
    );
}
