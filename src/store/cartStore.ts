import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: number;
  image: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      updateQty: (id, qty) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.qty, 0);
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.qty, 0);
      },
    }),
    {
      name: 'pi-opung-cart',
    }
  )
);
