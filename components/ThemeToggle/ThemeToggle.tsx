'use client';

import { useTheme } from '@/components/ThemeProvider/ThemeProvider';
import { useToast } from '@/components/ToastProvider';
import Tooltip from '@/components/Tooltip';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const toggleTheme = () => {
    let newTheme: 'light' | 'dark' | 'auto';
    let toastMessage: string;

    if (theme === 'light') {
      newTheme = 'dark';
      toastMessage = 'Theme changed to Dark mode';
    } else if (theme === 'dark') {
      newTheme = 'auto';
      toastMessage = 'Theme changed to Auto mode';
    } else {
      newTheme = 'light';
      toastMessage = 'Theme changed to Light mode';
    }

    setTheme(newTheme);
    showToast('info', toastMessage);
  };

  const getIcon = () => {
    if (theme === 'light') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    } else if (theme === 'dark') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
  };

  const getTooltipText = () => {
    if (theme === 'light') {
      return 'Switch to Dark mode';
    } else if (theme === 'dark') {
      return 'Switch to Auto mode';
    } else {
      return 'Switch to Light mode';
    }
  };

  return (
    <Tooltip content={getTooltipText()} position="bottom">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        aria-label={`Toggle theme. Current: ${theme}`}
      >
        {getIcon()}
      </button>
    </Tooltip>
  );
}
