import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'contrast-blue' | 'contrast-green';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeState() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'contrast-blue', 'contrast-green');
    
    // Add the current theme class
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'contrast-blue') {
      root.classList.add('contrast-blue');
    } else if (theme === 'contrast-green') {
      root.classList.add('contrast-green');
    }
    // 'dark' is the default, no class needed

    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}