import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isUserSearchOpen: boolean;
  isConnected: boolean;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setUserSearchOpen: (open: boolean) => void;
  setConnected: (connected: boolean) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSidebarOpen: true,
  isUserSearchOpen: false,
  isConnected: false,
  toasts: [],

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setUserSearchOpen: (open) => set({ isUserSearchOpen: open }),
  setConnected: (connected) => set({ isConnected: connected }),

  addToast: (message, type) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
