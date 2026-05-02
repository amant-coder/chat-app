'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Shield, Zap, Image as ImageIcon, MessageSquare, ArrowRight, Lock, Users, Smartphone, CheckCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadUser();
  }, [loadUser]);

  return (
    <div className="min-h-screen bg-(--bg-primary) flex flex-col font-sans overflow-x-hidden selection:bg-(--accent) selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-(--accent-glow) rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse duration-[4000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[rgba(0,206,201,0.2)] rounded-full blur-[120px] -z-10 mix-blend-screen" />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-(--border) px-6 py-4 transition-all slideDown">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Pulse Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-(--accent-glow)" />
            <span className="text-xl font-bold tracking-tight text-white">Pulse Chat</span>
          </div>

          <nav className="flex items-center gap-6">
            {isMounted && !isLoading ? (
              isAuthenticated ? (
                <Link href="/chat">
                  <button className="px-6 py-2 rounded-full cursor-pointer bg-(--surface) border border-(--border-light) hover:bg-(--bg-hover) transition-all font-medium glow-border">
                    Open Chat
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-(--text-secondary) hover:text-white transition-colors font-medium cursor-pointer">
                    Sign In
                  </Link>
                  <Link href="/register">
                    <button className="px-6 py-2 rounded-full cursor-pointer bg-gradient text-white font-medium hover:opacity-90 shadow-lg shadow-(--accent-glow) transition-all flex items-center gap-2">
                      Get Started
                    </button>
                  </Link>
                </>
              )
            ) : (
              <div className="w-24 h-10 shimmer rounded-full" />
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-4">
        <div className="max-w-4xl w-full text-center slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--surface-hover) border border-(--border) text-(--accent-secondary) text-sm font-semibold mb-8">
            <Shield className="w-4 h-4" />
            <span>Now with True End-to-End Encryption</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-tight">
            Connect <span className="text-gradient">Securely</span> <br />
            In Real-Time.
          </h1>

          <p className="text-xl text-(--text-secondary) mb-12 max-w-2xl mx-auto leading-relaxed">
            A beautiful, blazing-fast messaging platform that guarantees your privacy. Your keys. Your data. Your conversations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={isAuthenticated ? "/chat" : "/register"}>
              <button className="px-8 py-4 rounded-full cursor-pointer bg-gradient text-white font-semibold text-lg hover:opacity-90 hover:scale-105 active:scale-95 shadow-xl shadow-(--accent-glow) transition-all flex items-center gap-2">
                Start Chatting Free <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="w-full max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>

          {/* Feature 1 */}
          <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-(--surface-hover) border border-(--border-light) flex items-center justify-center mb-6 group-hover:border-(--accent) transition-colors">
              <Lock className="w-7 h-7 text-(--accent)" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Military-Grade Encryption</h3>
            <p className="text-(--text-secondary) leading-relaxed">
              Every message is encrypted natively in your browser using RSA-OAEP & AES-GCM algorithms. We literally can't read your chats even if we tried.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-(--surface-hover) border border-(--border-light) flex items-center justify-center mb-6 group-hover:border-(--accent-secondary) transition-colors">
              <Zap className="w-7 h-7 text-(--accent-secondary)" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Instant Sync</h3>
            <p className="text-(--text-secondary) leading-relaxed">
              Powered by WebSockets, messages fly across the globe instantly. Features live typing indicators and instant read receipts.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-(--surface-hover) border border-(--border-light) flex items-center justify-center mb-6 group-hover:border-pink-500 transition-colors">
              <ImageIcon className="w-7 h-7 text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Media Sharing</h3>
            <p className="text-(--text-secondary) leading-relaxed">
              Drag, drop, and share high-quality images and files securely. The seamless integration feels just like a native app.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-(--surface-hover) border border-(--border-light) flex items-center justify-center mb-6 group-hover:border-blue-500 transition-colors">
              <Users className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Group & Direct Chats</h3>
            <p className="text-(--text-secondary) leading-relaxed">
              Organize conversations with multiple friends or keep it 1-on-1. A flawless communication hub designed for any social dynamic.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-(--surface-hover) border border-(--border-light) flex items-center justify-center mb-6 group-hover:border-green-500 transition-colors">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Live Presence</h3>
            <p className="text-(--text-secondary) leading-relaxed">
              Know exactly when your friends are online or typing. Real-time read double-ticks keep you connected to the rhythm of the conversation.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-(--surface-hover) border border-(--border-light) flex items-center justify-center mb-6 group-hover:border-purple-500 transition-colors">
              <Smartphone className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Cross-Platform Ready</h3>
            <p className="text-(--text-secondary) leading-relaxed">
              A responsive, mobile-first design that looks breathtaking whether you are on a smartphone, tablet, or massive desktop screen.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-(--border) py-8 mt-20 glass-panel relative overflow-hidden">
        {/* Technologies Grid */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="text-center mb-6">
            <h4 className="text-sm font-semibold tracking-widest text-(--text-muted) uppercase">Powered by Modern Technologies</h4>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 lg:gap-6 opacity-80">
            <span className="px-5 py-2.5 rounded-full bg-(--surface) border border-(--border-light) text-sm font-medium text-(--text-secondary) hover:text-white hover:border-(--accent) transition-all cursor-default shadow-sm hover:shadow-(--accent-glow)">Next.js</span>
            <span className="px-5 py-2.5 rounded-full bg-(--surface) border border-(--border-light) text-sm font-medium text-(--text-secondary) hover:text-[#61dafb] hover:border-[#61dafb] transition-all cursor-default shadow-sm hover:shadow-[#61dafb]/20">React v19</span>
            <span className="px-5 py-2.5 rounded-full bg-(--surface) border border-(--border-light) text-sm font-medium text-(--text-secondary) hover:text-[#38bdf8] hover:border-[#38bdf8] transition-all cursor-default shadow-sm hover:shadow-[#38bdf8]/20">Tailwind CSS</span>
            <span className="px-5 py-2.5 rounded-full bg-(--surface) border border-(--border-light) text-sm font-medium text-(--text-secondary) hover:text-white hover:border-gray-300 transition-all cursor-default shadow-sm hover:shadow-gray-300/20">Socket.IO</span>
            <span className="px-5 py-2.5 rounded-full bg-(--surface) border border-(--border-light) text-sm font-medium text-(--text-secondary) hover:text-[#68a063] hover:border-[#68a063] transition-all cursor-default shadow-sm hover:shadow-[#68a063]/20">Node.js</span>
            <span className="px-5 py-2.5 rounded-full bg-(--surface) border border-(--border-light) text-sm font-medium text-(--text-secondary) hover:text-white hover:border-gray-500 transition-all cursor-default shadow-sm hover:shadow-gray-500/20">Express</span>
            <span className="px-5 py-2.5 rounded-full bg-(--surface) border border-(--border-light) text-sm font-medium text-(--text-secondary) hover:text-[#47A248] hover:border-[#47A248] transition-all cursor-default shadow-sm hover:shadow-[#47A248]/20">MongoDB</span>
          </div>
        </div>
        
        <div className="w-full h-px bg-gradient-to-r from-transparent via-(--border-light) to-transparent mb-8" />
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-(--text-muted)">
            <MessageSquare className="w-4 h-4" />
            <span>© 2026 Pulse Chat Application. All rights reserved.</span>
            <span className="hover:text-white cursor-pointer transition-colors align-center">Made with 🕵️ by Aman R. Thakur</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-(--text-secondary)">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            {/* <span className="hover:text-white cursor-pointer transition-colors">GitHub</span> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
