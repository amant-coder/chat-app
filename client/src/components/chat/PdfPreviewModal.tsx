'use client';

import React, { useState, useEffect } from 'react';

interface PdfPreviewModalProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function PdfPreviewModal({ fileUrl, fileName, onClose }: PdfPreviewModalProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent scroll propagation on body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md transition-all duration-200 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl h-[85vh] md:h-[90vh] bg-(--bg-secondary) rounded-3xl border border-(--border) shadow-2xl overflow-hidden flex flex-col animate-[scale-in_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between bg-(--bg-secondary)/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* PDF Icon */}
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.363 2H5.75C4.784 2 4 2.784 4 3.75v16.5c0 .966.784 1.75 1.75 1.75h12.5c.966 0 1.75-.784 1.75-1.75V8.637L14.363 2h-3zm-.863 1.5l3.5 3.5H10.5v-3.5zM6 20V4h3v4.5a1.5 1.5 0 001.5 1.5H15v10H6zm4.5-6.5a1.5 1.5 0 011.5-1.5h1a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5h-1a1.5 1.5 0 01-1.5-1.5v-1zm1.5 0v1h1v-1h-1zM7.5 11.5A1.5 1.5 0 006 13v1a1.5 1.5 0 001.5 1.5H9v-1.5H7.5v-1H9v-1.5H7.5zm7.5 0h1.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5H15v-4.5zm1.5 3v-1.5H16.5V14.5h1z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-(--text-primary) truncate max-w-[250px] sm:max-w-[400px]" title={fileName}>
                {fileName}
              </h3>
              <p className="text-[10px] text-(--text-muted) font-medium uppercase tracking-wider">PDF Document</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Open In New Tab */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary) transition-colors flex items-center justify-center cursor-pointer"
              title="Open in new browser tab"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Download */}
            <a
              href={fileUrl}
              download={fileName}
              className="p-2 rounded-xl hover:bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary) transition-colors flex items-center justify-center cursor-pointer"
              title="Download PDF"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary) transition-colors flex items-center justify-center cursor-pointer"
              title="Close Preview"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-(--bg-primary) relative flex flex-col">
          {/* Loading state */}
          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-(--bg-primary) z-20">
              <div className="w-10 h-10 border-3 border-(--accent) border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-(--text-muted) font-medium">Loading PDF viewer…</span>
            </div>
          )}

          {/* PDF iframe */}
          <iframe
            src={`${fileUrl}#toolbar=1`}
            className={`w-full h-full border-none transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            title={fileName}
          />

          {/* Inline Help / Mobile Banner */}
          <div className="px-4 py-2 bg-(--bg-secondary) border-t border-(--border) text-[11px] text-(--text-muted) text-center flex items-center justify-center gap-1 sm:hidden">
            <span>Trouble viewing?</span>
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-(--accent) font-semibold hover:underline"
            >
              Open directly in new tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
