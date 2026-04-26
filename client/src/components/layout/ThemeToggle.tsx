'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const dark = stored === null ? true : stored === 'dark';
    setIsDark(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <button
      onClick={toggle}
      id="theme-toggle-btn"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-xl hover:bg-(--bg-hover) transition-colors relative group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        {/* Sun icon (shown in light mode to switch to dark) */}
        <Sun
          className={`w-5 h-5 text-amber-400 absolute inset-0 transition-all duration-300 ${
            !isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
          }`}
        />
        {/* Moon icon (shown in dark mode to switch to light) */}
        <Moon
          className={`w-5 h-5 text-blue-400 absolute inset-0 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
      </div>
    </button>
  );
}
