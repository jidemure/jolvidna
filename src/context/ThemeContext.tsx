'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to light theme immediately
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    // Check saved preference in localStorage
    const saved = localStorage.getItem('jolvi_theme_mode') as ThemeMode | null;
    if (saved === 'dark') {
      setModeState('dark');
      document.documentElement.classList.add('dark-theme');
    } else {
      setModeState('light');
      document.documentElement.classList.remove('dark-theme');
    }
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('jolvi_theme_mode', newMode);
    document.documentElement.classList.toggle('dark-theme', newMode === 'dark');
  };

  const toggleTheme = () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
