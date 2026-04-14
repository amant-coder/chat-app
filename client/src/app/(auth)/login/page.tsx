'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError, loadUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/chat');
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-primary) px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-(--accent)/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-(--accent-secondary)/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient mb-4 shadow-lg shadow-(--accent)/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gradient">Pulse Chat</h1>
          <p className="text-(--text-secondary) mt-2">Welcome back — sign in to continue</p>
        </div>

        {/* Form */}
        <div className="glass-panel rounded-2xl p-8 slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm fade-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-(--text-secondary) mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-(--bg-tertiary) border border-(--border)
                  text-(--text-primary) placeholder-(--text-muted)
                  focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/50
                  transition-all duration-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block text-sm font-medium text-(--text-secondary)">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-(--accent) hover:text-(--accent-hover) transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-(--bg-tertiary) border border-(--border)
                  text-(--text-primary) placeholder-(--text-muted)
                  focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/50
                  transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient text-white font-semibold
                hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--accent)/50
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg shadow-(--accent)/20
                active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-(--text-secondary) text-sm slide-up" style={{ animationDelay: '0.2s' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-(--accent) hover:text-(--accent-hover) font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
