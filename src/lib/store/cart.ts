import { create } from "zustand";

export interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string;
    seller: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
  };
  createdAt: string;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  setLoading: (loading: boolean) => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearItems: () => set({ items: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  getItemCount: () => get().items.length,
}));
