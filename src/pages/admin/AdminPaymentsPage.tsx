import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { PaymentMethod, PaymentStatus } from '../../types';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Copy,
  Check,
  Settings,
  Save,
  DollarSign,
  Filter,
  Coins,
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  useDbSync();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const requests = db.getPaymentRequests();
  const initialGateways = db.getPaymentGateways();

  const [activeTab, setActiveTab] = useState<'queue' | 'gateways'>('queue');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [methodFilter, setMethodFilter] = useState<'All' | PaymentMethod>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Per-request action state (note / decline reason input)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  // Gateway settings state
  const [gateways, setGateways] = useState(initialGateways);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedList = requests.filter(r => r.status === 'approved');
  const declinedCount = requests.filter(r => r.status === 'declined').length;

  const totalApprovedBdt = approvedList
    .filter(r => r.currency === 'BDT')
    .reduce((acc, r) => acc + r.amount, 0);
  const totalApprovedUsdt = approvedList
    .filter(r => r.currency === 'USDT')
    .reduce((acc, r) => acc + r.amount, 0);

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (methodFilter !== 'All' && req.method !== methodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match =
        req.userName.toLowerCase().includes(q) ||
        req.userEmail.toLowerCase().includes(q) ||
        req.transactionId.toLowerCase().includes(q) ||
        req.senderAccount.toLowerCase().includes(q) ||
        req.packageName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    showToast('Copied TrxID to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleApprove = (reqId: string) => {
    const adminEmail = user?.gmail || 'admin@onlineearningit.com';
    const customNote = reviewNotes[reqId];
    const res = db.approvePaymentRequest(reqId, adminEmail, customNote);
    if (!res.success) {
      showToast(res.error || 'Failed to approve payment.', 'error');
      return;
    }
    refreshUser();
    showToast('Payment approved, package activated, and credits added to user balance!', 'success');
  };

  const handleDecline = (reqId: string) => {
    const adminEmail = user?.gmail || 'admin@onlineearningit.com';
    const customReason = reviewNotes[reqId];
    const res = db.declinePaymentRequest(reqId, adminEmail, customReason);
    if (!res.success) {
      showToast(res.error || 'Failed to decline payment.', 'error');
      return;
    }
    refreshUser();
    showToast('Payment request declined.', 'info');
  };

  const handleSaveGateways = (e: React.FormEvent) => {
    e.preventDefault();
    db.updatePaymentGateways(gateways);
    showToast('Payment gateway numbers and instructions updated!', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
            <CreditCard className="w-4 h-4" />
            <span>Payment Verification & Gateways</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Payment Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Verify user TrxIDs from bKash, Nagad, Rocket, and Binance — approve to activate plans or decline invalid entries.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'queue' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Approval Queue ({pendingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gateways' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Gateway Accounts</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Submissions</span>
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums">{requests.length}</p>
        </div>

        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">{pendingCount}</p>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <span>Approved Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums">
            ৳{totalApprovedBdt.toLocaleString()} · ${totalApprovedUsdt}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">{approvedList.length} approved orders</p>
        </div>

        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-rose-300">
            <span>Declined</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-rose-400 font-mono tabular-nums">{declinedCount}</p>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-400 mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </div>
              {(['all', 'pending', 'approved', 'declined'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer transition-colors ${
                    statusFilter === st
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}

              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value as 'All' | PaymentMethod)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Methods</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Binance">Binance</option>
              </select>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, Gmail, TrxID, sender..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/60 text-center space-y-2">
              <CreditCard className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-bold text-slate-300">No matching payment requests</p>
              <p className="text-xs text-slate-500">
                User payment submissions from bKash, Nagad, Rocket, and Binance will appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(req => {
                const methodBadge =
                  req.method === 'bKash'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : req.method === 'Nagad'
                    ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                    : req.method === 'Rocket'
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                    : 'bg-amber-400/15 text-amber-300 border-amber-400/30';

                const statusBadge =
                  req.status === 'approved'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : req.status === 'declined'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30';

                const matchedPkg = db.getPaymentPackages().find(p => p.id === req.packageId || p.name === req.packageName);
                const reqCredits = req.packageCredits ?? matchedPkg?.credits ?? 500;

                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${methodBadge}`}>
                            {req.method}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-bold uppercase ${statusBadge}`}>
                            {req.status}
                          </span>
                          <span className="text-xs font-bold text-white">{req.packageName}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] font-mono font-bold">
                            <Coins className="w-3 h-3" />
                            <span>+{reqCredits.toLocaleString()} Credits</span>
                          </span>
                          <span className="text-sm font-black font-mono tabular-nums text-emerald-400">
                            {req.currency === 'USDT' ? `$${req.amount} USDT` : `৳${req.amount.toLocaleString()} BDT`}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                          <span>
                            User: <strong className="text-white">{req.userName}</strong> ({req.userEmail})
                          </span>
                          <span>
                            Sender: <strong className="font-mono text-white">{req.senderAccount}</strong>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            TrxID: <strong className="font-mono text-amber-300">{req.transactionId}</strong>
                            <button
                              type="button"
                              onClick={() => handleCopy(req.id, req.transactionId)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              title="Copy TrxID"
                            >
                              {copiedId === req.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </span>
                        </div>

                        {req.note && (
                          <p className="text-[11px] text-slate-400">
                            User Note: <span className="text-slate-300">{req.note}</span>
                          </p>
                        )}
                        <p className="text-[10px] font-mono text-slate-500">
                          Submitted {new Date(req.createdAt).toLocaleString()}
                          {req.reviewedAt ? ` · Reviewed ${new Date(req.reviewedAt).toLocaleString()}` : ''}
                        </p>
                      </div>

                      {/* Approve / Decline Controls */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:min-w-[380px]">
                        <input
                          type="text"
                          value={reviewNotes[req.id] ?? req.adminNote ?? ''}
                          onChange={e => setReviewNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                          placeholder="Approval note or decline reason..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleApprove(req.id)}
                          disabled={req.status === 'approved'}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecline(req.id)}
                          disabled={req.status === 'declined'}
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Gateway Accounts Configuration */
        <form
          onSubmit={handleSaveGateways}
          className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6"
        >
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Receiving Account Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Update the live receiving numbers and wallet addresses shown to users on the payment page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* bKash */}
            <div className="p-4 rounded-xl border border-rose-500/20 bg-slate-950/60 space-y-3">
              <h3 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">bKash Settings</h3>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">bKash Number</label>
                <input
                  type="text"
                  value={gateways.bkashNumber}
                  onChange={e => setGateways({ ...gateways, bkashNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Account Type</label>
                <input
                  type="text"
                  value={gateways.bkashType}
                  onChange={e => setGateways({ ...gateways, bkashType: e.target.value })}
                  placeholder="Personal (Send Money) / Merchant"
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Nagad */}
            <div className="p-4 rounded-xl border border-orange-500/20 bg-slate-950/60 space-y-3">
              <h3 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">Nagad Settings</h3>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nagad Number</label>
                <input
                  type="text"
                  value={gateways.nagadNumber}
                  onChange={e => setGateways({ ...gateways, nagadNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Account Type</label>
                <input
                  type="text"
                  value={gateways.nagadType}
                  onChange={e => setGateways({ ...gateways, nagadType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Rocket */}
            <div className="p-4 rounded-xl border border-purple-500/20 bg-slate-950/60 space-y-3">
              <h3 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Rocket Settings</h3>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Rocket Number</label>
                <input
                  type="text"
                  value={gateways.rocketNumber}
                  onChange={e => setGateways({ ...gateways, rocketNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Account Type</label>
                <input
                  type="text"
                  value={gateways.rocketType}
                  onChange={e => setGateways({ ...gateways, rocketType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Binance */}
          <div className="p-4 rounded-xl border border-amber-400/20 bg-slate-950/60 space-y-4">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Binance Pay & Crypto Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Binance Pay ID</label>
                <input
                  type="text"
                  value={gateways.binancePayId}
                  onChange={e => setGateways({ ...gateways, binancePayId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">USDT TRC20 Address</label>
                <input
                  type="text"
                  value={gateways.binanceTrc20Address}
                  onChange={e => setGateways({ ...gateways, binanceTrc20Address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">USDT BEP20 Address</label>
                <input
                  type="text"
                  value={gateways.binanceBep20Address}
                  onChange={e => setGateways({ ...gateways, binanceBep20Address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Instructions Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Payment Instructions Note (Shown to Users)
            </label>
            <textarea
              rows={2}
              value={gateways.instructionsNote}
              onChange={e => setGateways({ ...gateways, instructionsNote: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Payment Gateway Settings</span>
          </button>
        </form>
      )}
    </div>
  );
};
