'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart';
import { useSyncExternalStore, useState, useEffect } from 'react';

const emptySubscribe = (() => () => {}) as (cb: () => void) => () => void;

const HIDDEN_ON = ['/checkout', '/admin'];

export default function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const totalItems = useCartStore((s) => s.totalItems());
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [overlayHidden, setOverlayHidden] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Only trigger hide/show if we've scrolled a bit to avoid jitter
            if (currentScrollY > lastScrollY && currentScrollY > 60) {
                // Scrolling down
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY || currentScrollY <= 60) {
                // Scrolling up or at the top
                setIsVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const handleOverlayVisibility = (event: Event) => {
            const detail = (event as CustomEvent<{ hidden?: boolean }>).detail;
            setOverlayHidden(Boolean(detail?.hidden));
        };

        window.addEventListener('mobile-nav-visibility', handleOverlayVisibility as EventListener);
        return () => {
            window.removeEventListener('mobile-nav-visibility', handleOverlayVisibility as EventListener);
        };
    }, []);

    const isSingleProduct = pathname?.startsWith('/products/') && pathname.split('/').length > 3;
    if (HIDDEN_ON.some((p) => pathname?.startsWith(p)) || isSingleProduct) return null;

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            href: '/',
            icon: Home,
        },
        {
            id: 'shop',
            label: 'Shop',
            href: '/products',
            icon: ShoppingBag,
        },
        {
            id: 'cart',
            label: 'Cart',
            href: null,
            icon: ShoppingCart,
            action: () => window.dispatchEvent(new Event('open-cart')),
        },
        {
            id: 'profile',
            label: session ? 'Account' : 'Sign In',
            href: session ? '/account' : '/login',
            icon: User,
        },
    ];

    const isActive = (href: string | null) => {
        if (!href) return false;
        if (href === '/') return pathname === '/';
        return pathname?.startsWith(href) ?? false;
    };

    const badge = mounted && totalItems > 0
        ? totalItems > 9 ? '9+' : String(totalItems)
        : null;

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 transition-transform duration-300 ease-in-out",
                !overlayHidden && isVisible ? "translate-y-0" : "translate-y-[120%]"
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex h-[62px] items-stretch justify-around px-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    const inner = (
                        <span className="relative flex flex-col items-center justify-center gap-[5px] w-full h-full">
                            <span className="relative z-10 flex items-center justify-center w-6 h-6">
                                <Icon
                                    strokeWidth={active ? 2.2 : 1.5}
                                    className={cn(
                                        'w-[22px] h-[22px] transition-all duration-200',
                                        active ? 'text-black' : 'text-gray-400'
                                    )}
                                />

                                {/* Cart badge */}
                                {item.id === 'cart' && badge && (
                                    <span
                                        key={badge}
                                        className="absolute -top-[6px] -right-[8px]
                                                   flex items-center justify-center
                                                   min-w-[16px] h-[16px] px-[3px]
                                                   bg-black text-white rounded-full
                                                   text-[9px] font-bold leading-none
                                                   badge-pop"
                                    >
                                        {badge}
                                    </span>
                                )}
                            </span>

                            {/* Label */}
                            <span
                                className={cn(
                                    'relative z-10 text-[10px] leading-none tracking-wide transition-all duration-200',
                                    active ? 'text-black font-semibold' : 'text-gray-400 font-normal'
                                )}
                            >
                                {item.label}
                            </span>
                        </span>
                    );

                    const sharedClass = cn(
                        'relative flex items-center justify-center',
                        'flex-1 h-full',
                        'select-none',
                        /* spring press — scale down then spring back */
                        'transition-transform duration-100 active:scale-90',
                        'nav-tap'
                    );

                    if (item.action) {
                        return (
                            <button
                                key={item.id}
                                onClick={item.action}
                                aria-label={item.label}
                                className={sharedClass}
                            >
                                {inner}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.id}
                            href={item.href!}
                            aria-label={item.label}
                            className={sharedClass}
                        >
                            {inner}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
