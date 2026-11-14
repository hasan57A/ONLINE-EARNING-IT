import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { PaymentMethod } from '../../types';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Send,
  ShieldCheck,
  Wallet,
  Sparkles,
  FileText,
  AlertCircle,
  Coins,
} from 'lucide-react';

interface MethodTheme {
  id: PaymentMethod;
  label: string;
  tagline: string;
  currency: 'BDT' | 'USDT';
  badgeBg: string;
  activeCard: string;
  buttonBg: string;
  accentText: string;
}

const PAYMENT_METHODS: MethodTheme[] = [
  {
    id: 'bKash',
    label: 'bKash',
    tagline: 'Mobile Wallet · BDT',
    currency: 'BDT',
    badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    activeCard: 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10',
    buttonBg: 'bg-rose-600 hover:bg-rose-500',
    accentText: 'text-rose-400',
  },
  {
    id: 'Nagad',
    label: 'Nagad',
    tagline: 'Digital Wallet · BDT',
    currency: 'BDT',
    badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    activeCard: 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10',
    buttonBg: 'bg-orange-600 hover:bg-orange-500',
    accentText: 'text-orange-400',
  },
  {
    id: 'Rocket',
    label: 'Rocket',
    tagline: 'DBBL Mobile · BDT',
    currency: 'BDT',
    badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    activeCard: 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10',
    buttonBg: 'bg-purple-600 hover:bg-purple-500',
    accentText: 'text-purple-400',
  },
  {
    id: 'Binance',
    label: 'Binance',
    tagline: 'Binance Pay / USDT',
    currency: 'USDT',
    badgeBg: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    activeCard: 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10',
    buttonBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    accentText: 'text-amber-400',
  },
];

export const PaymentPage: React.FC = () => {
  useDbSync();
  const { user, refreshUser } = useAuth();
  const { queryParams } = useRouter();
  const { showToast } = useToast();

  const packages = db.getPaymentPackages();
  const gateways = db.getPaymentGateways();
  const myRequests = user ? db.getPaymentRequests(user.id) : [];
  const requestedPkgId = queryParams.get('pkg');

  const [selectedPkgId, setSelectedPkgId] = useState<string>(() => {
    if (requestedPkgId && packages.some(p => p.id === requestedPkgId)) return requestedPkgId;
    return packages[1]?.id || packages[0]?.id || '';
  });
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bKash');

  useEffect(() => {
    if (requestedPkgId && packages.some(p => p.id === requestedPkgId)) {
      setSelectedPkgId(requestedPkgId);
      setCustomAmount('');
    }
  }, [requestedPkgId]);

  const selectedPkg = packages.find(p => p.id === selectedPkgId) || packages[0];
  const methodMeta = PAYMENT_METHODS.find(m => m.id === selectedMethod) || PAYMENT_METHODS[0];
  const expectedAmount =
    methodMeta.currency === 'USDT' ? selectedPkg?.priceUsdt || 0 : selectedPkg?.priceBdt || 0;

  const [customAmount, setCustomAmount] = useState<string>('');
  const [senderAccount, setSenderAccount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const effectiveAmount = customAmount.trim() !== '' ? Number(customAmount) : expectedAmount;

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    showToast('Copied payment details to clipboard.', 'success');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    setCustomAmount('');
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setCustomAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPkg) return;

    setSubmitting(true);
    const res = db.submitPaymentRequest(user, {
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      method: selectedMethod,
      currency: methodMeta.currency,
      amount: effectiveAmount,
      senderAccount,
      transactionId,
      note,
    });
    setSubmitting(false);

    if (!res.success) {
      showToast(res.error || 'Could not submit payment request.', 'error');
      return;
    }

    refreshUser();
    setSenderAccount('');
    setTransactionId('');
    setNote('');
    setCustomAmount('');
    showToast('Payment submitted! Waiting for Admin verification.', 'success');
  };

  const latestUserRecord = user ? db.getUserById(user.id) || user : null;
  const toolAccess = db.canUseTool(user?.id);
  const isAdmin = latestUserRecord?.role === 'admin';
  const planStatus = latestUserRecord?.planStatus || 'none';
  const activePlan = latestUserRecord?.plan;
  const userCredits = Math.max(0, Math.floor(Number(latestUserRecord?.credits ?? 0)));
  const packageCreditTotal = toolAccess.packageCredits ?? userCredits;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-widest">
            <CreditCard className="w-4 h-4" />
            <span>Billing & Subscriptions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Plans & Payment Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Select a credit package and submit your payment via bKash, Nagad, Rocket, or Binance to unlock all 6 tools.
          </p>
        </div>

        {/* Active / Pending Plan & Credits Status Card */}
        <div
          className={`px-4 py-3 rounded-2xl border flex items-center gap-3 ${
            isAdmin || (planStatus === 'active' && userCredits > 0)
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : planStatus === 'pending'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
          }`}
        >
          {isAdmin || (planStatus === 'active' && userCredits > 0) ? (
            <ShieldCheck className="w-5 h-5 shrink-0" />
          ) : planStatus === 'pending' ? (
            <Clock className="w-5 h-5 shrink-0" />
          ) : (
            <Wallet className="w-5 h-5 shrink-0" />
          )}
          <div className="text-xs">
            <p className="font-bold uppercase tracking-wider text-[10px] opacity-80">Package & Credit Balance</p>
            <p className="font-bold text-slate-900 dark:text-white">
              {isAdmin
                ? 'Admin Unlimited · All Tools Unlocked'
                : planStatus === 'active' && activePlan
                ? `${activePlan} (${packageCreditTotal.toLocaleString()} Cr Pack) · ${userCredits.toLocaleString()} Left`
                : planStatus === 'pending'
                ? `Pending: ${toolAccess.planName || 'Package'}${
                    toolAccess.packageCredits ? ` (${toolAccess.packageCredits.toLocaleString()} Cr)` : ''
                  } · ${userCredits.toLocaleString()} Credits`
                : 'No Active Package · 0 Credits'}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Select Package */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>1. Choose Subscription Package</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Instant activation after approval</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map(pkg => {
            const isSelected = pkg.id === selectedPkg?.id;
            const isCurrentActive =
              planStatus === 'active' &&
              userCredits > 0 &&
              activePlan?.toLowerCase() === pkg.name.toLowerCase();
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => handleSelectPackage(pkg.id)}
                className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-600/10 ring-2 ring-blue-500/20 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                      {pkg.durationLabel}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Coins className="w-3 h-3" />
                        <span>{pkg.credits.toLocaleString()} Credits</span>
                      </span>
                      {isCurrentActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          Active Plan
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{pkg.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-baseline justify-between font-mono tabular-nums">
                    <div>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        ৳{pkg.priceBdt.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">BDT</span>
                    </div>
                    <span className="text-sm font-bold text-amber-400">${pkg.priceUsdt} USDT</span>
                  </div>
                  <ul className="space-y-1.5">
                    {pkg.features.map(feat => (
                      <li key={feat} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 & 3: Payment Method + Gateway Instructions + Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Method Selector & Admin Gateway Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Select Payment Gateway
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(m => {
                const active = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMethod(m.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? m.activeCard
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-extrabold ${active ? m.accentText : 'text-slate-900 dark:text-white'}`}>
                        {m.label}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${m.badgeBg}`}>
                        {m.currency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{m.tagline}</p>
                  </button>
                );
              })}
            </div>

            {/* Active Gateway Account Details */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${methodMeta.accentText}`}>
                  {selectedMethod} Receiving Account
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  Payable: {methodMeta.currency === 'USDT' ? `$${expectedAmount} USDT` : `৳${expectedAmount.toLocaleString()} BDT`}
                </span>
              </div>

              {selectedMethod === 'bKash' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">bKash ({gateways.bkashType})</p>
                      <p className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {gateways.bkashNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('bkash', gateways.bkashNumber)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                      title="Copy number"
                    >
                      {copiedKey === 'bkash' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'Nagad' && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Nagad ({gateways.nagadType})</p>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {gateways.nagadNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('nagad', gateways.nagadNumber)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                    title="Copy number"
                  >
                    {copiedKey === 'nagad' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {selectedMethod === 'Rocket' && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Rocket ({gateways.rocketType})</p>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {gateways.rocketNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('rocket', gateways.rocketNumber)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                    title="Copy number"
                  >
                    {copiedKey === 'rocket' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {selectedMethod === 'Binance' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase">Binance Pay ID</p>
                      <p className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums truncate">
                        {gateways.binancePayId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('binance_id', gateways.binancePayId)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
                    >
                      {copiedKey === 'binance_id' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase">USDT (TRC20)</p>
                      <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white truncate">
                        {gateways.binanceTrc20Address}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('trc20', gateways.binanceTrc20Address)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
                    >
                      {copiedKey === 'trc20' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase">USDT (BEP20)</p>
                      <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white truncate">
                        {gateways.binanceBep20Address}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('bep20', gateways.binanceBep20Address)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
                    >
                      {copiedKey === 'bep20' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {gateways.instructionsNote && (
                <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>{gateways.instructionsNote}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Payment Verification Submission Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 space-y-5 shadow-sm h-full flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  3. Submit Payment Proof
                </h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${methodMeta.badgeBg}`}>
                  {selectedMethod} · {selectedPkg?.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {selectedMethod === 'Binance' ? 'Sender Binance ID / Wallet' : `Sender ${selectedMethod} Number`}
                  </label>
                  <input
                    type="text"
                    required
                    value={senderAccount}
                    onChange={e => setSenderAccount(e.target.value)}
                    placeholder={selectedMethod === 'Binance' ? 'e.g. 521849302 or 0x...' : 'e.g. 017XXXXXXXX'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Amount ({methodMeta.currency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={customAmount !== '' ? customAmount : String(expectedAmount)}
                    onChange={e => setCustomAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono tabular-nums text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {selectedMethod === 'Binance' ? 'Order ID / TxHash' : 'Transaction ID (TrxID)'}
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder={selectedMethod === 'Binance' ? 'e.g. 2847192041 or 0x9f...' : 'e.g. BGD82K91XM'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reference Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Optional reference or message for admin verification..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                selectedMethod === 'Binance' ? methodMeta.buttonBg : `${methodMeta.buttonBg} text-white`
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Submitting...'
                  : `Submit ${selectedMethod} Payment (${methodMeta.currency === 'USDT' ? `$${effectiveAmount} USDT` : `৳${effectiveAmount}`})`}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* User Payment History */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              My Payment Requests
            </h2>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {myRequests.length} total
          </span>
        </div>

        {myRequests.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 space-y-1.5">
            <CreditCard className="w-7 h-7 mx-auto opacity-30" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No payment submissions yet</p>
            <p>Once you send a payment and submit your TrxID above, approval status appears here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-4">Package</th>
                  <th className="py-2.5 pr-4">Credits</th>
                  <th className="py-2.5 pr-4">Method</th>
                  <th className="py-2.5 pr-4">Amount</th>
                  <th className="py-2.5 pr-4">Sender</th>
                  <th className="py-2.5 pr-4">TrxID</th>
                  <th className="py-2.5 pr-4">Status</th>
                  <th className="py-2.5">Admin Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
                {myRequests.map(req => {
                  const statusBadge =
                    req.status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      : req.status === 'declined'
                      ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-500 border-amber-500/30';
                  const matchedPkg = packages.find(p => p.id === req.packageId || p.name === req.packageName);
                  const reqCredits = req.packageCredits ?? matchedPkg?.credits ?? 500;
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {req.packageName}
                      </td>
                      <td className="py-3 pr-4 font-mono font-bold text-amber-400 whitespace-nowrap tabular-nums">
                        +{reqCredits.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {req.method}
                      </td>
                      <td className="py-3 pr-4 font-mono tabular-nums font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {req.currency === 'USDT' ? `$${req.amount} USDT` : `৳${req.amount.toLocaleString()}`}
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {req.senderAccount}
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {req.transactionId}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase ${statusBadge}`}
                        >
                          {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {req.status === 'declined' && <XCircle className="w-3 h-3" />}
                          {req.status === 'pending' && <Clock className="w-3 h-3" />}
                          <span>{req.status}</span>
                        </span>
                      </td>
                      <td className="py-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                        {req.adminNote || (req.status === 'pending' ? 'Awaiting review' : '—')}
                      </td>
                    </tr>
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
