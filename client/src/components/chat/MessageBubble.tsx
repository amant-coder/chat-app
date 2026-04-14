'use client';

import React from 'react';
import { Message } from '@/types';
import { formatMessageTime, getSenderInfo, formatFileSize } from '@/lib/utils';
import MessageStatus from './MessageStatus';

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

  return (
    <div
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${
        isConsecutive ? 'mt-0.5' : 'mt-3'
      } message-enter`}
    >
      <div className={`max-w-[75%] md:max-w-[60%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
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

          {/* Time and status */}
          <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${
              isMine ? 'text-white/50' : 'text-(--text-muted)'
            }`}>
              {formatMessageTime(message.createdAt)}
            </span>
            {isMine && <MessageStatus status={message.status} isMine={isMine} />}
          </div>
        </div>
      </div>
    </div>
  );
}
