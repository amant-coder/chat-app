'use client';

import React, { useState, useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
import api from '@/lib/api';

export default function UserSearchModal() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const setUserSearchOpen = useUIStore((s) => s.setUserSearchOpen);
  const startConversation = useChatStore((s) => s.startConversation);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const addToast = useUIStore((s) => s.addToast);

  const handleSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      setSearchError(null);

      if (q.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data } = await api.get<User[]>('/auth/users/search', {
          params: { q: q.trim() },
        });
        setResults(data);
      } catch (error: any) {
        console.error('Search error:', error);
        setResults([]);
        setSearchError(error?.response?.data?.error || 'Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const handleSelectUser = async (user: User) => {
    try {
      const conversation = await startConversation(user._id);
      setActiveConversation(conversation);
      await fetchMessages(conversation._id);
      setUserSearchOpen(false);
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to start conversation', 'error');
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const isLikelySelfQuery =
    !!user &&
    normalizedQuery.length >= 2 &&
    (user.username.toLowerCase().includes(normalizedQuery) || user.email.toLowerCase().includes(normalizedQuery));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setUserSearchOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-panel rounded-2xl overflow-hidden slide-up shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-(--border)">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-(--text-primary)">New Conversation</h2>
            <button
              onClick={() => setUserSearchOpen(false)}
              className="p-1.5 rounded-lg hover:bg-(--bg-hover) transition-colors"
            >
              <svg className="w-5 h-5 text-(--text-secondary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by username or email..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-tertiary) border border-(--border)
                text-(--text-primary) placeholder-(--text-muted) text-sm
                focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/30
                transition-all duration-200"
              id="user-search-input"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-(--accent) border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-(--bg-hover) transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`}
                      alt=""
                      className="w-10 h-10 rounded-full bg-(--bg-hover)"
                    />
                    {user.status === 'online' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-(--online) rounded-full border-2 border-(--surface)" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-(--text-primary)">{user.username}</p>
                    <p className="text-xs text-(--text-muted)">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-6">
              <p className="text-sm text-red-300 mb-1">{searchError}</p>
              <p className="text-xs text-(--text-muted)">Please retry after reconnecting.</p>
            </div>
          ) : query.length >= 2 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-6">
              <svg className="w-10 h-10 text-(--text-muted) mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-(--text-secondary)">No users found</p>
              {isLikelySelfQuery && (
                <p className="text-xs text-(--text-muted) mt-1">Your own account is excluded from search.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <p className="text-sm text-(--text-muted)">
                Type at least 2 characters to search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
