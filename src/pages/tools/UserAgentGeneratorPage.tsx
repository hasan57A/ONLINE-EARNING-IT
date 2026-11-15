import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Smartphone,
  Copy,
  Download,
  Bookmark,
  RefreshCw,
  Database,
  CheckCircle2,
  Sparkles,
  Sliders,
  Globe2,
  ShieldCheck,
  Search,
  Check,
  Terminal,
  Cpu,
  Layers,
  SlidersHorizontal,
  Scissors,
  X,
  Trash2,
  HelpCircle,
  Minus,
  Plus,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { BrowserIcons, InAppIcons, DeviceIcons } from '../../components/ui/BrandIcons';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_COUNTRIES_WITH_GLOBAL, findCountryGeo } from '../../data/countries';
import { useDbSync } from '../../hooks/useDbSync';
import { PackageCreditGuard } from '../../components/ui/PackageCreditGuard';

const DEFAULT_BROWSER_5_VERSIONS: Record<string, string[]> = {
  Chrome: ['124.0.6367.60', '123.0.6312.86', '122.0.6261.94', '121.0.6167.85', '120.0.6099.109'],
  Firefox: ['125.0', '124.0.2', '123.0.1', '122.0', '120.0'],
  Safari: ['17.4.1', '17.3', '17.0', '16.6', '16.4'],
  Edge: ['124.0.2478.51', '123.0.2420.65', '122.0.2365.92', '121.0.2277.83', '120.0.2210.91'],
  Opera: ['109.0.5097.38', '108.0.5067.24', '107.0.5049.20', '106.0.4998.40', '105.0.4970.21'],
};

const DEFAULT_IN_APP_5_VERSIONS: Record<string, string[]> = {
  Facebook: ['452.0.0.38.109', '448.0.0.32.115', '440.0.0.28.110', '435.0.0.22.115', '430.0.0.20.108'],
  'Facebook Lite': ['395.0.0.12.114', '385.0.0.9.112', '375.0.0.8.110', '365.0.0.7.108', '355.0.0.5.105'],
  Instagram: ['322.0.0.32.109', '318.0.0.26.109', '310.0.0.20.108', '305.0.0.19.110', '300.0.0.18.110'],
  TikTok: ['34.2.3', '33.8.4', '33.2.0', '32.5.0', '31.8.2'],
  Twitter: ['10.35.0-release.0', '10.30.0', '10.25.0', '10.20.0', '10.15.0'],
  LinkedIn: ['4.1.890', '4.1.850', '4.1.820', '4.1.800', '4.1.750'],
  Snapchat: ['12.78.0.40', '12.70.0.35', '12.65.0.32', '12.60.0.30', '12.50.0.25'],
  WeChat: ['8.0.48', '8.0.47', '8.0.45', '8.0.43', '8.0.40'],
};

export const UserAgentGeneratorPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();
  useDbSync();

  const devices = ['iPhone', 'iPad', 'Android', 'Windows', 'macOS'] as const;
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'] as const;
  const inAppBrowsers = [
    'None',
    'Facebook',
    'Facebook Lite',
    'Instagram',
    'TikTok',
    'Twitter',
    'LinkedIn',
    'Snapchat',
    'WeChat',
  ] as const;

  const deviceDetails: Record<(typeof devices)[number], { badge: string; resolution: string }> = {
    iPhone: { badge: 'iOS 17.4+', resolution: '393 × 852' },
    iPad: { badge: 'iPadOS 17', resolution: '1024 × 1366' },
    Android: { badge: 'Android 14', resolution: '412 × 915' },
    Windows: { badge: 'Win 11 x64', resolution: '1920 × 1080' },
    macOS: { badge: 'Sonoma ARM', resolution: '1728 × 1117' },
  };

  const prefs = db.getUserPreferences();
  const [device, setDevice] = useState<(typeof devices)[number]>('Windows');
  const [browser, setBrowser] = useState<string>('Chrome');
  const [inAppBrowser, setInAppBrowser] = useState<string>('None');
  const [country, setCountry] = useState<string>(() => prefs.defaultCountry || 'All Countries');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(() => Math.min(1000, Math.max(1, prefs.defaultQuantity || 10)));

  const [isBrowserVersionOn, setIsBrowserVersionOn] = useState<boolean>(true);
  const [browserVersions, setBrowserVersions] = useState<string[]>([
    '124.0.6367.60',
    '123.0.6312.86',
    '122.0.6261.94',
    '121.0.6167.85',
    '120.0.6099.109',
  ]);

  const [isInAppVersionOn, setIsInAppVersionOn] = useState<boolean>(false);
  const [inAppVersions, setInAppVersions] = useState<string[]>([
    '452.0.0.38.109',
    '448.0.0.32.115',
    '440.0.0.28.110',
    '435.0.0.22.115',
    '430.0.0.20.108',
  ]);

  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [metaInfo, setMetaInfo] = useState<{ fromPool: number; procedural: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [outputTab, setOutputTab] = useState<'cards' | 'terminal'>('cards');
  const [howItWorksOpen, setHowItWorksOpen] = useState<boolean>(false);

  const adminPool = db.getUserAgents();
  const poolAvailable = adminPool.filter(u => !u.used).length;
  const poolConsumed = adminPool.filter(u => u.used).length;
  const deviceStats = db.getUserAgentStatsByDevice();
  const selectedDeviceStats = deviceStats[device];
  const selectedDeviceAvailable = selectedDeviceStats.available;
  const requestedQty = Math.min(1000, Math.max(1, Number(quantity) || 1));
  const effectiveCreditsNeeded =
    selectedDeviceAvailable > 0 ? Math.min(selectedDeviceAvailable, requestedQty) : requestedQty;
  const creditAccess = db.canUseTool(user?.id, effectiveCreditsNeeded);

  const availableBrowsers = browsers.filter(b => {
    if (b === 'Safari') {
      return device === 'iPhone' || device === 'iPad' || device === 'macOS';
    }
    return true;
  });

  const handleDeviceChange = (newDevice: (typeof devices)[number]) => {
    playUiSound('click');
    setDevice(newDevice);
    if ((newDevice === 'Windows' || newDevice === 'Android') && browser === 'Safari') {
      setBrowser('Chrome');
      loadDefaultBrowserVersions('Chrome');
    }
  };

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return ALL_COUNTRIES_WITH_GLOBAL;
    return ALL_COUNTRIES_WITH_GLOBAL.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.locale.toLowerCase().includes(q) ||
        c.languageName.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const activeGeo = country === 'No Language System' ? null : findCountryGeo(country);

  const handleBrowserVersionChange = (index: number, val: string) => {
    setBrowserVersions(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const loadDefaultBrowserVersions = (bName: string) => {
    const defaults = DEFAULT_BROWSER_5_VERSIONS[bName] || DEFAULT_BROWSER_5_VERSIONS.Chrome;
    setBrowserVersions([...defaults]);
    showToast(`Loaded 5 latest versions for ${bName}!`, 'info');
  };

  const handleInAppVersionChange = (index: number, val: string) => {
    setInAppVersions(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const loadDefaultInAppVersions = (iabName: string) => {
    const defaults = DEFAULT_IN_APP_5_VERSIONS[iabName] || DEFAULT_IN_APP_5_VERSIONS.Facebook;
    setInAppVersions([...defaults]);
    showToast(`Loaded 5 latest releases for ${iabName}!`, 'info');
  };

  const handleGenerate = () => {
    if (!user) {
      showToast('Please sign in and take a package first to generate user agents.', 'error');
      navigate('/signin');
      return;
    }

    const plannedQty = Math.min(1000, Math.max(1, Number(quantity) || 1));
    const qty = selectedDeviceAvailable > 0 ? Math.min(selectedDeviceAvailable, plannedQty) : plannedQty;
    const access = db.canUseTool(user.id, qty);
    if (!access.allowed) {
      showToast(access.reason || 'Please take a package first to generate User Agents!', 'error');
      if (!access.hasUsablePackage) {
        navigate('/payment');
      }
      return;
    }

    if (selectedDeviceAvailable === 0) {
      showToast(`Cannot generate: 0 unused ${device} User Agents available! Admin must upload ${device} User Agents in the Admin Panel first.`, 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const activeBrowserVersions = isBrowserVersionOn
        ? browserVersions.map(v => v.trim()).filter(Boolean)
        : [];
      const activeInAppVersions = isInAppVersionOn
        ? inAppVersions.map(v => v.trim()).filter(Boolean)
        : [];

      const { results, fromPoolCount, generatedCount, error } = db.consumeUserAgents(user.id, {
        device,
        browser: browser !== 'None' ? browser : undefined,
        inAppBrowser: inAppBrowser !== 'None' ? inAppBrowser : undefined,
        country,
        quantity: qty,
        browserVersions: activeBrowserVersions,
        inAppVersions: activeInAppVersions,
        isBrowserVersionOn,
        isInAppVersionOn,
      });

      if (error || results.length === 0) {
        showToast(error || 'No available User Agents found in database pool. Please upload in Admin Panel first.', 'error');
        setIsGenerating(false);
        return;
      }

      setGeneratedResults(results);
      setMetaInfo({ fromPool: fromPoolCount, procedural: generatedCount });
      refreshUser();
      playUiSound('generate');

      if (db.getUserPreferences().autoCopyAfterGenerate) {
        navigator.clipboard.writeText(results.join('\n'));
      }

      const versionTags: string[] = [];
      if (isBrowserVersionOn) versionTags.push(`${browser} (${activeBrowserVersions.length} versions)`);
      if (isInAppVersionOn && inAppBrowser !== 'None') versionTags.push(`${inAppBrowser} (${activeInAppVersions.length} versions)`);
      const versionLabel = versionTags.length > 0 ? versionTags.join(' + ') : 'Original Versions';

      const comboLabel =
        inAppBrowser !== 'None'
          ? `${device} · ${browser} + ${inAppBrowser} (${versionLabel}) · ${country}`
          : `${device} · ${browser} (${versionLabel}) · ${country}`;

      db.recordUsage(
        user.id,
        'user-agent-generator',
        'User Agent Generator',
        results.length,
        'Success',
        comboLabel
      );

      showToast(
        `Generated ${results.length} authentic user agents (${fromPoolCount} cut from pool${
          access.isAdmin ? '' : ` · ${results.length} credits used`
        })!`,
        'success'
      );
    } catch {
      showToast('Failed to generate user agents.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAll = () => {
    if (generatedResults.length === 0) return;
    navigator.clipboard.writeText(generatedResults.join('\n'));
    playUiSound('copy');
    showToast('Copied all user agents to clipboard!', 'success');
  };

  const copySingle = (ua: string, idx: number) => {
    navigator.clipboard.writeText(ua);
    playUiSound('copy');
    setCopiedIndex(idx);
    showToast('User agent copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const outputFormat = db.getUserPreferences().defaultOutputFormat || 'TXT';

  const downloadTxt = () => {
    if (generatedResults.length === 0) return;
    let body = generatedResults.join('\n');
    let mime = 'text/plain;charset=utf-8';
    const ext = outputFormat.toLowerCase();
    if (outputFormat === 'CSV') {
      body = 'UserAgent\n' + generatedResults.map(u => `"${u.replace(/"/g, '""')}"`).join('\n');
      mime = 'text/csv;charset=utf-8';
    } else if (outputFormat === 'JSON') {
      body = JSON.stringify(generatedResults, null, 2);
      mime = 'application/json;charset=utf-8';
    }
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_agents_${device.toLowerCase()}_${country.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    playUiSound('copy');
    showToast(`Downloaded user agents ${outputFormat} file.`, 'success');
  };

  const saveResults = () => {
    if (!user || generatedResults.length === 0) return;
    const title =
      inAppBrowser !== 'None'
        ? `User Agents (${device} / ${browser} + ${inAppBrowser} - ${country})`
        : `User Agents (${device} / ${browser} - ${country})`;
    db.saveResult(
      user.id,
      'user-agent-generator',
      'User Agent Generator',
      title,
      generatedResults.join('\n'),
      generatedResults.length
    );
    playUiSound('generate');
    showToast('Results saved to your dashboard vault!', 'success');
  };

  const handleClearResults = () => {
    if (generatedResults.length === 0) return;
    setGeneratedResults([]);
    setMetaInfo(null);
    setSearchQuery('');
    setCopiedIndex(null);
    showToast('Cleared generated User Agents output.', 'info');
  };

  const handleRemoveSingleResult = (targetUa: string, idx: number) => {
    setGeneratedResults(prev => {
      const removeIdx = prev.findIndex((item, i) =>
        searchQuery.trim() ? item === targetUa : i === idx
      );
      if (removeIdx === -1) return prev;
      const next = [...prev];
      next.splice(removeIdx, 1);
      if (next.length === 0) {
        setMetaInfo(null);
        setSearchQuery('');
      }
      return next;
    });
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return generatedResults;
    const q = searchQuery.toLowerCase();
    return generatedResults.filter(ua => ua.toLowerCase().includes(q));
  }, [generatedResults, searchQuery]);

  const ActiveBrowserIcon = BrowserIcons[browser] || BrowserIcons.Chrome;
  const ActiveDeviceIcon = DeviceIcons[device] || DeviceIcons.Windows;
  const ActiveInAppIcon = inAppBrowser !== 'None' ? InAppIcons[inAppBrowser] : null;

  return (
    <div className="space-y-6">
      {/* Top Workstation Header */}
      <div className="oe-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <RealisticToolIcon slug="user-agent-generator" size="lg" />
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-violet-400/60 shadow-lg">
                <ActiveDeviceIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/35">
                  Admin Pool Synchronized
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-mono">
                  5-Version Cycling
                </span>
                <button
                  type="button"
                  onClick={() => setHowItWorksOpen(true)}
                  className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 hover:text-slate-100 border border-slate-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3 text-violet-400" />
                  <span>How it works?</span>
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
                <span>User Agent Generator</span>
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Pick device, browser engine, in-app webview, and target GEO — pulled cleanly from the synced Admin database pool and cut permanently to prevent duplicates.
              </p>
            </div>
          </div>

          {/* Live Pool HUD */}
          <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-2xl border border-slate-800/90 bg-slate-950/75">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Total Uploaded</div>
              <div className="text-xs font-bold text-slate-100 font-mono tabular-nums">{adminPool.length}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Used / Cut</div>
              <div className="text-xs font-bold text-rose-400 font-mono tabular-nums">{poolConsumed}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/25">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Available</div>
              <div className="text-xs font-bold text-emerald-400 font-mono tabular-nums">{poolAvailable}</div>
            </div>
          </div>
        </div>
      </div>

      <PackageCreditGuard
        userId={user?.id}
        requiredCredits={effectiveCreditsNeeded}
        creditUnitLabel="1 Credit per User Agent"
      />

      {/* Pool Alert */}
      {poolAvailable === 0 || selectedDeviceAvailable === 0 ? (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-100">
                {poolAvailable === 0
                  ? 'Admin Database Pool is Empty (0 Available)'
                  : `0 Unused "${device}" User Agents Available`}
              </h4>
              <p className="text-amber-300 text-[11px] mt-0.5">
                Strict device isolation active. {device} Available: <strong className="font-mono">{selectedDeviceAvailable}</strong> / Total: <strong className="font-mono">{selectedDeviceStats.total}</strong>.
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30 whitespace-nowrap">
            Upload Required
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">
              <strong className="font-mono">{device}</strong> pool ready —{' '}
              <strong className="font-mono text-emerald-300">{selectedDeviceAvailable}</strong> unused UAs available ({selectedDeviceStats.used} consumed).
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
            Pool Active
          </span>
        </div>
      )}

      {/* 4-Card Selection Matrix matching Images 1 & 8 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Device */}
        <div className="oe-panel rounded-3xl p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span>1. Device Type</span>
            </h2>
            <span className="text-[10px] font-mono text-violet-300 font-bold">{selectedDeviceAvailable} avail</span>
          </div>

          <div className="space-y-2">
            {devices.map(d => {
              const DeviceIconComponent = DeviceIcons[d];
              const isSelected = device === d;
              const dStat = deviceStats[d];
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDeviceChange(d)}
                  className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-violet-500 bg-gradient-to-r from-violet-600/25 to-indigo-600/15 text-slate-100 shadow-[0_0_20px_-6px_rgba(var(--oe-accent-rgb),0.55)]'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <DeviceIconComponent className="w-5 h-5" />
                    <div>
                      <div className="text-xs font-bold">{d}</div>
                      <div className="text-[10px] font-mono text-slate-400">{deviceDetails[d].badge}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        dStat.available > 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {dStat.available}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-violet-300" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Browser Engine + Version ON/OFF + 5 Slots */}
        <div className="oe-panel rounded-3xl p-5 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>2. Browser</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsBrowserVersionOn(!isBrowserVersionOn)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono cursor-pointer border ${
                isBrowserVersionOn
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                  : 'bg-slate-900 text-slate-500 border-slate-700'
              }`}
            >
              Ver: {isBrowserVersionOn ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {availableBrowsers.map(b => {
              const BrowserIconComponent = BrowserIcons[b];
              const isSelected = browser === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setBrowser(b);
                    loadDefaultBrowserVersions(b);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/15 text-slate-100 font-bold shadow-[0_0_16px_-6px_rgba(34,211,238,0.65)]'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <BrowserIconComponent className="w-4 h-4" />
                  <span className="text-[10px] truncate w-full">{b}</span>
                </button>
              );
            })}
          </div>

          {isBrowserVersionOn ? (
            <div className="p-3 rounded-2xl border border-cyan-500/25 bg-slate-950/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-100 flex items-center gap-1">
                  <ActiveBrowserIcon className="w-3 h-3" />
                  <span>{browser} 5 Slots</span>
                </span>
                <button
                  type="button"
                  onClick={() => loadDefaultBrowserVersions(browser)}
                  className="text-cyan-400 hover:underline font-mono cursor-pointer"
                >
                  Reset 5 Builds
                </button>
              </div>
              {browserVersions.map((ver, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={ver}
                  onChange={e => handleBrowserVersionChange(idx, e.target.value)}
                  placeholder={`Slot #${idx + 1}`}
                  className="w-full px-2.5 py-1 rounded-lg border text-[11px] font-mono text-cyan-300"
                />
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
              Original pool browser versions preserved.
            </div>
          )}
        </div>

        {/* Card 3: In-App Browser (Incl. WeChat) */}
        <div className="oe-panel rounded-3xl p-5 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>3. In-App App</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsInAppVersionOn(!isInAppVersionOn)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono cursor-pointer border ${
                isInAppVersionOn
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/50'
                  : 'bg-slate-900 text-slate-500 border-slate-700'
              }`}
            >
              Ver: {isInAppVersionOn ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {inAppBrowsers.map(iab => {
              const InAppIconComponent = iab !== 'None' ? InAppIcons[iab] : null;
              const isSelected = inAppBrowser === iab;
              return (
                <button
                  key={iab}
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setInAppBrowser(iab);
                    if (iab !== 'None') loadDefaultInAppVersions(iab);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'border-fuchsia-400 bg-fuchsia-500/15 text-slate-100 font-bold shadow-[0_0_16px_-6px_rgba(232,121,249,0.6)]'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {InAppIconComponent ? (
                    <InAppIconComponent className="w-4 h-4" />
                  ) : (
                    <Globe2 className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-[9px] truncate w-full">{iab}</span>
                </button>
              );
            })}
          </div>

          {isInAppVersionOn && inAppBrowser !== 'None' ? (
            <div className="p-3 rounded-2xl border border-fuchsia-500/25 bg-slate-950/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-100 flex items-center gap-1">
                  {ActiveInAppIcon && <ActiveInAppIcon className="w-3 h-3" />}
                  <span>{inAppBrowser} 5 Slots</span>
                </span>
                <button
                  type="button"
                  onClick={() => loadDefaultInAppVersions(inAppBrowser)}
                  className="text-fuchsia-300 hover:underline font-mono cursor-pointer"
                >
                  Reset 5 Builds
                </button>
              </div>
              {inAppVersions.map((ver, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={ver}
                  onChange={e => handleInAppVersionChange(idx, e.target.value)}
                  placeholder={`Slot #${idx + 1}`}
                  className="w-full px-2.5 py-1 rounded-lg border text-[11px] font-mono text-fuchsia-300"
                />
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
              {isInAppVersionOn ? 'Pick an app tile to customize its 5 version slots.' : 'In-App override disabled.'}
            </div>
          )}
        </div>

        {/* Card 4: Country + Quantity Stepper + Generate CTA */}
        <div className="oe-panel rounded-3xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>4. Country / GEO</span>
              </h2>
              <span className="text-[10px] font-mono text-indigo-300 truncate max-w-[110px]">
                {country === 'No Language System'
                  ? 'No Lang'
                  : activeGeo && activeGeo.code !== 'ALL'
                  ? `${activeGeo.flag} ${activeGeo.locale}`
                  : '🌐 Global'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  placeholder="Search country..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border text-[11px] text-slate-100"
                />
              </div>
              {device === 'Android' && (
                <button
                  type="button"
                  onClick={() =>
                    setCountry(country === 'No Language System' ? 'All Countries' : 'No Language System')
                  }
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-mono font-bold border cursor-pointer shrink-0 ${
                    country === 'No Language System'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  No Lang
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {filteredCountries.map(c => {
                const isSelected = country === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCountry(c.name)}
                    className={`p-1.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/20 text-slate-100 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm shrink-0">{c.flag}</span>
                    <span className="text-[10px] truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quantity Stepper */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
                  <span>Quantity</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 5))}
                    className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-slate-100 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={quantity}
                    onChange={e => setQuantity(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-14 text-center py-1 rounded-lg border text-xs font-mono font-bold text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(1000, q + 5))}
                    className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-slate-100 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[10, 50, 100, 250, 500].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuantity(val)}
                    className={`py-1 rounded-lg text-[10px] font-mono border cursor-pointer ${
                      quantity === val
                        ? 'border-violet-500 bg-violet-500/20 text-violet-200 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3.5 px-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
              !creditAccess.allowed || selectedDeviceAvailable === 0
                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                : 'btn-premium-vivid'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {isGenerating
                ? 'Generating...'
                : !creditAccess.allowed
                ? creditAccess.hasUsablePackage
                  ? `Need ${effectiveCreditsNeeded} Cr`
                  : 'Unlock Package'
                : selectedDeviceAvailable === 0
                ? `No ${device} UAs in Pool`
                : `Generate User Agents`}
            </span>
            {!isGenerating && creditAccess.allowed && selectedDeviceAvailable > 0 && (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Results Table Console (Images 1 & 8) */}
      <div className="oe-panel rounded-3xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-100">Generated User Agents Console</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/35 text-violet-200 text-xs font-mono font-bold">
              {generatedResults.length} Ready
            </span>
            {metaInfo && metaInfo.fromPool > 0 && (
              <span className="text-[11px] font-mono text-emerald-400">
                ({metaInfo.fromPool} cut from pool)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {generatedResults.length > 0 && (
              <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setOutputTab('cards')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    outputTab === 'cards' ? 'bg-violet-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Rows
                </button>
                <button
                  type="button"
                  onClick={() => setOutputTab('terminal')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    outputTab === 'terminal' ? 'bg-violet-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Raw TXT
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={copyAll}
              disabled={generatedResults.length === 0}
              className="btn-premium-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All</span>
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              disabled={generatedResults.length === 0}
              className="btn-premium-cyan px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{outputFormat.toLowerCase()}</span>
            </button>
            <button
              type="button"
              onClick={saveResults}
              disabled={generatedResults.length === 0}
              className="btn-premium-emerald px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            {generatedResults.length > 0 && (
              <button
                type="button"
                onClick={handleClearResults}
                className="px-3 py-2 rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {generatedResults.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter generated strings by version, OS, or keyword..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-mono text-slate-100"
            />
          </div>
        )}

        {generatedResults.length === 0 ? (
          <div className="py-16 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center text-violet-300">
              <Smartphone className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-100">Ready to Forge Fresh User Agents</p>
              <p className="text-xs text-slate-400 max-w-md">
                Configure your Device, Browser, In-App Webview, Country, and Quantity above, then press{' '}
                <strong className="text-violet-300">Generate User Agents</strong>.
              </p>
            </div>
          </div>
        ) : outputTab === 'cards' ? (
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            <AnimatePresence>
              {filteredResults.map((ua, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: Math.min(idx * 0.015, 0.25) }}
                  className="p-3.5 rounded-2xl border border-slate-800/90 hover:border-violet-500/45 bg-slate-950/75 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <span className="px-2 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/30 text-violet-300 font-mono text-[10px] font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <code className="text-xs font-mono text-slate-200 break-all select-all leading-relaxed">
                      {ua}
                    </code>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => copySingle(ua, idx)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                        copiedIndex === idx
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-700 bg-slate-900 hover:border-violet-400 text-slate-200'
                      }`}
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSingleResult(ua, idx)}
                      className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Remove line"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <textarea
            readOnly
            rows={14}
            value={filteredResults.join('\n')}
            className="w-full p-4 rounded-2xl border bg-slate-950 font-mono text-xs text-violet-200 resize-none leading-relaxed"
          />
        )}

        {/* Privacy & Deduplication Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Duplicate Pool Cut Guarantee: every consumed User Agent is permanently retired from shared distribution.</span>
          </span>
          <span className="font-mono text-slate-500">
            {device} · {browser} {inAppBrowser !== 'None' ? `+ ${inAppBrowser}` : ''}
          </span>
        </div>
      </div>

      {/* How It Works Modal */}
      {howItWorksOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md oe-panel rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                <span>How User Agent Generator Works</span>
              </h3>
              <button
                type="button"
                onClick={() => setHowItWorksOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <li>1. Select your exact <strong>Target Device</strong> (strict device matching ensures an iPhone query never returns Android or Windows strings).</li>
              <li>2. Enable <strong>Browser Version</strong> or <strong>In-App Version</strong> cycling to rotate through up to 5 latest release builds evenly across your batch.</li>
              <li>3. Pick a target <strong>Country / GEO</strong> to inject localized language tags cleanly.</li>
              <li>4. Every generated User Agent is cut from the Admin Pool so no other user receives your string.</li>
            </ul>
            <button
              type="button"
              onClick={() => setHowItWorksOpen(false)}
              className="btn-premium-vivid w-full py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
