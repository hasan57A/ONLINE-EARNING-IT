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
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Send,
  ShieldCheck,
} from 'lucide-react';

type ResetStep = 'email' | 'otp' | 'password' | 'done';

export const ForgotPasswordPage: React.FC = () => {
  const { navigate, queryParams } = useRouter();
  const { requestPasswordReset, verifyResetOtp, resendOtp, resetPassword, loading } = useAuth();
  const { showToast } = useToast();

  const initialEmail = (queryParams.get('email') || '').trim().toLowerCase();

  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formError, setFormError] = useState('');
  const [expiresSeconds, setExpiresSeconds] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid registered email address.');
      return;
    }

    playUiSound('click');
    const res = await requestPasswordReset(cleanEmail);
    if (res.success) {
      setEmail(cleanEmail);
      setOtp('');
      setExpiresSeconds(res.expiresInSeconds ?? 300);
      setCooldownSeconds(res.cooldownSeconds ?? 60);
      setStep('otp');
      playUiSound('notification');
      showToast('6-digit password reset OTP sent to your email!', 'success');
    } else {
      if (res.cooldownSeconds) setCooldownSeconds(res.cooldownSeconds);
      if (res.retryAfterSeconds && res.code?.includes('LOCKED')) {
        setLockoutSeconds(res.retryAfterSeconds);
      }
      setFormError(res.error || 'Could not send password reset code.');
      showToast(res.error || 'Failed to send reset OTP', 'error');
    }
  };

  const handleResendOtp = async () => {
    setFormError('');
    setResending(true);
    playUiSound('click');
    const res = await resendOtp(email.trim().toLowerCase(), 'password_reset');
    setResending(false);

    if (res.success) {
      setOtp('');
      setExpiresSeconds(res.expiresInSeconds ?? 300);
      setCooldownSeconds(res.cooldownSeconds ?? 60);
      playUiSound('notification');
      showToast('Fresh 6-digit password reset OTP sent!', 'success');
    } else {
      if (res.cooldownSeconds) setCooldownSeconds(res.cooldownSeconds);
      if (res.retryAfterSeconds && res.code?.includes('LOCKED')) {
        setLockoutSeconds(res.retryAfterSeconds);
      }
      setFormError(res.error || 'Could not resend OTP.');
      showToast(res.error || 'Resend failed', 'error');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!/^\d{6}$/.test(otp.trim())) {
      setFormError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    playUiSound('click');
    const res = await verifyResetOtp(email.trim().toLowerCase(), otp.trim());
    if (res.success && res.resetToken) {
      setResetToken(res.resetToken);
      setStep('password');
      playUiSound('notification');
      showToast('OTP verified! Please enter your new password.', 'success');
    } else {
      if (res.retryAfterSeconds && res.code?.includes('LOCKED')) {
        setLockoutSeconds(res.retryAfterSeconds);
      }
      setFormError(res.error || 'OTP verification failed.');
      showToast(res.error || 'Invalid OTP', 'error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('New Password and Confirm Password do not match.');
      return;
    }

    playUiSound('click');
    const res = await resetPassword(
      email.trim().toLowerCase(),
      resetToken,
      newPassword,
      confirmPassword
    );
    if (res.success) {
      setStep('done');
      playUiSound('notification');
      showToast('Password reset successfully!', 'success');
    } else {
      setFormError(res.error || 'Could not reset password.');
      showToast(res.error || 'Reset failed', 'error');
    }
  };

  const stepIndex = step === 'email' ? 1 : step === 'otp' ? 2 : 3;

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

      {/* Main card */}
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
            <h1 className="text-2xl font-black tracking-tight text-slate-100">
              {step === 'done' ? 'Password Updated' : 'Reset Password'}
            </h1>
            <p className="text-xs text-slate-400">
              {step === 'email' && 'Enter your registered email to receive a 6-digit password reset OTP.'}
              {step === 'otp' && `Enter the 6-digit security code sent to ${email}.`}
              {step === 'password' && 'Create a strong new password for your account.'}
              {step === 'done' && 'Your password has been securely updated. Sign in with your new credentials.'}
            </p>
          </div>

          {step !== 'done' && (
            <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold">
              {[
                { num: 1, label: 'Email' },
                { num: 2, label: 'Verify OTP' },
                { num: 3, label: 'Password' },
              ].map(item => {
                const active = stepIndex === item.num;
                const completed = stepIndex > item.num;
                return (
                  <div
                    key={item.num}
                    className={`px-2.5 py-2 rounded-xl border text-center transition-colors ${
                      active
                        ? 'bg-violet-600/20 border-violet-500/60 text-violet-200'
                        : completed
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="font-mono">{item.num}.</span> {item.label}
                  </div>
                );
              })}
            </div>
          )}

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {formError}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
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
                type="submit"
                disabled={loading || cooldownSeconds > 0 || lockoutSeconds > 0}
                className="btn-premium-vivid w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {loading
                    ? 'Sending Reset OTP...'
                    : cooldownSeconds > 0
                    ? `Wait ${cooldownSeconds}s`
                    : 'Send 6-Digit Reset OTP'}
                </span>
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    6-Digit Password Reset OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setFormError('');
                    }}
                    className="text-[11px] font-semibold text-violet-300 hover:text-violet-200 cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
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
                onResend={handleResendOtp}
              />

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || expiresSeconds <= 0 || lockoutSeconds > 0}
                className="btn-premium-vivid w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(v => !v)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p
                    className={`text-[11px] mt-1 ${
                      newPassword === confirmPassword ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {newPassword === confirmPassword
                      ? 'Passwords match'
                      : 'Passwords do not match yet'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-premium-vivid w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Password reset complete for <strong className="font-mono">{email}</strong>.
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  playUiSound('click');
                  navigate(`/signin?reset=1&email=${encodeURIComponent(email)}`);
                }}
                className="btn-premium-vivid w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In with New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="text-center text-[11px] text-slate-500 max-w-md mx-auto flex items-center justify-center gap-1.5 relative z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>ONLINE LEARNING PRO · Rate-Limited Password Recovery</span>
      </div>
    </div>
  );
};
