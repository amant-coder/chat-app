'use client';

import React from 'react';
import { formatFileSize } from '@/lib/utils';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/');
  const previewUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="px-4 pt-3 fade-in">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-(--bg-tertiary) border border-(--border) max-w-sm">
        {isImage && previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-14 h-14 rounded-lg object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-(--accent)/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-(--accent)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-(--text-primary) truncate">{file.name}</p>
          <p className="text-xs text-(--text-muted)">{formatFileSize(file.size)}</p>
        </div>

        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-(--bg-hover) transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4 text-(--text-secondary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
