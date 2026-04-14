'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSocket } from '@/hooks/useSocket';
import { useUIStore } from '@/stores/uiStore';

function SocketInitializer() {
  useSocket();
  return null;
}

function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`slide-up px-5 py-3 rounded-xl shadow-2xl text-sm font-medium max-w-sm
            border backdrop-blur-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]
            ${toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : toast.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <>
      {isAuthenticated && <SocketInitializer />}
      {children}
      <ToastContainer />
    </>
  );
}
