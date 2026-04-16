'use client';

import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

import { formatLastSeen } from '@/lib/utils';

export default function ChatHeader() {
  const activeConversation = useChatStore((s) => s.activeConversation);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const currentUser = useAuthStore((s) => s.user);


  if (!activeConversation) return null;

  const otherUser = activeConversation.participants.find((p) => p._id !== currentUser?._id);
  const isTyping = typingUsers[`${activeConversation._id}:${otherUser?._id}`];

  return (
    <div className="h-16 flex items-center justify-between px-4 border-b border-(--border) bg-(--bg-secondary)/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Back button (Mobile only) */}
        <div className="flex items-center md:hidden -ml-2 mr-1">
          <button
            onClick={() => {
              useChatStore.getState().setActiveConversation(null);
            }}
            className="p-2 rounded-xl hover:bg-(--bg-hover) transition-colors text-(--text-secondary)"
            aria-label="Back to conversations"
            title="Back to conversations"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Avatar */}
        <div className="relative">
          <img
            src={otherUser?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${otherUser?.username}`}
            alt=""
            className="w-10 h-10 rounded-full bg-(--bg-hover)"
          />
          {otherUser?.status === 'online' && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-(--online) rounded-full border-2 border-(--bg-secondary)" />
          )}
        </div>

        {/* User info */}
        <div>
          <h3 className="text-sm font-semibold text-(--text-primary)">
            {otherUser?.username || 'Unknown'}
          </h3>
          <p className="text-xs text-(--text-muted)">
            {isTyping ? (
              <span className="text-(--accent-secondary) flex items-center gap-1">
                typing
                <span className="typing-dots">
                  <span></span><span></span><span></span>
                </span>
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
        <button className="p-2 rounded-xl hover:bg-(--bg-hover) transition-colors" title="Search messages">
          <svg className="w-5 h-5 text-(--text-secondary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
