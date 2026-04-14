'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

type Step = 'email' | 'reset';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSuccess(data.message);
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/reset-password', {
        email,
        otp: otp.trim(),
        newPassword,
      });
      setSuccess(data.message);
      // Redirect to login after a short delay
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gradient">
            {step === 'email' ? 'Forgot Password' : 'Reset Password'}
          </h1>
          <p className="text-(--text-secondary) mt-2">
            {step === 'email'
              ? "Enter your email and we'll send you a reset code"
              : 'Enter the code sent to your email'}
          </p>
        </div>

        {/* Form */}
        <div className="glass-panel rounded-2xl p-8 slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm fade-in">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-300 text-sm fade-in">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-(--text-secondary) mb-2">
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  placeholder="you@example.com"
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
                    Sending code...
                  </span>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP + New Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm fade-in">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-300 text-sm fade-in">
                  {success}
                </div>
              )}

              {/* Email display */}
              <div className="bg-(--bg-tertiary) rounded-xl px-4 py-3 border border-(--border)">
                <p className="text-xs text-(--text-muted) mb-1">Reset code sent to</p>
                <p className="text-sm text-(--text-primary) font-medium">{email}</p>
              </div>

              <div>
                <label htmlFor="reset-otp" className="block text-sm font-medium text-(--text-secondary) mb-2">
                  6-Digit Code
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val);
                    setError('');
                  }}
                  required
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-xl bg-(--bg-tertiary) border border-(--border)
                    text-(--text-primary) placeholder-(--text-muted) text-center text-2xl tracking-[0.5em] font-mono
                    focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/50
                    transition-all duration-200"
                  autoComplete="one-time-code"
                />
              </div>

              <div>
                <label htmlFor="reset-password" className="block text-sm font-medium text-(--text-secondary) mb-2">
                  New Password
                </label>
                <input
                  id="reset-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
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
                <label htmlFor="reset-confirm" className="block text-sm font-medium text-(--text-secondary) mb-2">
                  Confirm New Password
                </label>
                <input
                  id="reset-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
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
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-gradient text-white font-semibold
                  hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--accent)/50
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-lg shadow-(--accent)/20
                  active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setError(''); setSuccess(''); }}
                className="w-full text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors py-2"
              >
                ← Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-(--text-secondary) text-sm slide-up" style={{ animationDelay: '0.2s' }}>
          Remember your password?{' '}
          <Link href="/login" className="text-(--accent) hover:text-(--accent-hover) font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
