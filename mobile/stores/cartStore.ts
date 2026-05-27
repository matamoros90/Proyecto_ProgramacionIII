import { create } from 'zustand';
import type { Build, PcCategory } from '../types';

interface CartItem {
  category: PcCategory;
  categoryLabel: string;
  build: Build;
  totalPrice: number;
}

interface CartState {
  cartItem: CartItem | null;
  addToCart: (category: PcCategory, categoryLabel: string, build: Build, totalPrice: number) => void;
  removeFromCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItem: null,
  addToCart: (category, categoryLabel, build, totalPrice) =>
    set({
      cartItem: { category, categoryLabel, build, totalPrice },
    }),
  removeFromCart: () => set({ cartItem: null }),
  clearCart: () => set({ cartItem: null }),
}));
