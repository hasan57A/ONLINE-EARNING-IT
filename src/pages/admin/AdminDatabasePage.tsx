import React, { useState } from 'react';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Database,
  Smartphone,
  Users,
  PhoneCall,
  Mail,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Scissors,
  Search,
  Download,
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

  // Filter States
  const [uaFilter, setUaFilter] = useState<'all' | 'available' | 'used'>('all');
  const [uaDeviceFilter, setUaDeviceFilter] = useState<'All' | 'iPhone' | 'iPad' | 'Android' | 'Windows' | 'macOS'>('All');
  const [uaSearch, setUaSearch] = useState('');
  const [isDraggingUa, setIsDraggingUa] = useState(false);

  const [leadFilter, setLeadFilter] = useState<'all' | 'available' | 'used'>('all');
  const [numFilter, setNumFilter] = useState<'all' | 'available' | 'used'>('all');
  const [mailFilter, setMailFilter] = useState<'all' | 'available' | 'used'>('all');
  const [confirmPurgeTarget, setConfirmPurgeTarget] = useState<string | null>(null);

  // User Agent Form (includes WeChat)
  const [uaDevice, setUaDevice] = useState<'iPhone' | 'iPad' | 'Android' | 'Windows' | 'macOS'>('Windows');
  const [uaBrowser, setUaBrowser] = useState<'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'None'>('Chrome');
  const [uaInApp, setUaInApp] = useState<
    'Facebook' | 'Facebook Lite' | 'Instagram' | 'Twitter' | 'LinkedIn' | 'Snapchat' | 'TikTok' | 'WeChat' | 'None'
  >('None');
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

  const handleUaFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      if (content) {
        setUaBulkInput(content);
        const lineCount = content.split(/\r?\n/).filter(l => l.trim()).length;
        showToast(`Loaded ${lineCount} User Agents from ${file.name}`, 'info');
      }
    };
    reader.readAsText(file);
  };

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
    playUiSound('click');
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
    playUiSound('generate');
    showToast(`Bulk imported ${items.length} User Agents!`, 'success');
  };

  const exportPoolCsv = (filename: string, lines: string[]) => {
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    playUiSound('copy');
    showToast(`Exported ${lines.length} entries to ${filename}`, 'success');
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
    playUiSound('click');
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
    playUiSound('generate');
    showToast(`Bulk imported ${items.length} leads!`, 'success');
  };

  // Number Handlers
  const handleAddNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numString.trim()) return;
    db.addNumber({ country: numCountry, phoneNumber: numString.trim() });
    setNumString('');
    playUiSound('click');
    showToast('Phone number added to pool!', 'success');
  };

  const handleBulkAddNumbers = () => {
    if (!numBulkInput.trim()) return;
    const lines = numBulkInput.split(/\r?\n/).filter(l => l.trim().length > 0);
    const items = lines.map(line => ({ country: numCountry, phoneNumber: line.trim() }));
    db.addMultipleNumbers(items);
    setNumBulkInput('');
    playUiSound('generate');
    showToast(`Bulk imported ${items.length} numbers!`, 'success');
  };

  // Mail Handlers
  const handleAddMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailString.trim()) return;
    db.addMail({ country: mailCountry, email: mailString.trim() });
    setMailString('');
    playUiSound('click');
    showToast('Email address added to pool!', 'success');
  };

  const handleBulkAddMails = () => {
    if (!mailBulkInput.trim()) return;
    const lines = mailBulkInput.split(/\r?\n/).filter(l => l.trim().length > 0);
    const items = lines.map(line => ({ country: mailCountry, email: line.trim() }));
    db.addMultipleMails(items);
    setMailBulkInput('');
    playUiSound('generate');
    showToast(`Bulk imported ${items.length} email addresses!`, 'success');
  };

  const filteredUas = uas
    .filter(u => (uaDeviceFilter === 'All' ? true : u.device === uaDeviceFilter))
    .filter(u => (uaFilter === 'available' ? !u.used : uaFilter === 'used' ? u.used : true))
    .filter(u =>
      !uaSearch.trim()
        ? true
        : u.userAgentString.toLowerCase().includes(uaSearch.toLowerCase()) ||
          u.country.toLowerCase().includes(uaSearch.toLowerCase()) ||
          u.browser.toLowerCase().includes(uaSearch.toLowerCase()) ||
          u.inAppBrowser.toLowerCase().includes(uaSearch.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Database className="w-4 h-4" />
            <span>Master Data Pools</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Generator Databases
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload, filter, and audit exclusive pools for User Agents, Leads, Numbers, and Emails.
          </p>
        </div>

        <button
          onClick={() => {
            const res = db.seedCuratedDemoData();
            playUiSound('generate');
            showToast(`Seeded ${res.poolTotal} records into active generator databases!`, 'success');
          }}
          className="btn-premium-vivid py-2.5 px-4 rounded-xl text-xs inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Quick Seed Samples</span>
        </button>
      </div>

      {/* 4 Master Pool Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            key: 'ua' as const,
            title: 'User Agents Pool',
            icon: Smartphone,
            rgb: 'oe-rgb-violet',
            bar: 'from-violet-600 to-indigo-500',
            text: 'text-violet-400',
            items: uas,
          },
          {
            key: 'leads' as const,
            title: 'Fresh Leads Pool',
            icon: Users,
            rgb: 'oe-rgb-emerald',
            bar: 'from-emerald-600 to-teal-500',
            text: 'text-emerald-400',
            items: leads,
          },
          {
            key: 'numbers' as const,
            title: 'Phone Numbers Pool',
            icon: PhoneCall,
            rgb: 'oe-rgb-cyan',
            bar: 'from-cyan-600 to-blue-500',
            text: 'text-cyan-400',
            items: numbers,
          },
          {
            key: 'mails' as const,
            title: 'Email Pool',
            icon: Mail,
            rgb: 'oe-rgb-pink',
            bar: 'from-pink-600 to-purple-500',
            text: 'text-pink-400',
            items: mails,
          },
        ].map(pool => {
          const Icon = pool.icon;
          const total = pool.items.length;
          const used = pool.items.filter(i => i.used).length;
          const avail = total - used;
          const pct = total > 0 ? Math.round((used / total) * 100) : 0;
          const active = activeTab === pool.key;
          return (
            <div
              key={pool.key}
              onClick={() => setActiveTab(pool.key)}
              className={`oe-panel oe-panel-hover p-4 rounded-2xl cursor-pointer ${
                active ? `${pool.rgb} ring-1 ring-slate-700` : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${pool.text}`} />
                  {pool.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-300 font-mono font-bold">
                  {pct}% cut
                </span>
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Uploaded</div>
                  <div className="text-2xl font-black text-slate-100 tabular-nums">{total}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-emerald-400 font-bold tabular-nums">{avail} Available</div>
                  <div className="text-[11px] text-rose-400 font-bold tabular-nums">{used} Cut</div>
                </div>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-800/70">
                <div style={{ width: `${pct}%` }} className={`bg-gradient-to-r ${pool.bar} h-full transition-all duration-500`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pool Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'ua' as const, label: 'User Agents', count: uas.length, fresh: uas.filter(u => !u.used).length, icon: Smartphone },
          { key: 'leads' as const, label: 'Leads Pool', count: leads.length, fresh: leads.filter(l => !l.used).length, icon: Users },
          { key: 'numbers' as const, label: 'Numbers Pool', count: numbers.length, fresh: numbers.filter(n => !n.used).length, icon: PhoneCall },
          { key: 'mails' as const, label: 'Mails Pool', count: mails.length, fresh: mails.filter(m => !m.used).length, icon: Mail },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                active ? 'btn-premium-primary' : 'btn-premium-glass text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>
                {tab.label} ({tab.count})
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-800/70 text-slate-300'
                }`}
              >
                {tab.fresh} Fresh
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: User Agents */}
      {activeTab === 'ua' && (
        <div className="space-y-6">
          {/* 5 Device Breakdown Cards (Image 7) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(['iPhone', 'iPad', 'Android', 'Windows', 'macOS'] as const).map(dev => {
              const st = deviceStats[dev];
              const isFiltered = uaDeviceFilter === dev;
              return (
                <button
                  key={dev}
                  type="button"
                  onClick={() => setUaDeviceFilter(isFiltered ? 'All' : dev)}
                  className={`oe-panel p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    isFiltered ? 'oe-rgb-violet ring-1 ring-violet-500/40' : 'oe-panel-hover'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-100">
                    <span>{dev}</span>
                    <span className="text-[10px] font-mono text-violet-300 tabular-nums">{st.total} Total</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 tabular-nums">
                    <span className="text-emerald-400 font-bold">{st.available} Avail</span>
                    <span className="text-rose-400 font-bold">{st.used} Used</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Add Individual & Drag-Drop Bulk UA */}
            <div className="lg:col-span-5 oe-panel p-6 rounded-2xl space-y-5">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-3">
                Add User Agent to Pool
              </h3>

              <form onSubmit={handleAddUa} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">Device</label>
                    <select
                      value={uaDevice}
                      onChange={e => setUaDevice(e.target.value as typeof uaDevice)}
                      className="w-full p-2.5 rounded-xl border text-slate-100"
                    >
                      {['iPhone', 'iPad', 'Android', 'Windows', 'macOS'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Browser</label>
                    <select
                      value={uaBrowser}
                      onChange={e => setUaBrowser(e.target.value as typeof uaBrowser)}
                      className="w-full p-2.5 rounded-xl border text-slate-100"
                    >
                      {['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'None'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">In-App Browser</label>
                    <select
                      value={uaInApp}
                      onChange={e => setUaInApp(e.target.value as typeof uaInApp)}
                      className="w-full p-2.5 rounded-xl border text-slate-100"
                    >
                      {['None', 'Facebook', 'Facebook Lite', 'Instagram', 'Twitter', 'LinkedIn', 'Snapchat', 'TikTok', 'WeChat'].map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Country / GEO</label>
                    <select
                      value={uaCountry}
                      onChange={e => setUaCountry(e.target.value)}
                      className="w-full p-2.5 rounded-xl border text-slate-100"
                    >
                      <option value="No Language System">🚫 No Language System</option>
                      {countries.map(c => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
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
                    className="w-full p-2.5 rounded-xl border text-slate-100 font-mono text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-premium-primary w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Single Entry</span>
                </button>
              </form>

              {/* Drag & Drop Bulk Importer */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3 text-xs">
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDraggingUa(true);
                  }}
                  onDragLeave={() => setIsDraggingUa(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setIsDraggingUa(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleUaFile(file);
                  }}
                  className={`p-4 rounded-2xl border-2 border-dashed text-center transition-colors ${
                    isDraggingUa
                      ? 'border-violet-400 bg-violet-600/15'
                      : 'border-slate-700 bg-slate-950/60 hover:border-violet-500/40'
                  }`}
                >
                  <Upload className="w-5 h-5 text-violet-400 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-100">Drag & Drop .TXT / .CSV File Here</p>
                  <label className="inline-block mt-1.5 text-[11px] text-cyan-400 hover:underline font-semibold cursor-pointer">
                    <span>or browse from computer</span>
                    <input
                      type="file"
                      accept=".txt,.csv,text/plain"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleUaFile(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <textarea
                  rows={4}
                  value={uaBulkInput}
                  onChange={e => setUaBulkInput(e.target.value)}
                  placeholder="Paste multiple user agents (1 per line)..."
                  className="w-full p-2.5 rounded-xl border text-slate-100 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleBulkAddUa}
                  className="btn-premium-vivid w-full py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Bulk Import Lines to Pool
                </button>
              </div>
            </div>

            {/* Right: UA Table, Search, Filter & Purge */}
            <div className="lg:col-span-7 oe-panel p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-violet-400" />
                    <span>Stored User Agents ({filteredUas.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold">{uas.filter(u => !u.used).length} Available</span> ·{' '}
                    <span className="text-rose-400 font-bold">{uas.filter(u => u.used).length} Consumed</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      exportPoolCsv(
                        'user_agents_pool.txt',
                        filteredUas.map(u => u.userAgentString)
                      )
                    }
                    className="btn-premium-cyan py-1.5 px-3 rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>

                  {uas.some(u => u.used) && (
                    <button
                      type="button"
                      onClick={() => {
                        const removed = db.deleteUserAgentsByFilter(uaDeviceFilter, 'used');
                        showToast(`Deleted ${removed} consumed User Agents.`, 'info');
                      }}
                      className="btn-premium-glass py-1.5 px-2.5 rounded-lg text-amber-400 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Clear Used</span>
                    </button>
                  )}

                  {uas.length > 0 &&
                    (confirmPurgeTarget === 'ua' ? (
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
                          className="py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmPurgeTarget(null)}
                          className="btn-premium-glass py-1.5 px-2 rounded-lg text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmPurgeTarget('ua')}
                        className="btn-premium-glass py-1.5 px-2.5 rounded-lg text-rose-400 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{uaDeviceFilter !== 'All' ? `Delete ${uaDeviceFilter}` : 'Purge'}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Search + Status Filter */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={uaSearch}
                    onChange={e => setUaSearch(e.target.value)}
                    placeholder="Filter UA string, browser, or country..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border text-xs text-slate-100"
                  />
                </div>
                <div className="inline-flex rounded-xl bg-slate-950/70 p-1 border border-slate-800/80 text-[11px] shrink-0">
                  {(['all', 'available', 'used'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setUaFilter(st)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-semibold cursor-pointer ${
                        uaFilter === st ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredUas.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <Smartphone className="w-8 h-8 mx-auto opacity-30 text-violet-400" />
                  <p>No user agents match your filters.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredUas.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-[11px] flex-wrap">
                          <span className="font-bold text-slate-100">{item.device}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-violet-300 font-medium">
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
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          db.deleteUserAgent(item.id);
                          showToast('Deleted User Agent entry.', 'info');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer shrink-0"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 oe-panel p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-3">Add Lead to Pool</h3>

            <form onSubmit={handleAddLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={e => setLeadName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 mb-1">Gender</label>
                  <select
                    value={leadGender}
                    onChange={e => setLeadGender(e.target.value as 'Male' | 'Female')}
                    className="w-full p-2.5 rounded-xl border text-slate-100"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Country</label>
                  <select
                    value={leadCountry}
                    onChange={e => setLeadCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-slate-100"
                  >
                    {countries.map(c => (
                      <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
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
                  className="w-full p-2.5 rounded-xl border text-slate-100"
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
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="btn-premium-emerald w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lead Entry</span>
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100">Bulk Import Leads (TXT / CSV)</span>
                <label className="cursor-pointer text-[11px] text-emerald-400 hover:underline font-semibold flex items-center gap-1">
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
                          if (content) setLeadBulkInput(content);
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
                placeholder="Name,Gender,Gmail,Phone,Country (1 per line)"
                className="w-full p-2.5 rounded-xl border text-slate-100 font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleBulkAddLeads}
                className="btn-premium-emerald w-full py-2 rounded-xl text-xs cursor-pointer"
              >
                Bulk Import Leads
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 oe-panel p-6 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Stored Leads ({leads.length})</span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-950/70 p-1 border border-slate-800/80 text-[11px]">
                  {(['all', 'available', 'used'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setLeadFilter(st)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-semibold cursor-pointer ${
                        leadFilter === st ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                {leads.some(l => l.used) && (
                  <button
                    type="button"
                    onClick={() => showToast(`Deleted ${db.deleteUsedLeads()} used leads.`, 'info')}
                    className="btn-premium-glass py-1 px-2.5 rounded-lg text-amber-400 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Clear Used</span>
                  </button>
                )}
                {leads.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      db.deleteAllLeads();
                      showToast('Purged all leads.', 'info');
                    }}
                    className="btn-premium-glass py-1 px-2.5 rounded-lg text-rose-400 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge All</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {leads
                .filter(l => (leadFilter === 'available' ? !l.used : leadFilter === 'used' ? l.used : true))
                .map(lead => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-[11px] flex-wrap">
                        <span className="font-bold text-slate-100">{lead.fullName}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-300">{lead.gender}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{lead.country}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            lead.used
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {lead.used ? 'Consumed' : 'Fresh'}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-slate-400">
                        {lead.gmail} · {lead.phoneNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        db.deleteLead(lead.id);
                        showToast('Deleted lead.', 'info');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Numbers Database */}
      {activeTab === 'numbers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 oe-panel p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-3">Add Phone Number</h3>
            <form onSubmit={handleAddNumber} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Country</label>
                <select
                  value={numCountry}
                  onChange={e => setNumCountry(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                >
                  {countries.map(c => (
                    <option key={c.name} value={c.name}>{c.flag} {c.name} ({c.dial})</option>
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
                  className="w-full p-2.5 rounded-xl border text-slate-100 font-mono"
                />
              </div>
              <button
                type="submit"
                className="btn-premium-cyan w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Number</span>
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100">Bulk Import Numbers</span>
                <label className="cursor-pointer text-[11px] text-cyan-400 hover:underline font-semibold flex items-center gap-1">
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
                          if (content) setNumBulkInput(content);
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
                placeholder="+1 (555) 001-2000"
                className="w-full p-2.5 rounded-xl border text-slate-100 font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleBulkAddNumbers}
                className="btn-premium-cyan w-full py-2 rounded-xl text-xs cursor-pointer"
              >
                Bulk Import Numbers
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 oe-panel p-6 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-cyan-400" />
                <span>Stored Numbers ({numbers.length})</span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-950/70 p-1 border border-slate-800/80 text-[11px]">
                  {(['all', 'available', 'used'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNumFilter(st)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-semibold cursor-pointer ${
                        numFilter === st ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                {numbers.some(n => n.used) && (
                  <button
                    type="button"
                    onClick={() => showToast(`Deleted ${db.deleteUsedNumbers()} used numbers.`, 'info')}
                    className="btn-premium-glass py-1 px-2.5 rounded-lg text-amber-400 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Clear Used</span>
                  </button>
                )}
              </div>
            </div>

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
                      <span className="font-mono text-slate-100 font-bold">{num.phoneNumber}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          num.used
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {num.used ? 'Consumed' : 'Fresh'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        db.deleteNumber(num.id);
                        showToast('Deleted number.', 'info');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Mails Database */}
      {activeTab === 'mails' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 oe-panel p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-3">Add Test Email</h3>
            <form onSubmit={handleAddMail} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Country</label>
                <select
                  value={mailCountry}
                  onChange={e => setMailCountry(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                >
                  {countries.map(c => (
                    <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
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
                  placeholder="marketing.test@gmail.com"
                  className="w-full p-2.5 rounded-xl border text-slate-100 font-mono"
                />
              </div>
              <button
                type="submit"
                className="btn-premium-vivid w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Email</span>
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100">Bulk Import Emails</span>
                <label className="cursor-pointer text-[11px] text-pink-400 hover:underline font-semibold flex items-center gap-1">
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
                          if (content) setMailBulkInput(content);
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
                placeholder="test1@gmail.com"
                className="w-full p-2.5 rounded-xl border text-slate-100 font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleBulkAddMails}
                className="btn-premium-vivid w-full py-2 rounded-xl text-xs cursor-pointer"
              >
                Bulk Import Emails
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 oe-panel p-6 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-400" />
                <span>Stored Emails ({mails.length})</span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-950/70 p-1 border border-slate-800/80 text-[11px]">
                  {(['all', 'available', 'used'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setMailFilter(st)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-semibold cursor-pointer ${
                        mailFilter === st ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                {mails.some(m => m.used) && (
                  <button
                    type="button"
                    onClick={() => showToast(`Deleted ${db.deleteUsedMails()} used emails.`, 'info')}
                    className="btn-premium-glass py-1 px-2.5 rounded-lg text-amber-400 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Clear Used</span>
                  </button>
                )}
              </div>
            </div>

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
                      <span className="font-mono text-slate-100 font-bold">{m.email}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          m.used
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {m.used ? 'Consumed' : 'Fresh'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        db.deleteMail(m.id);
                        showToast('Deleted email.', 'info');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
