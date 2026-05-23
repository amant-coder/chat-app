import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isUserSearchOpen: boolean;
  userSearchMode: 'new_chat' | 'add_to_group';
  userSearchGroupId?: string;
  isProfileOpen: boolean;
  isGroupCreateOpen: boolean;
  isConnected: boolean;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setUserSearchOpen: (open: boolean, mode?: 'new_chat' | 'add_to_group', groupId?: string) => void;
  setProfileOpen: (open: boolean) => void;
  setGroupCreateOpen: (open: boolean) => void;
  setConnected: (connected: boolean) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSidebarOpen: true,
  isUserSearchOpen: false,
  userSearchMode: 'new_chat',
  isProfileOpen: false,
  isGroupCreateOpen: false,
  isConnected: false,
  toasts: [],

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setUserSearchOpen: (open, mode = 'new_chat', groupId) => set({ 
    isUserSearchOpen: open, 
    userSearchMode: mode, 
    userSearchGroupId: groupId 
  }),
  setProfileOpen: (open) => set({ isProfileOpen: open }),
  setGroupCreateOpen: (open) => set({ isGroupCreateOpen: open }),
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
