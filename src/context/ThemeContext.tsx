import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode =
  | 'midnight'
  | 'obsidian'
  | 'royal'
  | 'gold'
  | 'crimson'
  | 'oceanic';

export interface ThemeMeta {
  id: ThemeMode;
  name: string;
  subtitle: string;
  swatchPrimary: string;
  swatchBg: string;
  badgeText: string;
}

export const PREMIUM_THEMES: ThemeMeta[] = [
  {
    id: 'midnight',
    name: 'Midnight Cyber',
    subtitle: 'Deep Navy · Electric Blue',
    swatchPrimary: '#3b82f6',
    swatchBg: '#020617',
    badgeText: 'text-blue-400',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Emerald',
    subtitle: 'Carbon Slate · Emerald Neon',
    swatchPrimary: '#10b981',
    swatchBg: '#050a09',
    badgeText: 'text-emerald-400',
  },
  {
    id: 'royal',
    name: 'Royal Amethyst',
    subtitle: 'Velvet Noir · Violet Glow',
    swatchPrimary: '#a855f7',
    swatchBg: '#080510',
    badgeText: 'text-purple-400',
  },
  {
    id: 'gold',
    name: 'Sovereign Gold',
    subtitle: 'Matte Onyx · 24K Amber',
    swatchPrimary: '#f59e0b',
    swatchBg: '#090806',
    badgeText: 'text-amber-400',
  },
  {
    id: 'crimson',
    name: 'Crimson Stealth',
    subtitle: 'Obsidian Ash · Ruby Flare',
    swatchPrimary: '#f43f5e',
    swatchBg: '#0b0608',
    badgeText: 'text-rose-400',
  },
  {
    id: 'oceanic',
    name: 'Abyssal Cyan',
    subtitle: 'Arctic Trench · Aqua Pulse',
    swatchPrimary: '#06b6d4',
    swatchBg: '#040b10',
    badgeText: 'text-cyan-400',
  },
];

const THEME_CLASSES: Record<ThemeMode, string | null> = {
  midnight: null,
  obsidian: 'theme-obsidian',
  royal: 'theme-royal',
  gold: 'theme-gold',
  crimson: 'theme-crimson',
  oceanic: 'theme-oceanic',
};

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const VALID_MODES: ThemeMode[] = ['midnight', 'obsidian', 'royal', 'gold', 'crimson', 'oceanic'];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('oe_theme_mode');
    if (saved && VALID_MODES.includes(saved as ThemeMode)) {
      return saved as ThemeMode;
    }
    if (saved === 'light') return 'obsidian';
    return 'midnight';
  });

  useEffect(() => {
    const root = document.documentElement;
    // Always keep .dark active so zero white glare appears
    root.classList.add('dark');

    // Remove all previous custom theme classes before applying active one
    Object.values(THEME_CLASSES).forEach(cls => {
      if (cls) root.classList.remove(cls);
    });

    const activeCls = THEME_CLASSES[theme];
    if (activeCls) {
      root.classList.add(activeCls);
    }

    localStorage.setItem('oe_theme_mode', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      const idx = VALID_MODES.indexOf(prev);
      return VALID_MODES[(idx + 1) % VALID_MODES.length];
    });
  };

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
