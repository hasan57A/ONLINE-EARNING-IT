import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db, TOOL_CREDIT_COSTS } from '../../services/db';
import {
  Mail,
  Copy,
  Download,
  Bookmark,
  RefreshCw,
  Info,
  Check,
  Layers,
  AtSign,
  Sliders,
  ShieldCheck,
  Terminal,
  Database,
  Scissors,
  CheckCircle2,
  Search,
  Globe2,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_COUNTRIES_WITH_GLOBAL, findCountryGeo } from '../../data/countries';
import { useDbSync } from '../../hooks/useDbSync';
import { PackageCreditGuard } from '../../components/ui/PackageCreditGuard';

export const MailGeneratorPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  useDbSync();

  const [country, setCountry] = useState<string>('All Countries');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(20);
  const [viewMode, setViewMode] = useState<'cards' | 'raw'>('cards');

  const [mails, setMails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fromPool, setFromPool] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const mailsPool = db.getMails();
  const poolTotal = mailsPool.length;
  const poolConsumed = mailsPool.filter(m => m.used).length;
  const poolAvailable = poolTotal - poolConsumed;
  const requestedQty = Math.min(100, Math.max(1, Number(quantity) || 1));
  const effectiveItemsCount = poolAvailable > 0 ? Math.min(poolAvailable, requestedQty) : requestedQty;
  const effectiveCreditsNeeded = effectiveItemsCount * TOOL_CREDIT_COSTS.MAIL;
  const creditAccess = db.canUseTool(user?.id, effectiveCreditsNeeded);

  const filteredCountries = ALL_COUNTRIES_WITH_GLOBAL.filter(c => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.locale.toLowerCase().includes(q) ||
      c.languageName.toLowerCase().includes(q)
    );
  });

  const selectedConfig = findCountryGeo(country);

  const handleGenerate = () => {
    if (!user) {
      showToast('Please sign in to generate emails.', 'error');
      return;
    }

    if (poolAvailable === 0) {
      showToast('Admin Database Pool is empty! Emails must be uploaded from the Admin Panel first.', 'error');
      return;
    }

    const qty = Math.min(poolAvailable, Math.min(100, Math.max(1, Number(quantity) || 1)));
    const creditsRequired = qty * TOOL_CREDIT_COSTS.MAIL;
    const access = db.canUseTool(user.id, creditsRequired);
    if (!access.allowed) {
      showToast(access.reason || 'Active package and credits are required to generate Emails.', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const { results, fromPoolCount, error } = db.consumeMails(user.id, country, qty);
      if (error || results.length === 0) {
        showToast(error || 'No available Emails found in Admin Database Pool.', 'error');
        setIsGenerating(false);
        return;
      }

      setMails(results);
      setFromPool(fromPoolCount);
      refreshUser();

      db.recordUsage(
        user.id,
        'mail-generator',
        'Mail Generator',
        results.length,
        'Success',
        `${country} · ${results.length} emails`
      );

      showToast(
        `Generated & cut ${results.length} emails from Admin Database Pool${
          access.isAdmin ? '' : ` (${results.length * TOOL_CREDIT_COSTS.MAIL} credits used)`
        }!`,
        'success'
      );
    } catch {
      showToast('Failed to generate emails.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copySingle = (email: string, idx: number) => {
    navigator.clipboard.writeText(email);
    setCopiedIndex(idx);
    showToast(`Copied ${email}`, 'success');
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const copyAll = () => {
    if (mails.length === 0) return;
    navigator.clipboard.writeText(mails.join('\n'));
    showToast('Copied all test emails to clipboard!', 'success');
  };

  const downloadTxt = () => {
    if (mails.length === 0) return;
    const blob = new Blob([mails.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test_emails_${country.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded email addresses TXT file.', 'success');
  };

  const saveResults = () => {
    if (!user || mails.length === 0) return;
    const title = `Test Emails (${country} · ${mails.length} addresses)`;
    db.saveResult(
      user.id,
      'mail-generator',
      'Mail Generator',
      title,
      mails.join('\n'),
      mails.length
    );
    showToast('Saved results to your dashboard!', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-fuchsia-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <RealisticToolIcon slug="mail-generator" size="lg" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Mail className="w-3 h-3 text-purple-400" />
                  Admin Pool Synchronized
                </span>
                <span className="text-slate-600 dark:text-slate-500">·</span>
                <span className="text-emerald-400 font-mono text-[11px]">All Countries & GEO Languages</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Mail Generator
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Strictly pulls verified email addresses uploaded in the Admin Panel and permanently cuts consumed entries to prevent duplicate issuance.
              </p>
            </div>
          </div>

          {/* Live Pool HUD */}
          <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <Database className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Total Uploaded</div>
                <div className="text-xs font-bold text-white font-mono tabular-nums">{poolTotal} Uploaded</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <Scissors className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Used / Cut</div>
                <div className="text-xs font-bold text-rose-400 font-mono tabular-nums">{poolConsumed} Cut</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Remaining</div>
                <div className="text-xs font-bold text-emerald-400 font-mono tabular-nums">{poolAvailable} Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package & Credit Enforcement Banner */}
      <PackageCreditGuard
        userId={user?.id}
        requiredCredits={effectiveCreditsNeeded}
        creditUnitLabel="3 Credits per Email Address"
      />

      {/* Pool Status Callout */}
      {poolAvailable === 0 ? (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-xs flex items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Admin Emails Pool is Empty (0 Available)</h4>
              <p className="text-amber-200/80 leading-relaxed mt-0.5">
                Emails <strong>only generate</strong> after the administrator uploads email addresses in the Admin Panel. Total uploaded: <strong className="font-mono tabular-nums">{poolTotal}</strong> · Used: <strong className="font-mono tabular-nums">{poolConsumed}</strong>.
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30 whitespace-nowrap">
            Upload Required
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 text-xs text-purple-700 dark:text-purple-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <p className="leading-relaxed">
              <strong className="font-mono tabular-nums">{poolAvailable}</strong> unused email addresses available in Admin Pool ({poolConsumed} consumed).
            </p>
          </div>
          <span className="font-mono text-[11px] font-bold text-purple-400">
            {selectedConfig.flag} {selectedConfig.locale}
          </span>
        </div>
      )}

      {/* Main Grid: Controls vs Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                  Mailbox Configuration
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Global GEOs
              </span>
            </div>

            {/* Target Country & Domain Tiles */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Target Country / GEO Language</span>
                </label>
                <span className="text-[11px] font-mono text-purple-400 font-semibold truncate max-w-[160px]">
                  {selectedConfig.flag} {selectedConfig.locale}
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  placeholder="Search country, domain, or GEO language..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredCountries.map(c => {
                  const isSelected = country === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCountry(c.name)}
                      className={`group relative p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10 shadow-sm shadow-purple-500/20 ring-1 ring-purple-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none shrink-0">{c.flag}</span>
                        <div className="min-w-0">
                          <p className={`text-[11px] font-medium truncate ${isSelected ? 'text-purple-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                            {c.name}
                          </p>
                          <p className="text-[9px] font-mono text-slate-400 truncate">
                            {c.locale} · @{c.domain}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center shrink-0 ml-1">
                          <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Slider & Presets */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Quantity To Generate
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 tabular-nums">
                    {quantity} emails
                  </span>
                </div>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min={1}
                max={100}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[5, 10, 25, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuantity(val)}
                    className={`py-1.5 text-[11px] font-mono rounded-lg transition-colors cursor-pointer border ${
                      quantity === val
                        ? 'border-purple-500/40 bg-purple-500/20 text-purple-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Domain Preview */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Target Sandbox Domain</span>
              <p className="font-mono text-purple-400 font-semibold flex items-center gap-2">
                <AtSign className="w-3.5 h-3.5" />
                alex.doe@{selectedConfig.domain}
              </p>
            </div>

            {/* Action Trigger */}
            <motion.button
              whileTap={{ scale: poolAvailable > 0 && creditAccess.allowed ? 0.98 : 1 }}
              onClick={handleGenerate}
              disabled={isGenerating || poolAvailable === 0 || !creditAccess.allowed}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 transition-all ${
                poolAvailable === 0 || !creditAccess.allowed
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25 cursor-pointer'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isGenerating
                  ? 'Retrieving Emails...'
                  : !creditAccess.allowed
                  ? creditAccess.hasActivePackage && creditAccess.remainingCredits > 0
                    ? `Need ${effectiveCreditsNeeded} Cr (${creditAccess.remainingCredits} left)`
                    : 'Package & Credits Required'
                  : poolAvailable === 0
                  ? 'Admin Must Upload Emails First'
                  : `Generate & Cut ${effectiveItemsCount} Emails${
                      creditAccess.isAdmin ? '' : ` (${effectiveCreditsNeeded} Cr)`
                    }`}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl space-y-5">
            {/* Output Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Generated Email Records
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold tabular-nums">
                  {mails.length} addresses
                </span>
              </div>

              <div className="flex items-center gap-2">
                {fromPool > 0 && (
                  <span className="text-[11px] font-medium text-purple-400 flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    {fromPool} matched from pool
                  </span>
                )}

                {/* View Mode Toggle */}
                {mails.length > 0 && (
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        viewMode === 'cards'
                          ? 'bg-purple-600 text-white font-bold shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      Tiles
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('raw')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        viewMode === 'raw'
                          ? 'bg-purple-600 text-white font-bold shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Terminal className="w-3 h-3" />
                      Raw
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Output Display */}
            {mails.length === 0 ? (
              <div className="h-96 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Mail className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    No Email Addresses Generated
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    Select a GEO sandbox domain on the left, adjust quantity slider, and trigger generation to view test email cards.
                  </p>
                </div>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {mails.map((email, idx) => {
                    const localPart = email.split('@')[0] || '';
                    const initial = localPart.charAt(0).toUpperCase() || 'E';
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.4) }}
                        className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 bg-slate-50/70 dark:bg-slate-950/70 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-400 transition-colors">
                              {email}
                            </p>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              {selectedConfig.flag} RFC 2606 · Safe QA
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copySingle(email, idx)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            copiedIndex === idx
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : 'border-slate-200 dark:border-slate-800 hover:border-purple-500 bg-white dark:bg-slate-900 text-slate-500 hover:text-purple-400'
                          }`}
                          title="Copy this email address"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  readOnly
                  rows={16}
                  value={mails.join('\n')}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-purple-300 focus:outline-none resize-none leading-relaxed selection:bg-purple-500/30"
                />
              </div>
            )}

            {/* Action Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={copyAll}
                disabled={mails.length === 0}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 text-purple-400" />
                <span>Copy All ({mails.length})</span>
              </button>

              <button
                type="button"
                onClick={downloadTxt}
                disabled={mails.length === 0}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Download TXT</span>
              </button>

              <button
                type="button"
                onClick={saveResults}
                disabled={mails.length === 0}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
