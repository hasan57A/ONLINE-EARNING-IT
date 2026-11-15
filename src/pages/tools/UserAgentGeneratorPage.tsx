import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
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
  Code2,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Scissors,
  X,
  Trash2,
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
};

export const UserAgentGeneratorPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();

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
  ] as const;

  useDbSync();

  const deviceDetails: Record<(typeof devices)[number], { badge: string; chip: string; resolution: string }> = {
    iPhone: { badge: 'iOS 17.4+ Mobile', chip: 'Apple A17 Pro Bionic', resolution: '393 × 852' },
    iPad: { badge: 'iPadOS 17 Retina', chip: 'Apple M4 Ultra Core', resolution: '1024 × 1366' },
    Android: { badge: 'Android OS Mobile', chip: 'Google Tensor G4 / Snapdragon', resolution: '412 × 915' },
    Windows: { badge: 'Windows 11 x64', chip: 'Intel Core i9 / AMD Ryzen', resolution: '1920 × 1080' },
    macOS: { badge: 'macOS Sonoma', chip: 'Apple Silicon ARM64 / M3', resolution: '1728 × 1117' },
  };

  // Target Selections
  const [device, setDevice] = useState<(typeof devices)[number]>('Windows');
  const [browser, setBrowser] = useState<string>('Chrome');
  const [inAppBrowser, setInAppBrowser] = useState<string>('None');
  const [country, setCountry] = useState<string>('All Countries');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);

  // 1. Browser Version ON / OFF Toggle
  const [isBrowserVersionOn, setIsBrowserVersionOn] = useState<boolean>(true);
  // Up to 5 simultaneous browser version slots
  const [browserVersions, setBrowserVersions] = useState<string[]>([
    '124.0.6367.60',
    '123.0.6312.86',
    '122.0.6261.94',
    '121.0.6167.85',
    '120.0.6099.109',
  ]);

  // 2. In-App Webview Version ON / OFF Toggle
  const [isInAppVersionOn, setIsInAppVersionOn] = useState<boolean>(false);
  // Up to 5 simultaneous in-app version slots
  const [inAppVersions, setInAppVersions] = useState<string[]>([
    '452.0.0.38.109',
    '448.0.0.32.115',
    '440.0.0.28.110',
    '435.0.0.22.115',
    '430.0.0.20.108',
  ]);

  // Output State
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [metaInfo, setMetaInfo] = useState<{ fromPool: number; procedural: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [outputTab, setOutputTab] = useState<'cards' | 'terminal'>('cards');

  // Live Admin Pool Statistics (Global + Strict Per-Device)
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

  // Filter Safari: Show Safari only for iPhone, iPad, macOS. Hide for Windows and Android.
  const availableBrowsers = browsers.filter(b => {
    if (b === 'Safari') {
      return device === 'iPhone' || device === 'iPad' || device === 'macOS';
    }
    return true;
  });

  const handleDeviceChange = (newDevice: (typeof devices)[number]) => {
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

  // Generation & Admin Pool Consumption Handler
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

      // Consume strictly from Admin Database Pool with 5-version cycling & cutting from pool
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

      // Record in usage history
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
    showToast('Copied all user agents to clipboard!', 'success');
  };

  const copySingle = (ua: string, idx: number) => {
    navigator.clipboard.writeText(ua);
    setCopiedIndex(idx);
    showToast('User agent copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const downloadTxt = () => {
    if (generatedResults.length === 0) return;
    const blob = new Blob([generatedResults.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_agents_${device.toLowerCase()}_${country.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded user agents TXT file.', 'success');
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
    showToast('Results saved to your dashboard!', 'success');
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
    <div className="space-y-8">
      {/* Top Workstation Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-950 via-blue-950/70 to-indigo-950/60 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative group">
              <RealisticToolIcon slug="user-agent-generator" size="lg" />
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-blue-500/60 shadow-lg">
                <ActiveDeviceIcon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wider uppercase">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm">
                  <Database className="w-3 h-3 text-cyan-400" />
                  Admin Database Synchronized
                </span>
                <span className="text-slate-600 dark:text-slate-500">·</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono text-[10px]">
                  Version ON / OFF System
                </span>
                <span className="text-slate-600 dark:text-slate-500">·</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono text-[10px]">
                  5 Simultaneous Version Slots
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                User Agent Generator
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse hidden sm:inline" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Fetches records from the Admin database pool, executes 5-version cycling when Version ON is enabled, and permanently cuts consumed items to prevent duplicate distribution.
              </p>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <Database className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Total Uploaded</div>
                <div className="text-xs font-bold text-white font-mono">{adminPool.length} Uploaded</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <Scissors className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Used / Consumed</div>
                <div className="text-xs font-bold text-rose-400 font-mono">{poolConsumed} Cut</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Remaining</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">{poolAvailable} Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PACKAGE & CREDIT ENFORCEMENT BANNER */}
      <PackageCreditGuard
        userId={user?.id}
        requiredCredits={effectiveCreditsNeeded}
        creditUnitLabel="1 Credit per User Agent"
      />

      {/* DYNAMIC ADMIN POOL STATUS BANNER */}
      {poolAvailable === 0 || selectedDeviceAvailable === 0 ? (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-xs flex items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">
                {poolAvailable === 0
                  ? 'Admin Database Pool is Empty (0 Available)'
                  : `0 Unused "${device}" User Agents Available`}
              </h4>
              <p className="text-amber-200/80 leading-relaxed mt-0.5">
                {poolAvailable === 0 ? (
                  <>
                    User agents <strong>only generate</strong> from Admin Panel uploads. Total uploaded: <strong className="font-mono tabular-nums">{adminPool.length}</strong> · Used: <strong className="font-mono tabular-nums">{poolConsumed}</strong>.
                  </>
                ) : (
                  <>
                    Strict device matching is active: only User Agents imported under <strong>{device}</strong> can be generated for {device}. Uploaded for {device}: <strong className="font-mono tabular-nums">{selectedDeviceStats.total}</strong> · Used: <strong className="font-mono tabular-nums">{selectedDeviceStats.used}</strong> · Available: <strong>0</strong>.
                  </>
                )}
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30 whitespace-nowrap">
            Upload Required
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs font-mono tabular-nums">
                {device} Pool Ready ({selectedDeviceAvailable} Available · {selectedDeviceStats.used} Used · {selectedDeviceStats.total} Uploaded)
              </h4>
              <p className="text-emerald-200/80 text-[11px] mt-0.5">
                Total Master Pool: {adminPool.length} Uploaded · {poolConsumed} Cut · {poolAvailable} Remaining. Strict device isolation active.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 whitespace-nowrap">
            Pool Active
          </span>
        </div>
      )}

      {/* WORKSTATION CONTROLS & OUTPUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: All Options with VERSION ON/OFF Systems */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  Workstation Configuration
                </h2>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                5-Version Cycling
              </span>
            </div>

            {/* 1. TARGET DEVICE */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>1. Target Device (Strict Match)</span>
                </label>
                <span className="text-[11px] font-mono text-blue-400 font-semibold tabular-nums">
                  {device} · {selectedDeviceAvailable} avail
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {devices.map(d => {
                  const DeviceIconComponent = DeviceIcons[d];
                  const isSelected = device === d;
                  const details = deviceDetails[d];
                  const dStat = deviceStats[d];

                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDeviceChange(d)}
                      className={`relative p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600/15 text-white font-bold ring-1 ring-blue-500/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-400 dark:hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <DeviceIconComponent className="w-4 h-4" />
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tabular-nums ${
                            dStat.available > 0
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {dStat.available}/{dStat.total}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <span>{d}</span>
                          {isSelected && <Check className="w-3 h-3 text-blue-400 stroke-[3]" />}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400">{details.badge}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. WEB BROWSER ENGINE WITH VERSION ON / OFF SYSTEM */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Web Browser Engine</span>
                </label>

                {/* VERSION ON / OFF TOGGLE SWITCH */}
                <button
                  type="button"
                  onClick={() => setIsBrowserVersionOn(!isBrowserVersionOn)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                    isBrowserVersionOn
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                  }`}
                  title="Toggle Browser Version replacement ON/OFF"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isBrowserVersionOn ? 'bg-slate-950 animate-pulse' : 'bg-slate-500'}`} />
                  <span>VERSION: {isBrowserVersionOn ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* Browser Selection Grid */}
              <div className="grid grid-cols-5 gap-1.5">
                {availableBrowsers.map(b => {
                  const BrowserIconComponent = BrowserIcons[b];
                  const isSelected = browser === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setBrowser(b);
                        loadDefaultBrowserVersions(b);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-600/20 text-white font-bold ring-1 ring-cyan-500/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <BrowserIconComponent className="w-4 h-4" />
                      <span className="text-[10px] truncate w-full">{b}</span>
                    </button>
                  );
                })}
              </div>

              {/* 5 BROWSER VERSION SLOTS (Shown when Version is ON) */}
              {isBrowserVersionOn ? (
                <div className="p-3.5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900/90 to-slate-950 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <ActiveBrowserIcon className="w-3.5 h-3.5" />
                      <span>{browser} 5 Target Versions (Cycling)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadDefaultBrowserVersions(browser)}
                      className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Load 5 Latest Builds</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {browserVersions.map((ver, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 w-12 shrink-0">
                          Slot #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ver}
                          onChange={e => handleBrowserVersionChange(idx, e.target.value)}
                          placeholder={`Version slot ${idx + 1}...`}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-slate-950 font-mono text-xs text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                        />
                        {ver && (
                          <button
                            type="button"
                            onClick={() => handleBrowserVersionChange(idx, '')}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                  <span>Browser Version: OFF</span>
                  <span className="text-slate-400">Original database version will be preserved</span>
                </div>
              )}
            </div>

            {/* 3. IN-APP WEBVIEW (SOCIAL APPS) WITH VERSION ON / OFF SYSTEM */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3. In-App Webview (Social Apps)</span>
                </label>

                {/* IN-APP VERSION ON / OFF TOGGLE SWITCH */}
                <button
                  type="button"
                  onClick={() => setIsInAppVersionOn(!isInAppVersionOn)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                    isInAppVersionOn
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                  }`}
                  title="Toggle In-App Webview Version replacement ON/OFF"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isInAppVersionOn ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
                  <span>VERSION: {isInAppVersionOn ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* In-App App Selection Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {inAppBrowsers.map(iab => {
                  const InAppIconComponent = iab !== 'None' ? InAppIcons[iab] : null;
                  const isSelected = inAppBrowser === iab;
                  return (
                    <button
                      key={iab}
                      type="button"
                      onClick={() => {
                        setInAppBrowser(iab);
                        if (iab !== 'None') loadDefaultInAppVersions(iab);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold ring-1 ring-indigo-500/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 hover:border-slate-400'
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

              {/* 5 IN-APP VERSION SLOTS (Shown when Version is ON and App is selected) */}
              {isInAppVersionOn && inAppBrowser !== 'None' ? (
                <div className="p-3.5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-slate-900/90 to-slate-950 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      {ActiveInAppIcon && <ActiveInAppIcon className="w-3.5 h-3.5" />}
                      <span>{inAppBrowser} 5 Target Versions (Cycling)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadDefaultInAppVersions(inAppBrowser)}
                      className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Load 5 Latest Releases</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {inAppVersions.map((ver, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 w-12 shrink-0">
                          Slot #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ver}
                          onChange={e => handleInAppVersionChange(idx, e.target.value)}
                          placeholder={`In-App Version slot ${idx + 1}...`}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-slate-950 font-mono text-xs text-indigo-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400"
                        />
                        {ver && (
                          <button
                            type="button"
                            onClick={() => handleInAppVersionChange(idx, '')}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                  <span>In-App Version: {isInAppVersionOn ? 'Select an app above' : 'OFF'}</span>
                  <span className="text-slate-400">Original in-app token preserved</span>
                </div>
              )}
            </div>

            {/* 4. ALL COUNTRY / GEO TARGET LANGUAGE */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>4. All Country / GEO Target Language</span>
                </label>
                <span className="text-[10px] text-blue-400 font-mono truncate">
                  {country === 'No Language System'
                    ? 'No Language Tag'
                    : activeGeo && activeGeo.code !== 'ALL'
                    ? `${activeGeo.flag} ${activeGeo.locale}`
                    : '🌐 All GEOs'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={e => setCountrySearch(e.target.value)}
                    placeholder="Search country or language (e.g. Bangladesh, bn-BD, en-US)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                {device === 'Android' && (
                  <button
                    type="button"
                    onClick={() =>
                      setCountry(country === 'No Language System' ? 'All Countries' : 'No Language System')
                    }
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-colors cursor-pointer shrink-0 ${
                      country === 'No Language System'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Strip language tags from Android UAs"
                  >
                    No Lang
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {filteredCountries.map(c => {
                  const isSelected = country === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCountry(c.name)}
                      className={`p-1.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950/50 text-white font-bold ring-1 ring-blue-500/50'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <span className="text-sm shrink-0">{c.flag}</span>
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold truncate">{c.name}</div>
                        <div className="text-[9px] font-mono text-slate-400 truncate">{c.locale}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. QUANTITY BATCH SLIDER (Max 1,000) */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Batch Quantity (Max 1,000)</span>
                </label>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20 tabular-nums">
                  {quantity} UAs
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={1000}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />

              <div className="grid grid-cols-6 gap-1.5">
                {[10, 50, 100, 250, 500, 1000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuantity(val)}
                    className={`py-1.5 text-[10px] font-mono rounded-lg transition-all cursor-pointer border ${
                      quantity === val
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATE TRIGGER BUTTON */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 rounded-2xl font-extrabold text-xs tracking-wider uppercase shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer ${
                !creditAccess.allowed
                  ? 'bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-500/40'
                  : selectedDeviceAvailable === 0
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-slate-950 shadow-cyan-500/25'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isGenerating
                  ? `Generating ${quantity} Signatures...`
                  : !creditAccess.allowed
                  ? creditAccess.hasUsablePackage
                    ? `Insufficient Credits (${creditAccess.remainingCredits} left) — Click for Packages`
                    : 'Package Required — Click to Take a Package'
                  : selectedDeviceAvailable === 0
                  ? `No ${device} User Agents in Pool`
                  : `Generate & Cut ${effectiveCreditsNeeded} ${device} UAs${
                      creditAccess.isAdmin ? '' : ` (${effectiveCreditsNeeded} Cr)`
                    }`}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Right Column: Output Workstation Console */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl space-y-5">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Generated Console
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {generatedResults.length} Ready
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                  {metaInfo ? (
                    <span>
                      {metaInfo.fromPool > 0 && (
                        <strong className="text-emerald-400">
                          {metaInfo.fromPool} retrieved & cut from Admin Database Pool ·{' '}
                        </strong>
                      )}
                      Device: {device} · Browser: {browser}
                    </span>
                  ) : (
                    <span>Ready for generation</span>
                  )}
                </div>
              </div>

              {/* View Switcher + Clear Console Button */}
              {generatedResults.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setOutputTab('cards')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        outputTab === 'cards'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutputTab('terminal')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        outputTab === 'terminal'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Terminal className="w-3 h-3" />
                      Raw
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearResults}
                    className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Clear generated output"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>

            {/* Keyword Search Filter */}
            {generatedResults.length > 0 && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter generated results by keyword or version..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-inner"
                />
              </div>
            )}

            {/* Output Display Area */}
            {generatedResults.length === 0 ? (
              <div className="h-[460px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-inner">
                  <Smartphone className="w-12 h-12 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
                    Console Ready for Generation
                  </p>
                  <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Select your device, configure the 5-version slots with Version ON/OFF switches, and click <strong>Generate</strong> to retrieve and cut records from the database pool.
                  </p>
                </div>
              </div>
            ) : outputTab === 'cards' ? (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {filteredResults.map((ua, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.3) }}
                      className="group p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 bg-slate-50/70 dark:bg-slate-950/70 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {device} · {browser} {inAppBrowser !== 'None' && `+ ${inAppBrowser}`}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            ({ua.length} chars)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copySingle(ua, idx)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              copiedIndex === idx
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500 bg-white dark:bg-slate-900 text-slate-400 hover:text-cyan-400'
                            }`}
                            title="Copy this User Agent"
                          >
                            {copiedIndex === idx ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSingleResult(ua, idx)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                            title="Clear this User Agent from list"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="font-mono text-xs text-slate-800 dark:text-cyan-300 break-all select-all leading-relaxed bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 group-hover:border-cyan-500/30 transition-colors">
                        {ua}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    readOnly
                    rows={16}
                    value={filteredResults.join('\n')}
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 font-mono text-xs text-cyan-300 focus:outline-none resize-none leading-relaxed selection:bg-cyan-500/30 shadow-inner"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
                  <span>Showing {filteredResults.length} of {generatedResults.length} records</span>
                  <span>UTF-8 Raw Output</span>
                </div>
              </div>
            )}

            {/* Action Bar Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                type="button"
                onClick={copyAll}
                disabled={generatedResults.length === 0}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyan-500 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Copy All ({generatedResults.length})</span>
              </button>

              <button
                type="button"
                onClick={downloadTxt}
                disabled={generatedResults.length === 0}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download TXT</span>
              </button>

              <button
                type="button"
                onClick={saveResults}
                disabled={generatedResults.length === 0}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save Results</span>
              </button>

              <button
                type="button"
                onClick={handleClearResults}
                disabled={generatedResults.length === 0}
                className="py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
