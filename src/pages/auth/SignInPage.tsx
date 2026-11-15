import React, { useState } from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { playUiSound } from '../../services/sound';
import { AuthBackdrop } from '../../components/motion/Extras';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';
import { Lock, Mail, ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { navigate, queryParams } = useRouter();
  const { signIn, signInWithGoogle, loading } = useAuth();
  const { showToast } = useToast();

  const redirectTarget = queryParams.get('redirect') || '/dashboard';

  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleGoogleSignIn = async () => {
    setFormError('');
    playUiSound('click');
    const res = await signInWithGoogle();
    if (res.success) {
      playUiSound('notification');
      showToast('Redirecting to Google for Supabase Cloud sync...', 'success');
      if (res.user) {
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(redirectTarget === '/admin' ? '/dashboard' : redirectTarget);
        }
      }
    } else if (res.error) {
      playUiSound('notification');
      setFormError(res.error);
      showToast(res.error, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!gmail.trim()) {
      setFormError('Please enter your Gmail address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    playUiSound('click');
    const res = await signIn(gmail.trim(), password);
    if (res.success) {
      playUiSound('notification');
      showToast('Welcome back! Signed in successfully.', 'success');
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectTarget === '/admin' ? '/dashboard' : redirectTarget);
      }
    } else {
      playUiSound('notification');
      setFormError(res.error || 'Invalid Gmail or password. Please verify your credentials.');
      showToast(res.error || 'Authentication failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative">
      <AuthBackdrop />

      {/* Top bar */}
      <div className="max-w-md w-full mx-auto relative z-10 flex items-center justify-between gap-3">
        <button
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
      <div className="max-w-md w-full mx-auto my-auto relative z-10">
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
              Sign in with Google for live Supabase Cloud sync, or use your registered Gmail & password.
            </p>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-premium-glass w-full py-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.04l3.3 2.56c1.93-1.78 3.04-4.4 3.04-7.5 0-.72-.06-1.41-.19-2.08H12z"
              />
              <path
                fill="#4285F4"
                d="M12 22c2.75 0 5.06-.91 6.75-2.47l-3.3-2.56c-.91.61-2.08.98-3.45.98-2.65 0-4.9-1.79-5.71-4.2H2.88v2.64C4.56 19.73 8.01 22 12 22z"
              />
              <path
                fill="#FBBC05"
                d="M6.29 13.75c-.2-.61-.32-1.26-.32-1.95s.12-1.34.32-1.95V7.21H2.88A9.96 9.96 0 0 0 1.8 11.8c0 1.65.4 3.21 1.08 4.59l3.41-2.64z"
              />
              <path
                fill="#34A853"
                d="M12 5.65c1.5 0 2.84.52 3.9 1.53l2.92-2.92C17.05 2.61 14.74 1.6 12 1.6 8.01 1.6 4.56 3.87 2.88 7.21l3.41 2.64C7.1 7.44 9.35 5.65 12 5.65z"
              />
            </svg>
            <span>Continue with Google (Supabase DB)</span>
          </button>

          <div className="relative flex items-center py-0.5">
            <div className="flex-grow border-t border-slate-800" />
            <span className="shrink mx-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              or with Gmail & Password
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gmail Address</label>
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
              <div className="flex items-center justify-between mb-1.5">
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

          <div className="text-center pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              Don’t have an account yet?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-violet-300 hover:text-violet-200 font-bold cursor-pointer"
              >
                Create Account
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
