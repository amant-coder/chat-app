'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { formatLastSeen, formatMessageTime } from '@/lib/utils';
import api from '@/lib/api';
import { Message } from '@/types';

export default function ChatHeader() {
  const activeConversation = useChatStore((s) => s.activeConversation);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const currentUser = useAuthStore((s) => s.user);
  const setUserSearchOpen = useUIStore((s) => s.setUserSearchOpen);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!activeConversation) return null;

  const otherUser = activeConversation.type === 'direct'
    ? activeConversation.participants.find((p) => p._id !== currentUser?._id)
    : null;

  const isGroup = activeConversation.type === 'group';
  const headerName = isGroup ? activeConversation.name : otherUser?.username;
  const headerAvatar = isGroup
    ? (activeConversation.avatar || `https://api.dicebear.com/9.x/identicon/svg?seed=${activeConversation._id}`)
    : (otherUser?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${otherUser?.username}`);
  const headerSub = isGroup
    ? `${activeConversation.participants.length} members`
    : null;

  const isTyping = otherUser
    ? typingUsers[`${activeConversation._id}:${otherUser._id}`]
    : false;

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setSearchResults([]); return; }

    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get<{ messages: Message[] }>(
          `/messages/${activeConversation._id}/search`,
          { params: { q } }
        );
        setSearchResults(data.messages);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, [activeConversation._id]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex-shrink-0">
      {/* Main header row */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-(--border) bg-(--bg-secondary)/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* Back button (Mobile only) */}
          <div className="flex items-center md:hidden -ml-2 mr-1">
            <button
              onClick={() => useChatStore.getState().setActiveConversation(null)}
              className="p-2 rounded-xl hover:bg-(--bg-hover) transition-colors text-(--text-secondary)"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Avatar */}
          <div className="relative">
            <img
              src={headerAvatar}
              alt=""
              className="w-10 h-10 rounded-full bg-(--bg-hover) object-cover"
            />
            {!isGroup && otherUser?.status === 'online' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-(--online) rounded-full border-2 border-(--bg-secondary)" />
            )}
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-(--text-primary)">{headerName || 'Unknown'}</h3>
            <p className="text-xs text-(--text-muted)">
              {isGroup ? (
                <span>{headerSub}</span>
              ) : isTyping ? (
                <span className="text-(--accent-secondary) flex items-center gap-1">
                  typing
                  <span className="typing-dots"><span /><span /><span /></span>
                </span>
              ) : otherUser?.status === 'online' ? (
                <span className="text-(--online)">Online</span>
              ) : otherUser?.lastSeen ? (
                formatLastSeen(otherUser.lastSeen)
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isGroup && activeConversation.admins?.includes(currentUser?._id || '') && (
            <button
              onClick={() => setUserSearchOpen(true, 'add_to_group', activeConversation._id)}
              className="p-2 rounded-xl transition-colors hover:bg-(--bg-hover) text-(--text-secondary)"
              title="Add Participant"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen((o) => !o)}
            className={`p-2 rounded-xl transition-colors ${isSearchOpen ? 'bg-(--accent)/10 text-(--accent)' : 'hover:bg-(--bg-hover) text-(--text-secondary)'}`}
            title="Search messages"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search panel */}
      {isSearchOpen && (
        <div className="border-b border-(--border) bg-(--bg-secondary) px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-(--bg-tertiary) border border-(--border) rounded-xl">
            <svg className="w-4 h-4 text-(--text-muted) flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search messages…"
              className="flex-1 bg-transparent text-sm text-(--text-primary) placeholder-(--text-muted) outline-none"
            />
            {isSearching && (
              <div className="w-4 h-4 border-2 border-(--accent) border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
            <button onClick={closeSearch} className="text-(--text-muted) hover:text-(--text-primary) flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-(--border) divide-y divide-(--border)">
              {searchResults.map((msg) => (
                <div key={msg._id} className="px-3 py-2 hover:bg-(--bg-hover) transition-colors">
                  <p className="text-xs text-(--text-muted) mb-0.5">{formatMessageTime(msg.createdAt)}</p>
                  <p className="text-sm text-(--text-primary) line-clamp-2">{msg.content}</p>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !isSearching && searchResults.length === 0 && (
            <p className="text-xs text-(--text-muted) text-center py-2">
              No messages found
              {activeConversation.type === 'direct' && (
                <span className="block mt-0.5 opacity-60">(Encrypted messages cannot be searched server-side)</span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
