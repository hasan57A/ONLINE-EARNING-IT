import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import { PaymentMethod, PaymentRequest, PaymentStatus } from '../../types';
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
  Receipt,
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const dbTick = useDbSync();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const requests = db.getPaymentRequests();

  const [activeTab, setActiveTab] = useState<'queue' | 'gateways'>('queue');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [methodFilter, setMethodFilter] = useState<'All' | PaymentMethod>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReqId, setSelectedReqId] = useState<string>(requests[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [gateways, setGateways] = useState(() => db.getPaymentGateways());

  useEffect(() => {
    setGateways(db.getPaymentGateways());
  }, [dbTick]);

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

  const selectedReq: PaymentRequest | null =
    requests.find(r => r.id === selectedReqId) || filteredRequests[0] || requests[0] || null;

  useEffect(() => {
    if (selectedReq) {
      setReviewNote(selectedReq.adminNote || '');
    }
  }, [selectedReq?.id, selectedReq?.status, selectedReq?.adminNote, selectedReq?.reviewedAt]);

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    playUiSound('copy');
    showToast('Copied TrxID to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleApprove = (reqId: string) => {
    const adminEmail = user?.gmail || 'admin@onlineearningit.com';
    const res = db.approvePaymentRequest(reqId, adminEmail, reviewNote);
    if (!res.success) {
      showToast(res.error || 'Failed to approve payment.', 'error');
      return;
    }
    refreshUser();
    playUiSound('notification');
    showToast('Payment approved, package activated, and credits added!', 'success');
  };

  const handleDecline = (reqId: string) => {
    const adminEmail = user?.gmail || 'admin@onlineearningit.com';
    const res = db.declinePaymentRequest(reqId, adminEmail, reviewNote);
    if (!res.success) {
      showToast(res.error || 'Failed to decline payment.', 'error');
      return;
    }
    refreshUser();
    playUiSound('click');
    showToast('Payment request declined.', 'info');
  };

  const handleSaveGateways = (e: React.FormEvent) => {
    e.preventDefault();
    db.updatePaymentGateways(gateways);
    playUiSound('click');
    showToast('Payment gateway accounts updated!', 'success');
  };

  const packages = db.getPaymentPackages();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <CreditCard className="w-4 h-4" />
            <span>Payment Verification & Gateways</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Payment Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Verify user TrxIDs from bKash, Nagad, Rocket, and Binance — inspect details and approve credits.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="oe-panel flex items-center gap-1.5 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Requests ({pendingCount} Pending)</span>
          </button>
          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gateways'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Gateway Accounts</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Summary Cards (Image 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="oe-panel oe-rgb-violet p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Total Requests</span>
            <Receipt className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono tabular-nums">{requests.length}</p>
        </div>

        <div className="oe-panel oe-rgb-amber p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
            <span>Pending Review</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono tabular-nums">{pendingCount}</p>
        </div>

        <div className="oe-panel oe-rgb-emerald p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-emerald-300 font-semibold">
            <span>Approved Orders</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono tabular-nums">{approvedList.length}</p>
        </div>

        <div className="oe-panel oe-rgb-cyan p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-cyan-300 font-semibold">
            <span>BDT Volume</span>
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400 font-mono tabular-nums">
            ৳{totalApprovedBdt.toLocaleString()}
          </p>
        </div>

        <div className="oe-panel oe-rgb-rose p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-rose-300 font-semibold">
            <span>USDT / Declined</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-lg font-black text-slate-100 font-mono tabular-nums">
            ${totalApprovedUsdt} <span className="text-xs text-rose-400">({declinedCount} dec)</span>
          </p>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="oe-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-950/70 text-slate-400 border border-slate-800 hover:text-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}

              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value as 'All' | PaymentMethod)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-100"
              >
                <option value="All">All Methods</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Binance">Binance</option>
              </select>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, Gmail, TrxID, sender..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs text-slate-100"
              />
            </div>
          </div>

          {/* Split Table + Inspector */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Table */}
            <div className="xl:col-span-7 oe-panel rounded-2xl overflow-hidden">
              {filteredRequests.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm font-bold text-slate-300">No matching payment requests</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">User & Package</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">TrxID</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredRequests.map(req => {
                        const isSelected = selectedReq?.id === req.id;
                        return (
                          <tr
                            key={req.id}
                            onClick={() => setSelectedReqId(req.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-violet-600/15' : 'hover:bg-slate-800/30'
                            }`}
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-100">{req.userName}</div>
                              <div className="text-[11px] text-violet-300">{req.packageName}</div>
                            </td>
                            <td className="py-3 px-4 font-bold whitespace-nowrap">{req.method}</td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap tabular-nums">
                              {req.currency === 'USDT' ? `$${req.amount}` : `৳${req.amount.toLocaleString()}`}
                            </td>
                            <td className="py-3 px-4 font-mono text-amber-300 whitespace-nowrap">
                              {req.transactionId}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${
                                  req.status === 'approved'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : req.status === 'declined'
                                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: Transaction Details Inspector Panel */}
            <div className="xl:col-span-5 oe-panel oe-rgb-amber rounded-2xl p-6 space-y-5">
              {selectedReq ? (
                <>
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Transaction Details Inspector
                      </span>
                      <h3 className="text-base font-extrabold text-slate-100 mt-0.5">
                        {selectedReq.packageName} ·{' '}
                        {selectedReq.currency === 'USDT'
                          ? `$${selectedReq.amount} USDT`
                          : `৳${selectedReq.amount.toLocaleString()} BDT`}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {selectedReq.userName} ({selectedReq.userEmail})
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase ${
                        selectedReq.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : selectedReq.status === 'declined'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {selectedReq.status}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between">
                      <span className="text-slate-400">Credits to Grant</span>
                      <span className="font-mono font-bold text-amber-300 inline-flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        +
                        {(
                          selectedReq.packageCredits ??
                          packages.find(p => p.id === selectedReq.packageId)?.credits ??
                          500
                        ).toLocaleString()}{' '}
                        Credits
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between">
                      <span className="text-slate-400">Sender Account</span>
                      <span className="font-mono font-bold text-slate-100">{selectedReq.senderAccount}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Transaction ID</span>
                        <span className="font-mono font-bold text-amber-300">{selectedReq.transactionId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedReq.id, selectedReq.transactionId)}
                        className="btn-premium-glass p-2 rounded-lg cursor-pointer"
                      >
                        {copiedId === selectedReq.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {selectedReq.note && (
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70">
                        <span className="text-[10px] uppercase text-slate-500 block mb-0.5">User Note</span>
                        <p className="text-slate-300">{selectedReq.note}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="block font-bold text-slate-300">Admin Note / Decline Reason</label>
                    <input
                      type="text"
                      value={reviewNote}
                      onChange={e => setReviewNote(e.target.value)}
                      placeholder="Optional approval note or decline explanation..."
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedReq.id)}
                      disabled={selectedReq.status === 'approved'}
                      className="btn-premium-emerald py-2.5 px-4 rounded-xl text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecline(selectedReq.id)}
                      disabled={selectedReq.status === 'declined'}
                      className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Select a payment request from the queue to inspect and approve.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveGateways} className="oe-panel p-6 rounded-2xl space-y-6">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Receiving Account Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Update live receiving numbers and wallet addresses shown to users on the Payment page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="oe-panel oe-rgb-rose p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">bKash Settings</h3>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">bKash Number</label>
                <input
                  type="text"
                  value={gateways.bkashNumber}
                  onChange={e => setGateways({ ...gateways, bkashNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Account Type</label>
                <input
                  type="text"
                  value={gateways.bkashType}
                  onChange={e => setGateways({ ...gateways, bkashType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="oe-panel oe-rgb-amber p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">Nagad Settings</h3>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nagad Number</label>
                <input
                  type="text"
                  value={gateways.nagadNumber}
                  onChange={e => setGateways({ ...gateways, nagadNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Account Type</label>
                <input
                  type="text"
                  value={gateways.nagadType}
                  onChange={e => setGateways({ ...gateways, nagadType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="oe-panel oe-rgb-violet p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-extrabold text-violet-300 uppercase tracking-wider">Rocket Settings</h3>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Rocket Number</label>
                <input
                  type="text"
                  value={gateways.rocketNumber}
                  onChange={e => setGateways({ ...gateways, rocketNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Account Type</label>
                <input
                  type="text"
                  value={gateways.rocketType}
                  onChange={e => setGateways({ ...gateways, rocketType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="oe-panel oe-rgb-amber p-4 rounded-xl space-y-4">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              Binance Pay & Crypto Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Binance Pay ID</label>
                <input
                  type="text"
                  value={gateways.binancePayId}
                  onChange={e => setGateways({ ...gateways, binancePayId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">USDT TRC20 Address</label>
                <input
                  type="text"
                  value={gateways.binanceTrc20Address}
                  onChange={e => setGateways({ ...gateways, binanceTrc20Address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">USDT BEP20 Address</label>
                <input
                  type="text"
                  value={gateways.binanceBep20Address}
                  onChange={e => setGateways({ ...gateways, binanceBep20Address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-mono text-slate-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Payment Instructions Note (Shown to Users)
            </label>
            <textarea
              rows={2}
              value={gateways.instructionsNote}
              onChange={e => setGateways({ ...gateways, instructionsNote: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="btn-premium-vivid px-6 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Payment Gateway Settings</span>
          </button>
        </form>
      )}
    </div>
  );
};
