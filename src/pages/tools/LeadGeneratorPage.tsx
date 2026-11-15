import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { db, TOOL_CREDIT_COSTS } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Users,
  Copy,
  Download,
  Bookmark,
  RefreshCw,
  Sparkles,
  Sliders,
  Phone,
  Mail,
  User,
  Check,
  Scissors,
  Search,
  Globe2,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_COUNTRIES_WITH_GLOBAL, findCountryGeo } from '../../data/countries';
import { useDbSync } from '../../hooks/useDbSync';
import { PackageCreditGuard } from '../../components/ui/PackageCreditGuard';

export const LeadGeneratorPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();
  useDbSync();

  const prefs = db.getUserPreferences();
  const [country, setCountry] = useState<string>(() => prefs.defaultCountry || 'All Countries');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Mix'>('Mix');
  const [quantity, setQuantity] = useState<number>(() => Math.min(100, Math.max(1, prefs.defaultQuantity || 5)));

  const [leads, setLeads] = useState<Array<{ fullName: string; gender: string; gmail: string; phoneNumber: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fromPool, setFromPool] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const leadsPool = db.getLeads();
  const poolTotal = leadsPool.length;
  const poolConsumed = leadsPool.filter(l => l.used).length;
  const poolAvailable = poolTotal - poolConsumed;
  const requestedQty = Math.min(100, Math.max(1, Number(quantity) || 1));
  const effectiveItemsCount = poolAvailable > 0 ? Math.min(poolAvailable, requestedQty) : requestedQty;
  const effectiveCreditsNeeded = effectiveItemsCount * TOOL_CREDIT_COSTS.LEAD;
  const creditAccess = db.canUseTool(user?.id, effectiveCreditsNeeded);

  const filteredCountries = ALL_COUNTRIES_WITH_GLOBAL.filter(c => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.locale.toLowerCase().includes(q)
    );
  });

  const handleGenerate = () => {
    if (!user) {
      showToast('Please sign in to generate leads.', 'error');
      return;
    }

    if (poolAvailable === 0) {
      showToast('Admin Database Pool is empty! Leads must be uploaded from the Admin Panel first.', 'error');
      return;
    }

    const qty = Math.min(poolAvailable, Math.min(100, Math.max(1, Number(quantity) || 1)));
    const creditsRequired = qty * TOOL_CREDIT_COSTS.LEAD;
    const access = db.canUseTool(user.id, creditsRequired);
    if (!access.allowed) {
      showToast(access.reason || 'Active package and credits are required to generate Leads.', 'error');
      if (!access.hasUsablePackage) navigate('/payment');
      return;
    }

    setIsGenerating(true);

    try {
      const { results, fromPoolCount, error } = db.consumeLeads(user.id, {
        country,
        gender,
        quantity: qty,
      });

      if (error || results.length === 0) {
        showToast(error || 'No available Leads found in Admin Database Pool.', 'error');
        setIsGenerating(false);
        return;
      }

      setLeads(results);
      setFromPool(fromPoolCount);
      refreshUser();
      playUiSound('generate');

      if (db.getUserPreferences().autoCopyAfterGenerate) {
        const autoText = results
          .map(
            (l, i) =>
              `[Lead #${i + 1}]\nFull Name: ${l.fullName}\nGender: ${l.gender}\nGmail: ${l.gmail}\nPhone Number: ${l.phoneNumber}\nTarget GEO: ${country}`
          )
          .join('\n\n-------------------------\n\n');
        navigator.clipboard.writeText(autoText);
      }

      db.recordUsage(
        user.id,
        'lead-generator',
        'Lead Generator',
        results.length,
        'Success',
        `${country} · ${gender} · ${results.length} Leads`
      );

      showToast(
        `Generated & cut ${results.length} leads from Admin Database Pool${
          access.isAdmin ? '' : ` (${results.length * TOOL_CREDIT_COSTS.LEAD} credits used)`
        }!`,
        'success'
      );
    } catch {
      showToast('Failed to generate leads.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatLeadsText = () =>
    leads
      .map(
        (l, i) =>
          `[Lead #${i + 1}]\nFull Name: ${l.fullName}\nGender: ${l.gender}\nGmail: ${l.gmail}\nPhone Number: ${l.phoneNumber}\nTarget GEO: ${country}`
      )
      .join('\n\n-------------------------\n\n');

  const copyAll = () => {
    if (leads.length === 0) return;
    navigator.clipboard.writeText(formatLeadsText());
    playUiSound('copy');
    showToast('Copied all leads to clipboard!', 'success');
  };

  const copySingleLead = (lead: { fullName: string; gender: string; gmail: string; phoneNumber: string }, idx: number) => {
    const text = `${lead.fullName}, ${lead.gender}, ${lead.gmail}, ${lead.phoneNumber}, ${country}`;
    navigator.clipboard.writeText(text);
    playUiSound('copy');
    setCopiedIndex(idx);
    showToast(`Copied ${lead.fullName} to clipboard!`, 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const outputFormat = db.getUserPreferences().defaultOutputFormat || 'TXT';

  const downloadTxt = () => {
    if (leads.length === 0) return;
    let body = formatLeadsText();
    let mime = 'text/plain;charset=utf-8';
    const ext = outputFormat.toLowerCase();
    if (outputFormat === 'CSV') {
      const rows = leads.map(
        l =>
          `"${l.fullName.replace(/"/g, '""')}","${l.gender}","${l.gmail}","${l.phoneNumber}","${country}"`
      );
      body = 'FullName,Gender,Gmail,PhoneNumber,Country\n' + rows.join('\n');
      mime = 'text/csv;charset=utf-8';
    } else if (outputFormat === 'JSON') {
      body = JSON.stringify(leads.map(l => ({ ...l, country })), null, 2);
      mime = 'application/json;charset=utf-8';
    }
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_${country.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    playUiSound('copy');
    showToast(`Downloaded leads ${outputFormat} file.`, 'success');
  };

  const saveResults = () => {
    if (!user || leads.length === 0) return;
    db.saveResult(
      user.id,
      'lead-generator',
      'Lead Generator',
      `Leads (${country} · ${gender} · ${leads.length} records)`,
      formatLeadsText(),
      leads.length
    );
    playUiSound('generate');
    showToast('Leads saved to your dashboard vault!', 'success');
  };

  const selectedCountryObj = findCountryGeo(country);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="oe-panel rounded-3xl p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <RealisticToolIcon slug="lead-generator" size="lg" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Admin Pool Synchronized
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-400/30 font-mono">
                5 Credits / Lead
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <span>Lead Generator</span>
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Pull verified lead profiles from the synced Admin pool and permanently retire distributed records.
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
        creditUnitLabel="5 Credits per Lead"
      />

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 oe-panel rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Lead Targeting Controls</span>
            </h2>
            <span className="text-[11px] font-mono text-emerald-300">
              {selectedCountryObj.flag} {selectedCountryObj.locale}
            </span>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Country / GEO</span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {filteredCountries.map(c => {
                const isSelected = country === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCountry(c.name)}
                    className={`p-2 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-slate-100 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base shrink-0">{c.flag}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold truncate">{c.name}</div>
                      <div className="text-[9px] font-mono text-slate-400 truncate">{c.dial}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold text-slate-300">Gender Filter</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Male', 'Female', 'Mix'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    gender === g
                      ? 'border-emerald-400 bg-emerald-500/20 text-slate-100'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{g}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Quantity (Max 100)</span>
              <span className="font-mono font-bold text-emerald-300">{quantity} Leads</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 10, 25, 50, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuantity(val)}
                  className={`py-1.5 text-[11px] font-mono rounded-lg border cursor-pointer ${
                    quantity === val
                      ? 'border-emerald-500 bg-emerald-500/20 text-slate-100 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
              poolAvailable === 0 || !creditAccess.allowed
                ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-400/50'
                : 'btn-premium-emerald'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {!creditAccess.allowed
                ? creditAccess.hasUsablePackage
                  ? `Need ${effectiveCreditsNeeded} Cr`
                  : 'Unlock Package to Generate'
                : poolAvailable === 0
                ? 'Admin Must Upload Leads'
                : `Generate ${effectiveItemsCount} Leads`}
            </span>
          </button>
        </div>

        {/* Output */}
        <div className="lg:col-span-7 oe-panel rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-100">Lead Dossier Output</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/35 text-emerald-200 text-xs font-mono font-bold">
                {leads.length}
              </span>
            </div>
            {fromPool > 0 && (
              <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                <Scissors className="w-3 h-3" /> {fromPool} cut from pool
              </span>
            )}
          </div>

          {leads.length === 0 ? (
            <div className="h-[420px] rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Users className="w-7 h-7" />
              </div>
              <p className="font-bold text-sm text-slate-100">No Leads Generated Yet</p>
              <p className="max-w-sm text-xs text-slate-400">
                Select your target country, gender filter, and batch size, then click Generate.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              <AnimatePresence>
                {leads.map((lead, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: idx * 0.03 }}
                    className="p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/45 bg-slate-950/75 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                          {lead.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{lead.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {lead.gender} · {country}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => copySingleLead(lead, idx)}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:border-emerald-400 text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-slate-800/70">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                        <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-slate-200 truncate">{lead.gmail}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300 font-bold">{lead.phoneNumber}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={copyAll}
              disabled={leads.length === 0}
              className="btn-premium-emerald py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All ({leads.length})</span>
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              disabled={leads.length === 0}
              className="btn-premium-cyan py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{outputFormat.toLowerCase()}</span>
            </button>
            <button
              type="button"
              onClick={saveResults}
              disabled={leads.length === 0}
              className="btn-premium-primary py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Results</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
