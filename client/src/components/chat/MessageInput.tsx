'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useTyping } from '@/hooks/useChat';
import { useUIStore } from '@/stores/uiStore';
import api from '@/lib/api';
import FilePreview from './FilePreview';

export default function MessageInput() {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = useChatStore((s) => s.activeConversation);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const replyingToMessage = useChatStore((s) => s.replyingToMessage);
  const setReplyingToMessage = useChatStore((s) => s.setReplyingToMessage);
  const addToast = useUIStore((s) => s.addToast);
  const { startTyping, stopTyping } = useTyping(activeConversation?._id);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current?.stop();
    };
  }, []);

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
          { fileUrl: data.url, fileName: data.fileName, fileSize: data.fileSize },
          replyingToMessage?._id
        );
        setSelectedFile(null);
        setMessage('');
      } catch {
        addToast('Failed to upload file. Please try again.', 'error');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Handle text message
    if (!trimmed) return;
    sendMessage(activeConversation._id, trimmed, 'text', undefined, replyingToMessage?._id);
    setMessage('');
    stopTyping();
    inputRef.current?.focus();
  }, [message, selectedFile, activeConversation, sendMessage, stopTyping, addToast, replyingToMessage]);

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
        if (blob.size > 10 * 1024 * 1024) {
          addToast('Pasted image is too large (max 10MB)', 'error');
          return;
        }
        const ext = blob.type.split('/')[1] || 'png';
        const file = new File([blob], `pasted-image-${Date.now()}.${ext}`, { type: blob.type });
        setSelectedFile(file);
        return;
      }
    }
  }, [addToast]);

  // ── Voice recording ──────────────────────────────────────────────
  const startRecording = async () => {
    if (!activeConversation) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 1000) return; // Too short, ignore

        setIsUploading(true);
        try {
          const ext = mimeType.includes('webm') ? 'webm' : 'ogg';
          const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: mimeType });
          const formData = new FormData();
          formData.append('file', file);
          const { data } = await api.post('/upload', formData);
          sendMessage(activeConversation._id, '🎤 Voice message', 'voice', {
            fileUrl: data.url,
            fileName: data.fileName,
            fileSize: data.fileSize,
          });
        } catch {
          addToast('Failed to send voice message', 'error');
        } finally {
          setIsUploading(false);
        }
      };

      recorder.start(250); // collect data every 250ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      addToast('Microphone access denied', 'error');
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current) {
      // Remove the onstop handler so we don't upload
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!activeConversation) return null;

  const hasPreview = !!replyingToMessage || !!selectedFile;

  return (
    <div className="bg-transparent px-3 pb-3 sm:px-4 sm:pb-4 pt-1 flex-shrink-0 relative z-10" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Grouped previews container (replying + file attachments) */}
      {hasPreview && (
        <div className="max-w-4xl mx-auto rounded-t-3xl border border-(--border) bg-(--bg-secondary) overflow-hidden animate-[slideUp_0.2s_ease-out]">
          {/* Replying message preview */}
          {replyingToMessage && (
            <div className="flex items-start justify-between px-4 py-2.5 bg-(--bg-tertiary)/30 border-b border-(--border)">
              <div className="flex-1 min-w-0 border-l-3 border-(--accent) pl-3 py-0.5">
                <span className="text-[10px] font-bold text-(--accent) block uppercase tracking-wider">
                  Replying to {typeof replyingToMessage.sender === 'object' ? replyingToMessage.sender.username : 'User'}
                </span>
                <p className="text-xs text-(--text-secondary) truncate mt-0.5">
                  {replyingToMessage.isDeleted ? '🚫 This message was deleted' : (replyingToMessage.type === 'text' ? replyingToMessage.content : `📎 ${replyingToMessage.type}`)}
                </p>
              </div>
              <button
                onClick={() => setReplyingToMessage(null)}
                className="p-1.5 rounded-full hover:bg-(--bg-hover) text-(--text-muted) hover:text-(--text-primary) transition-colors ml-2 active:scale-90"
                title="Cancel reply"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* File preview */}
          {selectedFile && (
            <div className="p-3 bg-(--bg-tertiary)/10">
              <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />
            </div>
          )}
        </div>
      )}

      {/* Main Input Pill Box */}
      <div className={`max-w-4xl mx-auto shadow-xl transition-all duration-200 ${
        isRecording ? 'rounded-3xl' : hasPreview ? 'rounded-b-3xl rounded-t-none border-t-0' : 'rounded-full'
      } bg-(--bg-secondary) border border-(--border)`}>
        
        {/* Recording UI */}
        {isRecording ? (
          <div className="flex items-center gap-3 p-2.5 px-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-xs font-semibold text-red-500 flex-1">
              Recording… {formatRecordingTime(recordingSeconds)}
            </span>
            <button
              onClick={cancelRecording}
              className="p-2 rounded-full hover:bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary) transition-colors active:scale-95"
              title="Cancel recording"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={stopRecording}
              disabled={recordingSeconds < 1}
              className="p-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 transition-colors active:scale-95 flex items-center justify-center"
              title="Send voice message"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        ) : (
          /* Normal input row */
          <div className="flex items-center gap-1.5 p-1.5 px-3">
            {/* File attach button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2.5 rounded-full hover:bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary) transition-colors flex-shrink-0 active:scale-95"
              title="Attach file"
              id="attach-file-btn"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {/* Textarea inside pill */}
            <div className="flex-1 relative min-w-0">
              <textarea
                ref={inputRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Type a message…"
                rows={1}
                className="w-full px-2 py-2 bg-transparent border-0 outline-none text-(--text-primary) placeholder-(--text-muted) text-sm resize-none focus:outline-none focus:ring-0 max-h-32"
                style={{
                  height: 'auto',
                  minHeight: '36px',
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

            {/* Voice / Send button */}
            {message.trim() || selectedFile ? (
              <button
                onClick={handleSend}
                disabled={isUploading}
                className="p-2.5 rounded-full bg-(--accent) text-white
                  hover:bg-(--accent-hover) disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-200 flex-shrink-0
                  active:scale-90 shadow-md shadow-(--accent)/15 flex items-center justify-center cursor-pointer"
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
            ) : (
              <button
                onClick={startRecording}
                className="p-2.5 rounded-full hover:bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary) transition-colors flex-shrink-0 active:scale-95"
                title="Record voice message"
                id="voice-record-btn"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
