import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { db } from '../../services/db';
import {
  Lock,
  Coins,
  ShieldCheck,
  Clock,
  CreditCard,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface PackageCreditGuardProps {
  userId?: string;
  requiredCredits: number;
  creditUnitLabel?: string;
}

export const PackageCreditGuard: React.FC<PackageCreditGuardProps> = ({
  userId,
  requiredCredits,
  creditUnitLabel = '1 Credit / item',
}) => {
  const { navigate } = useRouter();
  const access = db.canUseTool(userId, requiredCredits);

  if (access.isAdmin) {
    return (
      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>Admin Unlimited Access Active</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p className="text-amber-200/80 text-[11px] mt-0.5">
              Administrator accounts bypass credit deductions. Regular users require an active paid package and credits.
            </p>
          </div>
        </div>
        <span className="font-mono text-[11px] font-bold text-amber-300 bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/30">
          UNLIMITED CREDITS
        </span>
      </div>
    );
  }

  if (access.hasActivePackage && access.remainingCredits > 0 && access.allowed) {
    const packCredits = access.packageCredits ?? access.remainingCredits;
    return (
      <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs font-mono tabular-nums">
              {access.planName || 'Active Package'} ({packCredits.toLocaleString()} Cr Pack) ·{' '}
              {access.remainingCredits.toLocaleString()} Credits Remaining
            </h4>
            <p className="text-blue-200/80 text-[11px] mt-0.5">
              Rate: <strong className="text-white">{creditUnitLabel}</strong> · This run will use{' '}
              <strong className="text-cyan-300 font-mono tabular-nums">{requiredCredits}</strong>{' '}
              {requiredCredits === 1 ? 'credit' : 'credits'}.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/payment')}
          className="px-3 py-1.5 rounded-xl border border-blue-400/40 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Top Up Credits</span>
        </button>
      </div>
    );
  }

  if (access.hasActivePackage && access.remainingCredits > 0 && !access.allowed) {
    return (
      <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">
              Insufficient Credits for Requested Quantity
            </h4>
            <p className="text-amber-200/85 text-[11px] leading-relaxed mt-0.5">
              You have <strong className="font-mono text-white">{access.remainingCredits.toLocaleString()}</strong> credits remaining, but requested{' '}
              <strong className="font-mono text-amber-300">{requiredCredits}</strong>. Reduce the quantity to {access.remainingCredits} or less, or buy a new package.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/payment')}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Buy Package</span>
        </button>
      </div>
    );
  }

  // Locked: No active package or 0 credits remaining
  const isPending = access.planStatus === 'pending';
  return (
    <div
      className={`p-5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl ${
        isPending
          ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-slate-950'
          : 'border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-slate-900/90 to-slate-950'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
            isPending ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
          }`}
        >
          {isPending ? <Clock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-extrabold text-white text-sm">
              {isPending
                ? 'Package Payment Pending Admin Approval'
                : access.hasActivePackage && access.remainingCredits === 0
                ? '0 Credits Remaining — Package Renewal Required'
                : 'Active Package Required to Generate'}
            </h4>
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                isPending
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              {isPending ? 'Pending' : 'Locked · 0 Credits'}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed max-w-2xl">
            {access.reason}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/payment')}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
      >
        <CreditCard className="w-4 h-4" />
        <span>{isPending ? 'View Payment Status' : 'Buy Package & Unlock'}</span>
      </button>
    </div>
  );
};
