import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Shield, ArrowLeft, Lock, Eye, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Pulse Chat – How We Protect Your Data',
  description:
    'Learn how Pulse Chat protects your conversations with client-side RSA-OAEP and AES-GCM end-to-end encryption. Your private keys never leave your browser.',
  keywords: [
    'Pulse Chat privacy policy',
    'end-to-end encryption',
    'client-side encryption',
    'secure messaging privacy',
    'RSA-OAEP AES-GCM chat',
  ],
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Pulse Chat',
    description:
      'Pulse Chat uses client-side end-to-end encryption so your private keys and messages never reach our servers.',
    url: '/privacy',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Pulse Chat',
    description:
      'Pulse Chat uses client-side end-to-end encryption so your private keys and messages never reach our servers.',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-(--bg-primary) flex flex-col font-sans overflow-x-hidden selection:bg-(--accent) selection:text-white relative">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-(--accent-glow) rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse duration-[4000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[rgba(0,206,201,0.15)] rounded-full blur-[120px] -z-10 mix-blend-screen" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-(--border) px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo.svg" alt="Pulse Logo" width={40} height={40} className="w-10 h-10 rounded-xl shadow-lg shadow-(--accent-glow)" />
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-gradient transition-all">Pulse Chat</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-(--text-secondary) hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto pt-32 pb-20 px-6">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-(--border) relative overflow-hidden slide-up">
          {/* Header section inside panel */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center border border-(--accent)/20">
              <Shield className="w-6 h-6 text-(--accent)" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-(--text-muted) mt-1">Last Updated: May 20, 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-(--text-secondary) leading-relaxed">
            <p className="text-lg text-white/95 font-medium">
              At Pulse Chat, your privacy is our core mission. Pulse Chat is designed around local client-side End-to-End Encryption (E2EE) to ensure you are always in complete control of your data.
            </p>

            <div className="w-full h-px bg-(--border) my-6" />

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-(--accent)" />
                1. End-to-End Encryption (E2EE)
              </h2>
              <p>
                Pulse Chat implements robust client-side RSA-OAEP and AES-GCM encryption. 
                When you register, key-pairs are generated directly in your browser:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Public Key:</strong> Shared with the server to allow other users to encrypt messages for you.</li>
                <li><strong>Private Key:</strong> Kept strictly client-side. The server never receives, stores, or transmits your unencrypted private key. Even when backed up, it is encrypted locally on your device with your master passphrase using PBKDF2 before sync.</li>
              </ul>
              <p className="text-sm bg-(--bg-tertiary)/40 border border-(--border) p-3.5 rounded-xl text-(--text-primary)">
                <strong>Summary:</strong> Because your conversations are encrypted before leaving your browser, the administrators of Pulse Chat cannot read, inspect, or intercept the content of your messages under any circumstances.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-(--accent-secondary)" />
                2. Information We Collect
              </h2>
              <p>
                To provide a functional chat experience, we collect only minimal metadata:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> A username and an optional email address used exclusively for authentication and account recovery.</li>
                <li><strong>Presence Data:</strong> Your current status (online/offline) and last-seen timestamp to inform your conversation participants.</li>
                <li><strong>Encrypted Payload Data:</strong> The encrypted content of messages, files, and voice recordings, which are automatically purged or stored securely on our database.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-500" />
                3. Data Retention and Safety
              </h2>
              <p>
                We retain your account profile and encrypted message logs only as long as necessary to sync your chat history across your active sessions. When you delete a message using the &ldquo;Delete for Everyone&rdquo; feature, the action triggers a soft-delete on our database and immediately clears message text, media links, and reply context across all participant layouts.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">4. Changes to This Policy</h2>
              <p>
                We may periodically update our Privacy Policy to reflect changing technical capabilities or security standards. We encourage you to review this page regularly.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">5. Contact Us</h2>
              <p>
                If you have questions regarding our encryption implementation or data protection practices, please contact our support team at aullrounder01@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-(--border) py-6 text-center text-xs text-(--text-muted) glass-panel">
        <p>© 2026 Pulse Chat. All rights reserved.</p>
      </footer>
    </div>
  );
}
