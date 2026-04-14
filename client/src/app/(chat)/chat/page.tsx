'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import UserSearchModal from '@/components/chat/UserSearchModal';

export default function ChatPage() {
  const { user, isLoading } = useAuth(true);
  const fetchConversations = useChatStore((s) => s.fetchConversations);
  const activeConversation = useChatStore((s) => s.activeConversation);
  const isUserSearchOpen = useUIStore((s) => s.isUserSearchOpen);
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const isConnected = useUIStore((s) => s.isConnected);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--bg-primary)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-(--accent) border-t-transparent rounded-full animate-spin" />
          <p className="text-(--text-secondary)">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-(--bg-primary) overflow-hidden">
      {/* Connection status bar */}
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-[slideDown_0.3s_ease-out]">
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 
            border-b border-amber-500/20 backdrop-blur-xl px-4 py-2.5">
            <div className="flex items-center justify-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-6 h-6 bg-amber-400/20 rounded-full animate-ping" />
                <svg className="w-4 h-4 text-amber-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M8.464 8.464a5 5 0 000 7.072" />
                  <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" strokeWidth={2.5} className="text-amber-500" />
                </svg>
              </div>
              <span className="text-amber-200/90 text-sm font-medium tracking-wide">
                Connection lost — reconnecting
              </span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 z-40 h-full transition-transform duration-300 ease-in-out`}
      >
        <ChatSidebar />
      </div>

      {/* Sidebar overlay on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-(--bg-tertiary) mb-6">
                <svg className="w-10 h-10 text-(--text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-(--text-primary) mb-2">
                Welcome to Pulse Chat
              </h2>
              <p className="text-(--text-secondary) max-w-md">
                Select a conversation from the sidebar or start a new one to begin chatting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Search Modal */}
      {isUserSearchOpen && <UserSearchModal />}
    </div>
  );
}
