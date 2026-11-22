import React from 'react';
import { Clock, RefreshCw, ShieldAlert } from 'lucide-react';

interface OtpCountdownPanelProps {
  expiresSeconds: number;
  cooldownSeconds: number;
  lockoutSeconds: number;
  resending: boolean;
  onResend: () => void;
}

export function formatMmSs(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const OtpCountdownPanel: React.FC<OtpCountdownPanelProps> = ({
  expiresSeconds,
  cooldownSeconds,
  lockoutSeconds,
  resending,
  onResend,
}) => {
  const isExpired = expiresSeconds <= 0;
  const isLocked = lockoutSeconds > 0;
  const canResend = cooldownSeconds <= 0 && !resending && !isLocked;

  return (
    <div className="space-y-3">
      {isLocked && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-2 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Verification temporarily locked due to failed attempts.</span>
          </div>
          <span className="font-mono font-bold tabular-nums shrink-0">
            {formatMmSs(lockoutSeconds)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs">
        <div className="flex items-center gap-2">
          <Clock
            className={`w-4 h-4 shrink-0 ${
              isExpired
                ? 'text-rose-400'
                : expiresSeconds <= 60
                ? 'text-amber-400'
                : 'text-violet-400'
            }`}
          />
          <span className="text-slate-400">
            {isExpired ? 'Code expired' : 'Code expires in'}
          </span>
        </div>

        <span
          className={`font-mono font-bold tabular-nums ${
            isExpired
              ? 'text-rose-400'
              : expiresSeconds <= 60
              ? 'text-amber-300'
              : 'text-emerald-400'
          }`}
        >
          {formatMmSs(expiresSeconds)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs pt-0.5">
        <span className="text-slate-400">Didn&apos;t receive the code?</span>
        <button
          type="button"
          onClick={onResend}
          disabled={!canResend}
          className="inline-flex items-center gap-1.5 font-semibold text-violet-300 hover:text-violet-200 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
          <span className="font-mono tabular-nums">
            {resending
              ? 'Sending...'
              : cooldownSeconds > 0
              ? `Resend OTP (${cooldownSeconds}s)`
              : 'Resend OTP'}
          </span>
        </button>
      </div>
    </div>
  );
};
