'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow() {
  const activeConversation = useChatStore((s) => s.activeConversation);
  const messages = useChatStore((s) => s.messages);
  const hasMore = useChatStore((s) => s.hasMoreMessages);
  const loadMoreMessages = useChatStore((s) => s.loadMoreMessages);
  const markAsRead = useChatStore((s) => s.markAsRead);
  const isLoading = useChatStore((s) => s.isLoadingMessages);
  const currentUser = useAuthStore((s) => s.user);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const conversationId = activeConversation?._id || '';
  const conversationMessages = messages[conversationId] || [];
  const hasMoreMessages = hasMore[conversationId] || false;

  useInfiniteScroll(
    containerRef,
    () => loadMoreMessages(conversationId),
    hasMoreMessages
  );

  // State to hold the first unread message ID for this session (so divider doesn't vanish instantly)
  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);

  useEffect(() => {
    // When conversation changes or messages load initially, determine first unread
    if (conversationMessages.length > 0 && currentUser && isInitialLoad.current) {
      const unreadMsgs = conversationMessages.filter(m => {
        const senderId = typeof m.sender === 'string' ? m.sender : m.sender._id;
        return senderId !== currentUser._id && m.status !== 'read';
      });
      if (unreadMsgs.length > 0) {
        setFirstUnreadId(unreadMsgs[0]._id);
      } else {
        setFirstUnreadId(null);
      }
    }
  }, [conversationId, conversationMessages, currentUser]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (conversationMessages.length > 0) {
      if (isInitialLoad.current) {
        messagesEndRef.current?.scrollIntoView();
        isInitialLoad.current = false;
      } else {
        // Only auto-scroll if near bottom
        const container = containerRef.current;
        if (container) {
          const isNearBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight < 150;
          if (isNearBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }
  }, [conversationMessages.length]);

  // Reset initial load when conversation changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [conversationId]);

  // Mark messages as read
  useEffect(() => {
    if (conversationId && conversationMessages.length > 0) {
      if (document.visibilityState === 'visible') {
        markAsRead(conversationId);
      }
    }
  }, [conversationId, conversationMessages.length, markAsRead]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && conversationId && conversationMessages.length > 0) {
        markAsRead(conversationId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [conversationId, conversationMessages.length, markAsRead]);

  if (!activeConversation) return null;

  const formatDividerDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const groupedMessages: { date: string; messages: typeof conversationMessages }[] = [];
  let currentDate = '';

  conversationMessages.forEach((msg) => {
    const msgDate = formatDividerDate(msg.createdAt);

    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader />

      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ scrollBehavior: 'auto' }}
      >
        {/* Loading older messages */}
        {hasMoreMessages && (
          <div className="flex justify-center py-3">
            <div className="w-6 h-6 border-2 border-(--accent) border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isLoading && conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-(--accent) border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 rounded-full bg-(--bg-tertiary) text-xs text-(--text-muted)">
                  {group.date}
                </div>
              </div>

              {/* Messages */}
              {group.messages.map((message, idx) => {
                const senderId = typeof message.sender === 'string'
                  ? message.sender
                  : message.sender._id;
                const isMine = senderId === currentUser?._id;
                const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                const prevSenderId = prevMsg
                  ? typeof prevMsg.sender === 'string'
                    ? prevMsg.sender
                    : prevMsg.sender._id
                  : null;
                const isConsecutive = prevSenderId === senderId;
                const showUnreadDivider = message._id === firstUnreadId;

                return (
                  <React.Fragment key={message._id}>
                    {showUnreadDivider && (
                      <div className="flex items-center justify-center my-4">
                        <div className="flex-1 h-px bg-red-500/20 max-w-[200px]"></div>
                        <div className="px-3 py-1 rounded-full bg-red-500/10 text-xs font-medium text-red-500">
                          Unread Messages
                        </div>
                        <div className="flex-1 h-px bg-red-500/20 max-w-[200px]"></div>
                      </div>
                    )}
                    <MessageBubble
                      message={message}
                      isMine={isMine}
                      isConsecutive={isConsecutive && !showUnreadDivider}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          ))
        )}

        <TypingIndicator />
        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </div>
  );
}
