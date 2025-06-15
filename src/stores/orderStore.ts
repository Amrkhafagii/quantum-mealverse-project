
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '@/types/order';
import { CartItem } from '@/types/cart';

interface OrderDraft {
  id: string;
  customerData: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryData: {
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
    method: 'delivery' | 'pickup';
    instructions?: string;
  };
  paymentData: {
    method: 'cash' | 'visa';
  };
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  // Current order being processed
  currentOrder: Order | null;
  
  // Order drafts for offline/interrupted sessions
  orderDrafts: OrderDraft[];
  
  // Recent orders for quick access
  recentOrders: Order[];
  
  // Loading states
  isCreatingOrder: boolean;
  isLoadingOrders: boolean;
  
  // Error state
  orderError: string | null;
  
  // Actions
  setCurrentOrder: (order: Order | null) => void;
  saveDraft: (draft: OrderDraft) => void;
  removeDraft: (draftId: string) => void;
  getDraft: (draftId: string) => OrderDraft | null;
  addRecentOrder: (order: Order) => void;
  setCreatingOrder: (isCreating: boolean) => void;
  setLoadingOrders: (isLoading: boolean) => void;
  setOrderError: (error: string | null) => void;
  clearStore: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      currentOrder: null,
      orderDrafts: [],
      recentOrders: [],
      isCreatingOrder: false,
      isLoadingOrders: false,
      orderError: null,

      setCurrentOrder: (order) => set({ currentOrder: order }),

      saveDraft: (draft) => set((state) => {
        const existingIndex = state.orderDrafts.findIndex(d => d.id === draft.id);
        const updatedDraft = { ...draft, updatedAt: new Date().toISOString() };
        
        if (existingIndex >= 0) {
          const newDrafts = [...state.orderDrafts];
          newDrafts[existingIndex] = updatedDraft;
          return { orderDrafts: newDrafts };
        } else {
          return { orderDrafts: [...state.orderDrafts, updatedDraft] };
        }
      }),

      removeDraft: (draftId) => set((state) => ({
        orderDrafts: state.orderDrafts.filter(d => d.id !== draftId)
      })),

      getDraft: (draftId) => {
        return get().orderDrafts.find(d => d.id === draftId) || null;
      },

      addRecentOrder: (order) => set((state) => ({
        recentOrders: [order, ...state.recentOrders.slice(0, 9)] // Keep last 10
      })),

      setCreatingOrder: (isCreating) => set({ isCreatingOrder: isCreating }),
      setLoadingOrders: (isLoading) => set({ isLoadingOrders: isLoading }),
      setOrderError: (error) => set({ orderError: error }),

      clearStore: () => set({
        currentOrder: null,
        orderDrafts: [],
        recentOrders: [],
        isCreatingOrder: false,
        isLoadingOrders: false,
        orderError: null
      })
    }),
    {
      name: 'order-store',
      partialize: (state) => ({
        orderDrafts: state.orderDrafts,
        recentOrders: state.recentOrders
      })
    }
  )
);
