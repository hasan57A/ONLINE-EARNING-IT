import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Lock, Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { navigate, queryParams } = useRouter();
  const { signIn, loading } = useAuth();
  const { showToast } = useToast();

  const redirectTarget = queryParams.get('redirect') || '/dashboard';

  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

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

    const res = await signIn(gmail.trim(), password);
    if (res.success) {
      showToast('Welcome back! Signed in successfully.', 'success');
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectTarget === '/admin' ? '/dashboard' : redirectTarget);
      }
    } else {
      setFormError(res.error || 'Invalid Gmail or password. Please verify your credentials.');
      showToast(res.error || 'Authentication failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top back button */}
      <div className="max-w-md w-full mx-auto">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2.5 cursor-pointer mb-2"
            >
              <img
                src="/assets/aistudio/Online_Earning_IT_Logo__e2215d9f_e2215d9f.png"
                alt="ONLINE EARNING IT"
                className="w-10 h-10 rounded-xl object-contain shadow-md"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Sign In to Platform</h1>
            <p className="text-xs text-slate-400">
              Enter your registered Gmail and password to access your dashboard.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gmail Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={gmail}
                  onChange={e => setGmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Don’t have an account yet?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="text-center text-[11px] text-slate-600 max-w-md mx-auto">
        ONLINE EARNING IT · Secure Session Authentication
      </div>
    </div>
  );
};
