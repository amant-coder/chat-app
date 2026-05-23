'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

/**
 * Clerk SSO Callback page.
 * Clerk redirects back here after OAuth and handles the session creation
 * before forwarding to /login (where our PIN flow triggers).
 */
export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-primary)">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-(--accent) border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-(--text-secondary) text-sm">Completing sign-in…</p>
      </div>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/login"
        signUpForceRedirectUrl="/login"
      />
    </div>
  );
}
