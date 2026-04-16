'use client';

import React from 'react';
import { MessageStatus as MessageStatusType } from '@/types';

interface MessageStatusProps {
  status: MessageStatusType;
  isMine: boolean;
}

export default function MessageStatus({ status, isMine }: MessageStatusProps) {
  if (!isMine) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return (
          <svg className="w-4 h-4 text-white/50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.354 4.854a.5.5 0 00-.708-.708L5.5 10.293 3.354 8.146a.5.5 0 10-.708.708l2.5 2.5a.5.5 0 00.708 0l6.5-6.5z" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-4 h-4 text-white/70 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" viewBox="0 0 20 16" fill="currentColor">
            <path d="M15.354 4.854a.5.5 0 00-.708-.708L8.5 10.293 6.354 8.146a.5.5 0 10-.708.708l2.5 2.5a.5.5 0 00.708 0l6.5-6.5z" />
            <path d="M11.354 4.854a.5.5 0 00-.708-.708L4.5 10.293 2.354 8.146a.5.5 0 10-.708.708l2.5 2.5a.5.5 0 00.708 0l6.5-6.5z" />
          </svg>
        );
      case 'read':
        return (
          <svg className="w-4 h-4 text-[#2FE5FF] drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] brightness-110" viewBox="0 0 20 16" fill="currentColor">
            <path d="M15.354 4.854a.5.5 0 00-.708-.708L8.5 10.293 6.354 8.146a.5.5 0 10-.708.708l2.5 2.5a.5.5 0 00.708 0l6.5-6.5z" />
            <path d="M11.354 4.854a.5.5 0 00-.708-.708L4.5 10.293 2.354 8.146a.5.5 0 10-.708.708l2.5 2.5a.5.5 0 00.708 0l6.5-6.5z" />
          </svg>
        );
    }
  };

  return <span className="flex-shrink-0">{getStatusIcon()}</span>;
}
