import React, { useState } from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { playUiSound } from '../../services/sound';
import { AuthBackdrop } from '../../components/motion/Extras';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';
import { Lock, Mail, Phone, User, ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { navigate } = useRouter();
  const { signUp, loading } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!mobile.trim()) {
      setFormError('Please enter your mobile number.');
      return;
    }
    const cleanGmail = gmail.trim().toLowerCase();
    if (!cleanGmail.endsWith('@gmail.com')) {
      setFormError('Registration requires a valid Gmail address (@gmail.com).');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    playUiSound('click');
    const res = await signUp(fullName, mobile, cleanGmail, password);
    if (res.success) {
      playUiSound('notification');
      showToast('Registration successful! Welcome to ONLINE EARNING IT.', 'success');
      navigate('/dashboard');
    } else {
      playUiSound('notification');
      setFormError(res.error || 'Registration failed. Please try again.');
      showToast(res.error || 'Registration failed.', 'error');
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
            <h1 className="text-2xl font-black tracking-tight text-slate-100">Create Your Account</h1>
            <p className="text-xs text-slate-400">
              Register with your Gmail address to access ONLINE EARNING IT tools.
            </p>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="+880 17XX-XXXXXX"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 transition-colors"
                />
              </div>
            </div>

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
              <span className="block text-[11px] text-slate-500 mt-1">
                Must end with @gmail.com
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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
              <span>{loading ? 'Creating Account...' : 'Complete Sign Up'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="text-violet-300 hover:text-violet-200 font-bold cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="text-center text-[11px] text-slate-500 max-w-md mx-auto flex items-center justify-center gap-1.5 relative z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Protected by SHA-256 client cryptographic salting · ONLINE EARNING IT</span>
      </div>
    </div>
  );
};
