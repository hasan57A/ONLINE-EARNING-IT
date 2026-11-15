import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import { User, UserStatus } from '../../types';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  Coins,
  Download,
  Trash2,
  Save,
  Activity,
  FileText,
  UserCheck,
  Clock,
  CreditCard,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  useDbSync();
  const { showToast } = useToast();
  const users = db.getUsers();
  const packages = db.getPaymentPackages();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [inspectorTab, setInspectorTab] = useState<'details' | 'activity' | 'notes'>('details');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(q) ||
      u.gmail.toLowerCase().includes(q) ||
      u.mobile.toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedUser: User | null =
    users.find(u => u.id === selectedUserId) || filteredUsers[0] || users[0] || null;

  // Inspector form state synced to selectedUser
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');
  const [editCredits, setEditCredits] = useState('0');
  const [editPlanName, setEditPlanName] = useState('Starter Pass');
  const [editPlanStatus, setEditPlanStatus] = useState<'none' | 'pending' | 'active'>('none');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    if (selectedUser) {
      setEditName(selectedUser.fullName);
      setEditRole(selectedUser.role);
      setEditStatus(selectedUser.status);
      setEditCredits(String(selectedUser.credits ?? 0));
      setEditPlanName(selectedUser.plan || packages[0]?.name || 'Starter Pass');
      setEditPlanStatus(
        selectedUser.planStatus || (Number(selectedUser.credits ?? 0) > 0 ? 'active' : 'none')
      );
      setEditNote(selectedUser.adminNote || '');
      setConfirmDeleteId(null);
    }
  }, [
    selectedUser?.id,
    selectedUser?.updatedAt,
    selectedUser?.credits,
    selectedUser?.planStatus,
    selectedUser?.plan,
    selectedUser?.status,
    selectedUser?.role,
    selectedUser?.fullName,
    selectedUser?.adminNote,
  ]);

  // 5 KPI counts
  const activeCount = users.filter(u => u.status === 'active').length;
  const paidActiveCount = users.filter(u => u.planStatus === 'active' || u.role === 'admin').length;
  const pendingPlanCount = users.filter(u => u.planStatus === 'pending').length;
  const deactivatedCount = users.filter(u => u.status === 'deactivated').length;

  const handleSaveDetails = () => {
    if (!selectedUser) return;
    const res1 = db.adminUpdateUserDetails(selectedUser.id, {
      fullName: editName,
      role: editRole,
      status: editStatus,
    });
    const parsedCredits = Math.max(0, Math.floor(Number(editCredits) || 0));
    const res2 = db.adminUpdateUserPackageAndCredits(
      selectedUser.id,
      parsedCredits,
      editPlanName,
      editPlanStatus
    );
    if (!res1.success || !res2.success) {
      showToast(res1.error || res2.error || 'Could not update user.', 'error');
      return;
    }
    playUiSound('click');
    showToast(`Saved changes for ${editName} (${parsedCredits.toLocaleString()} Cr).`, 'success');
  };

  const handleSaveNote = () => {
    if (!selectedUser) return;
    const res = db.adminUpdateUserDetails(selectedUser.id, { adminNote: editNote });
    if (res.success) {
      playUiSound('click');
      showToast('Admin note saved to user record.', 'success');
    }
  };

  const handleDeleteUser = (userId: string) => {
    const res = db.adminDeleteUser(userId);
    if (!res.success) {
      showToast(res.error || 'Cannot delete user.', 'error');
      return;
    }
    setConfirmDeleteId(null);
    showToast('User removed from registry.', 'info');
  };

  const handleExportCsv = () => {
    const header = 'ID,Full Name,Gmail,Mobile,Plan,Plan Status,Credits,Role,Status,CreatedAt\n';
    const rows = filteredUsers
      .map(u =>
        [
          u.id,
          `"${(u.fullName || '').replace(/"/g, '""')}"`,
          u.gmail,
          `"${u.mobile || ''}"`,
          `"${u.plan || 'None'}"`,
          u.planStatus || 'none',
          u.credits ?? 0,
          u.role,
          u.status,
          u.createdAt,
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `online_earning_it_users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    playUiSound('copy');
    showToast(`Exported ${filteredUsers.length} user records as CSV.`, 'success');
  };

  const selectedHistory = selectedUser ? db.getUsageHistory(selectedUser.id).slice(0, 8) : [];
  const selectedPayments = selectedUser ? db.getPaymentRequests(selectedUser.id).slice(0, 6) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Users className="w-4 h-4" />
            <span>Account Authorization & Package Credits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Inspect user profiles, adjust package credit balances, verify roles, and export CSV records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="btn-premium-cyan px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Users CSV</span>
        </button>
      </div>

      {/* 5 KPI Summary Cards (Image 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="oe-panel oe-rgb-violet p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Total Users</span>
            <Users className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono tabular-nums">{users.length}</p>
        </div>

        <div className="oe-panel oe-rgb-emerald p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-emerald-300 font-semibold">
            <span>Active Accounts</span>
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono tabular-nums">{activeCount}</p>
        </div>

        <div className="oe-panel oe-rgb-cyan p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-cyan-300 font-semibold">
            <span>Active Packages</span>
            <Coins className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400 font-mono tabular-nums">{paidActiveCount}</p>
        </div>

        <div className="oe-panel oe-rgb-amber p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
            <span>Pending Plans</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono tabular-nums">{pendingPlanCount}</p>
        </div>

        <div className="oe-panel oe-rgb-rose p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-rose-300 font-semibold">
            <span>Deactivated</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono tabular-nums">{deactivatedCount}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by full name, username, Gmail, or mobile..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl oe-panel text-xs">
          {(['all', 'active', 'deactivated'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-violet-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Split Workspace: Users Table + Right User Details Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Users Table */}
        <div className="xl:col-span-7 oe-panel rounded-2xl overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto opacity-30 text-violet-400" />
              <p>No user accounts found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Package & Credits</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.map(u => {
                    const isSelected = selectedUser?.id === u.id;
                    const userCredits = Math.max(0, Math.floor(Number(u.credits ?? 0)));
                    const planStatus = u.planStatus || 'none';
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-violet-600/15' : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                              {u.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100">{u.fullName}</div>
                              <div className="text-[11px] font-mono text-slate-400">{u.gmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                              Admin Unlimited
                            </span>
                          ) : (
                            <div>
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                  planStatus === 'active'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : planStatus === 'pending'
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {u.plan || (planStatus === 'none' ? 'No Package' : planStatus)}
                              </span>
                              <div className="text-[11px] font-mono font-bold text-amber-300 mt-0.5 tabular-nums">
                                {userCredits.toLocaleString()} Cr
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              <Shield className="w-3 h-3" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">User</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Deactivated</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: User Details Inspector Panel */}
        <div className="xl:col-span-5 oe-panel oe-rgb-violet rounded-2xl p-6 space-y-5">
          {selectedUser ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white font-black text-lg flex items-center justify-center shrink-0">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-slate-100 truncate">
                      {selectedUser.fullName}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 truncate">{selectedUser.gmail}</p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Mobile: {selectedUser.mobile || '—'} · Joined{' '}
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inspector Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                {(
                  [
                    { id: 'details', label: 'Details' },
                    { id: 'activity', label: 'Activity' },
                    { id: 'notes', label: 'Notes' },
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInspectorTab(tab.id)}
                    className={`py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                      inspectorTab === tab.id
                        ? 'bg-violet-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {inspectorTab === 'details' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Role</label>
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value as 'user' | 'admin')}
                        className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Account Status</label>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as UserStatus)}
                        className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
                      >
                        <option value="active">Active</option>
                        <option value="deactivated">Deactivated</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Package</label>
                      <select
                        value={editPlanName}
                        onChange={e => setEditPlanName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
                      >
                        {packages.map(pkg => (
                          <option key={pkg.id} value={pkg.name}>
                            {pkg.name} ({pkg.credits})
                          </option>
                        ))}
                        <option value="Custom Admin Grant">Custom Grant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Plan Status</label>
                      <select
                        value={editPlanStatus}
                        onChange={e => setEditPlanStatus(e.target.value as 'none' | 'pending' | 'active')}
                        className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>

                  {/* Credits Management */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5" />
                        <span>Credits Management</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        Used: {(selectedUser.usedCredits ?? 0).toLocaleString()} Cr
                      </span>
                    </div>

                    <input
                      type="number"
                      min={0}
                      max={10000000}
                      value={editCredits}
                      onChange={e => setEditCredits(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm font-bold text-amber-300 tabular-nums"
                    />

                    <div className="flex flex-wrap gap-2">
                      {[500, 1500, 10000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setEditCredits(prev => String((Number(prev) || 0) + amt));
                            setEditPlanStatus('active');
                          }}
                          className="btn-premium-glass px-3 py-1.5 rounded-lg text-[11px] font-mono text-amber-300 cursor-pointer"
                        >
                          +{amt.toLocaleString()}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setEditCredits('0')}
                        className="btn-premium-glass px-3 py-1.5 rounded-lg text-[11px] font-mono text-rose-300 cursor-pointer"
                      >
                        Set 0
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {confirmDeleteId === selectedUser.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(selectedUser.id)}
                          className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="btn-premium-glass px-3 py-2 rounded-xl text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(selectedUser.id)}
                        className="btn-premium-glass px-3.5 py-2.5 rounded-xl text-xs text-rose-400 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete User</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveDetails}
                      className="btn-premium-vivid px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save User Changes</span>
                    </button>
                  </div>
                </div>
              )}

              {inspectorTab === 'activity' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-violet-400" />
                      <span>Recent Tool Runs ({selectedHistory.length})</span>
                    </h4>
                    {selectedHistory.length === 0 ? (
                      <p className="text-slate-500 py-3">No tool runs logged for this user.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {selectedHistory.map(h => (
                          <div
                            key={h.id}
                            className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-100 truncate">{h.toolName}</span>
                            <span className="font-mono text-[11px] text-slate-400">
                              {h.resultCount} items · {h.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-slate-800/80 pt-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>Payment History ({selectedPayments.length})</span>
                    </h4>
                    {selectedPayments.length === 0 ? (
                      <p className="text-slate-500 py-3">No payment submissions yet.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {selectedPayments.map(p => (
                          <div
                            key={p.id}
                            className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-100">{p.packageName}</span>
                              <span className="text-[10px] font-mono text-slate-400 block">
                                {p.method} · {p.transactionId}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                p.status === 'approved'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : p.status === 'declined'
                                  ? 'bg-rose-500/15 text-rose-400'
                                  : 'bg-amber-500/15 text-amber-300'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {inspectorTab === 'notes' && (
                <div className="space-y-3 text-xs">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                    <span>Internal Admin Notes</span>
                  </label>
                  <textarea
                    rows={6}
                    value={editNote}
                    onChange={e => setEditNote(e.target.value)}
                    placeholder="Add private billing or verification notes about this user..."
                    className="w-full p-3.5 rounded-xl border text-xs text-slate-100 leading-relaxed resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="btn-premium-primary w-full py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Admin Note</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select a user from the table to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
