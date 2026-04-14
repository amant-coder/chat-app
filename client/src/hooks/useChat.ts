'use client';

import { useCallback, useRef } from 'react';
import { getSocket } from '@/lib/socket';

export const useTyping = (conversationId: string | undefined) => {
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const startTyping = useCallback(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing:start', { conversationId });
    }

    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Auto-stop after 2 seconds of inactivity
    typingTimeout.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket) return;

    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('typing:stop', { conversationId });
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
  }, [conversationId]);

  return { startTyping, stopTyping };
};
