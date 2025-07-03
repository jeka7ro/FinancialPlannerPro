import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'monterey';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('monterey');

  useEffect(() => {
    // Încarcă tema din localStorage
    const savedTheme = localStorage.getItem('cashpot-theme') as Theme;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'monterey')) {
      setThemeState(savedTheme);
    } else {
      // Verifică preferința sistemului
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'monterey' : 'light');
    }
  }, []);

  useEffect(() => {
    // Aplică tema la document
    document.documentElement.classList.remove('light', 'dark', 'monterey');
    
    // Monterey folosește clasa 'dark' pentru stilizare
    if (theme === 'monterey') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'monterey');
    } else {
      document.documentElement.classList.add(theme);
      document.documentElement.removeAttribute('data-theme');
    }
    
    // Salvează în localStorage
    localStorage.setItem('cashpot-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'monterey';
      return 'light';
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 