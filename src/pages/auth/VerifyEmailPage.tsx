import React, { useEffect, useState } from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { playUiSound } from '../../services/sound';
import { AuthBackdrop } from '../../components/motion/Extras';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';
import { OtpCodeInput } from '../../components/auth/OtpCodeInput';
import { OtpCountdownPanel } from '../../components/auth/OtpCountdownPanel';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  MailCheck,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const { navigate, queryParams } = useRouter();
  const { verifyEmailOtp, resendOtp, loading } = useAuth();
  const { showToast } = useToast();

  const initialEmail = (queryParams.get('email') || '').trim().toLowerCase();
  const initialCooldown = Math.max(0, Number(queryParams.get('cooldown') || '0'));
  const initialExpires = Math.max(0, Number(queryParams.get('expires') || '300'));

  const [email, setEmail] = useState(initialEmail);
  const [hasRequestedOtp, setHasRequestedOtp] = useState(Boolean(initialEmail));
  const [otp, setOtp] = useState('');
  const [formError, setFormError] = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const [expiresSeconds, setExpiresSeconds] = useState(initialEmail ? initialExpires : 0);
  const [cooldownSeconds, setCooldownSeconds] = useState(initialEmail ? initialCooldown : 0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExpiresSeconds(prev => (prev > 0 ? prev - 1 : 0));
      setCooldownSeconds(prev => (prev > 0 ? prev - 1 : 0));
      setLockoutSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleSendOrResendOtp = async () => {
    setFormError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid registered email address.');
      return;
    }

    setResending(true);
    playUiSound('click');
    const res = await resendOtp(cleanEmail, 'email_verification');
    setResending(false);

    if (res.success) {
      setEmail(cleanEmail);
      setHasRequestedOtp(true);
      setOtp('');
      setExpiresSeconds(res.expiresInSeconds ?? 300);
      setCooldownSeconds(res.cooldownSeconds ?? 60);
      playUiSound('notification');
      showToast('6-digit verification OTP sent to your email!', 'success');
    } else {
      if (res.cooldownSeconds) setCooldownSeconds(res.cooldownSeconds);
      if (res.retryAfterSeconds && res.code?.includes('LOCKED')) {
        setLockoutSeconds(res.retryAfterSeconds);
      }
      setFormError(res.error || 'Could not send OTP.');
      showToast(res.error || 'Could not send OTP', 'error');
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setFormError('Please enter the complete 6-digit OTP code from your email.');
      return;
    }

    playUiSound('click');
    const res = await verifyEmailOtp(cleanEmail, otp.trim());
    if (res.success) {
      setVerifiedSuccess(true);
      playUiSound('notification');
      showToast('Email verified! You can now sign in.', 'success');
    } else {
      if (res.retryAfterSeconds && res.code?.includes('LOCKED')) {
        setLockoutSeconds(res.retryAfterSeconds);
      }
      setFormError(res.error || 'Verification failed.');
      showToast(res.error || 'Invalid OTP code', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative">
      <AuthBackdrop />

      {/* Top bar */}
      <div className="max-w-md w-full mx-auto relative z-10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            playUiSound('click');
            navigate('/signin');
          }}
          className="btn-premium-glass inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>
        <ThemeSwitcher />
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10 py-6">
        <div className="oe-panel oe-rgb-violet p-7 sm:p-8 rounded-3xl backdrop-blur-2xl space-y-6">
          <div className="text-center space-y-2">
            <div
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-950/90 border border-violet-500/35 shadow-[0_0_24px_-6px_rgba(var(--oe-accent-rgb),0.65)] cursor-pointer mb-2"
            >
              <img
                src={PLATFORM_LOGO_URL}
                alt="ONLINE LEARNING PRO"
                className="w-10 h-10 rounded-xl object-contain"
              />
            </div>

            {verifiedSuccess ? (
              <>
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-100">
                  Email Verified
                </h1>
                <p className="text-xs text-slate-400">
                  Your account <span className="font-mono text-emerald-300">{email}</span> is now active. Sign in to open your workspace.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-black tracking-tight text-slate-100">
                  Verify Your Email
                </h1>
                <p className="text-xs text-slate-400">
                  {hasRequestedOtp
                    ? 'Enter the 6-digit security code sent to your email address.'
                    : 'Enter your registered email address to receive a 6-digit verification OTP.'}
                </p>
              </>
            )}
          </div>

          {verifiedSuccess ? (
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                navigate(`/signin?verified=1&email=${encodeURIComponent(email)}`);
              }}
              className="btn-premium-vivid w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : !hasRequestedOtp ? (
            <div className="space-y-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendOrResendOtp}
                disabled={resending || cooldownSeconds > 0}
                className="btn-premium-vivid w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{resending ? 'Sending OTP...' : 'Send 6-Digit Verification OTP'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <MailCheck className="w-4 h-4 text-violet-400 shrink-0" />
                  <span className="font-mono text-slate-200 truncate">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHasRequestedOtp(false);
                    setFormError('');
                  }}
                  className="text-[11px] font-semibold text-violet-300 hover:text-violet-200 cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  6-Digit Verification OTP
                </label>
                <OtpCodeInput
                  value={otp}
                  onChange={next => {
                    setOtp(next);
                    if (formError) setFormError('');
                  }}
                  disabled={loading || lockoutSeconds > 0}
                  hasError={Boolean(formError)}
                />
              </div>

              <OtpCountdownPanel
                expiresSeconds={expiresSeconds}
                cooldownSeconds={cooldownSeconds}
                lockoutSeconds={lockoutSeconds}
                resending={resending}
                onResend={handleSendOrResendOtp}
              />

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || expiresSeconds <= 0 || lockoutSeconds > 0}
                className="btn-premium-vivid w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Verifying Code...' : 'Verify Email & Activate Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="text-center text-[11px] text-slate-500 max-w-md mx-auto flex items-center justify-center gap-1.5 relative z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>ONLINE LEARNING PRO · 5-Minute Cryptographic OTP Verification</span>
      </div>
    </div>
  );
};
