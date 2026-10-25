import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  image?: string;
  slug?: string;
  categorySlug?: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        if (!items.find((i) => i.productId === item.productId)) {
          set({ items: [...items, item] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      isInWishlist: (productId) => {
        return !!get().items.find((i) => i.productId === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'ecommerce-wishlist-storage',
    }
  )
);
