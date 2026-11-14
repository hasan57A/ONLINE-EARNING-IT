import React from 'react';
import { Moon, Sparkles, Crown, Gem, Flame, Waves } from 'lucide-react';
import { PREMIUM_THEMES, ThemeMode, useTheme } from '../../context/ThemeContext';
import { useToast } from './Toast';

const THEME_ICONS: Record<ThemeMode, React.ComponentType<{ className?: string }>> = {
  midnight: Moon,
  obsidian: Sparkles,
  royal: Crown,
  gold: Gem,
  crimson: Flame,
  oceanic: Waves,
};

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const currentIdx = Math.max(
    0,
    PREMIUM_THEMES.findIndex(t => t.id === theme)
  );
  const activeMeta = PREMIUM_THEMES[currentIdx] || PREMIUM_THEMES[0];
  const nextMeta = PREMIUM_THEMES[(currentIdx + 1) % PREMIUM_THEMES.length];
  const ActiveIcon = THEME_ICONS[activeMeta.id] || Moon;

  const handleCycleTheme = () => {
    setTheme(nextMeta.id);
    showToast(`${nextMeta.name} mode activated`, 'info');
  };

  return (
    <button
      type="button"
      onClick={handleCycleTheme}
      aria-label={`Switch theme (Current: ${activeMeta.name}, Click for ${nextMeta.name})`}
      title={`Theme: ${activeMeta.name} — Click to switch to ${nextMeta.name}`}
      className="group relative p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-700/80 bg-slate-900/85 hover:bg-slate-800 hover:border-slate-500 text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
    >
      <span
        className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
        style={{ backgroundColor: activeMeta.swatchPrimary }}
      />
      <ActiveIcon className={`w-4 h-4 ${activeMeta.badgeText} transition-transform group-hover:rotate-12`} />
      <span className="hidden lg:inline text-[11px] font-bold text-slate-200 whitespace-nowrap">
        {activeMeta.name.split(' ')[0]}
      </span>
    </button>
  );
};
