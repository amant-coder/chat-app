'use client';

import React, { useState } from 'react';
import { Message } from '@/types';
import { formatMessageTime, getSenderInfo, formatFileSize } from '@/lib/utils';
import MessageStatus from './MessageStatus';
import EmojiPicker from './EmojiPicker';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  isConsecutive: boolean;
}

export default function MessageBubble({ message, isMine, isConsecutive }: MessageBubbleProps) {
  const sender = getSenderInfo(message.sender);
  const isImage = message.type === 'image' && message.fileUrl;
  const isVideo = message.type === 'video' && message.fileUrl;
  const isFile = message.type === 'file' && message.fileUrl;
  const isVoice = message.type === 'voice' && message.fileUrl;
  
  const [showPicker, setShowPicker] = useState(false);
  const toggleReaction = useChatStore((s) => s.toggleReaction);
  const currentUser = useAuthStore((s) => s.user);

  const handleReact = (emoji: string) => {
    toggleReaction(message._id, message.conversation, emoji);
    setShowPicker(false);
  };

  return (
    <div
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${
        isConsecutive ? 'mt-0.5' : 'mt-3'
      } message-enter`}
      onMouseEnter={() => setShowPicker(true)}
      onMouseLeave={() => setShowPicker(false)}
    >
      <div className={`max-w-[75%] md:max-w-[60%] ${isMine ? 'items-end' : 'items-start'} flex flex-col relative group`}>
        {/* Emoji Picker (shows on hover) */}
        {showPicker && !message.pending && !message.failed && (
          <div className={`absolute -top-10 z-10 ${isMine ? 'right-0' : 'left-0'}`}>
            <EmojiPicker onReact={handleReact} />
          </div>
        )}

        {/* Sender name for received messages */}
        {!isMine && !isConsecutive && (
          <span className="text-xs text-(--text-muted) mb-1 ml-1 font-medium">
            {sender.username}
          </span>
        )}

        <div
          className={`relative group px-4 py-2.5 ${
            isMine
              ? 'bg-(--accent) text-white rounded-2xl rounded-br-md'
              : 'bg-(--message-received) text-(--text-primary) border border-(--border) rounded-2xl rounded-bl-md'
          } ${message.pending ? 'opacity-70' : ''} ${
            message.failed ? 'border-red-500/50' : ''
          }`}
        >
          {/* Image message */}
          {isImage && (
            <div className="mb-2 -mx-2 -mt-1">
              <img
                src={message.fileUrl}
                alt={message.fileName || 'Image'}
                className="rounded-xl max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
                onClick={() => window.open(message.fileUrl, '_blank')}
              />
            </div>
          )}

          {/* Video message */}
          {isVideo && (
            <div className="mb-2 -mx-2 -mt-1 rounded-xl overflow-hidden bg-black/10 flex justify-center">
              <video
                src={message.fileUrl}
                controls
                className="max-h-64 outline-none max-w-full"
                preload="metadata"
              />
            </div>
          )}

          {/* Voice message */}
          {isVoice && (
            <div className={`flex items-center gap-3 py-1 mb-2 min-w-[200px]`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isMine ? 'bg-white/20' : 'bg-(--accent)/10'
              }`}>
                <svg className={`w-4 h-4 ${isMine ? 'text-white' : 'text-(--accent)'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              <audio
                src={message.fileUrl}
                controls
                className="flex-1 h-8 min-w-0"
                style={{ colorScheme: isMine ? 'dark' : 'light' }}
                preload="metadata"
              />
            </div>
          )}

          {/* File message */}
          {isFile && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-2 rounded-xl mb-2 transition-colors ${
                isMine
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-(--bg-tertiary) hover:bg-(--bg-hover)'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isMine ? 'bg-white/20' : 'bg-(--accent)/10'
              }`}>
                <svg className={`w-5 h-5 ${isMine ? 'text-white' : 'text-(--accent)'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{message.fileName}</p>
                {message.fileSize && (
                  <p className={`text-xs ${isMine ? 'text-white/60' : 'text-(--text-muted)'}`}>
                    {formatFileSize(message.fileSize)}
                  </p>
                )}
              </div>
            </a>
          )}

          {/* Text content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          )}

          {/* Time, pin and status */}
          <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            {message.isPinned && (
              <svg className={`w-3 h-3 ${isMine ? 'text-white/50' : 'text-(--accent)'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
              </svg>
            )}
            <span className={`text-[10px] ${
              isMine ? 'text-white/50' : 'text-(--text-muted)'
            }`}>
              {formatMessageTime(message.createdAt)}
            </span>
            {isMine && <MessageStatus status={message.status} isMine={isMine} />}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`absolute -bottom-4 ${isMine ? 'right-2' : 'left-2'} flex flex-wrap gap-1 z-10`}>
              {message.reactions.map((r, i) => {
                const iReacted = currentUser && r.users.includes(currentUser._id);
                return (
                  <button
                    key={`${r.emoji}-${i}`}
                    onClick={() => handleReact(r.emoji)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border cursor-pointer hover:scale-105 transition-transform ${
                      iReacted
                        ? isMine 
                          ? 'bg-(--reaction-bg-mine) border-(--reaction-border-mine) text-white' 
                          : 'bg-(--reaction-bg) border-(--reaction-border) text-(--text-primary)'
                        : isMine
                          ? 'bg-black/20 border-white/10 text-white'
                          : 'bg-(--bg-secondary) border-(--border) text-(--text-primary)'
                    }`}
                  >
                    <span>{r.emoji}</span>
                    <span className="font-medium text-[10px] opacity-80">{r.users.length}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
