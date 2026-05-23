'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const [showScrollDown, setShowScrollDown] = useState(false);

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

  // Track scroll position for "scroll to bottom" button
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollDown(distFromBottom > 300);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // Count new unread messages for the floating badge
  const newUnreadCount = conversationMessages.filter(m => {
    const senderId = typeof m.sender === 'string' ? m.sender : m.sender._id;
    return senderId !== currentUser?._id && m.status !== 'read';
  }).length;

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <ChatHeader />

      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-1"
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
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-(--accent) border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-(--text-muted)">Loading messages…</span>
            </div>
          </div>
        ) : conversationMessages.length === 0 ? (
          /* Empty conversation state */
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-(--accent)/10 to-(--accent-secondary)/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-(--accent)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-(--text-secondary) font-medium">No messages yet</p>
              <p className="text-xs text-(--text-muted) mt-1">Say hello! 👋</p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-6">
                <div className="flex-1 h-px bg-(--border)/40 max-w-16" />
                <div className="px-4 py-1.5 rounded-full bg-(--bg-secondary) text-[10px] text-(--text-secondary) font-bold uppercase tracking-wider mx-3 shadow-sm border border-(--border)/60">
                  {group.date}
                </div>
                <div className="flex-1 h-px bg-(--border)/40 max-w-16" />
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
                      <div className="flex items-center justify-center my-5">
                        <div className="flex-1 h-px bg-red-500/20 max-w-[150px]"></div>
                        <div className="px-3 py-1 rounded-full bg-red-500/10 text-[10px] font-bold uppercase tracking-wider text-red-500 border border-red-500/20 mx-3">
                          Unread Messages
                        </div>
                        <div className="flex-1 h-px bg-red-500/20 max-w-[150px]"></div>
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

      {/* Scroll to bottom FAB */}
      {showScrollDown && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 w-10 h-10 rounded-full bg-(--bg-secondary) border border-(--border) shadow-xl flex items-center justify-center hover:bg-(--bg-hover) transition-all duration-200 z-20 active:scale-95 cursor-pointer text-(--text-secondary) hover:text-(--text-primary)"
          title="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          {newUnreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-(--accent) text-white text-[10px] font-bold flex items-center justify-center">
              {newUnreadCount > 9 ? '9+' : newUnreadCount}
            </span>
          )}
        </button>
      )}

      <MessageInput />
    </div>
  );
}
