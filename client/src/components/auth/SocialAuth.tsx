'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { useAuthStore } from '@/stores/authStore';
import {
  generateRSAKeyPair,
  generateSalt,
  deriveMasterKey,
  encryptPrivateKey,
  decryptPrivateKey,
} from '@/lib/crypto';
import api from '@/lib/api';
import { ShieldAlert, KeyRound, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type FlowStep = 'idle' | 'e2e-setup' | 'e2e-unlock';

// ─── Provider icons ───────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function SocialAuth() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { getToken, isSignedIn, signOut } = useAuth();

  const { socialLogin } = useAuthStore();

  const [flowStep, setFlowStep] = useState<FlowStep>('idle');
  const [pin, setPin] = useState('');
  const probeAttempted = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingKeyData, setExistingKeyData] = useState<{
    encryptedPrivateKey: string;
    keySalt: string;
  } | null>(null);

  const getAuthOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }

    return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3006';
  };

  const formatAuthError = (err: unknown) => {
    const error = err as { errors?: { longMessage?: string; message?: string }[]; message?: string };
    const clerkMessage = error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message;
    return clerkMessage || error?.message || 'OAuth failed. Please try again.';
  };

  const handleAccountDeleted = async (err: unknown): Promise<boolean> => {
    const error = err as { response?: { status?: number; data?: { code?: string } } };
    if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_DELETED') {
      setError('Your account has been deleted by an administrator.');
      if (signOut) {
        try {
          await signOut();
        } catch (signOutErr) {
          console.error('Clerk signOut failed:', signOutErr);
        }
      }
      localStorage.clear();
      setFlowStep('idle');
      return true;
    }
    return false;
  };

  const runClerkProbe = async () => {
    try {
      setLoading(true);
      setError(null);
      const clerkToken = await getToken();
      console.log('[SocialAuth] runClerkProbe ->', clerkToken ? `token-length=${clerkToken.length}` : 'no-token');
      if (!clerkToken) return;

      // Probe backend: does this user already have E2EE keys?
      const { data } = await api.post(
        '/auth/clerk-login',
        {},
        { headers: { Authorization: `Bearer ${clerkToken}` } }
      );
      console.log('[SocialAuth] /auth/clerk-login response ok, user:', data?.user?.email || 'unknown');

      if (data.user.publicKey && data.user.encryptedPrivateKey && data.user.keySalt) {
        // Existing user — ask for their PIN to unlock E2EE keys
        setExistingKeyData({
          encryptedPrivateKey: data.user.encryptedPrivateKey,
          keySalt: data.user.keySalt,
        });
        setFlowStep('e2e-unlock');
      } else {
        // New user — ask them to set a PIN
        setFlowStep('e2e-setup');
      }
    } catch (err: unknown) {
      if (await handleAccountDeleted(err)) return;
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to connect to server. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  // ── After Clerk completes OAuth we land back here with isSignedIn=true ──────
  // We then call our backend to upsert the user and get our app JWT.
  useEffect(() => {
    if (!isSignedIn) {
      probeAttempted.current = false;
      return;
    }
    if (flowStep !== 'idle' || probeAttempted.current) return;
    probeAttempted.current = true;
    console.log('[SocialAuth] isSignedIn=true, starting clerk-login probe');
    runClerkProbe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  // ── Kick off Clerk OAuth redirect ─────────────────────────────────────────
  const handleOAuth = async (provider: 'oauth_google' | 'oauth_github') => {
    setError(null);
    if (isSignedIn) {
      // Already signed into Clerk. Directly trigger E2EE PIN probe!
      await runClerkProbe();
      return;
    }
    if (!signIn) return;
    try {
      const authOrigin = getAuthOrigin();

      // Clerk v7 SignInFuture API uses signIn.sso() for OAuth
      await signIn.sso({
        strategy: provider,
        redirectUrl: `${authOrigin}/login`,
        redirectCallbackUrl: `${authOrigin}/sso-callback`,
      });
    } catch (err: unknown) {
      console.error('OAuth redirect failed:', err);
      setError(formatAuthError(err));
    }
  };

  // ── New user PIN setup ────────────────────────────────────────────────────
  const handlePinSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) { setError('PIN must be at least 4 digits'); return; }
    setLoading(true);
    setError(null);

    try {
      const clerkToken = await getToken();
      if (!clerkToken) throw new Error('Lost Clerk session. Please try again.');

      const { publicKeyJwk, privateKeyJwk } = await generateRSAKeyPair();
      const keySalt = generateSalt();
      const masterKey = await deriveMasterKey(pin, keySalt);
      const encryptedPrivateKey = await encryptPrivateKey(privateKeyJwk, masterKey);

      localStorage.setItem('e2e_private_key', JSON.stringify(privateKeyJwk));

      const { data } = await api.post(
        '/auth/clerk-login',
        {
          publicKey: JSON.stringify(publicKeyJwk),
          encryptedPrivateKey,
          keySalt,
          backupPin: pin,
        },
        { headers: { Authorization: `Bearer ${clerkToken}` } }
      );

      // Persist our own JWT & user
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Sync Zustand store (re-use socialLogin action for token/socket setup)
      await socialLogin(data.user.email, data.user.username);
      router.push('/chat');
    } catch (err: unknown) {
      if (await handleAccountDeleted(err)) return;
      const error = err as { message?: string };
      setError(error.message || 'Key generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Existing user PIN unlock ──────────────────────────────────────────────
  const handlePinUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingKeyData) return;
    setLoading(true);
    setError(null);

    try {
      const clerkToken = await getToken();
      if (!clerkToken) throw new Error('Lost Clerk session. Please try again.');

      // Decrypt private key locally with provided PIN
      const masterKey = await deriveMasterKey(pin, existingKeyData.keySalt);
      const { privateKeyJwk } = await decryptPrivateKey(existingKeyData.encryptedPrivateKey, masterKey);
      localStorage.setItem('e2e_private_key', JSON.stringify(privateKeyJwk));

      // Get/refresh our own JWT from the backend
      const { data } = await api.post(
        '/auth/clerk-login',
        {},
        { headers: { Authorization: `Bearer ${clerkToken}` } }
      );

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      await socialLogin(data.user.email, data.user.username);
      router.push('/chat');
    } catch (err: unknown) {
      if (await handleAccountDeleted(err)) return;
      const error = err as { message?: string };
      setError(error.message || 'Incorrect PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFlowStep('idle');
    setPin('');
    setError(null);
    setExistingKeyData(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-4 mt-6">
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-(--border)" />
        <span className="flex-shrink mx-4 text-(--text-muted) text-xs uppercase tracking-wider font-semibold">
          Or continue with
        </span>
        <div className="flex-grow border-t border-(--border)" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Google */}
        <button
          id="oauth-google-btn"
          onClick={() => handleOAuth('oauth_google')}
          type="button"
          disabled={(!signIn && !isSignedIn) || loading}
          className="flex items-center justify-center gap-2.5 py-3 rounded-xl border border-(--border) bg-(--bg-tertiary) hover:bg-(--surface-hover) transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          <span className="text-sm font-semibold text-(--text-primary)">Google</span>
        </button>

        {/* GitHub */}
        <button
          id="oauth-github-btn"
          onClick={() => handleOAuth('oauth_github')}
          type="button"
          disabled={(!signIn && !isSignedIn) || loading}
          className="flex items-center justify-center gap-2.5 py-3 rounded-xl border border-(--border) bg-(--bg-tertiary) hover:bg-(--surface-hover) transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-(--text-primary)"
        >
          <GithubIcon />
          <span className="text-sm font-semibold">GitHub</span>
        </button>
      </div>

      {/* ── Security PIN Modal (shown after Clerk OAuth completes) ── */}
      {(flowStep === 'e2e-setup' || flowStep === 'e2e-unlock') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#111B21] border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* ── New user: Set PIN ── */}
            {flowStep === 'e2e-setup' && (
              <form onSubmit={handlePinSetup} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-3 text-emerald-500">
                    <KeyRound size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Create Security PIN</h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Set a 4–6 digit PIN to encrypt your end-to-end encryption keys.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3 py-2 rounded-xl">
                    {error}
                  </div>
                )}

                <input
                  id="e2e-pin-setup"
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="Enter Security PIN"
                  className="w-full bg-[#202C33] border border-gray-700/50 rounded-xl py-3 px-4 text-gray-100 focus:outline-none focus:border-[#00A884] transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                />

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl flex items-start gap-3">
                  <ShieldAlert size={20} className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs leading-relaxed">
                    This PIN encrypts your cryptographic keys client-side. The administrator can
                    review it in the Admin Panel if you forget.
                  </p>
                </div>

                <button
                  id="e2e-pin-setup-submit"
                  type="submit"
                  disabled={loading || pin.length < 4}
                  className="w-full py-3 bg-[#00A884] hover:bg-[#008f6f] text-black font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {loading ? 'Generating keys…' : 'Save & Start Chatting'}
                </button>
              </form>
            )}

            {/* ── Returning user: Unlock PIN ── */}
            {flowStep === 'e2e-unlock' && (
              <form onSubmit={handlePinUnlock} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-3 text-emerald-500">
                    <KeyRound size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Unlock E2EE Chats</h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Enter your Security PIN to decrypt your conversation keys.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3 py-2 rounded-xl">
                    {error}
                  </div>
                )}

                <input
                  id="e2e-pin-unlock"
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="Enter Security PIN"
                  className="w-full bg-[#202C33] border border-gray-700/50 rounded-xl py-3 px-4 text-gray-100 focus:outline-none focus:border-[#00A884] transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                />

                <div className="p-3 bg-gray-800/50 border border-gray-700 text-gray-400 rounded-xl flex items-start gap-3">
                  <ShieldAlert size={20} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <div>
                    <p className="text-xs font-semibold text-gray-300 mb-0.5">Forgot your PIN?</p>
                    <p className="text-xs leading-relaxed">
                      Go to the Admin Panel dashboard to find your user profile recovery PIN.
                    </p>
                  </div>
                </div>

                <button
                  id="e2e-pin-unlock-submit"
                  type="submit"
                  disabled={loading || pin.length < 4}
                  className="w-full py-3 bg-[#00A884] hover:bg-[#008f6f] text-black font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {loading ? 'Decrypting chats…' : 'Unlock & Continue'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
