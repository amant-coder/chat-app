'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, isLoading, error, clearError, loadUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(username, email, password);
      router.push('/chat');
    } catch {}
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-primary) px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-(--accent-secondary)/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-(--accent)/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient mb-4 shadow-lg shadow-(--accent)/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gradient">Join Pulse</h1>
          <p className="text-(--text-secondary) mt-2">Create your account to get started</p>
        </div>

        {/* Form */}
        <div className="glass-panel rounded-2xl p-8 slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {displayError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm fade-in">
                {displayError}
              </div>
            )}

            <div>
              <label htmlFor="register-username" className="block text-sm font-medium text-(--text-secondary) mb-2">
                Username
              </label>
              <input
                id="register-username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError(); setLocalError(''); }}
                required
                minLength={3}
                maxLength={30}
                pattern="^[a-zA-Z0-9_]+$"
                placeholder="cool_username"
                className="w-full px-4 py-3 rounded-xl bg-(--bg-tertiary) border border-(--border)
                  text-(--text-primary) placeholder-(--text-muted)
                  focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/50
                  transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-(--text-secondary) mb-2">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); setLocalError(''); }}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-(--bg-tertiary) border border-(--border)
                  text-(--text-primary) placeholder-(--text-muted)
                  focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/50
                  transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-(--text-secondary) mb-2">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); setLocalError(''); }}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-(--bg-tertiary) border border-(--border)
                  text-(--text-primary) placeholder-(--text-muted)
                  focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/50
                  transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="register-confirm" className="block text-sm font-medium text-(--text-secondary) mb-2">
                Confirm Password
              </label>
              <input
                id="register-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); }}
                required
                minLength={6}
                placeholder="••••••••"
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-(--text-secondary) text-sm slide-up" style={{ animationDelay: '0.2s' }}>
          Already have an account?{' '}
          <Link href="/login" className="text-(--accent) hover:text-(--accent-hover) font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
