'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { Message } from '@/types';

export const useSocket = () => {
  const addMessage = useChatStore((s) => s.addMessage);
  const updateMessageStatus = useChatStore((s) => s.updateMessageStatus);
  const updateReadReceipt = useChatStore((s) => s.updateReadReceipt);
  const setTyping = useChatStore((s) => s.setTyping);
  const updateUserStatus = useChatStore((s) => s.updateUserStatus);
  const setConnected = useUIStore((s) => s.setConnected);
  const activeSocket = useRef<any>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || activeSocket.current === socket) return;

    activeSocket.current = socket;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleMessageReceived = ({ message, tempId }: { message: Message; tempId: string | null }) => {
      addMessage(message, tempId);
    };

    const handleMessageDelivered = ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      updateMessageStatus(messageId, conversationId, 'delivered');
    };

    const handleReadUpdate = ({ conversationId, messageIds }: { conversationId: string; messageIds: string[] }) => {
      updateReadReceipt(conversationId, messageIds);
    };

    const handleTypingUpdate = ({ conversationId, userId, isTyping }: { conversationId: string; userId: string; isTyping: boolean }) => {
      setTyping(conversationId, userId, isTyping);
    };

    const handleUserStatus = ({ userId, status }: { userId: string; status: string }) => {
      updateUserStatus(userId, status);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('message:received', handleMessageReceived);
    socket.on('message:delivered', handleMessageDelivered);
    socket.on('message:read:update', handleReadUpdate);
    socket.on('typing:update', handleTypingUpdate);
    socket.on('user:status', handleUserStatus);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('message:received', handleMessageReceived);
      socket.off('message:delivered', handleMessageDelivered);
      socket.off('message:read:update', handleReadUpdate);
      socket.off('typing:update', handleTypingUpdate);
      socket.off('user:status', handleUserStatus);
      activeSocket.current = null;
    };
  }, []);
};
