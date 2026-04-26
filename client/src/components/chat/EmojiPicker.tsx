import React from 'react';

interface EmojiPickerProps {
  onReact: (emoji: string) => void;
  className?: string;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];

export default function EmojiPicker({ onReact, className = '' }: EmojiPickerProps) {
  return (
    <div className={`flex items-center gap-1 p-1.5 bg-(--surface) border border-(--border) rounded-full shadow-lg ${className}`}>
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={(e) => {
            e.stopPropagation();
            onReact(emoji);
          }}
          className="w-8 h-8 flex items-center justify-center text-lg rounded-full hover:bg-(--bg-hover) hover:scale-110 transition-all cursor-pointer"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
