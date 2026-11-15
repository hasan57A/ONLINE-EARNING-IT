import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Users,
  Wrench,
  Database,
  LifeBuoy,
  Settings,
  Sparkles,
  ArrowRight,
  Shield,
  CreditCard,
  Megaphone,
  Headphones,
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  useDbSync();
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const users = db.getUsers();
  const tools = db.getTools();
  const uas = db.getUserAgents();
  const leads = db.getLeads();
  const numbers = db.getNumbers();
  const mails = db.getMails();
  const tickets = db.getSupportTickets();
  const paymentRequests = db.getPaymentRequests();
  const pendingPayments = paymentRequests.filter(r => r.status === 'pending').length;

  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalPoolRecords = uas.length + leads.length + numbers.length + mails.length;
  const usedPoolRecords =
    uas.filter(u => u.used).length +
    leads.filter(l => l.used).length +
    numbers.filter(n => n.used).length +
    mails.filter(m => m.used).length;
  const availablePoolRecords = totalPoolRecords - usedPoolRecords;
  const openTickets = tickets.filter(t => t.status === 'open').length;

  const handleSeedData = () => {
    const res = db.seedCuratedDemoData();
    playUiSound('generate');
    showToast(
      `Seeded ${res.cpaCount} CPA networks, ${res.proxyCount} proxy sites, ${res.browserCount} browsers, and ${res.poolTotal} pool entries!`,
      'success'
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Shield className="w-4 h-4" />
            <span>Master Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Admin Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time administrative telemetry, database pools, payment approvals, and system configuration.
          </p>
        </div>

        <button
          onClick={handleSeedData}
          className="btn-premium-vivid py-2.5 px-4 rounded-xl text-xs inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Seed Curated Sample Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => navigate('/admin/users')}
          className="oe-panel oe-panel-hover oe-rgb-violet p-5 rounded-2xl cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400">{activeUsers} active</span>
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Registered Users</span>
            <p className="text-2xl font-black text-slate-100 font-mono tabular-nums">{users.length}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/database')}
          className="oe-panel oe-panel-hover oe-rgb-emerald p-5 rounded-2xl cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-slate-400">{availablePoolRecords} unused</span>
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Database Entries</span>
            <p className="text-2xl font-black text-slate-100 font-mono tabular-nums">{totalPoolRecords}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/tools')}
          className="oe-panel oe-panel-hover oe-rgb-cyan p-5 rounded-2xl cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              {tools.filter(t => t.enabled).length} enabled
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400">Tools Managed</span>
            <p className="text-2xl font-black text-slate-100 font-mono tabular-nums">{tools.length}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/support')}
          className="oe-panel oe-panel-hover oe-rgb-amber p-5 rounded-2xl cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
            {openTickets > 0 ? (
              <span className="text-[11px] font-mono text-amber-400 font-bold">{openTickets} open</span>
            ) : (
              <span className="text-[11px] font-mono text-emerald-400">All cleared</span>
            )}
          </div>
          <div>
            <span className="text-xs text-slate-400">Support Inquiries</span>
            <p className="text-2xl font-black text-slate-100 font-mono tabular-nums">{tickets.length}</p>
          </div>
        </div>
      </div>

      {/* Database Pool Breakdown */}
      <div className="oe-panel p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Generator Pool Allocation</h2>
            <p className="text-xs text-slate-400">
              Admin-added data feeds matched exclusively to user generator requests
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/database')}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Pools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'User Agents Pool', items: uas, badge: 'bg-violet-500/15 text-violet-300', bar: 'bg-violet-500' },
            { name: 'Leads Database', items: leads, badge: 'bg-emerald-500/15 text-emerald-400', bar: 'bg-emerald-500' },
            { name: 'Numbers Database', items: numbers, badge: 'bg-cyan-500/15 text-cyan-400', bar: 'bg-cyan-500' },
            { name: 'Mails Database', items: mails, badge: 'bg-pink-500/15 text-pink-400', bar: 'bg-pink-500' },
          ].map(pool => {
            const total = pool.items.length;
            const used = pool.items.filter(x => x.used).length;
            const avail = total - used;
            return (
              <div key={pool.name} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{pool.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${pool.badge}`}>
                    {used} Cut
                  </span>
                </div>
                <div className="flex items-baseline justify-between font-mono">
                  <div>
                    <span className="text-xl font-black text-slate-100 tabular-nums">{total}</span>
                    <span className="text-[10px] text-slate-500 block">Uploaded</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-400 font-bold block tabular-nums">{avail} available</span>
                    <span className="text-[10px] text-rose-400 tabular-nums">{used} used</span>
                  </div>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${total ? (used / total) * 100 : 0}%` }}
                    className={`${pool.bar} h-full`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/admin/users')}
          className="oe-panel oe-panel-hover p-5 rounded-2xl cursor-pointer space-y-2"
        >
          <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </div>
          <p className="text-xs text-slate-400">
            Inspect user profiles, adjust credits & packages, and control account status.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/payments')}
          className="oe-panel oe-panel-hover oe-rgb-amber p-5 rounded-2xl cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <CreditCard className="w-4 h-4" />
              <span>Payment Approvals</span>
            </div>
            {pendingPayments > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-mono font-bold tabular-nums">
                {pendingPayments} pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Verify bKash, Nagad, Rocket & Binance TrxIDs and activate plan credits.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/support-channels')}
          className="oe-panel oe-panel-hover oe-rgb-cyan p-5 rounded-2xl cursor-pointer space-y-2"
        >
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Headphones className="w-4 h-4" />
            <span>Support Channels</span>
          </div>
          <p className="text-xs text-slate-400">
            Manage Telegram and WhatsApp concierge channels visible to users.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/announcements')}
          className="oe-panel oe-panel-hover oe-rgb-pink p-5 rounded-2xl cursor-pointer space-y-2"
        >
          <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
            <Megaphone className="w-4 h-4" />
            <span>Announcements</span>
          </div>
          <p className="text-xs text-slate-400">
            Publish bonus promos, updates, and notices to the user dashboard feed.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/tools')}
          className="oe-panel oe-panel-hover oe-rgb-emerald p-5 rounded-2xl cursor-pointer space-y-2"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Wrench className="w-4 h-4" />
            <span>Tool Enable / Disable</span>
          </div>
          <p className="text-xs text-slate-400">
            Enable or place individual generator routes into maintenance mode.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/settings')}
          className="oe-panel oe-panel-hover oe-rgb-blue p-5 rounded-2xl cursor-pointer space-y-2"
        >
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Settings className="w-4 h-4" />
            <span>Content & Resources</span>
          </div>
          <p className="text-xs text-slate-400">
            Edit homepage copy, CPA networks, proxy sites, and antidetect browsers.
          </p>
        </div>
      </div>
    </div>
  );
};
