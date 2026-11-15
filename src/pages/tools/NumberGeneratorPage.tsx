import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { db, TOOL_CREDIT_COSTS } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  PhoneCall,
  Copy,
  Download,
  Bookmark,
  RefreshCw,
  Check,
  Database,
  Scissors,
  CheckCircle2,
  Search,
  Globe2,
  Trash2,
  Coins,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_COUNTRIES_WITH_GLOBAL, findCountryGeo } from '../../data/countries';
import { useDbSync } from '../../hooks/useDbSync';
import { PackageCreditGuard } from '../../components/ui/PackageCreditGuard';

export const NumberGeneratorPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();
  useDbSync();

  const prefs = db.getUserPreferences();
  const [country, setCountry] = useState<string>(() => prefs.defaultCountry || 'All Countries');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(() => Math.min(100, Math.max(1, prefs.defaultQuantity || 20)));
  const [numbers, setNumbers] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fromPool, setFromPool] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const numbersPool = db.getNumbers();
  const poolTotal = numbersPool.length;
  const poolConsumed = numbersPool.filter(n => n.used).length;
  const poolAvailable = poolTotal - poolConsumed;
  const requestedQty = Math.min(100, Math.max(1, Number(quantity) || 1));
  const effectiveItemsCount = poolAvailable > 0 ? Math.min(poolAvailable, requestedQty) : requestedQty;
  const effectiveCreditsNeeded = effectiveItemsCount * TOOL_CREDIT_COSTS.NUMBER;
  const creditAccess = db.canUseTool(user?.id, effectiveCreditsNeeded);

  const filteredCountries = ALL_COUNTRIES_WITH_GLOBAL.filter(c => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dial.toLowerCase().includes(q) ||
      c.locale.toLowerCase().includes(q)
    );
  });

  const selectedCountryMeta = findCountryGeo(country);

  const handleGenerate = () => {
    if (!user) {
      showToast('Please sign in to generate numbers.', 'error');
      navigate('/signin');
      return;
    }

    if (poolAvailable === 0) {
      showToast('Admin Database Pool is empty! Numbers must be uploaded from the Admin Panel first.', 'error');
      return;
    }

    const qty = Math.min(poolAvailable, Math.min(100, Math.max(1, Number(quantity) || 1)));
    const creditsRequired = qty * TOOL_CREDIT_COSTS.NUMBER;
    const access = db.canUseTool(user.id, creditsRequired);
    if (!access.allowed) {
      showToast(access.reason || 'Active package and credits are required to generate Numbers.', 'error');
      if (!access.hasUsablePackage) navigate('/payment');
      return;
    }

    setIsGenerating(true);

    try {
      const { results, fromPoolCount, error } = db.consumeNumbers(user.id, country, qty);
      if (error || results.length === 0) {
        showToast(error || 'No available Phone Numbers found in Admin Database Pool.', 'error');
        setIsGenerating(false);
        return;
      }

      setNumbers(results);
      setFromPool(fromPoolCount);
      refreshUser();
      playUiSound('generate');

      if (db.getUserPreferences().autoCopyAfterGenerate) {
        navigator.clipboard.writeText(results.join('\n'));
      }

      db.recordUsage(
        user.id,
        'number-generator',
        'Number Generator',
        results.length,
        'Success',
        `${country} · ${results.length} numbers`
      );

      showToast(
        `Generated & cut ${results.length} phone numbers from Admin Pool${
          access.isAdmin ? '' : ` (${results.length * TOOL_CREDIT_COSTS.NUMBER} credits used)`
        }!`,
        'success'
      );
    } catch {
      showToast('Failed to generate numbers.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copySingle = (num: string, idx: number) => {
    navigator.clipboard.writeText(num);
    playUiSound('copy');
    setCopiedIndex(idx);
    showToast(`Copied ${num}`, 'success');
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const copyAll = () => {
    if (numbers.length === 0) return;
    navigator.clipboard.writeText(numbers.join('\n'));
    playUiSound('copy');
    showToast('Copied all phone numbers to clipboard!', 'success');
  };

  const outputFormat = db.getUserPreferences().defaultOutputFormat || 'TXT';

  const downloadTxt = () => {
    if (numbers.length === 0) return;
    let body = numbers.join('\n');
    let mime = 'text/plain;charset=utf-8';
    const ext = outputFormat.toLowerCase();
    if (outputFormat === 'CSV') {
      body = 'PhoneNumber,Country\n' + numbers.map(n => `"${n}","${country}"`).join('\n');
      mime = 'text/csv;charset=utf-8';
    } else if (outputFormat === 'JSON') {
      body = JSON.stringify(numbers.map(phoneNumber => ({ phoneNumber, country })), null, 2);
      mime = 'application/json;charset=utf-8';
    }
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phone_numbers_${country.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    playUiSound('copy');
    showToast(`Downloaded numbers .${ext} file.`, 'success');
  };

  const saveResults = () => {
    if (!user || numbers.length === 0) return;
    const title = `Phone Numbers (${country} · ${numbers.length} items)`;
    db.saveResult(
      user.id,
      'number-generator',
      'Number Generator',
      title,
      numbers.join('\n'),
      numbers.length
    );
    playUiSound('generate');
    showToast('Saved results to your dashboard vault!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header matching Image 6 with Your Credits Card */}
      <div className="oe-panel rounded-3xl p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <RealisticToolIcon slug="number-generator" size="lg" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30">
                Admin Pool Synchronized
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-400/30 font-mono">
                {poolAvailable} Available · {poolConsumed} Cut
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <span>Phone Number Generator</span>
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Generate clean country-specific phone numbers pulled strictly from the synced Admin database pool.
            </p>
          </div>
        </div>

        {/* Your Credits Card */}
        <div className="oe-panel oe-rgb-violet rounded-2xl p-4 flex items-center gap-4 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-violet-500/20 border border-violet-400/35 flex items-center justify-center text-violet-300">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Your Credits</div>
            <div className="text-xl font-extrabold text-slate-100 font-mono">
              {creditAccess.isAdmin ? 'Unlimited' : (user?.credits ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-cyan-300 font-mono">2 Credits / Number</div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/payment')}
            className="btn-premium-primary px-3 py-2 rounded-xl text-[11px] cursor-pointer whitespace-nowrap"
          >
            Top Up
          </button>
        </div>
      </div>

      <PackageCreditGuard
        userId={user?.id}
        requiredCredits={effectiveCreditsNeeded}
        creditUnitLabel="2 Credits per Phone Number"
      />

      {/* Main 2-Column Split matching Image 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Generator Settings */}
        <div className="lg:col-span-5 oe-panel rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-violet-400" />
              <span>Generator Settings</span>
            </h2>
            <span className="text-[11px] font-mono text-cyan-300">
              {selectedCountryMeta.flag} {selectedCountryMeta.dial}
            </span>
          </div>

          {/* Country Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Quick Select Country</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
            >
              {ALL_COUNTRIES_WITH_GLOBAL.map(c => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name} ({c.dial})
                </option>
              ))}
            </select>
          </div>

          {/* Searchable 2-col Country Flag & Dial Code Grid */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search country or dial code (+1, +880)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredCountries.map(c => {
                const isSelected = country === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setCountry(c.name);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/20 text-slate-100 shadow-[0_0_16px_-6px_rgba(var(--oe-accent-rgb),0.55)]'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{c.flag}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold truncate">{c.name}</div>
                        <div className="text-[9px] font-mono text-slate-400 truncate">{c.dial}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-violet-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper & Slider */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Quantity</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 5))}
                  className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-slate-100 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-cyan-300 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(100, q + 5))}
                  className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-slate-100 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={100}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />

            <div className="grid grid-cols-5 gap-1.5">
              {[5, 10, 25, 50, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuantity(val)}
                  className={`py-1.5 rounded-lg text-[11px] font-mono border cursor-pointer ${
                    quantity === val
                      ? 'border-violet-500 bg-violet-500/20 text-slate-100 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Format Sample Preview */}
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs">
            <span className="text-slate-400">Pattern Preview</span>
            <span className="font-mono font-semibold text-cyan-300">{selectedCountryMeta.samplePhone}</span>
          </div>

          {/* Blue-to-Pink Generate CTA */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
              poolAvailable === 0 || !creditAccess.allowed
                ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-400/50'
                : 'btn-premium-vivid'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {isGenerating
                ? 'Generating Numbers...'
                : !creditAccess.allowed
                ? creditAccess.hasUsablePackage
                  ? `Need ${effectiveCreditsNeeded} Cr`
                  : 'Unlock Package to Generate'
                : poolAvailable === 0
                ? 'Admin Pool Empty'
                : `Generate Numbers (${effectiveItemsCount})`}
            </span>
          </button>
        </div>

        {/* Right Card: Generated Numbers */}
        <div className="lg:col-span-7 oe-panel rounded-3xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-100">Generated Numbers</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/35 text-violet-200 text-xs font-mono font-bold">
                {numbers.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNumbers([])}
                disabled={numbers.length === 0}
                className="btn-premium-glass px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear All</span>
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-premium-primary px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate Again</span>
              </button>
            </div>
          </div>

          {numbers.length > 0 && (
            <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-xs text-emerald-200">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Successfully retrieved <strong>{numbers.length}</strong> unique numbers ({fromPool} cut from Admin Pool).
                </span>
              </span>
              <span className="font-mono text-[11px] text-emerald-300">
                {selectedCountryMeta.flag} {selectedCountryMeta.code}
              </span>
            </div>
          )}

          {numbers.length === 0 ? (
            <div className="h-96 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <PhoneCall className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-100">No Phone Numbers Generated Yet</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Select your target country and batch size on the left, then click Generate Numbers.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <AnimatePresence>
                {numbers.map((num, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: Math.min(idx * 0.015, 0.25) }}
                    className="p-3 rounded-2xl border border-slate-800/90 hover:border-cyan-500/45 bg-slate-950/75 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-base shrink-0">{selectedCountryMeta.flag}</span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {num}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copySingle(num, idx)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0 ${
                        copiedIndex === idx
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-700 bg-slate-900 hover:border-cyan-400 text-slate-200'
                      }`}
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Bottom 3-Button Triad matching Image 6: Green Copy All | Blue Download | Purple Save */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={copyAll}
              disabled={numbers.length === 0}
              className="btn-premium-emerald py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All ({numbers.length})</span>
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              disabled={numbers.length === 0}
              className="btn-premium-cyan py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download as .{outputFormat.toLowerCase()}</span>
            </button>
            <button
              type="button"
              onClick={saveResults}
              disabled={numbers.length === 0}
              className="btn-premium-primary py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save to My List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Pool Note */}
      <div className="oe-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Scissors className="w-3.5 h-3.5 text-rose-400" />
          <span>Consumed phone numbers are automatically cut from the shared database pool.</span>
        </span>
        <span className="flex items-center gap-1.5 font-mono text-slate-500">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>{poolTotal} total uploaded</span>
        </span>
      </div>
    </div>
  );
};
