import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services/db';

export type ThemeMode =
  | 'midnight'
  | 'obsidian'
  | 'royal'
  | 'gold'
  | 'crimson'
  | 'oceanic';

export type DisplayMode = 'dark' | 'light' | 'system';

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
    name: 'Aurora Noir',
    subtitle: 'Ink Violet · Iris Glow',
    swatchPrimary: '#7c3aed',
    swatchBg: '#070913',
    badgeText: 'text-violet-400',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Emerald',
    subtitle: 'Carbon Slate · Emerald Neon',
    swatchPrimary: '#10b981',
    swatchBg: '#040a08',
    badgeText: 'text-emerald-400',
  },
  {
    id: 'royal',
    name: 'Royal Amethyst',
    subtitle: 'Velvet Noir · Orchid Glow',
    swatchPrimary: '#a855f7',
    swatchBg: '#080512',
    badgeText: 'text-purple-400',
  },
  {
    id: 'gold',
    name: 'Sovereign Gold',
    subtitle: 'Matte Onyx · 24K Amber',
    swatchPrimary: '#f59e0b',
    swatchBg: '#090805',
    badgeText: 'text-amber-400',
  },
  {
    id: 'crimson',
    name: 'Crimson Stealth',
    subtitle: 'Obsidian Ash · Ruby Flare',
    swatchPrimary: '#f43f5e',
    swatchBg: '#0b0507',
    badgeText: 'text-rose-400',
  },
  {
    id: 'oceanic',
    name: 'Abyssal Cyan',
    subtitle: 'Arctic Trench · Aqua Pulse',
    swatchPrimary: '#06b6d4',
    swatchBg: '#040a10',
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
  displayMode: DisplayMode;
  resolvedDisplayMode: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
  setDisplayMode: (m: DisplayMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const VALID_MODES: ThemeMode[] = ['midnight', 'obsidian', 'royal', 'gold', 'crimson', 'oceanic'];

const resolveMode = (mode: DisplayMode): 'dark' | 'light' => {
  if (mode === 'light') return 'light';
  if (mode === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('oe_theme_mode');
    if (saved && VALID_MODES.includes(saved as ThemeMode)) {
      return saved as ThemeMode;
    }
    if (saved === 'light') return 'obsidian';
    return 'midnight';
  });

  const [displayMode, setDisplayModeState] = useState<DisplayMode>(() => {
    return db.getUserPreferences().themeMode || 'dark';
  });

  const [resolvedDisplayMode, setResolvedDisplayMode] = useState<'dark' | 'light'>(() =>
    resolveMode(db.getUserPreferences().themeMode || 'dark')
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.values(THEME_CLASSES).forEach(cls => {
      if (cls) root.classList.remove(cls);
    });

    const activeCls = THEME_CLASSES[theme];
    if (activeCls) {
      root.classList.add(activeCls);
    }
    root.dataset.theme = theme;
    localStorage.setItem('oe_theme_mode', theme);
    window.dispatchEvent(new CustomEvent('oe-theme-changed'));
  }, [theme]);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveMode(displayMode);
      setResolvedDisplayMode(resolved);
      const root = document.documentElement;
      root.classList.toggle('dark', resolved === 'dark');
      root.classList.toggle('oe-light', resolved === 'light');
      root.dataset.colorMode = resolved;
      window.dispatchEvent(new CustomEvent('oe-theme-changed'));
    };

    apply();

    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const onMediaChange = () => {
      if (displayMode === 'system') apply();
    };
    const onPrefsChanged = () => {
      const latest = db.getUserPreferences().themeMode || 'dark';
      setDisplayModeState(prev => (prev === latest ? prev : latest));
    };

    mql.addEventListener('change', onMediaChange);
    window.addEventListener('oe-prefs-changed', onPrefsChanged);
    return () => {
      mql.removeEventListener('change', onMediaChange);
      window.removeEventListener('oe-prefs-changed', onPrefsChanged);
    };
  }, [displayMode]);

  const toggleTheme = () => {
    setThemeState(prev => {
      const idx = VALID_MODES.indexOf(prev);
      return VALID_MODES[(idx + 1) % VALID_MODES.length];
    });
  };

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  const setDisplayMode = (m: DisplayMode) => {
    setDisplayModeState(m);
    db.updateUserPreferences({ themeMode: m });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, displayMode, resolvedDisplayMode, toggleTheme, setTheme, setDisplayMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
