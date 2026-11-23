import React, { useEffect, useRef, useState } from 'react';
import { Moon, Sun, Monitor, Sparkles, Crown, Gem, Flame, Waves, Check, ChevronDown } from 'lucide-react';
import { DisplayMode, PREMIUM_THEMES, ThemeMode, useTheme } from '../../context/ThemeContext';
import { useToast } from './Toast';
import { playUiSound } from '../../services/sound';

const THEME_ICONS: Record<ThemeMode, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  midnight: Moon,
  obsidian: Sparkles,
  royal: Crown,
  gold: Gem,
  crimson: Flame,
  oceanic: Waves,
};

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, displayMode, setDisplayMode } = useTheme();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeMeta = PREMIUM_THEMES.find(t => t.id === theme) || PREMIUM_THEMES[0];
  const ActiveIcon = THEME_ICONS[activeMeta.id] || Moon;

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onOutsideClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onOutsideClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleSelectTheme = (id: ThemeMode, name: string) => {
    playUiSound('click');
    setTheme(id);
    showToast(`${name} color mode activated`, 'info');
    setOpen(false);
  };

  const handleSelectDisplayMode = (mode: DisplayMode) => {
    playUiSound('click');
    setDisplayMode(mode);
    const label = mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'System';
    showToast(`${label} display mode activated`, 'info');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          playUiSound('click');
          setOpen(prev => !prev);
        }}
        aria-expanded={open}
        aria-label={`Color Mode: ${activeMeta.name} (${displayMode})`}
        title={`Color Mode: ${activeMeta.name} — Click to customize theme & light/dark mode`}
        className="group relative p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 hover:border-amber-400/50 text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap shrink-0"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-slate-700/50 transition-transform group-hover:scale-110"
          style={{ backgroundColor: activeMeta.swatchPrimary }}
        />
        <ActiveIcon className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-12 shrink-0" />
        <span className="hidden lg:inline text-[11px] font-bold text-slate-100 whitespace-nowrap">
          {activeMeta.name.split(' ')[0]}
        </span>
        <ChevronDown className={`hidden sm:inline w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-3 space-y-3 z-50">
          {/* Display Mode: Dark / Light / System */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
              Display Mode
            </p>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
              {([
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'system', label: 'Auto', icon: Monitor },
              ] as const).map(item => {
                const Icon = item.icon;
                const active = displayMode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectDisplayMode(item.id)}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6 Studio Color Palettes */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
              Color Theme
            </p>
            <div className="space-y-1">
              {PREMIUM_THEMES.map(item => {
                const Icon = THEME_ICONS[item.id];
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTheme(item.id, item.name)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border border-amber-400/40 text-slate-100'
                        : 'border border-transparent hover:bg-slate-800/70 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-600/50"
                        style={{ backgroundColor: item.swatchPrimary }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                          <Icon className="w-3 h-3 shrink-0" style={{ color: item.swatchPrimary }} />
                          <span>{item.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
