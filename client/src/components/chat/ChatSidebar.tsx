'use client';

import React, { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Conversation } from '@/types';
import { formatConversationTime } from '@/lib/utils';
import ThemeToggle from '@/components/layout/ThemeToggle';
import Image from 'next/image';

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

  const [searchFilter, setSearchFilter] = useState('');

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const getOtherUser = (conversation: Conversation) => {
    return conversation.participants.find((p) => p._id !== currentUser?._id);
  };

  const filteredConversations = searchFilter.trim()
    ? conversations.filter((conv) => {
        const name = conv.type === 'group' ? conv.name : getOtherUser(conv)?.username;
        return name?.toLowerCase().includes(searchFilter.toLowerCase());
      })
    : conversations;

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
      <div className="p-3 sm:p-4 border-b border-(--border) flex-shrink-0 bg-(--bg-secondary)">
        <div className="flex items-center justify-between mb-3">
          {/* Title + total unread badge */}
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Pulse Logo" width={32} height={32} className="w-8 h-8 rounded-xl shadow-md" />
            <h1 className="text-xl font-bold tracking-tight text-gradient">Pulse</h1>
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
              className="p-2 rounded-full hover:bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary) transition-all active:scale-90"
              title="Create group"
              id="new-group-btn"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button
              onClick={() => setUserSearchOpen(true)}
              className="p-2 rounded-full hover:bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary) transition-all active:scale-90"
              title="New conversation"
              id="new-chat-btn"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-(--bg-hover) text-(--text-secondary) hover:text-red-500 transition-all active:scale-90"
              title="Logout"
              id="logout-btn"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Current user card */}
        <button 
          onClick={() => setProfileOpen(true)}
          className="w-full flex items-center gap-3 p-2 px-3 rounded-full bg-(--bg-tertiary) hover:bg-(--bg-hover) transition-all duration-200 text-left group"
        >
          <div className="relative">
            <Image
              src={currentUser?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${currentUser?.username}`}
              alt=""
              width={32}
              height={32}
              unoptimized
              className="w-8 h-8 rounded-full bg-(--bg-hover) object-cover ring-2 ring-transparent group-hover:ring-(--accent)/30 transition-all"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-(--online) rounded-full border-2 border-(--bg-secondary)" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-(--text-primary) truncate">{currentUser?.username}</p>
            <p className="text-[10px] text-(--text-muted) truncate">
              {currentUser?.statusMessage || 'Available'}
            </p>
          </div>
          <svg className="w-4 h-4 text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Search / Filter conversations */}
        <div className="mt-3 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search chats…"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-(--bg-tertiary) border border-(--border) text-(--text-primary) placeholder-(--text-muted) text-xs focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/35 transition-all"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 sm:p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-full">
                <div className="w-12 h-12 rounded-full shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded-lg shimmer" />
                  <div className="h-3 w-36 rounded-lg shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-(--bg-tertiary) flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-(--text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <p className="text-(--text-secondary) text-sm font-medium mb-1">
              {searchFilter ? 'No matching conversations' : 'No conversations yet'}
            </p>
            <p className="text-(--text-muted) text-xs mb-3">
              {searchFilter ? 'Try a different search term' : 'Start chatting with someone'}
            </p>
            {!searchFilter && (
              <button
                onClick={() => setUserSearchOpen(true)}
                className="text-sm text-(--accent) hover:text-(--accent-hover) font-semibold transition-colors"
              >
                Start a new chat →
              </button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conv) => {
              const otherUser = conv.type === 'direct' ? getOtherUser(conv) : null;
              const isActive = activeConversation?._id === conv._id;
              const name = conv.type === 'group' ? conv.name : otherUser?.username;
              const avatar = conv.type === 'group' 
                ? (conv.avatar || `https://api.dicebear.com/9.x/identicon/svg?seed=${conv._id}`)
                : (otherUser?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${otherUser?.username}`);

              // Format last message preview
              let lastMsgPreview = conv.lastMessage?.content || 'Start a conversation';
              if (conv.lastMessage?.type === 'image') lastMsgPreview = '📷 Photo';
              else if (conv.lastMessage?.type === 'video') lastMsgPreview = '🎥 Video';
              else if (conv.lastMessage?.type === 'file') lastMsgPreview = '📁 File';
              else if (conv.lastMessage?.type === 'voice') lastMsgPreview = '🎤 Voice';

              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full flex items-center gap-3 p-2.5 px-4 rounded-full transition-all duration-200 mb-1 cursor-pointer
                    ${isActive
                      ? 'bg-(--accent-glow) text-(--accent) shadow-sm'
                      : 'hover:bg-(--bg-hover) border border-transparent active:scale-[0.98]'
                    }`}
                  id={`conversation-${conv._id}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Image
                      src={avatar}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className={`w-12 h-12 rounded-full bg-(--bg-hover) object-cover ${
                        isActive ? 'ring-2 ring-(--accent)/30' : ''
                      }`}
                    />
                    {conv.type === 'direct' && otherUser?.status === 'online' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-(--online) rounded-full border-2 border-(--bg-secondary)" />
                    )}
                    {conv.type === 'group' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-(--bg-tertiary) rounded-full border-2 border-(--bg-secondary) flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-(--text-muted)" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 17v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold truncate ${
                        isActive ? 'text-(--accent)' : 'text-(--text-primary)'
                      }`}>
                        {name || 'Unknown'}
                      </span>
                      {conv.lastMessage?.timestamp && (
                        <span className={`text-[11px] flex-shrink-0 ml-2 ${
                          conv.unreadCount > 0 ? 'text-(--accent) font-semibold' : 'text-(--text-muted)'
                        }`}>
                          {formatConversationTime(conv.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-xs truncate pr-2 ${
                        conv.unreadCount > 0 ? 'text-(--text-primary) font-medium' : 'text-(--text-secondary)'
                      }`}>
                        {lastMsgPreview}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-(--accent) text-white text-xs font-bold flex items-center justify-center shadow-sm shadow-(--accent)/30">
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
