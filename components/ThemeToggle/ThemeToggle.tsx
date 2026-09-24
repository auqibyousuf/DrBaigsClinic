'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider/ThemeProvider';
import { useToast } from '@/components/ToastProvider';
import Tooltip from '@/components/Tooltip';

export default function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Direct, reliable toggle between Light and Dark mode
    const newTheme: 'light' | 'dark' = actualTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast('info', `Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} mode`);
  };

  const getIcon = () => {
    if (actualTheme === 'dark') {
      // Moon icon when dark (click to switch to light)
      return (
        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      );
    }
    // Sun icon when light (click to switch to dark)
    return (
      <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  };

  const getTooltipText = () => {
    return actualTheme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode';
  };

  return (
    <Tooltip content={getTooltipText()} position="bottom">
      <button
        onClick={toggleTheme}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        aria-label={`Toggle theme. Current: ${theme}`}
      >
        {getIcon()}
      </button>
    </Tooltip>
  );
}
