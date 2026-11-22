import React, { useState } from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { playUiSound } from '../../services/sound';
import { AuthBackdrop } from '../../components/motion/Extras';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';
import {
  Lock,
  Mail,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  MailWarning,
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { navigate, queryParams } = useRouter();
  const { signIn, resendOtp, loading } = useAuth();
  const { showToast } = useToast();

  const redirectTarget = queryParams.get('redirect') || '/dashboard';
  const prefillEmail = queryParams.get('email') || '';
  const isVerifiedNotice = queryParams.get('verified') === '1';

  const [gmail, setGmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [needsVerificationEmail, setNeedsVerificationEmail] = useState('');
  const [sendingVerifyOtp, setSendingVerifyOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setNeedsVerificationEmail('');

    const cleanEmail = gmail.trim().toLowerCase();
    if (!cleanEmail) {
      setFormError('Please enter your registered email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    playUiSound('click');
    const res = await signIn(cleanEmail, password);
    if (res.success) {
      playUiSound('notification');
      showToast('Welcome back! Signed in successfully.', 'success');
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectTarget === '/admin' ? '/dashboard' : redirectTarget);
      }
    } else if (res.emailNotVerified) {
      playUiSound('notification');
      setNeedsVerificationEmail(cleanEmail);
      setFormError(
        res.error ||
          'Your email address is not verified yet. Please verify your 6-digit OTP before signing in.'
      );
      showToast('Email verification required before login.', 'error');
    } else {
      playUiSound('notification');
      setFormError(res.error || 'Invalid email or password. Please verify your credentials.');
      showToast(res.error || 'Authentication failed', 'error');
    }
  };

  const handleVerifyNow = async () => {
    const targetEmail = needsVerificationEmail || gmail.trim().toLowerCase();
    if (!targetEmail) return;
    setSendingVerifyOtp(true);
    playUiSound('click');
    const res = await resendOtp(targetEmail, 'email_verification');
    setSendingVerifyOtp(false);

    if (res.success) {
      showToast('6-digit verification OTP sent to your email.', 'success');
      navigate(
        `/verify-email?email=${encodeURIComponent(targetEmail)}&cooldown=${
          res.cooldownSeconds ?? 60
        }&expires=${res.expiresInSeconds ?? 300}`
      );
    } else if (res.cooldownSeconds) {
      // Even if cooldown is active from registration, take them straight to OTP verification screen with remaining cooldown
      navigate(
        `/verify-email?email=${encodeURIComponent(targetEmail)}&cooldown=${
          res.cooldownSeconds
        }&expires=300`
      );
    } else {
      navigate(`/verify-email?email=${encodeURIComponent(targetEmail)}`);
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
            navigate('/');
          }}
          className="btn-premium-glass inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <ThemeSwitcher />
      </div>

      {/* Main card */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10 py-6">
        <div className="oe-panel oe-rgb-violet p-8 rounded-3xl backdrop-blur-2xl space-y-6">
          <div className="text-center space-y-2">
            <div
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-950/90 border border-violet-500/35 shadow-[0_0_24px_-6px_rgba(var(--oe-accent-rgb),0.65)] cursor-pointer mb-2"
            >
              <img
                src={PLATFORM_LOGO_URL}
                alt="ONLINE EARNING IT"
                className="w-10 h-10 rounded-xl object-contain"
              />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100">Sign In to Platform</h1>
            <p className="text-xs text-slate-400">
              Sign in with your verified email address & password.
            </p>
          </div>

          {isVerifiedNotice && !formError && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Email verified successfully! You can now sign in.
              </span>
            </div>
          )}

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2.5">
              <div className="flex items-start gap-2">
                {needsVerificationEmail && (
                  <MailWarning className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{formError}</span>
              </div>
              {needsVerificationEmail && (
                <button
                  type="button"
                  onClick={handleVerifyNow}
                  disabled={sendingVerifyOtp}
                  className="btn-premium-primary w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <span>{sendingVerifyOtp ? 'Opening Verification...' : 'Verify Email with 6-Digit OTP'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={gmail}
                  onChange={e => setGmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium-vivid w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-800 space-y-2">
            <p className="text-xs text-slate-400">
              Don’t have an account yet?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-violet-300 hover:text-violet-200 font-bold cursor-pointer"
              >
                Create Account
              </button>
            </p>
            <p className="text-[11px] text-slate-500">
              Need to finish verification?{' '}
              <button
                type="button"
                onClick={() => {
                  const clean = gmail.trim().toLowerCase();
                  navigate(clean ? `/verify-email?email=${encodeURIComponent(clean)}` : '/verify-email');
                }}
                className="text-slate-300 hover:text-violet-300 font-medium cursor-pointer"
              >
                Verify Email OTP
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="text-center text-[11px] text-slate-500 max-w-md mx-auto flex items-center justify-center gap-1.5 relative z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>ONLINE EARNING IT · Encrypted Session Authentication</span>
      </div>
    </div>
  );
};
