'use client';

import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

export default function TypingIndicator() {
  const activeConversation = useChatStore((s) => s.activeConversation);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const currentUser = useAuthStore((s) => s.user);

  if (!activeConversation) return null;

  const otherUser = activeConversation.participants.find((p) => p._id !== currentUser?._id);
  const isTyping = otherUser ? typingUsers[`${activeConversation._id}:${otherUser._id}`] : false;

  if (!isTyping) return null;

  return (
    <div className="flex items-end gap-2 py-2 px-1 fade-in mt-1">
      <img
        src={otherUser?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${otherUser?.username}`}
        alt={otherUser?.username}
        className="w-7 h-7 rounded-full bg-(--bg-hover) shadow-sm shrink-0"
      />
      <div className="px-3 py-2.5 rounded-2xl rounded-bl-md bg-(--message-received) border border-(--border) shadow-md">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
