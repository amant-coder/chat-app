import { create } from 'zustand';
import api from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { User, AuthResponse } from '@/types';
import {
  generateRSAKeyPair,
  generateSalt,
  deriveMasterKey,
  encryptPrivateKey,
  decryptPrivateKey,
} from '@/lib/crypto';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });

      // Handle E2EE Keys
      console.log('[Auth] Login successful, user data:', {
        hasPrivateKey: !!data.user.encryptedPrivateKey,
        hasSalt: !!data.user.keySalt,
        publicKey: data.user.publicKey
      });

      if (data.user.encryptedPrivateKey && data.user.keySalt) {
        try {
          const masterKey = await deriveMasterKey(password, data.user.keySalt);
          const { privateKeyJwk } = await decryptPrivateKey(data.user.encryptedPrivateKey, masterKey);
          localStorage.setItem('e2e_private_key', JSON.stringify(privateKeyJwk));
          console.log('[Auth] Private key decrypted and stored.');
        } catch (err) {
          console.error("[Auth] Failed to decrypt private key", err);
        }
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      connectSocket(data.accessToken);

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || 'Login failed. Please try again.',
      });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Generate E2EE Keys
      const { publicKeyJwk, privateKeyJwk } = await generateRSAKeyPair();
      const keySalt = generateSalt();
      const masterKey = await deriveMasterKey(password, keySalt);
      const encryptedPrivateKey = await encryptPrivateKey(privateKeyJwk, masterKey);

      const { data } = await api.post<AuthResponse>('/auth/register', {
        username,
        email,
        password,
        publicKey: JSON.stringify(publicKeyJwk),
        encryptedPrivateKey,
        keySalt,
      });

      // Save private key locally for this device
      localStorage.setItem('e2e_private_key', JSON.stringify(privateKeyJwk));

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      connectSocket(data.accessToken);

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || 'Registration failed. Please try again.',
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('e2e_private_key');
    disconnectSocket();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  loadUser: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        connectSocket(token);
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),
}));
