import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import { UserPreferences } from '../../types';
import { ALL_COUNTRIES_WITH_GLOBAL } from '../../data/countries';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';
import { PREMIUM_THEMES, useTheme } from '../../context/ThemeContext';
import {
  Settings,
  Globe2,
  Palette,
  Volume2,
  Bell,
  Sliders,
  Database,
  ShieldCheck,
  UserCog,
  Sparkles,
  RotateCcw,
  Save,
  Download,
  Trash2,
  Crown,
  Check,
  Play,
  Lock,
  Monitor,
  Smartphone,
} from 'lucide-react';

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}

const PremiumToggle: React.FC<ToggleProps> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 py-2">
    <div className="min-w-0">
      <div className="text-xs font-semibold text-slate-100">{label}</div>
      {description && <div className="text-[11px] text-slate-400 mt-0.5">{description}</div>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        playUiSound('click');
        onChange(!checked);
      }}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 shrink-0 cursor-pointer border ${
        checked
          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-violet-400/50 shadow-[0_0_16px_-2px_rgba(139,92,246,0.75)]'
          : 'bg-slate-900 border-slate-700'
      }`}
    >
      <span
        className={`block w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, signOut } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const { theme, setTheme, displayMode, setDisplayMode } = useTheme();

  const [prefs, setPrefs] = useState<UserPreferences>(() => db.getUserPreferences());
  const [twoFactor, setTwoFactor] = useState<boolean>(Boolean(user?.twoFactorEnabled));
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const [sessionRefreshedAt, setSessionRefreshedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem('oe_session_rotated_at');
    } catch {
      return null;
    }
  });

  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      db.applyUserPreferencesToDom(next);
      return next;
    });
  };

  React.useEffect(() => {
    setPrefs(prev => (prev.themeMode === displayMode ? prev : { ...prev, themeMode: displayMode }));
  }, [displayMode]);

  const handleSaveChanges = async () => {
    db.updateUserPreferences(prefs);
    if (user && twoFactor !== Boolean(user.twoFactorEnabled)) {
      await db.updateUserProfile(user.id, { twoFactorEnabled: twoFactor });
      refreshUser();
    }
    playUiSound('generate', prefs.soundVolume);
    showToast('All workspace preferences saved successfully!', 'success');
  };

  const handleResetDefault = () => {
    const defaults = db.resetUserPreferences();
    setPrefs(defaults);
    setDisplayMode(defaults.themeMode);
    setTheme('midnight');
    playUiSound('click', defaults.soundVolume);
    showToast('Settings restored to default configuration.', 'info');
  };

  const handleTestSound = () => {
    playUiSound('generate', Math.max(10, prefs.soundVolume || 30));
    showToast(`Played UI feedback tone at ${prefs.soundVolume}% volume.`, 'success');
  };

  const handleExportMyData = () => {
    if (!user) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        fullName: user.fullName,
        username: user.username,
        email: user.gmail,
        mobile: user.mobile,
        telegramUsername: user.telegramUsername,
        plan: user.plan || 'Free Trial',
        credits: user.credits ?? 0,
      },
      preferences: prefs,
      usageHistory: db.getUsageHistory(user.id),
      savedResults: db.getSavedResults(user.id),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `online-earning-it-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playUiSound('copy');
    showToast('Exported your workspace data (.json).', 'success');
  };

  const handleClearHistory = () => {
    if (!user) return;
    db.clearUsageHistory(user.id);
    setConfirmClearHistory(false);
    playUiSound('click');
    showToast('Usage & search history cleared.', 'success');
  };

  const handleClearSaved = () => {
    if (!user) return;
    const saved = db.getSavedResults(user.id);
    saved.forEach(item => db.deleteSavedResult(item.id, user.id));
    playUiSound('click');
    showToast(`Deleted ${saved.length} saved result records.`, 'info');
  };

  const handleDeactivateSelf = () => {
    if (!user) return;
    if (user.role === 'admin') {
      showToast('Administrator accounts cannot be deactivated from user settings.', 'error');
      setConfirmDeactivate(false);
      return;
    }
    db.updateUserStatus(user.id, 'deactivated');
    signOut();
    navigate('/signin');
    showToast('Your account has been deactivated.', 'info');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="oe-panel rounded-3xl p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-indigo-600/30 border border-violet-400/35 flex items-center justify-center shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)] shrink-0">
            <Settings className="w-7 h-7 text-violet-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-violet-300">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Workspace Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-0.5">
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Customize your workspace preferences, visual effects, audio feedback, defaults & security.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefault}
            className="btn-premium-glass px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            <span>Reset to Default</span>
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="btn-premium-vivid px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* 8 Numbered RGB Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 01: General Settings */}
        <section className="oe-panel oe-rgb-violet rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-400/40 text-violet-300 font-mono text-xs font-extrabold flex items-center justify-center">
                01
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-violet-400" />
                  <span>General Settings</span>
                </h2>
                <p className="text-[11px] text-slate-400">Regional localization & date presentation</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Default Language
              </label>
              <select
                value={prefs.language}
                onChange={e => updatePref('language', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
              >
                <option value="English">English (International)</option>
                <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="Arabic">Arabic (العربية)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Date Format
              </label>
              <select
                value={prefs.dateFormat}
                onChange={e => updatePref('dateFormat', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
              >
                <option value="DD MMM YYYY">DD MMM YYYY (15 Nov 2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (11/15/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-11-15)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Time Zone
              </label>
              <select
                value={prefs.timeZone}
                onChange={e => updatePref('timeZone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
              >
                <option value="(UTC+06:00) Dhaka, Bangladesh">(UTC+06:00) Dhaka, Bangladesh</option>
                <option value="(UTC-05:00) New York, EST">(UTC-05:00) New York, EST</option>
                <option value="(UTC+00:00) London, GMT">(UTC+00:00) London, GMT</option>
                <option value="(UTC+01:00) Berlin, CET">(UTC+01:00) Berlin, CET</option>
                <option value="(UTC+08:00) Singapore, SGT">(UTC+08:00) Singapore, SGT</option>
              </select>
            </div>
          </div>
        </section>

        {/* 02: Appearance */}
        <section className="oe-panel oe-rgb-pink rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 font-mono text-xs font-extrabold flex items-center justify-center">
                02
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-fuchsia-400" />
                  <span>Appearance</span>
                </h2>
                <p className="text-[11px] text-slate-400">Studio palette, RGB luminance & typography</p>
              </div>
            </div>
            <ThemeSwitcher />
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Display Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'system'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setDisplayMode(mode);
                      updatePref('themeMode', mode);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      displayMode === mode
                        ? 'border-fuchsia-500/70 bg-fuchsia-500/15 text-slate-100 shadow-[0_0_16px_-4px_rgba(var(--oe-accent-rgb),0.45)]'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {mode} Mode
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Color Theme (Applies Site-Wide)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PREMIUM_THEMES.map(item => {
                  const active = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setTheme(item.id);
                        showToast(`${item.name} color mode activated`, 'info');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        active
                          ? 'border-violet-500/70 bg-violet-500/15 text-slate-100 shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 border border-white/25 shadow-sm"
                        style={{ backgroundColor: item.swatchPrimary }}
                      />
                      <span className="text-xs font-bold truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Sidebar Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['full', 'compact'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updatePref('sidebarStyle', st)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize cursor-pointer ${
                        prefs.sidebarStyle === st
                          ? 'border-violet-500 bg-violet-500/20 text-slate-100'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Font Style
                </label>
                <select
                  value={prefs.fontStyle}
                  onChange={e => updatePref('fontStyle', e.target.value as UserPreferences['fontStyle'])}
                  className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Outfit">Outfit Display</option>
                  <option value="Manrope">Manrope Clean</option>
                </select>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-800/70 divide-y divide-slate-800/50">
              <PremiumToggle
                checked={prefs.rgbEffects}
                onChange={v => updatePref('rgbEffects', v)}
                label="RGB Ambient Glow & Neon Rings"
                description="Luminous violet/cyan card highlights and specular edge effects"
              />
              <PremiumToggle
                checked={prefs.animations}
                onChange={v => updatePref('animations', v)}
                label="Micro-Animations & Transitions"
                description="Smooth hover elevations and card entrance motion"
              />
            </div>
          </div>
        </section>

        {/* 03: Sound Effects */}
        <section className="oe-panel oe-rgb-amber rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-extrabold flex items-center justify-center">
                03
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Sound Effects</span>
                </h2>
                <p className="text-[11px] text-slate-400">Synthesized Web Audio workspace cues</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSound}
              className="btn-premium-vivid px-3.5 py-2 rounded-xl text-[11px] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Test Sound</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800/50">
            <PremiumToggle
              checked={prefs.soundEnabled}
              onChange={v => updatePref('soundEnabled', v)}
              label="Master Audio Feedback"
              description="Enable or mute all sound cues across tools"
            />
            <PremiumToggle
              checked={prefs.buttonClickSound}
              onChange={v => updatePref('buttonClickSound', v)}
              label="Button Click Sound"
            />
            <PremiumToggle
              checked={prefs.generateSound}
              onChange={v => updatePref('generateSound', v)}
              label="Generation Complete Chime"
            />
            <PremiumToggle
              checked={prefs.copySound}
              onChange={v => updatePref('copySound', v)}
              label="Copy & Export Confirmation"
            />
            <PremiumToggle
              checked={prefs.notificationSound}
              onChange={v => updatePref('notificationSound', v)}
              label="Notification Alert Tone"
            />
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Output Volume</span>
              <span className="font-mono font-bold text-amber-300">{prefs.soundVolume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={prefs.soundVolume}
              onChange={e => updatePref('soundVolume', Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </section>

        {/* 04: Notification Settings */}
        <section className="oe-panel oe-rgb-emerald rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-extrabold flex items-center justify-center">
                04
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>Notification Settings</span>
                </h2>
                <p className="text-[11px] text-slate-400">Control alert channels & product announcements</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            <PremiumToggle
              checked={prefs.emailNotifications}
              onChange={v => updatePref('emailNotifications', v)}
              label="Email Notifications"
              description="Payment approvals, credit receipts & account notices"
            />
            <PremiumToggle
              checked={prefs.toolUpdatesNotif}
              onChange={v => updatePref('toolUpdatesNotif', v)}
              label="Tool Pool & Database Updates"
              description="Get alerted when fresh UA, Lead, or Number pools go live"
            />
            <PremiumToggle
              checked={prefs.announcementsNotif}
              onChange={v => updatePref('announcementsNotif', v)}
              label="Official Announcements & Bonus Offers"
            />
            <PremiumToggle
              checked={prefs.securityAlertsNotif}
              onChange={v => updatePref('securityAlertsNotif', v)}
              label="Security & Password Alerts"
            />
            <PremiumToggle
              checked={prefs.marketingEmailsNotif}
              onChange={v => updatePref('marketingEmailsNotif', v)}
              label="Partner & CPA Digest Emails"
            />
          </div>
        </section>

        {/* 05: Tool Preferences */}
        <section className="oe-panel oe-rgb-cyan rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-extrabold flex items-center justify-center">
                05
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Tool Preferences</span>
                </h2>
                <p className="text-[11px] text-slate-400">Default generator batch size, GEO & export format</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Default Quantity
              </label>
              <select
                value={prefs.defaultQuantity}
                onChange={e => updatePref('defaultQuantity', Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border text-xs text-slate-100 font-mono"
              >
                {[10, 20, 50, 100, 250].map(q => (
                  <option key={q} value={q}>{q} items</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Default Country
              </label>
              <select
                value={prefs.defaultCountry}
                onChange={e => updatePref('defaultCountry', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-xs text-slate-100"
              >
                {ALL_COUNTRIES_WITH_GLOBAL.slice(0, 25).map(c => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Output Format
              </label>
              <select
                value={prefs.defaultOutputFormat}
                onChange={e => updatePref('defaultOutputFormat', e.target.value as UserPreferences['defaultOutputFormat'])}
                className="w-full px-3 py-2.5 rounded-xl border text-xs text-slate-100 font-mono"
              >
                <option value="TXT">.TXT (Plain Lines)</option>
                <option value="CSV">.CSV (Spreadsheet)</option>
                <option value="JSON">.JSON (Structured)</option>
              </select>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800/70 divide-y divide-slate-800/50">
            <PremiumToggle
              checked={prefs.autoCopyAfterGenerate}
              onChange={v => updatePref('autoCopyAfterGenerate', v)}
              label="Auto-Copy Results After Generate"
              description="Automatically copies generated output to your clipboard"
            />
            <PremiumToggle
              checked={prefs.showToolTips}
              onChange={v => updatePref('showToolTips', v)}
              label="Show Interactive Tooltips & Guides"
            />
          </div>
        </section>

        {/* 06: Data & History */}
        <section className="oe-panel oe-rgb-blue rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-mono text-xs font-extrabold flex items-center justify-center">
                06
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>Data & History</span>
                </h2>
                <p className="text-[11px] text-slate-400">Export logs or purge locally stored usage records</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-2">
              <div className="text-xs font-bold text-slate-100">Export Workspace Archive</div>
              <p className="text-[11px] text-slate-400">
                Download your profile, saved results, and usage logs in JSON format.
              </p>
              <button
                type="button"
                onClick={handleExportMyData}
                className="btn-premium-cyan w-full py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export My Data (.json)</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-2">
              <div className="text-xs font-bold text-slate-100">Clear Search & Usage History</div>
              <p className="text-[11px] text-slate-400">
                Remove recent generation entries from your personal timeline.
              </p>
              {!confirmClearHistory ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearHistory(true)}
                  className="btn-premium-glass w-full py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 text-amber-300 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Usage History</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Confirm Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearHistory(false)}
                    className="px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Saved Results Vault</div>
              <div className="text-[11px] text-slate-400">
                {user ? `${db.getSavedResults(user.id).length} saved items in vault` : 'Sign in to manage vault'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSaved}
              className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold cursor-pointer"
            >
              Delete All Saved
            </button>
          </div>
        </section>

        {/* 07: Privacy & Security */}
        <section className="oe-panel oe-rgb-violet rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-mono text-xs font-extrabold flex items-center justify-center">
                07
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Privacy & Security</span>
                </h2>
                <p className="text-[11px] text-slate-400">Session guard, login alerts & 2FA protection</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            <PremiumToggle
              checked={twoFactor}
              onChange={setTwoFactor}
              label="Two-Factor Authentication (2FA)"
              description="Extra protection layer during workspace authentication"
            />
            <PremiumToggle
              checked={prefs.loginAlerts}
              onChange={v => updatePref('loginAlerts', v)}
              label="Unrecognized Sign-In Alerts"
              description="Notify immediately on new browser or IP logins"
            />
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <span>Current Browser Session</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {sessionRefreshedAt
                    ? `Session verified ${new Date(sessionRefreshedAt).toLocaleTimeString()}`
                    : `${navigator.userAgent.slice(0, 62)}...`}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const ts = db.rotateUserSession(user?.id);
                setSessionRefreshedAt(ts);
                refreshUser();
                playUiSound('click');
                showToast('Session token refreshed & prior sessions invalidated.', 'success');
              }}
              className="btn-premium-glass px-3 py-2 rounded-xl text-[11px] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Manage Sessions
            </button>
          </div>
        </section>

        {/* 08: Account Management */}
        <section className="oe-panel oe-rgb-rose rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 font-mono text-xs font-extrabold flex items-center justify-center">
                08
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-rose-400" />
                  <span>Account Management</span>
                </h2>
                <p className="text-[11px] text-slate-400">Membership tier, billing & account status</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 dark:bg-gradient-to-r dark:from-violet-950/50 dark:via-slate-950 dark:to-indigo-950/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">
                  {user?.plan || 'Free Workspace'}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {user?.role === 'admin'
                    ? 'Unlimited Admin Access'
                    : `${(user?.credits ?? 0).toLocaleString()} credits available`}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/payment')}
              className="btn-premium-primary px-4 py-2 rounded-xl text-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              Upgrade Plan
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-rose-500/25 bg-rose-500/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-rose-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Deactivate Account</span>
              </div>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                Temporarily disable access. Contact support anytime to reactivate.
              </p>
            </div>
            {!confirmDeactivate ? (
              <button
                type="button"
                onClick={() => setConfirmDeactivate(true)}
                className="px-3.5 py-2 rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 text-xs font-semibold cursor-pointer"
              >
                Deactivate
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeactivateSelf}
                  className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeactivate(false)}
                  className="px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Action Footer */}
      <div className="oe-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Preferences sync instantly across all your tools and generators.</span>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleResetDefault}
            className="btn-premium-glass px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="btn-premium-vivid px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
