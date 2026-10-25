'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useCartStore } from '@/store/cart';
import { useCurrency, formatCurrency } from '@/lib/utils/currency';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const emptySubscribe = (() => () => {}) as (onStoreChange: () => void) => () => void;

export default function CartSlideOver() {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const { currency } = useCurrency();

  useEffect(() => {
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('open-cart', handleOpenCart);

    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* SlideOver Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[95] flex flex-col overscroll-contain transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-black flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Your Bag ({items.reduce((acc, item) => acc + item.quantity, 0)})
          </h2>
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-gray-200" strokeWidth={1} />
              <p className="text-[12px] text-gray-500">Your bag is currently empty.</p>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-4 bg-[#26352b] text-white text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-3 hover:bg-[#35483a] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.sku} className="flex gap-4 group">
                  <div className="relative w-24 h-32 bg-[#F6F6F6] shrink-0">
                    {item.image ? (
                        <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 py-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[13px] font-medium text-black pr-4">{item.name}</h3>
                      <button 
                        type="button"
                        onClick={() => removeItem(item.sku)}
                        className="text-gray-300 hover:text-red-500 transition-colors -m-2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-1">{formatCurrency(item.price, currency)}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-200">
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:text-black transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[12px] font-medium w-6 text-center">{item.quantity}</span>
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:text-black transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <p className="text-[13px] font-semibold text-black">
                        {formatCurrency(item.price * item.quantity, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-6 bg-gray-50/50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[12px] font-medium text-gray-600">Subtotal</span>
              <span className="text-[16px] font-semibold text-black">{formatCurrency(totalPrice(), currency)}</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-4 text-center">Shipping & taxes calculated at checkout.</p>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-[#26352b] text-center text-white text-[12px] font-bold uppercase tracking-[0.2em] py-4 hover:bg-[#35483a] transition-colors shadow-lg active:scale-[0.99]"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
