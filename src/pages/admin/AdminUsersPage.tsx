import React, { useState } from 'react';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { UserStatus } from '../../types';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  Coins,
  Edit3,
  Check,
  X,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  useDbSync();
  const { showToast } = useToast();
  const users = db.getUsers();
  const packages = db.getPaymentPackages();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');

  // Inline Package & Credits Editor state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editCredits, setEditCredits] = useState<string>('0');
  const [editPlanName, setEditPlanName] = useState<string>('Starter Pass');
  const [editPlanStatus, setEditPlanStatus] = useState<'none' | 'pending' | 'active'>('active');

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.gmail.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (userId: string, currentStatus: UserStatus) => {
    const newStatus: UserStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    db.updateUserStatus(userId, newStatus);
    showToast(
      `Account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
      newStatus === 'active' ? 'success' : 'info'
    );
  };

  const openCreditEditor = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    setEditingUserId(userId);
    setEditCredits(String(target.credits ?? 0));
    setEditPlanName(target.plan || packages[0]?.name || 'Starter Pass');
    setEditPlanStatus(target.planStatus || (Number(target.credits ?? 0) > 0 ? 'active' : 'none'));
  };

  const handleSaveCredits = (userId: string) => {
    const parsedCredits = Math.max(0, Math.floor(Number(editCredits) || 0));
    const res = db.adminUpdateUserPackageAndCredits(userId, parsedCredits, editPlanName, editPlanStatus);
    if (!res.success) {
      showToast(res.error || 'Could not update package and credits.', 'error');
      return;
    }
    setEditingUserId(null);
    showToast(`Updated package (${editPlanName} · ${parsedCredits.toLocaleString()} credits)!`, 'success');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
            <Users className="w-4 h-4" />
            <span>Account Authorization & Package Credits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            View registered user profiles, manage package subscriptions & credit balances, and control account status.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Total Registered: <strong className="text-white">{users.length}</strong></span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by full name, Gmail, or mobile number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {(['all', 'active', 'deactivated'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Users className="w-8 h-8 mx-auto opacity-30 text-amber-500" />
            <p>No user accounts found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Gmail</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Package & Credits</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredUsers.map(u => {
                  const isEditing = editingUserId === u.id;
                  const userCredits = Math.max(0, Math.floor(Number(u.credits ?? 0)));
                  const planStatus = u.planStatus || 'none';

                  return (
                    <React.Fragment key={u.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                          <div>{u.fullName}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            Joined{' '}
                            {new Date(u.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                          {u.gmail}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                          {u.mobile}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                              <Coins className="w-3 h-3" />
                              <span>Admin Unlimited</span>
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                                    planStatus === 'active'
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                      : planStatus === 'pending'
                                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {u.plan || (planStatus === 'none' ? 'No Package' : planStatus)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 tabular-nums">
                                <Coins className="w-3 h-3 text-amber-400" />
                                <span>{userCredits.toLocaleString()} Credits</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                              <Shield className="w-3 h-3" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">User</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Deactivated</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {u.role !== 'admin' ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => (isEditing ? setEditingUserId(null) : openCreditEditor(u.id))}
                                className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>{isEditing ? 'Close' : 'Credits / Plan'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleStatus(u.id, u.status)}
                                className={`py-1 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                  u.status === 'active'
                                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                }`}
                              >
                                {u.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Protected</span>
                          )}
                        </td>
                      </tr>

                      {isEditing && (
                        <tr className="bg-slate-950/80 border-t border-amber-500/20">
                          <td colSpan={7} className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Package Name
                                  </label>
                                  <select
                                    value={editPlanName}
                                    onChange={e => setEditPlanName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-amber-500"
                                  >
                                    {packages.map(pkg => (
                                      <option key={pkg.id} value={pkg.name}>
                                        {pkg.name} ({pkg.credits.toLocaleString()} Credits)
                                      </option>
                                    ))}
                                    <option value="Custom Admin Grant">Custom Admin Grant</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Plan Status
                                  </label>
                                  <select
                                    value={editPlanStatus}
                                    onChange={e => setEditPlanStatus(e.target.value as 'none' | 'pending' | 'active')}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-amber-500"
                                  >
                                    <option value="active">Active (Tools Unlocked)</option>
                                    <option value="pending">Pending</option>
                                    <option value="none">None (Locked)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Total Credits Balance
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={10000000}
                                    value={editCredits}
                                    onChange={e => setEditCredits(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono tabular-nums text-white focus:outline-none focus:border-amber-500"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditCredits(prev => String((Number(prev) || 0) + 500));
                                    setEditPlanStatus('active');
                                  }}
                                  className="px-2.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-[11px] font-mono font-bold text-amber-300 cursor-pointer"
                                >
                                  +500
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditCredits(prev => String((Number(prev) || 0) + 1500));
                                    setEditPlanStatus('active');
                                  }}
                                  className="px-2.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-[11px] font-mono font-bold text-amber-300 cursor-pointer"
                                >
                                  +1,500
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditCredits(prev => String((Number(prev) || 0) + 10000));
                                    setEditPlanStatus('active');
                                  }}
                                  className="px-2.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-[11px] font-mono font-bold text-amber-300 cursor-pointer"
                                >
                                  +10,000
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveCredits(u.id)}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingUserId(null)}
                                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

