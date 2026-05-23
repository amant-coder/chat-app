import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { FileText, ArrowLeft, Scale, ShieldAlert, CheckSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Pulse Chat – Usage Rules & Encryption Disclaimer',
  description:
    'Read the Pulse Chat Terms of Service covering acceptable use, encryption disclaimers, account responsibilities, and governing law for our secure messaging platform.',
  keywords: [
    'Pulse Chat terms of service',
    'encrypted chat terms',
    'secure messaging rules',
    'chat app disclaimer',
  ],
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service | Pulse Chat',
    description:
      'Understand the rules, encryption disclaimers, and user responsibilities for using Pulse Chat.',
    url: '/terms',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | Pulse Chat',
    description:
      'Understand the rules, encryption disclaimers, and user responsibilities for using Pulse Chat.',
  },
};

export default function TermsOfService() {
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
              <FileText className="w-6 h-6 text-(--accent)" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
              <p className="text-xs text-(--text-muted) mt-1">Last Updated: May 20, 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-(--text-secondary) leading-relaxed">
            <p className="text-lg text-white/95 font-medium">
              Welcome to Pulse Chat. By accessing our platform or creating an account, you agree to comply with and be bound by the following Terms of Service.
            </p>

            <div className="w-full h-px bg-(--border) my-6" />

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-(--accent)" />
                1. Acceptance of Terms
              </h2>
              <p>
                By using the Pulse Chat service, website, and related applications, you accept and agree to all rules, policies, and terms stated herein. If you do not agree to these terms, you must immediately cease all access and use of Pulse Chat.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-(--accent-secondary)" />
                2. User Conduct & Responsibilities
              </h2>
              <p>
                To maintain a safe and legal environment, you agree not to use the service to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Engage in illegal, malicious, or fraudulent activities.</li>
                <li>Upload or transmit files containing viruses, Trojan horses, malware, or corrupted data.</li>
                <li>Harass, abuse, threaten, or violate the personal rights of other users.</li>
                <li>Impersonate any other individual or entity.</li>
              </ul>
              <p>
                You are solely responsible for maintaining the confidentiality of your master password and for any activity that occurs under your username.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-pink-500" />
                3. Encryption Disclaimer & Liability
              </h2>
              <p>
                Pulse Chat implements strong client-side end-to-end encryption. You understand that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Because we do not store your unencrypted private keys, <strong>we cannot recover your account or chat history if you lose your master password and backup keys</strong>.</li>
                <li>You acknowledge that we provide the service on an &quot;as is&quot; and &quot;as available&quot; basis without any express or implied warranties.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">4. Termination of Accounts</h2>
              <p>
                We reserve the right to suspend, terminate, or delete user accounts that violate our terms or engage in behavior harmful to the stability of the platform, the network, or the safety of our users.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">5. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with standard data privacy laws and terms of digital services, without regard to conflict of law principles.
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
