import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Lock, Mail, Phone, User, ArrowLeft, ArrowRight } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { navigate } = useRouter();
  const { signUp, loading } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
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

    const res = await signUp(fullName, mobile, cleanGmail, password);
    if (res.success) {
      showToast('Registration successful! Welcome to ONLINE EARNING IT.', 'success');
      navigate('/dashboard');
    } else {
      setFormError(res.error || 'Registration failed. Please try again.');
      showToast(res.error || 'Registration failed.', 'error');
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Create Your Account</h1>
            <p className="text-xs text-slate-400">
              Join ONLINE EARNING IT to access tools, save results, and streamline your marketing.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

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
              <span className="block text-[11px] text-slate-500 mt-1">
                Must end with @gmail.com
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Sign Up'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="text-center text-[11px] text-slate-600 max-w-md mx-auto">
        Protected by SHA-256 client cryptographic salting. ONLINE EARNING IT
      </div>
    </div>
  );
};
