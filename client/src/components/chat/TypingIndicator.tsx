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
    <div className="flex items-center gap-2 py-2 px-1 fade-in">
      <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-(--message-received) border border-(--border)">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
