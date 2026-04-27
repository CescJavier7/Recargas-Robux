import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string; // Ej: "800"
  robux: number;
  price: number;
};

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalRobux: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter((i, index) => index !== state.items.findIndex(x => x.id === id)) 
      })),
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return Number(get().items.reduce((total, item) => total + item.price, 0).toFixed(2));
      },
      getTotalRobux: () => {
        return get().items.reduce((total, item) => total + item.robux, 0);
      },
    }),
    { name: 'nexus-cart' } // Persiste en localStorage automáticamente
  )
);