'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export const useAuth = (requireAuth: boolean = true) => {
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, requireAuth, router]);

  return { user, isAuthenticated, isLoading };
};
