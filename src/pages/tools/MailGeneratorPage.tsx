import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { db, TOOL_CREDIT_COSTS } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Mail,
  Copy,
  Download,
  Bookmark,
  RefreshCw,
  Check,
  Layers,
  AtSign,
  Sliders,
  ShieldCheck,
  Terminal,
  Database,
  Scissors,
  Search,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_COUNTRIES_WITH_GLOBAL, findCountryGeo } from '../../data/countries';
import { useDbSync } from '../../hooks/useDbSync';
import { PackageCreditGuard } from '../../components/ui/PackageCreditGuard';

export const MailGeneratorPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();
  useDbSync();

  const prefs = db.getUserPreferences();
  const [country, setCountry] = useState<string>(() => prefs.defaultCountry || 'All Countries');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<'all' | 'gmail.com' | 'outlook.com' | 'country'>('all');
  const [quantity, setQuantity] = useState<number>(() => Math.min(100, Math.max(1, prefs.defaultQuantity || 20)));
  const [viewMode, setViewMode] = useState<'cards' | 'raw'>('cards');
  const [mails, setMails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fromPool, setFromPool] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const selectedConfig = findCountryGeo(country);
  const resolvedDomain = selectedDomain === 'country' ? selectedConfig.domain : selectedDomain;
  const activeDomainDisplay = selectedDomain === 'all' ? 'gmail.com' : resolvedDomain;

  const mailsPool = db.getMails();
  const availablePoolEntries = mailsPool.filter(m => !m.used);
  const poolTotal = mailsPool.length;
  const poolConsumed = mailsPool.filter(m => m.used).length;
  const poolAvailable = availablePoolEntries.length;
  const gmailAvailable = availablePoolEntries.filter(m => m.email.toLowerCase().endsWith('@gmail.com')).length;
  const outlookAvailable = availablePoolEntries.filter(m => m.email.toLowerCase().endsWith('@outlook.com')).length;
  const countryDomainAvailable = availablePoolEntries.filter(m =>
    m.email.toLowerCase().endsWith(`@${selectedConfig.domain.toLowerCase()}`)
  ).length;
  const filteredPoolAvailable =
    selectedDomain === 'all'
      ? poolAvailable
      : availablePoolEntries.filter(m => m.email.toLowerCase().endsWith(`@${resolvedDomain.toLowerCase()}`)).length;

  const requestedQty = Math.min(100, Math.max(1, Number(quantity) || 1));
  const effectiveItemsCount = filteredPoolAvailable > 0 ? Math.min(filteredPoolAvailable, requestedQty) : requestedQty;
  const effectiveCreditsNeeded = effectiveItemsCount * TOOL_CREDIT_COSTS.MAIL;
  const creditAccess = db.canUseTool(user?.id, effectiveCreditsNeeded);

  const filteredCountries = ALL_COUNTRIES_WITH_GLOBAL.filter(c => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.locale.toLowerCase().includes(q)
    );
  });

  const handleGenerate = () => {
    if (!user) {
      showToast('Please sign in to generate emails.', 'error');
      return;
    }

    if (poolAvailable === 0) {
      showToast('Admin Database Pool is empty! Emails must be uploaded from the Admin Panel first.', 'error');
      return;
    }

    if (filteredPoolAvailable === 0) {
      showToast(
        `No @${resolvedDomain} emails available in Admin Pool. Upload @${resolvedDomain} emails in Admin Panel or select All Domains.`,
        'error'
      );
      return;
    }

    const qty = Math.min(filteredPoolAvailable, Math.min(100, Math.max(1, Number(quantity) || 1)));
    const creditsRequired = qty * TOOL_CREDIT_COSTS.MAIL;
    const access = db.canUseTool(user.id, creditsRequired);
    if (!access.allowed) {
      showToast(access.reason || 'Active package and credits are required to generate Emails.', 'error');
      if (!access.hasUsablePackage) navigate('/payment');
      return;
    }

    setIsGenerating(true);

    try {
      const { results, fromPoolCount, error } = db.consumeMails(user.id, country, qty, resolvedDomain);
      if (error || results.length === 0) {
        showToast(error || 'No available Emails found in Admin Database Pool.', 'error');
        setIsGenerating(false);
        return;
      }

      setMails(results);
      setFromPool(fromPoolCount);
      refreshUser();
      playUiSound('generate');

      if (db.getUserPreferences().autoCopyAfterGenerate) {
        navigator.clipboard.writeText(results.join('\n'));
      }

      const domainTag = selectedDomain === 'all' ? 'All Domains' : `@${resolvedDomain}`;
      db.recordUsage(
        user.id,
        'mail-generator',
        'Mail Generator',
        results.length,
        'Success',
        `${country} · ${domainTag} · ${results.length} emails`
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
    playUiSound('copy');
    setCopiedIndex(idx);
    showToast(`Copied ${email}`, 'success');
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const copyAll = () => {
    if (mails.length === 0) return;
    navigator.clipboard.writeText(mails.join('\n'));
    playUiSound('copy');
    showToast('Copied all emails to clipboard!', 'success');
  };

  const outputFormat = db.getUserPreferences().defaultOutputFormat || 'TXT';

  const downloadTxt = () => {
    if (mails.length === 0) return;
    let body = mails.join('\n');
    let mime = 'text/plain;charset=utf-8';
    const ext = outputFormat.toLowerCase();
    if (outputFormat === 'CSV') {
      body = 'Email,Country\n' + mails.map(m => `"${m}","${country}"`).join('\n');
      mime = 'text/csv;charset=utf-8';
    } else if (outputFormat === 'JSON') {
      body = JSON.stringify(mails.map(email => ({ email, country })), null, 2);
      mime = 'application/json;charset=utf-8';
    }
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emails_${country.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    playUiSound('copy');
    showToast(`Downloaded email addresses ${outputFormat} file.`, 'success');
  };

  const saveResults = () => {
    if (!user || mails.length === 0) return;
    db.saveResult(
      user.id,
      'mail-generator',
      'Mail Generator',
      `Test Emails (${country} · ${mails.length} addresses)`,
      mails.join('\n'),
      mails.length
    );
    playUiSound('generate');
    showToast('Saved results to your dashboard vault!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="oe-panel rounded-3xl p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <RealisticToolIcon slug="mail-generator" size="lg" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Admin Pool Synchronized
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-400/30 font-mono">
                3 Credits / Email
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <span>Mail Generator</span>
              <Sparkles className="w-5 h-5 text-violet-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Pull verified email records from the synced Admin database pool and retire consumed entries permanently.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-2xl border border-slate-800 bg-slate-950/75">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Uploaded</div>
            <div className="text-xs font-bold text-slate-100 font-mono">{poolTotal}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Cut</div>
            <div className="text-xs font-bold text-rose-400 font-mono">{poolConsumed}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/25">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Available</div>
            <div className="text-xs font-bold text-emerald-400 font-mono">{poolAvailable}</div>
          </div>
        </div>
      </div>

      <PackageCreditGuard
        userId={user?.id}
        requiredCredits={effectiveCreditsNeeded}
        creditUnitLabel="3 Credits per Email Address"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 oe-panel rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>Mailbox Settings</span>
            </h2>
            <span className="text-[11px] font-mono text-violet-300">
              {selectedConfig.flag} {selectedDomain === 'all' ? 'All Domains' : `@${resolvedDomain}`}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-violet-400" />
              <span>Email Domain</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all' as const, label: 'All Domains', sub: 'Mixed pool', count: poolAvailable },
                { id: 'gmail.com' as const, label: '@gmail.com', sub: 'Google Mail', count: gmailAvailable },
                { id: 'outlook.com' as const, label: '@outlook.com', sub: 'Microsoft', count: outlookAvailable },
                {
                  id: 'country' as const,
                  label: `@${selectedConfig.domain}`,
                  sub: 'Country GEO',
                  count: countryDomainAvailable,
                },
              ].map(dom => {
                const isSelected = selectedDomain === dom.id;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setSelectedDomain(dom.id);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/20 text-slate-100 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono truncate">{dom.label}</div>
                      <div className="text-[9px] text-slate-400 truncate">{dom.sub}</div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
                        dom.count > 0
                          ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                          : 'bg-slate-800/70 text-slate-500'
                      }`}
                    >
                      {dom.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Target Country</span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search country or domain..."
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
                    onClick={() => setCountry(c.name)}
                    className={`p-2 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/20 text-slate-100 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{c.flag}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] truncate">{c.name}</div>
                        <div className="text-[9px] font-mono text-slate-400 truncate">
                          @{selectedDomain === 'all' || selectedDomain === 'country' ? c.domain : selectedDomain}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-violet-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Quantity</span>
              <span className="font-mono font-bold text-violet-300">{quantity} emails</span>
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
                  className={`py-1.5 text-[11px] font-mono rounded-lg border cursor-pointer ${
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

          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 text-xs flex items-center justify-between">
            <span className="text-slate-400">Sample Pattern</span>
            <span className="font-mono text-violet-300 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5" />
              alex.doe@{activeDomainDisplay}
            </span>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
              filteredPoolAvailable === 0 || !creditAccess.allowed
                ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-400/50'
                : 'btn-premium-vivid'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {!creditAccess.allowed
                ? creditAccess.hasUsablePackage
                  ? `Need ${effectiveCreditsNeeded} Cr`
                  : 'Unlock Package to Generate'
                : poolAvailable === 0
                ? 'Admin Must Upload Emails'
                : filteredPoolAvailable === 0
                ? `No @${resolvedDomain} in Pool`
                : `Generate ${effectiveItemsCount} ${selectedDomain === 'all' ? 'Emails' : `@${resolvedDomain}`}`}
            </span>
          </button>
        </div>

        <div className="lg:col-span-7 oe-panel rounded-3xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-100">Generated Email Records</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/35 text-violet-200 text-xs font-mono font-bold">
                {mails.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {fromPool > 0 && (
                <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {fromPool} cut
                </span>
              )}
              {mails.length > 0 && (
                <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1 ${
                      viewMode === 'cards' ? 'bg-violet-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <Layers className="w-3 h-3" /> Tiles
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('raw')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1 ${
                      viewMode === 'raw' ? 'bg-violet-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <Terminal className="w-3 h-3" /> Raw
                  </button>
                </div>
              )}
            </div>
          </div>

          {mails.length === 0 ? (
            <div className="h-96 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center text-violet-300">
                <Mail className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-100">No Email Addresses Generated</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Select a country, adjust quantity, and click Generate to retrieve email records.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              <AnimatePresence>
                {mails.map((email, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: Math.min(idx * 0.015, 0.25) }}
                    className="p-3 rounded-2xl border border-slate-800 hover:border-violet-500/45 bg-slate-950/75 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-mono text-xs text-slate-200 truncate">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copySingle(email, idx)}
                      className={`p-1.5 rounded-lg border cursor-pointer shrink-0 ${
                        copiedIndex === idx
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-700 bg-slate-900 text-slate-300'
                      }`}
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <textarea
              readOnly
              rows={15}
              value={mails.join('\n')}
              className="w-full p-4 rounded-2xl border bg-slate-950 font-mono text-xs text-violet-200 resize-none leading-relaxed"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={copyAll}
              disabled={mails.length === 0}
              className="btn-premium-emerald py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All ({mails.length})</span>
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              disabled={mails.length === 0}
              className="btn-premium-cyan py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{outputFormat.toLowerCase()}</span>
            </button>
            <button
              type="button"
              onClick={saveResults}
              disabled={mails.length === 0}
              className="btn-premium-primary py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Results</span>
            </button>
          </div>
        </div>
      </div>

      <div className="oe-panel rounded-2xl p-4 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Scissors className="w-3.5 h-3.5 text-rose-400" />
          <span>Distributed emails are permanently removed from the active Admin Pool.</span>
        </span>
        <span className="flex items-center gap-1 font-mono text-slate-500">
          <Database className="w-3.5 h-3.5 text-violet-400" /> {poolTotal} total
        </span>
      </div>
    </div>
  );
};
