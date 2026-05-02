'use client';

import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Conversation } from '@/types';
import { formatConversationTime } from '@/lib/utils';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function ChatSidebar() {
  const conversations = useChatStore((s) => s.conversations);
  const activeConversation = useChatStore((s) => s.activeConversation);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const isLoading = useChatStore((s) => s.isLoadingConversations);
  const currentUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setUserSearchOpen = useUIStore((s) => s.setUserSearchOpen);
  const setProfileOpen = useUIStore((s) => s.setProfileOpen);
  const setGroupCreateOpen = useUIStore((s) => s.setGroupCreateOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const getOtherUser = (conversation: Conversation) => {
    return conversation.participants.find((p) => p._id !== currentUser?._id);
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await fetchMessages(conversation._id);
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-(--bg-secondary)">
      {/* Header */}
      <div className="p-4 border-b border-(--border)">
        <div className="flex items-center justify-between mb-4">
          {/* Title + total unread badge */}
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Pulse Logo" className="w-8 h-8 rounded-xl shadow-sm" />
            <h1 className="text-xl font-bold text-gradient">Pulse</h1>
            {totalUnread > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-(--danger) text-white text-xs font-bold flex items-center justify-center animate-pulse">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setGroupCreateOpen(true)}
              className="p-2 rounded-xl hover:bg-(--bg-hover) transition-colors"
              title="Create group"
              id="new-group-btn"
            >
              <svg className="w-5 h-5 text-(--text-secondary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button
              onClick={() => setUserSearchOpen(true)}
              className="p-2 rounded-xl hover:bg-(--bg-hover) transition-colors"
              title="New conversation"
              id="new-chat-btn"
            >
              <svg className="w-5 h-5 text-(--text-secondary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-(--bg-hover) transition-colors"
              title="Logout"
              id="logout-btn"
            >
              <svg className="w-5 h-5 text-(--text-secondary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Current user */}
        <button 
          onClick={() => setProfileOpen(true)}
          className="w-full flex items-center gap-3 p-2 rounded-xl bg-(--bg-tertiary) hover:bg-(--bg-hover) transition-colors text-left"
        >
          <div className="relative">
            <img
              src={currentUser?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${currentUser?.username}`}
              alt=""
              className="w-9 h-9 rounded-full bg-(--bg-hover) object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-(--online) rounded-full border-2 border-(--bg-secondary)" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-(--text-primary) truncate">{currentUser?.username}</p>
            <p className="text-xs text-(--text-muted) truncate">
              {currentUser?.statusMessage || 'Available'}
            </p>
          </div>
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <div className="w-12 h-12 rounded-full shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded shimmer" />
                  <div className="h-3 w-36 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
            <svg className="w-12 h-12 text-(--text-muted) mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <p className="text-(--text-secondary) text-sm">No conversations yet</p>
            <button
              onClick={() => setUserSearchOpen(true)}
              className="mt-3 text-sm text-(--accent) hover:text-(--accent-hover) font-medium"
            >
              Start a new chat →
            </button>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conv) => {
              const otherUser = conv.type === 'direct' ? getOtherUser(conv) : null;
              const isActive = activeConversation?._id === conv._id;
              const name = conv.type === 'group' ? conv.name : otherUser?.username;
              const avatar = conv.type === 'group' 
                ? (conv.avatar || `https://api.dicebear.com/9.x/identicon/svg?seed=${conv._id}`)
                : (otherUser?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${otherUser?.username}`);

              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mb-0.5
                    ${isActive
                      ? 'bg-(--accent)/10 border border-(--accent)/20'
                      : 'hover:bg-(--bg-hover) border border-transparent'
                    }`}
                  id={`conversation-${conv._id}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={avatar}
                      alt=""
                      className="w-12 h-12 rounded-full bg-(--bg-hover) object-cover"
                    />
                    {conv.type === 'direct' && otherUser?.status === 'online' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-(--online) rounded-full border-2 border-(--bg-secondary)" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-(--text-primary) truncate">
                        {name || 'Unknown'}
                      </span>
                      {conv.lastMessage?.timestamp && (
                        <span className="text-xs text-(--text-muted) flex-shrink-0 ml-2">
                          {formatConversationTime(conv.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-(--text-secondary) truncate">
                        {conv.lastMessage?.content || 'Start a conversation'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-(--accent) text-white text-xs font-bold flex items-center justify-center">
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
