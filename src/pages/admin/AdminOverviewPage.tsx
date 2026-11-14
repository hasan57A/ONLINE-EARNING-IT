import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
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
    showToast(`Seeded ${res.cpaCount} CPA networks, ${res.proxyCount} proxy sites, ${res.browserCount} browsers, and ${res.poolTotal} pool entries!`, 'success');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
            <Shield className="w-4 h-4" />
            <span>Master Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Admin Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time administrative telemetry, database pools, user status monitoring, and system configuration.
          </p>
        </div>

        <button
          onClick={handleSeedData}
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Seed Curated Sample Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Users */}
        <div
          onClick={() => navigate('/admin/users')}
          className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400">{activeUsers} active</span>
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Registered Users</span>
            <p className="text-2xl font-bold text-white font-mono tabular-nums">{users.length}</p>
          </div>
        </div>

        {/* Database Pool */}
        <div
          onClick={() => navigate('/admin/database')}
          className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {availablePoolRecords} unused
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Database Entries</span>
            <p className="text-2xl font-bold text-white font-mono tabular-nums">
              {totalPoolRecords}
            </p>
          </div>
        </div>

        {/* Tools */}
        <div
          onClick={() => navigate('/admin/tools')}
          className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              {tools.filter(t => t.enabled).length} enabled
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400">Tools Managed</span>
            <p className="text-2xl font-bold text-white font-mono tabular-nums">{tools.length}</p>
          </div>
        </div>

        {/* Support */}
        <div
          onClick={() => navigate('/admin/support')}
          className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
            {openTickets > 0 ? (
              <span className="text-[11px] font-mono text-amber-400 font-semibold">
                {openTickets} open
              </span>
            ) : (
              <span className="text-[11px] font-mono text-emerald-400">All cleared</span>
            )}
          </div>
          <div>
            <span className="text-xs text-slate-400">Support Inquiries</span>
            <p className="text-2xl font-bold text-white font-mono tabular-nums">{tickets.length}</p>
          </div>
        </div>
      </div>

      {/* Database Pool Breakdown Grid */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white">Generator Pool Allocation</h2>
            <p className="text-xs text-slate-400">
              Admin-added data feeds matched exclusively to user generator requests
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/database')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Manage All Pools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">User Agents Pool</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                {uas.filter(u => u.used).length} Cut
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <div>
                <span className="text-xl font-bold text-white tabular-nums">{uas.length}</span>
                <span className="text-[10px] text-slate-500 block">Uploaded</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 font-bold block tabular-nums">
                  {uas.filter(u => !u.used).length} available
                </span>
                <span className="text-[10px] text-rose-400 tabular-nums">
                  {uas.filter(u => u.used).length} used
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${uas.length ? (uas.filter(u => u.used).length / uas.length) * 100 : 0}%`,
                }}
                className="bg-blue-500 h-full"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Leads Database</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                {leads.filter(l => l.used).length} Cut
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <div>
                <span className="text-xl font-bold text-white tabular-nums">{leads.length}</span>
                <span className="text-[10px] text-slate-500 block">Uploaded</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 font-bold block tabular-nums">
                  {leads.filter(l => !l.used).length} available
                </span>
                <span className="text-[10px] text-rose-400 tabular-nums">
                  {leads.filter(l => l.used).length} used
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${leads.length ? (leads.filter(l => l.used).length / leads.length) * 100 : 0}%`,
                }}
                className="bg-emerald-500 h-full"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Numbers Database</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">
                {numbers.filter(n => n.used).length} Cut
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <div>
                <span className="text-xl font-bold text-white tabular-nums">{numbers.length}</span>
                <span className="text-[10px] text-slate-500 block">Uploaded</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 font-bold block tabular-nums">
                  {numbers.filter(n => !n.used).length} available
                </span>
                <span className="text-[10px] text-rose-400 tabular-nums">
                  {numbers.filter(n => n.used).length} used
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${numbers.length ? (numbers.filter(n => n.used).length / numbers.length) * 100 : 0}%`,
                }}
                className="bg-cyan-500 h-full"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Mails Database</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">
                {mails.filter(m => m.used).length} Cut
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <div>
                <span className="text-xl font-bold text-white tabular-nums">{mails.length}</span>
                <span className="text-[10px] text-slate-500 block">Uploaded</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 font-bold block tabular-nums">
                  {mails.filter(m => !m.used).length} available
                </span>
                <span className="text-[10px] text-rose-400 tabular-nums">
                  {mails.filter(m => m.used).length} used
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${mails.length ? (mails.filter(m => m.used).length / mails.length) * 100 : 0}%`,
                }}
                className="bg-purple-500 h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation to Admin Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => navigate('/admin/users')}
          className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </div>
          <p className="text-xs text-slate-400">
            View user profiles, inspect registration timestamps, and activate or deactivate accounts.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/payments')}
          className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <CreditCard className="w-4 h-4" />
              <span>Payment Approvals</span>
            </div>
            {pendingPayments > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold tabular-nums">
                {pendingPayments} pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Verify bKash, Nagad, Rocket & Binance payments and approve or decline user plan requests.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/tools')}
          className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Wrench className="w-4 h-4" />
            <span>Tool Enable/Disable</span>
          </div>
          <p className="text-xs text-slate-400">
            Globally enable or place tools in maintenance mode across user-facing generators.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/settings')}
          className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Settings className="w-4 h-4" />
            <span>Content & Resources</span>
          </div>
          <p className="text-xs text-slate-400">
            Edit CPA networks, proxy sites, browser download links, social links, and website copy.
          </p>
        </div>
      </div>
    </div>
  );
};
