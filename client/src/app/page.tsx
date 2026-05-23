'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { 
  Shield, 
  Zap, 
  Image as ImageIcon, 
  ArrowRight, 
  Lock, 
  Users, 
  Smartphone, 
  CheckCircle, 
  Send, 
  Smile, 
  CheckCheck,
  Search,
  MessageCircle
} from 'lucide-react';
import BorderGlow from '@/components/ui/BorderGlow';
import Dock from '@/components/ui/Dock';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Pulse Chat',
      url: 'http://localhost:3006',
      description: 'Secure real-time messaging with end-to-end encryption and modern chat features.',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Pulse Chat',
      applicationCategory: 'CommunicationApplication',
      operatingSystem: 'Web',
      url: 'http://localhost:3006',
      description: 'A privacy-first chat app for encrypted direct and group conversations in real time.',
    },
  ],
};

interface MockMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  type: 'sent' | 'received';
}

function ChatPreviewMockup() {
  const [activeTab, setActiveTab] = useState<'aman' | 'alice'>('aman');
  const [inputVal, setInputVal] = useState('');
  const [demoSender, setDemoSender] = useState<'you' | 'other'>('you');
  const [messages, setMessages] = useState<{ aman: MockMessage[]; alice: MockMessage[] }>({
    aman: [
      { id: '1', sender: 'Aman R. Thakur', content: 'Hey there! Have you seen the new Google-inspired design updates to Pulse?', time: '11:24 AM', type: 'received' },
      { id: '2', sender: 'You', content: 'Not yet! Let me check them out. Is it clean?', time: '11:25 AM', type: 'sent' },
      { id: '3', sender: 'Aman R. Thakur', content: 'It is super polished. The floating message input is amazing! Try typing a message below to test it out.', time: '11:25 AM', type: 'received' },
    ],
    alice: [
      { id: '1', sender: 'Alice', content: 'Are we still meeting for the encryption review today?', time: '09:15 AM', type: 'received' },
      { id: '2', sender: 'You', content: 'Yes, absolutely. I want to showcase the local storage key storage design.', time: '09:17 AM', type: 'sent' },
      { id: '3', sender: 'Alice', content: 'Perfect, see you in the workspace! 🔐', time: '09:18 AM', type: 'received' },
    ]
  });

  const handleSendMockMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: MockMessage = {
      id: Date.now().toString(),
      sender: demoSender === 'you' ? 'You' : (activeTab === 'aman' ? 'Aman R. Thakur' : 'Alice'),
      content: inputVal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: demoSender === 'you' ? 'sent' : 'received'
    };

    setMessages(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newMsg]
    }));
    setInputVal('');
  };

  return (
    <BorderGlow
      className="w-full max-w-4xl mx-auto shadow-2xl"
      backgroundColor="var(--bg-secondary)"
      colors={['#38bdf8', '#818cf8', '#c084fc']}
      glowColor="230 80 70"
      borderRadius={24}
      glowRadius={40}
    >
      <div className="flex flex-col h-[520px] relative text-left overflow-hidden rounded-3xl">
      {/* Mock Header Bar */}
      <div className="px-4 py-3 sm:px-6 border-b border-(--border) bg-(--bg-secondary) flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-xs font-semibold text-(--text-muted) ml-2 border-l border-(--border) pl-4">Interactive App Demo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-(--online) animate-pulse" />
          <span className="text-xs text-(--text-muted) font-medium">Pulse Sandbox v1.4</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Mock Sidebar */}
        <div className="w-64 border-r border-(--border) bg-(--bg-secondary) hidden sm:flex flex-col">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                disabled 
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-(--bg-tertiary) border border-(--border) text-xs text-(--text-primary) placeholder-(--text-muted) cursor-not-allowed"
              />
            </div>
          </div>
          
          <div className="flex-1 px-2 space-y-1 overflow-y-auto">
            {/* Contact 1 */}
            <button 
              onClick={() => setActiveTab('aman')}
              className={`w-full flex items-center gap-3 p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'aman' 
                  ? 'bg-(--accent-glow) text-(--accent)' 
                  : 'hover:bg-(--bg-hover) text-(--text-primary)'
              }`}
            >
              <Image 
                src="https://api.dicebear.com/9.x/initials/svg?seed=Aman" 
                alt="Aman" 
                width={32}
                height={32}
                unoptimized
                className="rounded-full bg-(--bg-hover)"
              />
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-xs font-semibold truncate">Aman R. Thakur</p>
                  <span className="text-[9px] text-(--text-muted) flex-shrink-0">11:25 AM</span>
                </div>
                <p className="text-[10px] text-(--text-secondary) truncate">It is super polished. The...</p>
              </div>
            </button>

            {/* Contact 2 */}
            <button 
              onClick={() => setActiveTab('alice')}
              className={`w-full flex items-center gap-3 p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'alice' 
                  ? 'bg-(--accent-glow) text-(--accent)' 
                  : 'hover:bg-(--bg-hover) text-(--text-primary)'
              }`}
            >
              <Image 
                src="https://api.dicebear.com/9.x/initials/svg?seed=Alice" 
                alt="Alice" 
                width={32}
                height={32}
                unoptimized
                className="rounded-full bg-(--bg-hover)"
              />
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-xs font-semibold truncate">Alice</p>
                  <span className="text-[9px] text-(--text-muted) flex-shrink-0">09:18 AM</span>
                </div>
                <p className="text-[10px] text-(--text-secondary) truncate">Perfect, see you in the...</p>
              </div>
            </button>
          </div>
        </div>

        {/* Mock Chat View */}
        <div className="flex-1 flex flex-col bg-(--bg-primary) overflow-hidden relative">
          {/* Header */}
          <div className="px-4 py-3 border-b border-(--border) bg-(--bg-secondary)/60 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${activeTab === 'aman' ? 'Aman' : 'Alice'}`} 
                alt="Contact" 
                width={36}
                height={36}
                unoptimized
                className="rounded-full bg-(--bg-hover)"
              />
              <div>
                <p className="text-xs font-bold text-(--text-primary)">
                  {activeTab === 'aman' ? 'Aman R. Thakur' : 'Alice'}
                </p>
                <p className="text-[10px] text-(--success) font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--online) inline-block" />
                  Active now
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 flex flex-col justify-end">
            <div className="flex-1 flex flex-col justify-end space-y-3">
              {messages[activeTab].map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                  <BorderGlow
                    className="max-w-[80%]"
                    backgroundColor={msg.type === 'sent' ? 'var(--accent)' : 'var(--bg-secondary)'}
                    colors={msg.type === 'sent' ? ['#e0e7ff', '#ffffff', '#c7d2fe'] : ['#818cf8', '#c084fc', '#f472b6']}
                    glowColor={msg.type === 'sent' ? "220 80 80" : "260 70 60"}
                    borderRadius={18}
                    glowRadius={15}
                    glowIntensity={0.6}
                    edgeSensitivity={20}
                  >
                    <div className={`px-4 py-2.5 ${
                      msg.type === 'sent' 
                        ? 'text-white' 
                        : 'text-(--text-primary)'
                    }`}>
                      <p className="text-xs leading-relaxed">{msg.content}</p>
                      <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                        <span className="text-[8px]">{msg.time}</span>
                        {msg.type === 'sent' && <CheckCheck className="w-3 h-3 text-sky-200" />}
                      </div>
                    </div>
                  </BorderGlow>
                </div>
              ))}


            </div>
          </div>

          {/* Floating Pill Message Input Mockup */}
          <form onSubmit={handleSendMockMessage} className="p-4 bg-transparent relative z-10 flex-shrink-0">
            <div className="flex items-center gap-2 p-2 px-3 rounded-full bg-(--bg-secondary) border border-(--border) shadow-lg focus-within:border-(--accent) focus-within:ring-1 focus-within:ring-(--accent)/35 transition-all">
              <button 
                type="button"
                onClick={() => setDemoSender(s => s === 'you' ? 'other' : 'you')}
                className={`flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all ${
                  demoSender === 'you' 
                    ? 'bg-(--accent) text-white shadow-md shadow-(--accent-glow)' 
                    : 'bg-(--bg-hover) text-(--text-primary) border border-(--border)'
                }`}
                title="Toggle sender"
              >
                Send as: {demoSender === 'you' ? 'You' : (activeTab === 'aman' ? 'Aman' : 'Alice')}
              </button>
              <input 
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type a test message & press Enter..."
                className="flex-1 bg-transparent border-0 outline-none text-xs text-(--text-primary) placeholder-(--text-muted) px-2"
              />
              <button type="button" className="p-1.5 rounded-full hover:bg-(--bg-hover) text-(--text-secondary) transition-colors hidden sm:block">
                <Smile className="w-4 h-4" />
              </button>
              <button 
                type="submit" 
                disabled={!inputVal.trim()}
                className="p-2 rounded-full bg-(--accent) text-white hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </BorderGlow>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
    loadUser();
  }, [loadUser]);

  return (
    <div className="min-h-screen bg-(--bg-primary) flex flex-col font-sans overflow-x-hidden selection:bg-(--accent) selection:text-white">
      {/* Background glow animations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-(--accent-glow) rounded-full blur-[140px] -z-10 animate-pulse duration-[6000ms]" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-[140px] -z-10" />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-(--bg-secondary)/60 backdrop-blur-xl border-b border-(--border) px-4 py-3.5 sm:px-6 sm:py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Pulse Logo" width={36} height={36} className="rounded-xl shadow-lg shadow-(--accent-glow)" />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-(--text-primary)">Pulse Chat</span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="#features" className="hidden sm:inline-block text-xs sm:text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
              Features
            </Link>
            <Link href="#seo-info" className="hidden sm:inline-block text-xs sm:text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
              About
            </Link>
            {isMounted && !isLoading ? (
              <Link href={isAuthenticated ? "/chat" : "/login"}>
                <button className="px-5 py-2 rounded-full cursor-pointer bg-(--accent) hover:bg-(--accent-hover) text-white font-medium shadow-md transition-all text-xs sm:text-sm active:scale-95">
                  {isAuthenticated ? "Go to Chat" : "Sign In"}
                </button>
              </Link>
            ) : (
              <div className="w-16 h-8 shimmer rounded-full" />
            )}
          </nav>
        </div>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-28 pb-12 sm:pt-36 sm:pb-24 px-4 text-center">
        <div className="max-w-4xl w-full slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-(--bg-tertiary) border border-(--border) text-(--accent) text-xs font-semibold mb-6">
            <Shield className="w-3.5 h-3.5" />
            <span>True Cryptographic End-to-End Encryption</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-6 leading-tight text-(--text-primary)">
            Connect <span className="text-gradient font-black">Securely.</span> <br />
            Chat in Real-Time.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-(--text-secondary) mb-8 max-w-2xl mx-auto leading-relaxed">
            A minimalist, blazing-fast web messaging platform modeled for absolute privacy. No middleware tracking. Your keys remain yours.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href={isAuthenticated ? "/chat" : "/register"}>
              <button className="px-7 py-3.5 rounded-full cursor-pointer bg-(--accent) hover:bg-(--accent-hover) text-white font-bold text-sm sm:text-base hover:scale-105 active:scale-95 shadow-xl shadow-(--accent-glow) transition-all flex items-center gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="#demo">
              <button className="px-7 py-3.5 rounded-full cursor-pointer bg-(--bg-secondary) border border-(--border) hover:bg-(--bg-hover) text-(--text-primary) font-semibold text-sm sm:text-base transition-all">
                Try Demo
              </button>
            </Link>
          </div>
        </div>

        {/* Live Mockup Area */}
        <section id="demo" className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-8 mb-24 slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <div className="text-center mb-6">
            <h2 className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mb-1">Live Sandbox Preview</h2>
            <p className="text-sm text-(--text-secondary)">Experience the elegant floating message bar and bubble design</p>
          </div>
          <ChatPreviewMockup />
        </section>

        {/* Feature Cards Grid Section */}
        <section id="features" className="w-full max-w-7xl mx-auto px-4 py-8 mb-24 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm uppercase tracking-widest text-(--accent) font-extrabold mb-2">Modern Architecture</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-(--text-primary) tracking-tight">Built on Privacy & Speed</p>
            <p className="text-sm text-(--text-secondary) mt-3">Every component is tuned for performance, safety, and visual premium feel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <BorderGlow
              backgroundColor="var(--bg-secondary)"
              borderRadius={24}
              glowColor="200 80 70"
              colors={['#38bdf8', '#0ea5e9', '#7dd3fc']}
              glowRadius={35}
              glowIntensity={0.8}
              edgeSensitivity={25}
            >
              <div className="p-8 text-left">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-6 border border-sky-500/20">
                  <Lock className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-(--text-primary)">Military-Grade Encryption</h3>
                <p className="text-xs leading-relaxed text-(--text-secondary)">
                  Natively uses client-side RSA-OAEP & AES-GCM algorithms. Zero server-side unencrypted logs. Absolute privacy for direct messaging.
                </p>
              </div>
            </BorderGlow>

            {/* Feature 2 */}
            <BorderGlow
              backgroundColor="var(--bg-secondary)"
              borderRadius={24}
              glowColor="38 80 70"
              colors={['#fbbf24', '#f59e0b', '#fcd34d']}
              glowRadius={35}
              glowIntensity={0.8}
              edgeSensitivity={25}
            >
              <div className="p-8 text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-(--text-primary)">Instant Delivery</h3>
                <p className="text-xs leading-relaxed text-(--text-secondary)">
                  Harnesses WebSockets (Socket.IO) for real-time dispatch, active user tracking, online indicators, and fluid typing receipts.
                </p>
              </div>
            </BorderGlow>

            {/* Feature 3 */}
            <BorderGlow
              backgroundColor="var(--bg-secondary)"
              borderRadius={24}
              glowColor="330 80 70"
              colors={['#f472b6', '#ec4899', '#f9a8d4']}
              glowRadius={35}
              glowIntensity={0.8}
              edgeSensitivity={25}
            >
              <div className="p-8 text-left">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 border border-pink-500/20">
                  <ImageIcon className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-(--text-primary)">Fluid Media & Files</h3>
                <p className="text-xs leading-relaxed text-(--text-secondary)">
                  Drag-and-drop file transfers, image thumbnails, and audio voice messages are supported natively in modern formatted previews.
                </p>
              </div>
            </BorderGlow>

            {/* Feature 4 */}
            <BorderGlow
              backgroundColor="var(--bg-secondary)"
              borderRadius={24}
              glowColor="245 75 70"
              colors={['#818cf8', '#6366f1', '#a5b4fc']}
              glowRadius={35}
              glowIntensity={0.8}
              edgeSensitivity={25}
            >
              <div className="p-8 text-left">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-(--text-primary)">Encrypted Group Chat</h3>
                <p className="text-xs leading-relaxed text-(--text-secondary)">
                  Instantly spawn multi-user group chat conversations. Manage participants dynamically with cryptographically linked identities.
                </p>
              </div>
            </BorderGlow>

            {/* Feature 5 */}
            <BorderGlow
              backgroundColor="var(--bg-secondary)"
              borderRadius={24}
              glowColor="155 75 65"
              colors={['#34d399', '#10b981', '#6ee7b7']}
              glowRadius={35}
              glowIntensity={0.8}
              edgeSensitivity={25}
            >
              <div className="p-8 text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-(--text-primary)">Live Status Tracking</h3>
                <p className="text-xs leading-relaxed text-(--text-secondary)">
                  Observe read statuses, typing states, and online timelines directly. Real-time visual status updates keep you connected seamlessly.
                </p>
              </div>
            </BorderGlow>

            {/* Feature 6 */}
            <BorderGlow
              backgroundColor="var(--bg-secondary)"
              borderRadius={24}
              glowColor="270 75 70"
              colors={['#c084fc', '#a855f7', '#d8b4fe']}
              glowRadius={35}
              glowIntensity={0.8}
              edgeSensitivity={25}
            >
              <div className="p-8 text-left">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                  <Smartphone className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-(--text-primary)">Fluid Adaptability</h3>
                <p className="text-xs leading-relaxed text-(--text-secondary)">
                  Responsive screen grids adjust gracefully from layout headers to message drawers, on mobile, tablets, or multi-screen monitors.
                </p>
              </div>
            </BorderGlow>
          </div>
        </section>

        {/* Informative Architectural / SEO Section */}
        <section id="seo-info" className="w-full max-w-7xl mx-auto px-4 py-8 mb-20 scroll-mt-24">
          <div className="rounded-3xl border border-(--border) bg-(--bg-secondary) p-8 sm:p-12 text-left relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-(--accent-glow) rounded-full blur-[100px] -z-10 opacity-70" />
            
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
              <div className="space-y-6">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">Secure Messaging Blueprint</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-(--text-primary) tracking-tight">
                  Privacy-first chat app built for secure communication, rapid dispatch, and lightweight performance.
                </h2>
                <p className="text-sm text-(--text-secondary) leading-relaxed">
                  Pulse Chat brings together state-of-the-art client-side encryption and modern web technologies to solve the user search intent for private, fast communication. By handling private key creation sandbox-side in the browser, users can rest assured that no data leaks occur at intermediate points in the routing chain.
                </p>
                <p className="text-sm text-(--text-secondary) leading-relaxed">
                  Designed explicitly with mobile accessibility and SEO architecture in mind, the platform provides indexable public portals, lightweight bundles, clean layout landmarks, and robust semantic metadata tags.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-(--border) bg-(--bg-tertiary) p-5">
                  <h3 className="text-sm font-bold text-(--text-primary) mb-2">Intent Alignment</h3>
                  <p className="text-xs text-(--text-secondary) leading-relaxed">Secure, encrypted messaging, 1-on-1 private rooms, and multi-user encryption groups.</p>
                </div>
                <div className="rounded-2xl border border-(--border) bg-(--bg-tertiary) p-5">
                  <h3 className="text-sm font-bold text-(--text-primary) mb-2">Technical Core</h3>
                  <p className="text-xs text-(--text-secondary) leading-relaxed">Under 1.5s load times, JSON-LD schemas, high-fidelity responsive layout wrappers.</p>
                </div>
                <div className="rounded-2xl border border-(--border) bg-(--bg-tertiary) p-5">
                  <h3 className="text-sm font-bold text-(--text-primary) mb-2">Cryptographic Seal</h3>
                  <p className="text-xs text-(--text-secondary) leading-relaxed">Browser-side keys, encrypted asset blobs, and signed message verifications.</p>
                </div>
                <div className="rounded-2xl border border-(--border) bg-(--bg-tertiary) p-5">
                  <h3 className="text-sm font-bold text-(--text-primary) mb-2">SEO Landmarks</h3>
                  <p className="text-xs text-(--text-secondary) leading-relaxed">Accessible internal portals, XML sitemaps, semantic tags, and search engine crawling guides.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-(--border) py-12 mt-12 bg-(--bg-secondary)/40 backdrop-blur-xl relative overflow-hidden">
        {/* Powered By */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="text-center mb-6">
            <h4 className="text-[10px] sm:text-xs font-bold tracking-widest text-(--text-muted) uppercase">Powered by Modern Standards</h4>
          </div>
          <div className="flex justify-center opacity-90 pb-8">
            <Dock 
              panelHeight={60}
              baseItemSize={44}
              magnification={70}
              items={[
                { icon: <span className="font-black text-sm text-white/90 tracking-tighter">Nx</span>, label: 'Next.js 16' },
                { icon: <span className="font-black text-sm text-[#61dafb] tracking-tighter">Re</span>, label: 'React 19' },
                { icon: <span className="font-black text-sm text-[#38bdf8] tracking-tighter">Tw</span>, label: 'Tailwind CSS' },
                { icon: <Zap className="w-5 h-5 text-amber-400" />, label: 'WebSockets' },
                { icon: <span className="font-black text-sm text-[#68a063] tracking-tighter">No</span>, label: 'Node.js' },
                { icon: <span className="font-black text-sm text-[#47A248] tracking-tighter">Mg</span>, label: 'MongoDB' }
              ]}
            />
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-(--border) to-transparent mb-8" />

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-xs text-(--text-muted)">
            <MessageCircle className="w-4 h-4 text-(--accent)" />
            <span>© 2026 Pulse Chat Application. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs font-medium text-(--text-secondary)">
            <Link href="/privacy" className="hover:text-(--text-primary) transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-(--text-primary) transition-colors">
              Terms of Service
            </Link>
            <Link href="/seo-guide" className="hover:text-(--text-primary) transition-colors">
              SEO Guide
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
