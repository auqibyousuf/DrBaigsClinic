'use client';

import { useEffect, useState, createContext, useContext } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('auto');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Function to update theme based on preference
  const updateTheme = (preference: Theme) => {
    let effectiveTheme: 'light' | 'dark';

    if (preference === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = isDark ? 'dark' : 'light';
    } else {
      effectiveTheme = preference;
    }

    setActualTheme(effectiveTheme);

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    setMounted(true);

    // Load saved theme preference from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme: Theme = (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) ? savedTheme : 'auto';

    setTheme(initialTheme);
    updateTheme(initialTheme);

    // Listen for system theme changes (only if auto mode)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const currentTheme = localStorage.getItem('theme') as Theme | null;
      const activeTheme: Theme = (currentTheme && ['light', 'dark', 'auto'].includes(currentTheme)) ? currentTheme : 'auto';
      if (activeTheme === 'auto') {
        updateTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Update theme when theme state changes (after mount)
  useEffect(() => {
    if (mounted) {
      updateTheme(theme);
    }
  }, [theme, mounted]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (mounted) {
      localStorage.setItem('theme', newTheme);
      updateTheme(newTheme);
    }
  };

  // Always provide the context, but theme logic only runs when mounted
  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
