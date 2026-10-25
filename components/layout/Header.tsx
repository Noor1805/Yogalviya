'use client';

import { useState, useEffect, useSyncExternalStore, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, X, Plus } from 'lucide-react';
import CartSlideOver from '@/components/layout/CartSlideOver';
import { useCartStore } from '@/store/cart';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const emptySubscribe = (() => () => {}) as (onStoreChange: () => void) => () => void;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCartStore((state) => state.totalItems());
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? 'bg-black/95 backdrop-blur-xl' : 'bg-black'
        } ${pathname?.startsWith('/checkout') ? 'hidden lg:block' : ''}`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* LEFT — Contact Us */}
          <div className="flex items-center gap-1.5">
            <Plus className="h-3 w-3 text-white" strokeWidth={1.5} />
            <Link
              href="/contact"
              className="text-[11px] font-light tracking-[0.18em] text-white uppercase hover:opacity-70 transition-opacity duration-200"
            >
              Contact Us
            </Link>
          </div>

          {/* CENTER — Brand Name */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 hover:opacity-70 transition-opacity duration-200"
          >
            <span
              className="text-white uppercase tracking-[0.35em] font-light select-none"
              style={{ fontSize: 'clamp(13px, 1.6vw, 17px)', fontFamily: 'Georgia, serif', letterSpacing: '0.35em' }}
            >
              Almina Couture
            </span>
          </Link>

          {/* RIGHT — Icons + Menu */}
          <div className="flex items-center gap-6">

            {/* Icons — desktop only */}
            <div className="hidden md:flex items-center gap-5">
              <button 
                onClick={() => window.dispatchEvent(new Event('open-cart'))}
                aria-label="Cart" 
                className="relative text-white hover:opacity-70 transition-opacity duration-200"
              >
                <ShoppingBag className="h-[17px] w-[17px]" strokeWidth={1.2} />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black">
                    {totalItems}
                  </span>
                )}
              </button>
              <button aria-label="Account" className="text-white hover:opacity-70 transition-opacity duration-200">
                <User className="h-[17px] w-[17px]" strokeWidth={1.2} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                }}
                aria-label="Search"
                className="text-white hover:opacity-70 transition-opacity duration-200 cursor-pointer"
              >
                <Search className="h-[17px] w-[17px]" strokeWidth={1.2} />
              </button>
            </div>

            {/* MENU */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity duration-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-[17px] w-[17px]" strokeWidth={1.2} />
              ) : (
                <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
                  <line x1="0" y1="1"   x2="17" y2="1"   stroke="white" strokeWidth="1.2"/>
                  <line x1="0" y1="5.5" x2="17" y2="5.5" stroke="white" strokeWidth="1.2"/>
                  <line x1="0" y1="10"  x2="17" y2="10"  stroke="white" strokeWidth="1.2"/>
                </svg>
              )}
              <span className="text-[11px] font-light tracking-[0.22em] uppercase text-white">
                Menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full screen overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-all duration-500 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-2">
          {navigation.map((item, i) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`text-[13px] font-light tracking-[0.3em] uppercase py-3 transition-all duration-200 hover:opacity-60 ${
                isActive(item.href) ? 'text-white' : 'text-white/70'
              }`}
              style={{ transitionDelay: mobileOpen ? `${i * 0.06}s` : '0s' }}
            >
              {item.name}
            </Link>
          ))}

          <div className="mt-8 border-t border-white/20 pt-8 w-48 flex flex-col items-center">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="text-[11px] tracking-[0.25em] uppercase text-white border border-white/40 px-8 py-3 hover:bg-white hover:text-black transition-all duration-300"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </div>
      <CartSlideOver />

      {/* Search Dialog */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
          searchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery('');
          }}
        />
        <div className="relative z-10 pt-24 px-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                <div className="flex items-center px-6 py-4 border-b border-gray-100">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    autoFocus={searchOpen}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="px-6 py-3 bg-gray-50 text-[11px] text-gray-400 flex justify-between items-center">
                  <span>Press Enter to search</span>
                  <kbd className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-mono">ESC</kbd>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
