import React, { useState } from 'react';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import {
  Database,
  Smartphone,
  Users,
  PhoneCall,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Upload,
  FileText,
  Scissors,
  Filter,
  ArrowUpRight,
} from 'lucide-react';
import { ALL_COUNTRIES_WITH_GLOBAL } from '../../data/countries';
import { useDbSync } from '../../hooks/useDbSync';

export const AdminDatabasePage: React.FC = () => {
  const { showToast } = useToast();
  useDbSync();
  const [activeTab, setActiveTab] = useState<'ua' | 'leads' | 'numbers' | 'mails'>('ua');

  const uas = db.getUserAgents();
  const deviceStats = db.getUserAgentStatsByDevice();
  const leads = db.getLeads();
  const numbers = db.getNumbers();
  const mails = db.getMails();

  // Filter States for each table
  const [uaFilter, setUaFilter] = useState<'all' | 'available' | 'used'>('all');
  const [uaDeviceFilter, setUaDeviceFilter] = useState<'All' | 'iPhone' | 'iPad' | 'Android' | 'Windows' | 'macOS'>('All');
  const [leadFilter, setLeadFilter] = useState<'all' | 'available' | 'used'>('all');
  const [numFilter, setNumFilter] = useState<'all' | 'available' | 'used'>('all');
  const [mailFilter, setMailFilter] = useState<'all' | 'available' | 'used'>('all');
  const [confirmPurgeTarget, setConfirmPurgeTarget] = useState<string | null>(null);

  // User Agent Form
  const [uaDevice, setUaDevice] = useState<'iPhone' | 'iPad' | 'Android' | 'Windows' | 'macOS'>('Windows');
  const [uaBrowser, setUaBrowser] = useState<'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'None'>('Chrome');
  const [uaInApp, setUaInApp] = useState<'Facebook' | 'Facebook Lite' | 'Instagram' | 'Twitter' | 'LinkedIn' | 'Snapchat' | 'TikTok' | 'None'>('None');
  const [uaCountry, setUaCountry] = useState('All Countries');
  const [uaString, setUaString] = useState('');
  const [uaBulkInput, setUaBulkInput] = useState('');

  // Lead Form
  const [leadName, setLeadName] = useState('');
  const [leadGender, setLeadGender] = useState<'Male' | 'Female'>('Male');
  const [leadGmail, setLeadGmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCountry, setLeadCountry] = useState('All Countries');
  const [leadBulkInput, setLeadBulkInput] = useState('');

  // Number Form
  const [numCountry, setNumCountry] = useState('All Countries');
  const [numString, setNumString] = useState('');
  const [numBulkInput, setNumBulkInput] = useState('');

  // Mail Form
  const [mailCountry, setMailCountry] = useState('All Countries');
  const [mailString, setMailString] = useState('');
  const [mailBulkInput, setMailBulkInput] = useState('');

  const countries = ALL_COUNTRIES_WITH_GLOBAL;

  // UA Handlers
  const handleAddUa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uaString.trim()) {
      showToast('Please enter a User Agent string.', 'error');
      return;
    }
    db.addUserAgent({
      device: uaDevice,
      browser: uaBrowser,
      inAppBrowser: uaInApp,
      country: uaCountry,
      userAgentString: uaString.trim(),
    });
    setUaString('');
    showToast('User Agent added to active pool!', 'success');
  };

  const handleBulkAddUa = () => {
    if (!uaBulkInput.trim()) return;
    const lines = uaBulkInput.split(/\r?\n/).filter(l => l.trim().length > 0);
    const items = lines.map(line => ({
      device: uaDevice,
      browser: uaBrowser,
      inAppBrowser: uaInApp,
      country: uaCountry,
      userAgentString: line.trim(),
    }));
    db.addMultipleUserAgents(items);
    setUaBulkInput('');
    showToast(`Bulk imported ${items.length} User Agents!`, 'success');
  };

  // Lead Handlers
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadGmail.trim() || !leadPhone.trim()) {
      showToast('Please fill out all lead fields.', 'error');
      return;
    }
    db.addLead({
      fullName: leadName.trim(),
      gender: leadGender,
      gmail: leadGmail.trim(),
      phoneNumber: leadPhone.trim(),
      country: leadCountry,
    });
    setLeadName('');
    setLeadGmail('');
    setLeadPhone('');
    showToast('Lead record added to pool!', 'success');
  };

  const handleBulkAddLeads = () => {
    if (!leadBulkInput.trim()) return;
    const lines = leadBulkInput.split(/\r?\n/).filter(l => l.trim().length > 0);
    const items = lines.map((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 4) {
        return {
          fullName: parts[0],
          gender: (parts[1]?.toLowerCase() === 'female' ? 'Female' : 'Male') as 'Male' | 'Female',
          gmail: parts[2],
          phoneNumber: parts[3],
          country: parts[4] || leadCountry,
        };
      }
      return {
        fullName: parts[0] || `Lead Candidate ${idx + 1}`,
        gender: leadGender,
        gmail: parts[1] || `${(parts[0] || 'lead' + idx).toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
        phoneNumber: `+1 (555) 019-${1000 + (idx % 8999)}`,
        country: leadCountry,
      };
    });
    db.addMultipleLeads(items);
    setLeadBulkInput('');
    showToast(`Bulk imported ${items.length} leads!`, 'success');
  };

  // Number Handlers
  const handleAddNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numString.trim()) return;
    db.addNumber({ country: numCountry, phoneNumber: numString.trim() });
    setNumString('');
    showToast('Phone number added to pool!', 'success');
  };

  const handleBulkAddNumbers = () => {
    if (!numBulkInput.trim()) return;
    const lines = numBulkInput.split(/\r?\n/).filter(l => l.trim().length > 0);
    const items = lines.map(line => ({ country: numCountry, phoneNumber: line.trim() }));
    db.addMultipleNumbers(items);
    setNumBulkInput('');
    showToast(`Bulk imported ${items.length} numbers!`, 'success');
  };

  // Mail Handlers
  const handleAddMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailString.trim()) return;
    db.addMail({ country: mailCountry, email: mailString.trim() });
    setMailString('');
    showToast('Email address added to pool!', 'success');
  };

  const handleBulkAddMails = () => {
    if (!mailBulkInput.trim()) return;
    const lines = mailBulkInput.split(/\r?\n/).filter(l => l.trim().length > 0);
    const items = lines.map(line => ({ country: mailCountry, email: line.trim() }));
    db.addMultipleMails(items);
    setMailBulkInput('');
    showToast(`Bulk imported ${items.length} email addresses!`, 'success');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
            <Database className="w-4 h-4" />
            <span>Master Data Pools</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Generator Databases
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Add, inspect, and purge exclusive records for User Agents, Leads, Numbers, and Emails. Consumed items are permanently retired per user.
          </p>
        </div>

        <button
          onClick={() => {
            const res = db.seedCuratedDemoData();
            showToast(`Seeded ${res.poolTotal} records into active generator databases!`, 'success');
          }}
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Quick Seed Samples</span>
        </button>
      </div>

      {/* MASTER POOL TELEMETRY - User Agent & Tools Realtime Tracking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Agents Real-time Counter */}
        <div 
          onClick={() => setActiveTab('ua')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'ua'
              ? 'border-blue-500/60 bg-blue-950/40 ring-1 ring-blue-500/30'
              : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              User Agents Pool
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-mono font-bold">
              {uas.length > 0 ? Math.round((uas.filter(u => u.used).length / uas.length) * 100) : 0}% cut
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Total Uploaded</div>
              <div className="text-2xl font-extrabold text-white">{uas.length}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-emerald-400 font-bold">{uas.filter(u => !u.used).length} Available</div>
              <div className="text-[11px] text-rose-400 font-bold">{uas.filter(u => u.used).length} Used (Cut)</div>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              style={{
                width: `${uas.length ? (uas.filter(u => u.used).length / uas.length) * 100 : 0}%`,
              }}
              className="bg-blue-500 h-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Fresh Leads Counter */}
        <div 
          onClick={() => setActiveTab('leads')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'leads'
              ? 'border-emerald-500/60 bg-emerald-950/40 ring-1 ring-emerald-500/30'
              : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              Fresh Leads Pool
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-bold">
              {leads.length > 0 ? Math.round((leads.filter(l => l.used).length / leads.length) * 100) : 0}% cut
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Total Uploaded</div>
              <div className="text-2xl font-extrabold text-white">{leads.length}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-emerald-400 font-bold">{leads.filter(l => !l.used).length} Available</div>
              <div className="text-[11px] text-rose-400 font-bold">{leads.filter(l => l.used).length} Used (Cut)</div>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              style={{
                width: `${leads.length ? (leads.filter(l => l.used).length / leads.length) * 100 : 0}%`,
              }}
              className="bg-emerald-500 h-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Phone Numbers Counter */}
        <div 
          onClick={() => setActiveTab('numbers')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'numbers'
              ? 'border-cyan-500/60 bg-cyan-950/40 ring-1 ring-cyan-500/30'
              : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              Phone Numbers Pool
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono font-bold">
              {numbers.length > 0 ? Math.round((numbers.filter(n => n.used).length / numbers.length) * 100) : 0}% cut
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Total Uploaded</div>
              <div className="text-2xl font-extrabold text-white">{numbers.length}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-emerald-400 font-bold">{numbers.filter(n => !n.used).length} Available</div>
              <div className="text-[11px] text-rose-400 font-bold">{numbers.filter(n => n.used).length} Used (Cut)</div>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              style={{
                width: `${numbers.length ? (numbers.filter(n => n.used).length / numbers.length) * 100 : 0}%`,
              }}
              className="bg-cyan-500 h-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Mails Counter */}
        <div 
          onClick={() => setActiveTab('mails')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'mails'
              ? 'border-purple-500/60 bg-purple-950/40 ring-1 ring-purple-500/30'
              : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-purple-400" />
              Email Pool
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-mono font-bold">
              {mails.length > 0 ? Math.round((mails.filter(m => m.used).length / mails.length) * 100) : 0}% cut
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Total Uploaded</div>
              <div className="text-2xl font-extrabold text-white">{mails.length}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-emerald-400 font-bold">{mails.filter(m => !m.used).length} Available</div>
              <div className="text-[11px] text-rose-400 font-bold">{mails.filter(m => m.used).length} Used (Cut)</div>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              style={{
                width: `${mails.length ? (mails.filter(m => m.used).length / mails.length) * 100 : 0}%`,
              }}
              className="bg-purple-500 h-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ua')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'ua'
              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>User Agents ({uas.length})</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-mono font-bold">
            {uas.filter(u => !u.used).length} Fresh
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'leads'
              ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leads Pool ({leads.length})</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-mono font-bold">
            {leads.filter(l => !l.used).length} Fresh
          </span>
        </button>

        <button
          onClick={() => setActiveTab('numbers')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'numbers'
              ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Numbers Pool ({numbers.length})</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-mono font-bold">
            {numbers.filter(n => !n.used).length} Fresh
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mails')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'mails'
              ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Mails Pool ({mails.length})</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-mono font-bold">
            {mails.filter(m => !m.used).length} Fresh
          </span>
        </button>
      </div>

      {/* TAB 1: User Agents */}
      {activeTab === 'ua' && (
        <div className="space-y-6">
          {/* Per-Device Breakdown Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(['iPhone', 'iPad', 'Android', 'Windows', 'macOS'] as const).map(dev => {
              const st = deviceStats[dev];
              const isFiltered = uaDeviceFilter === dev;
              return (
                <button
                  key={dev}
                  type="button"
                  onClick={() => setUaDeviceFilter(isFiltered ? 'All' : dev)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isFiltered
                      ? 'border-blue-500 bg-blue-950/50 ring-1 ring-blue-500/40'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>{dev}</span>
                    <span className="text-[10px] font-mono text-blue-400 tabular-nums">{st.total} Total</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 tabular-nums">
                    <span className="text-emerald-400 font-semibold">{st.available} Avail</span>
                    <span className="text-rose-400 font-semibold">{st.used} Used</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Add Individual & Bulk UA */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Add User Agent to Pool (Strict Device Match)
              </h3>

              <form onSubmit={handleAddUa} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Device (Strict Generation Target)</label>
                    <select
                      value={uaDevice}
                      onChange={e => setUaDevice(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      {['iPhone', 'iPad', 'Android', 'Windows', 'macOS'].map(d => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Browser</label>
                    <select
                      value={uaBrowser}
                      onChange={e => setUaBrowser(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      {['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'None'].map(b => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">In-App Browser</label>
                    <select
                      value={uaInApp}
                      onChange={e => setUaInApp(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      {['None', 'Facebook', 'Facebook Lite', 'Instagram', 'Twitter', 'LinkedIn', 'Snapchat', 'TikTok'].map(i => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Country / GEO Language</label>
                    <select
                      value={uaCountry}
                      onChange={e => setUaCountry(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="No Language System">🚫 No Language System</option>
                      {countries.map(c => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name} ({c.locale})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">User Agent String</label>
                  <textarea
                    rows={3}
                    required
                    value={uaString}
                    onChange={e => setUaString(e.target.value)}
                    placeholder="Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Single Entry</span>
                </button>
              </form>

              {/* Bulk Add Section */}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white block">Bulk Import (1 per line)</span>
                  <label className="cursor-pointer text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                    <span>Upload TXT</span>
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            const content = ev.target?.result as string;
                            if (content) {
                              setUaBulkInput(content);
                              showToast(`Loaded ${content.split(/\r?\n/).filter(Boolean).length} lines from ${file.name}`, 'info');
                            }
                          };
                          reader.readAsText(file);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={uaBulkInput}
                  onChange={e => setUaBulkInput(e.target.value)}
                  placeholder="Paste multiple user agents or click 'Upload TXT' above..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleBulkAddUa}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Bulk Import Lines to Database Pool
                </button>
              </div>
            </div>

            {/* UA Table & Purge */}
            <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    Stored User Agents ({uas.length})
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold">{uas.filter(u => !u.used).length} Available</span> ·{' '}
                    <span className="text-rose-400 font-bold">{uas.filter(u => u.used).length} Consumed</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUaFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        uaFilter === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({uas.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUaFilter('available')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        uaFilter === 'available' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Available ({uas.filter(u => !u.used).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUaFilter('used')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        uaFilter === 'used' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Used ({uas.filter(u => u.used).length})
                    </button>
                  </div>

                  {uas.some(u => u.used) && (
                    <button
                      type="button"
                      onClick={() => {
                        const removed = db.deleteUserAgentsByFilter(uaDeviceFilter, 'used');
                        showToast(`Deleted ${removed} consumed/used User Agents.`, 'info');
                      }}
                      className="py-1 px-2.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Delete only Used/Cut entries"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Clear Used</span>
                    </button>
                  )}

                  {uas.length > 0 && (
                    confirmPurgeTarget === 'ua' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (uaDeviceFilter !== 'All' || uaFilter !== 'all') {
                              const removed = db.deleteUserAgentsByFilter(uaDeviceFilter, uaFilter);
                              showToast(`Deleted ${removed} matching User Agents.`, 'info');
                            } else {
                              db.deleteAllUserAgents();
                              showToast('Purged all User Agents from database.', 'info');
                            }
                            setConfirmPurgeTarget(null);
                          }}
                          className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                        >
                          {uaDeviceFilter !== 'All' || uaFilter !== 'all' ? 'Confirm Delete Filtered' : 'Confirm Purge All'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmPurgeTarget(null)}
                          className="py-1 px-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmPurgeTarget('ua')}
                        className="py-1 px-2.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title={uaDeviceFilter !== 'All' ? `Delete ${uaDeviceFilter} User Agents` : 'Purge All User Agents'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{uaDeviceFilter !== 'All' ? `Delete ${uaDeviceFilter}` : 'Purge All'}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {uas.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <Smartphone className="w-8 h-8 mx-auto opacity-30 text-blue-500" />
                  <p>No user agents in database. Add entries or click Quick Seed.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {uas
                    .filter(u => (uaDeviceFilter === 'All' ? true : u.device === uaDeviceFilter))
                    .filter(u => (uaFilter === 'available' ? !u.used : uaFilter === 'used' ? u.used : true))
                    .map(item => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="font-bold text-white">{item.device}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-blue-400 font-medium">
                              {item.inAppBrowser !== 'None' ? `${item.inAppBrowser} (In-App)` : item.browser}
                            </span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{item.country}</span>
                            <span className="text-slate-500">·</span>
                            {item.used ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/30 text-[10px]">
                                Consumed / Cut
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 text-[10px]">
                                Available Fresh
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-slate-400 truncate max-w-lg">
                            {item.userAgentString}
                          </p>
                          {item.used && item.usedAt && (
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-0.5">
                              <Scissors className="w-3 h-3 text-rose-400" />
                              <span>Consumed: {new Date(item.usedAt).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                      <button
                        type="button"
                        onClick={() => {
                          db.deleteUserAgent(item.id);
                          showToast('Deleted User Agent entry.', 'info');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Leads Database */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Add Lead Form */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Add Lead to Pool
              </h3>

              <form onSubmit={handleAddLead} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={e => setLeadName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Gender</label>
                    <select
                      value={leadGender}
                      onChange={e => setLeadGender(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Country / GEO Language</label>
                    <select
                      value={leadCountry}
                      onChange={e => setLeadCountry(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      {countries.map(c => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name} ({c.locale})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Gmail</label>
                  <input
                    type="email"
                    required
                    value={leadGmail}
                    onChange={e => setLeadGmail(e.target.value)}
                    placeholder="johndoe@gmail.com"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={leadPhone}
                    onChange={e => setLeadPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lead Entry</span>
                </button>
              </form>

              {/* Bulk Import Leads */}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white block">Bulk Import Leads (TXT / CSV)</span>
                  <label className="cursor-pointer text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept=".txt,.csv,text/plain"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            const content = ev.target?.result as string;
                            if (content) {
                              setLeadBulkInput(content);
                              showToast(`Loaded ${content.split(/\r?\n/).filter(Boolean).length} lines from ${file.name}`, 'info');
                            }
                          };
                          reader.readAsText(file);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={leadBulkInput}
                  onChange={e => setLeadBulkInput(e.target.value)}
                  placeholder="Paste Name,Gender,Gmail,Phone,Country or upload TXT/CSV..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleBulkAddLeads}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Bulk Import Leads to Pool
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Stored Leads ({leads.length})
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold">{leads.filter(l => !l.used).length} Available</span> ·{' '}
                    <span className="text-rose-400 font-bold">{leads.filter(l => l.used).length} Consumed</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setLeadFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        leadFilter === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({leads.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadFilter('available')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        leadFilter === 'available' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Available ({leads.filter(l => !l.used).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadFilter('used')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        leadFilter === 'used' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Used ({leads.filter(l => l.used).length})
                    </button>
                  </div>

                  {leads.some(l => l.used) && (
                    <button
                      type="button"
                      onClick={() => {
                        const removed = db.deleteUsedLeads();
                        showToast(`Deleted ${removed} used leads.`, 'info');
                      }}
                      className="py-1 px-2.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Clear Used</span>
                    </button>
                  )}

                  {leads.length > 0 && (
                    confirmPurgeTarget === 'leads' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            db.deleteAllLeads();
                            setConfirmPurgeTarget(null);
                            showToast('Purged all leads from database.', 'info');
                          }}
                          className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                        >
                          Confirm Purge
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmPurgeTarget(null)}
                          className="py-1 px-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmPurgeTarget('leads')}
                        className="py-1 px-2.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Purge All Leads"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge All</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <Users className="w-8 h-8 mx-auto opacity-30 text-emerald-500" />
                  <p>No leads in database. Add entries, upload file, or click Quick Seed.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {leads
                    .filter(l => (leadFilter === 'available' ? !l.used : leadFilter === 'used' ? l.used : true))
                    .map(lead => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="font-bold text-white">{lead.fullName}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{lead.gender}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{lead.country}</span>
                            <span className="text-slate-500">·</span>
                            {lead.used ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/30 text-[10px]">
                                Consumed / Cut
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 text-[10px]">
                                Available Fresh
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-slate-400">
                            {lead.gmail} · {lead.phoneNumber}
                          </p>
                          {lead.used && lead.usedAt && (
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-0.5">
                              <Scissors className="w-3 h-3 text-rose-400" />
                              <span>Consumed: {new Date(lead.usedAt).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                      <button
                        onClick={() => {
                          db.deleteLead(lead.id);
                          showToast('Deleted lead.', 'info');
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Numbers Database */}
      {activeTab === 'numbers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Add Number Form */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Add Phone Number
              </h3>

              <form onSubmit={handleAddNumber} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Country / GEO Language</label>
                  <select
                    value={numCountry}
                    onChange={e => setNumCountry(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    {countries.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name} ({c.dial} · {c.locale})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={numString}
                    onChange={e => setNumString(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Number</span>
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white block">Bulk Import Numbers (1 per line)</span>
                  <label className="cursor-pointer text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload TXT</span>
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            const content = ev.target?.result as string;
                            if (content) {
                              setNumBulkInput(content);
                              showToast(`Loaded ${content.split(/\r?\n/).filter(Boolean).length} lines from ${file.name}`, 'info');
                            }
                          };
                          reader.readAsText(file);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={numBulkInput}
                  onChange={e => setNumBulkInput(e.target.value)}
                  placeholder="+1 (555) 001-2000&#10;+1 (555) 001-2001..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleBulkAddNumbers}
                  className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Bulk Import Lines to Numbers Pool
                </button>
              </div>
            </div>

            {/* Numbers Table */}
            <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-cyan-400" />
                    Stored Numbers ({numbers.length})
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold">{numbers.filter(n => !n.used).length} Available</span> ·{' '}
                    <span className="text-rose-400 font-bold">{numbers.filter(n => n.used).length} Consumed</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setNumFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        numFilter === 'all' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({numbers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNumFilter('available')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        numFilter === 'available' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Available ({numbers.filter(n => !n.used).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNumFilter('used')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        numFilter === 'used' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Used ({numbers.filter(n => n.used).length})
                    </button>
                  </div>

                  {numbers.some(n => n.used) && (
                    <button
                      type="button"
                      onClick={() => {
                        const removed = db.deleteUsedNumbers();
                        showToast(`Deleted ${removed} used numbers.`, 'info');
                      }}
                      className="py-1 px-2.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Clear Used</span>
                    </button>
                  )}

                  {numbers.length > 0 && (
                    confirmPurgeTarget === 'numbers' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            db.deleteAllNumbers();
                            setConfirmPurgeTarget(null);
                            showToast('Purged all numbers from database.', 'info');
                          }}
                          className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                        >
                          Confirm Purge
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmPurgeTarget(null)}
                          className="py-1 px-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmPurgeTarget('numbers')}
                        className="py-1 px-2.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Purge All Numbers"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge All</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {numbers.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <PhoneCall className="w-8 h-8 mx-auto opacity-30 text-cyan-500" />
                  <p>No numbers in database. Add entries or click Quick Seed.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {numbers
                    .filter(n => (numFilter === 'available' ? !n.used : numFilter === 'used' ? n.used : true))
                    .map(num => (
                      <div
                        key={num.id}
                        className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-400 font-semibold">{num.country}</span>
                          <span className="text-slate-600">·</span>
                          <span className="font-mono text-white font-bold">{num.phoneNumber}</span>
                          <span className="text-slate-600">·</span>
                          {num.used ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[10px] font-semibold border border-rose-500/30">
                              Consumed / Cut
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                              Available Fresh
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            db.deleteNumber(num.id);
                            showToast('Deleted number.', 'info');
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Mails Database */}
      {activeTab === 'mails' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Add Mail Form */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Add Test Email
              </h3>

              <form onSubmit={handleAddMail} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Country / GEO Language</label>
                  <select
                    value={mailCountry}
                    onChange={e => setMailCountry(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    {countries.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name} ({c.locale} · @{c.domain})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={mailString}
                    onChange={e => setMailString(e.target.value)}
                    placeholder="marketing.test@example.com"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Email</span>
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white block">Bulk Import Emails (1 per line)</span>
                  <label className="cursor-pointer text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload TXT</span>
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            const content = ev.target?.result as string;
                            if (content) {
                              setMailBulkInput(content);
                              showToast(`Loaded ${content.split(/\r?\n/).filter(Boolean).length} lines from ${file.name}`, 'info');
                            }
                          };
                          reader.readAsText(file);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={mailBulkInput}
                  onChange={e => setMailBulkInput(e.target.value)}
                  placeholder="test1@example.com&#10;test2@example.com..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleBulkAddMails}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Bulk Import Lines to Email Pool
                </button>
              </div>
            </div>

            {/* Mails Table */}
            <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    Stored Emails ({mails.length})
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold">{mails.filter(m => !m.used).length} Available</span> ·{' '}
                    <span className="text-rose-400 font-bold">{mails.filter(m => m.used).length} Consumed</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setMailFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        mailFilter === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({mails.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMailFilter('available')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        mailFilter === 'available' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Available ({mails.filter(m => !m.used).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMailFilter('used')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        mailFilter === 'used' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Used ({mails.filter(m => m.used).length})
                    </button>
                  </div>

                  {mails.some(m => m.used) && (
                    <button
                      type="button"
                      onClick={() => {
                        const removed = db.deleteUsedMails();
                        showToast(`Deleted ${removed} used emails.`, 'info');
                      }}
                      className="py-1 px-2.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Clear Used</span>
                    </button>
                  )}

                  {mails.length > 0 && (
                    confirmPurgeTarget === 'mails' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            db.deleteAllMails();
                            setConfirmPurgeTarget(null);
                            showToast('Purged all emails from database.', 'info');
                          }}
                          className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                        >
                          Confirm Purge
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmPurgeTarget(null)}
                          className="py-1 px-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmPurgeTarget('mails')}
                        className="py-1 px-2.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Purge All Emails"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge All</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {mails.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <Mail className="w-8 h-8 mx-auto opacity-30 text-purple-500" />
                  <p>No emails in database. Add entries or click Quick Seed.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {mails
                    .filter(m => (mailFilter === 'available' ? !m.used : mailFilter === 'used' ? m.used : true))
                    .map(m => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-400 font-semibold">{m.country}</span>
                          <span className="text-slate-600">·</span>
                          <span className="font-mono text-white font-bold">{m.email}</span>
                          <span className="text-slate-600">·</span>
                          {m.used ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[10px] font-semibold border border-rose-500/30">
                              Consumed / Cut
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                              Available Fresh
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            db.deleteMail(m.id);
                            showToast('Deleted email.', 'info');
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
