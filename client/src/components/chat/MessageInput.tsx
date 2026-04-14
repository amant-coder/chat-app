'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useTyping } from '@/hooks/useChat';
import { useUIStore } from '@/stores/uiStore';
import api from '@/lib/api';
import FilePreview from './FilePreview';

export default function MessageInput() {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = useChatStore((s) => s.activeConversation);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const addToast = useUIStore((s) => s.addToast);
  const { startTyping, stopTyping } = useTyping(activeConversation?._id);

  const handleSend = useCallback(async () => {
    if (!activeConversation) return;
    const trimmed = message.trim();

    // Handle file upload
    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const { data } = await api.post('/upload', formData);

        const isImage = selectedFile.type.startsWith('image/');
        const isVideo = selectedFile.type.startsWith('video/');
        sendMessage(
          activeConversation._id,
          trimmed || (isImage ? '📷 Image' : isVideo ? '🎥 Video' : `📎 ${selectedFile.name}`),
          isImage ? 'image' : isVideo ? 'video' : 'file',
          {
            fileUrl: data.url,
            fileName: data.fileName,
            fileSize: data.fileSize,
          }
        );

        setSelectedFile(null);
        setMessage('');
      } catch (error) {
        addToast('Failed to upload file. Please try again.', 'error');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Handle text message
    if (!trimmed) return;
    sendMessage(activeConversation._id, trimmed, 'text');
    setMessage('');
    stopTyping();

    // Focus input
    inputRef.current?.focus();
  }, [message, selectedFile, activeConversation, sendMessage, stopTyping, addToast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    startTyping();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      addToast('File size must be less than 10MB', 'error');
      return;
    }

    setSelectedFile(file);
    e.target.value = '';
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (!blob) return;

        // Validate file size (10MB)
        if (blob.size > 10 * 1024 * 1024) {
          addToast('Pasted image is too large (max 10MB)', 'error');
          return;
        }

        // Create a proper File with a readable name
        const ext = blob.type.split('/')[1] || 'png';
        const fileName = `pasted-image-${Date.now()}.${ext}`;
        const file = new File([blob], fileName, { type: blob.type });

        setSelectedFile(file);
        return;
      }
    }
  }, [addToast]);

  if (!activeConversation) return null;

  return (
    <div className="border-t border-(--border) bg-(--bg-secondary)/80 backdrop-blur-xl">
      {/* File preview */}
      {selectedFile && (
        <FilePreview
          file={selectedFile}
          onRemove={() => setSelectedFile(null)}
        />
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 p-4">
        {/* File attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2.5 rounded-xl hover:bg-(--bg-hover) transition-colors flex-shrink-0 mb-0.5"
          title="Attach file"
          id="attach-file-btn"
        >
          <svg className="w-5 h-5 text-(--text-secondary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/mp4,.pdf,.doc,.docx,.txt"
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-3 rounded-2xl bg-(--bg-tertiary) border border-(--border)
              text-(--text-primary) placeholder-(--text-muted) resize-none
              focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/30
              transition-all duration-200 text-sm max-h-32"
            style={{
              height: 'auto',
              minHeight: '44px',
              overflow: message.split('\n').length > 4 ? 'auto' : 'hidden',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
            id="message-input"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || isUploading}
          className="p-2.5 rounded-xl bg-(--accent) text-white
            hover:bg-(--accent-hover) disabled:opacity-30 disabled:cursor-not-allowed
            transition-all duration-200 flex-shrink-0 mb-0.5
            active:scale-95 shadow-lg shadow-(--accent)/20"
          id="send-message-btn"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
