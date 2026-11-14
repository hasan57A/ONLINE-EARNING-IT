import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import {
  Users,
  Copy,
  Download,
  Bookmark,
  RefreshCw,
  Info,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Sliders,
  UserCheck,
  Phone,
  Mail,
  User,
  Check,
  Database,
  Scissors,
  Search,
  Globe2,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_COUNTRIES_WITH_GLOBAL, findCountryGeo } from '../../data/countries';
import { useDbSync } from '../../hooks/useDbSync';

export const LeadGeneratorPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  useDbSync();

  const [country, setCountry] = useState<string>('All Countries');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Mix'>('Mix');
  const [quantity, setQuantity] = useState<number>(5);

  const [leads, setLeads] = useState<Array<{ fullName: string; gender: string; gmail: string; phoneNumber: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fromPool, setFromPool] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const leadsPool = db.getLeads();
  const poolTotal = leadsPool.length;
  const poolConsumed = leadsPool.filter(l => l.used).length;
  const poolAvailable = poolTotal - poolConsumed;

  const filteredCountries = ALL_COUNTRIES_WITH_GLOBAL.filter(c => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.locale.toLowerCase().includes(q) ||
      c.languageName.toLowerCase().includes(q)
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

      db.recordUsage(
        user.id,
        'lead-generator',
        'Lead Generator',
        results.length,
        'Success',
        `${country} · ${gender} · ${results.length} Leads`
      );

      showToast(`Generated & cut ${results.length} leads from Admin Database Pool!`, 'success');
    } catch {
      showToast('Failed to generate leads.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatLeadsText = () => {
    return leads
      .map(
        (l, i) =>
          `[Lead #${i + 1}]\nFull Name: ${l.fullName}\nGender: ${l.gender}\nGmail: ${l.gmail}\nPhone Number: ${l.phoneNumber}\nTarget GEO: ${country}\nStatus: Fictional Test Profile`
      )
      .join('\n\n-------------------------\n\n');
  };

  const copyAll = () => {
    if (leads.length === 0) return;
    navigator.clipboard.writeText(formatLeadsText());
    showToast('Copied all test leads to clipboard!', 'success');
  };

  const copySingleLead = (lead: { fullName: string; gender: string; gmail: string; phoneNumber: string }, idx: number) => {
    const text = `${lead.fullName}, ${lead.gender}, ${lead.gmail}, ${lead.phoneNumber}, ${country}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showToast(`Copied ${lead.fullName} to clipboard!`, 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadTxt = () => {
    if (leads.length === 0) return;
    const blob = new Blob([formatLeadsText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test_leads_${country.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded test leads TXT file.', 'success');
  };

  const saveResults = () => {
    if (!user || leads.length === 0) return;
    const title = `Test Leads (${country} · ${gender} · ${leads.length} records)`;
    db.saveResult(
      user.id,
      'lead-generator',
      'Lead Generator',
      title,
      formatLeadsText(),
      leads.length
    );
    showToast('Leads saved to your personal dashboard!', 'success');
  };

  const selectedCountryObj = findCountryGeo(country);

  return (
    <div className="space-y-8">
      {/* Luxury Tool Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-emerald-950/40 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <RealisticToolIcon slug="lead-generator" size="lg" />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wider uppercase">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Admin Pool Synchronized
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  All Countries & GEO Languages
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
                Lead Generator
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Strictly pulls verified lead records uploaded in the Admin Database Pool and permanently cuts consumed entries so no lead is distributed twice.
              </p>
            </div>
          </div>

          {/* Live Pool HUD */}
          <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <Database className="w-4 h-4 text-emerald-400" />
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

      {/* Pool Status Banner */}
      {poolAvailable === 0 ? (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-xs flex items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Admin Leads Pool is Empty (0 Available)</h4>
              <p className="text-amber-200/80 leading-relaxed mt-0.5">
                Leads <strong>only generate</strong> after the administrator uploads leads in the Admin Panel. Total uploaded: <strong className="font-mono tabular-nums">{poolTotal}</strong> · Used: <strong className="font-mono tabular-nums">{poolConsumed}</strong>.
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30 whitespace-nowrap">
            Upload Required
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <p className="leading-relaxed">
              <strong className="font-mono tabular-nums">{poolAvailable}</strong> fresh leads ready in Admin Database Pool ({poolConsumed} already used / cut).
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-300">
            {selectedCountryObj.flag} {selectedCountryObj.locale}
          </span>
        </div>
      )}

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 p-6 rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Configuration Matrix
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-400">
              All GEO Targeted
            </span>
          </div>

          {/* 1. Country / GEO Target Language Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-300 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Country / GEO Language</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-400 font-mono truncate max-w-[160px]">
                {selectedCountryObj.flag} {selectedCountryObj.locale}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search any country or GEO language..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
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
                        ? 'border-emerald-500 bg-emerald-950/40 text-white font-bold ring-1 ring-emerald-500/50 shadow-md'
                        : 'border-white/5 bg-slate-950 hover:border-white/20 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-base leading-none shrink-0">{c.flag}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold truncate">{c.name}</div>
                      <div className="text-[9px] font-mono text-slate-400 truncate">
                        {c.dial} · {c.locale}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Gender Distribution Tiles */}
          <div className="space-y-2.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-300">
                2. Gender Distribution
              </label>
              <span className="text-[11px] font-bold text-emerald-400">
                {gender} Profile
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['Male', 'Female', 'Mix'] as const).map(g => {
                const isSelected = gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 border ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>{g}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Quantity Slider (Max 100) */}
          <div className="space-y-2.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-300">
                3. Quantity Batch (Max 100)
              </label>
              <span className="text-sm font-mono text-emerald-400 font-black px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 tabular-nums">
                {quantity} Leads
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex gap-1.5 pt-1">
              {[5, 10, 25, 50, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuantity(val)}
                  className={`flex-1 py-1.5 text-[11px] font-mono rounded-lg transition-all cursor-pointer ${
                    quantity === val
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || poolAvailable === 0}
            className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all ${
              poolAvailable === 0
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 cursor-pointer'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {poolAvailable === 0
                ? 'Admin Must Upload Leads First'
                : `Generate & Cut ${Math.min(quantity, poolAvailable)} Leads`}
            </span>
          </button>
        </div>

        {/* Results Column: Dossier Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Lead Dossier Output
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {leads.length} Generated Profiles
                </span>
              </div>
              {fromPool > 0 && (
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {fromPool} matched from exclusive pool
                </span>
              )}
            </div>

            {leads.length === 0 ? (
              <div className="h-[430px] rounded-2xl border border-dashed border-white/10 bg-slate-950/50 flex flex-col items-center justify-center p-8 text-center text-xs text-slate-400 space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Users className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm text-white">No Leads Generated Yet</p>
                  <p className="max-w-sm text-slate-400 leading-relaxed">
                    Select your Target Country, Gender distribution, and click Generate to produce high-fidelity test identities.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {leads.map((lead, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className="p-4 rounded-2xl border border-white/10 bg-slate-950 space-y-2.5 hover:border-emerald-500/40 transition-colors shadow-inner"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {lead.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm">
                              {lead.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-2 font-mono">
                              {lead.gender} · {country}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copySingleLead(lead, idx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-300" />
                              <span className="text-emerald-300">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-white/5">
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
                          <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="text-slate-200 truncate">{lead.gmail}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-emerald-400 font-bold">{lead.phoneNumber}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={copyAll}
                disabled={leads.length === 0}
                className="py-3 px-4 rounded-xl border border-white/10 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                <span>Copy All ({leads.length})</span>
              </button>

              <button
                type="button"
                onClick={downloadTxt}
                disabled={leads.length === 0}
                className="py-3 px-4 rounded-xl border border-white/10 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download TXT</span>
              </button>

              <button
                type="button"
                onClick={saveResults}
                disabled={leads.length === 0}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-300" />
                <span>Save Results</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

