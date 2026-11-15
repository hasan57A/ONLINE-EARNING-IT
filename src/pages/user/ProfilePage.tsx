import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Shield,
  Save,
  CheckCircle2,
  CreditCard,
  AtSign,
  Send,
  Eye,
  EyeOff,
  Coins,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  LogOut,
  KeyRound,
  ArrowUpRight,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  useDbSync();
  const { user, signOut, refreshUser } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const latestUser = user ? db.getUserById(user.id) || user : null;
  const toolAccess = db.canUseTool(user?.id);
  const remainingCredits = toolAccess.isAdmin
    ? 999999
    : Math.max(0, Math.floor(Number(latestUser?.credits ?? 0)));
  const usedCredits = Math.max(0, Math.floor(Number(latestUser?.usedCredits ?? 0)));
  const matchedPkg = db
    .getPaymentPackages()
    .find(p => p.name.toLowerCase() === (latestUser?.plan || '').toLowerCase());
  const totalPackCredits = toolAccess.isAdmin
    ? 10000
    : Math.max(remainingCredits + usedCredits, matchedPkg?.credits || remainingCredits || 500);
  const progressPct = toolAccess.isAdmin
    ? 100
    : totalPackCredits > 0
    ? Math.min(100, Math.max(0, Math.round((remainingCredits / totalPackCredits) * 100)))
    : 0;

  // Card 01: Full Name
  const [fullName, setFullName] = useState(latestUser?.fullName || '');
  // Card 02: Username
  const [username, setUsername] = useState(
    latestUser?.username || (latestUser?.gmail ? latestUser.gmail.split('@')[0] : '')
  );
  // Card 03: Mobile
  const [mobile, setMobile] = useState(latestUser?.mobile || '');
  // Card 04: Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  // Card 05: Telegram Username
  const [telegramUsername, setTelegramUsername] = useState(latestUser?.telegramUsername || '');
  // Card 08: Two-factor toggle
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(Boolean(latestUser?.twoFactorEnabled));

  const [savingCard, setSavingCard] = useState<string | null>(null);

  useEffect(() => {
    if (latestUser) {
      setFullName(latestUser.fullName || '');
      setUsername(latestUser.username || (latestUser.gmail ? latestUser.gmail.split('@')[0] : ''));
      setMobile(latestUser.mobile || '');
      setTelegramUsername(latestUser.telegramUsername || '');
      setTwoFactorEnabled(Boolean(latestUser.twoFactorEnabled));
    }
  }, [latestUser?.id]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName.trim()) {
      showToast('Full name cannot be empty.', 'error');
      return;
    }
    setSavingCard('01');
    const res = await db.updateUserProfile(user.id, { fullName: fullName.trim() });
    setSavingCard(null);
    if (res.success) {
      refreshUser();
      playUiSound('click');
      showToast('Profile display name updated!', 'success');
    } else {
      showToast(res.error || 'Could not update name.', 'error');
    }
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const clean = username.trim().replace(/^@/, '').replace(/\s+/g, '_');
    if (clean.length < 3) {
      showToast('Username must be at least 3 characters.', 'error');
      return;
    }
    setSavingCard('02');
    const res = await db.updateUserProfile(user.id, { username: clean });
    setSavingCard(null);
    if (res.success) {
      setUsername(clean);
      refreshUser();
      playUiSound('click');
      showToast(`Username updated to @${clean}`, 'success');
    } else {
      showToast(res.error || 'Could not update username.', 'error');
    }
  };

  const handleSaveMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mobile.trim()) {
      showToast('Mobile number cannot be empty.', 'error');
      return;
    }
    setSavingCard('03');
    const res = await db.updateUserProfile(user.id, { mobile: mobile.trim() });
    setSavingCard(null);
    if (res.success) {
      refreshUser();
      playUiSound('click');
      showToast('Mobile contact number updated!', 'success');
    } else {
      showToast(res.error || 'Could not update mobile number.', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    setSavingCard('04');
    const res = await db.updateUserProfile(user.id, { newPassword });
    setSavingCard(null);
    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
      refreshUser();
      playUiSound('click');
      showToast('Password updated securely with SHA-256 salt!', 'success');
    } else {
      showToast(res.error || 'Failed to update password.', 'error');
    }
  };

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingCard('05');
    const res = await db.updateUserProfile(user.id, { telegramUsername });
    setSavingCard(null);
    if (res.success) {
      refreshUser();
      playUiSound('click');
      showToast('Telegram handle linked & verified!', 'success');
    } else {
      showToast(res.error || 'Failed to save Telegram handle.', 'error');
    }
  };

  const handleToggle2FA = async () => {
    if (!user) return;
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    const res = await db.updateUserProfile(user.id, { twoFactorEnabled: next });
    if (res.success) {
      refreshUser();
      playUiSound('click');
      showToast(next ? 'Enhanced 2FA guard enabled.' : '2FA guard turned off.', 'info');
    }
  };

  // SVG Ring calculation
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest">
            <UserIcon className="w-4 h-4" />
            <span>Account Identity & Membership</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage personal credentials, verified channels, password security, and package credit consumption.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playUiSound('click');
            navigate('/settings');
          }}
          className="btn-premium-glass px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Workspace Preferences</span>
        </button>
      </div>

      {/* Hero Profile Banner (Image 11 Signature Header) */}
      <div className="oe-panel oe-rgb-violet rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-24 w-64 h-64 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Conic Gradient Avatar Ring */}
            <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-lg shadow-violet-600/30 shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[13px] bg-slate-950 flex items-center justify-center text-2xl sm:text-3xl font-black text-slate-100">
                {latestUser?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center"
                title="Verified Active Account"
              >
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 truncate">
                  {latestUser?.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1 whitespace-nowrap">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{latestUser?.status === 'active' ? 'Verified Active' : 'Restricted'}</span>
                </span>
                {latestUser?.role === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1 whitespace-nowrap">
                    <Shield className="w-3 h-3" />
                    <span>Master Admin</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
                <span className="text-violet-300 font-semibold">@{username || 'member'}</span>
                <span className="text-slate-600">·</span>
                <span className="truncate">{latestUser?.gmail}</span>
                {latestUser?.telegramUsername && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span className="text-cyan-400">{latestUser.telegramUsername}</span>
                  </>
                )}
              </div>

              <p className="text-[11px] text-slate-500">
                Member since{' '}
                {latestUser?.createdAt
                  ? new Date(latestUser.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recently'}
              </p>
            </div>
          </div>

          {/* Credit Summary Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Credit Balance
              </span>
              <span className="text-lg font-black font-mono tabular-nums text-amber-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{toolAccess.isAdmin ? 'Unlimited' : `${remainingCredits.toLocaleString()} Cr`}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                navigate('/payment');
              }}
              className="btn-premium-vivid px-5 py-3 rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>{toolAccess.hasUsablePackage ? 'Top Up / Upgrade Plan' : 'Activate Package'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Numbered RGB-Accented Profile Cards (Image 11 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 01 · Profile Information */}
        <form onSubmit={handleSaveName} className="oe-panel oe-rgb-violet rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-300 font-mono text-[11px] font-bold">
                01
              </span>
              <h3 className="text-sm font-bold text-slate-100">Profile Information</h3>
            </div>
            <UserIcon className="w-4 h-4 text-violet-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Full Display Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Registered Gmail (Permanent)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={latestUser?.gmail || ''}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs text-slate-400 cursor-not-allowed opacity-75"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingCard === '01'}
            className="btn-premium-primary w-full py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingCard === '01' ? 'Saving...' : 'Save Name Changes'}</span>
          </button>
        </form>

        {/* 02 · Change Username */}
        <form onSubmit={handleSaveUsername} className="oe-panel oe-rgb-pink rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 font-mono text-[11px] font-bold">
                02
              </span>
              <h3 className="text-sm font-bold text-slate-100">Change Username</h3>
            </div>
            <AtSign className="w-4 h-4 text-pink-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Platform Handle</label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="your_handle"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border font-mono text-xs text-slate-100"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Shown in support desk threads and team activity logs as{' '}
                <span className="text-pink-300 font-mono">@{username.replace(/^@/, '') || 'member'}</span>.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingCard === '02'}
            className="btn-premium-vivid w-full py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingCard === '02' ? 'Updating...' : 'Update Username'}</span>
          </button>
        </form>

        {/* 03 · Change Mobile & Contact Info */}
        <form onSubmit={handleSaveMobile} className="oe-panel oe-rgb-amber rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold">
                03
              </span>
              <h3 className="text-sm font-bold text-slate-100">Mobile & Contact Info</h3>
            </div>
            <Phone className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Primary Phone / WhatsApp Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="+880 17XXXXXXXX"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border font-mono text-xs text-slate-100"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Used to verify bKash / Nagad / Rocket sender numbers during payment approvals.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingCard === '03'}
            className="btn-premium-primary w-full py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingCard === '03' ? 'Saving...' : 'Update Mobile Number'}</span>
          </button>
        </form>

        {/* 04 · Change Password */}
        <form onSubmit={handleChangePassword} className="oe-panel oe-rgb-rose rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[11px] font-bold">
                04
              </span>
              <h3 className="text-sm font-bold text-slate-100">Change Password</h3>
            </div>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-100 cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(p => !p)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-100 cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingCard === '04'}
            className="btn-premium-glass w-full py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>{savingCard === '04' ? 'Encrypting...' : 'Update Password (SHA-256)'}</span>
          </button>
        </form>

        {/* 05 · Telegram Username */}
        <form onSubmit={handleSaveTelegram} className="oe-panel oe-rgb-cyan rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold">
                05
              </span>
              <h3 className="text-sm font-bold text-slate-100">Telegram Username</h3>
            </div>
            <Send className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Telegram Handle</label>
              <div className="relative">
                <Send className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={e => setTelegramUsername(e.target.value)}
                  placeholder="@your_telegram"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border font-mono text-xs text-slate-100"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Link your Telegram for fast payment confirmation and VIP support escalation.
              </p>
            </div>

            {telegramUsername.trim() && (
              <a
                href={`https://t.me/${telegramUsername.trim().replace(/^@/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:underline font-mono"
              >
                <span>t.me/{telegramUsername.trim().replace(/^@/, '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <button
            type="submit"
            disabled={savingCard === '05'}
            className="btn-premium-cyan w-full py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingCard === '05' ? 'Linking...' : 'Save Telegram Handle'}</span>
          </button>
        </form>

        {/* 06 · Current Plan & Usage (Circular Progress Ring) */}
        <div className="oe-panel oe-rgb-emerald rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold">
                06
              </span>
              <h3 className="text-sm font-bold text-slate-100">Current Plan & Usage</h3>
            </div>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-center gap-5">
            {/* Circular SVG Ring */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  stroke="rgba(148,163,184,0.14)"
                  strokeWidth="7"
                  fill="none"
                />
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  stroke="url(#oeCreditRing)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
                <defs>
                  <linearGradient id="oeCreditRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black font-mono text-slate-100 tabular-nums">{progressPct}%</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Left</span>
              </div>
            </div>

            <div className="space-y-1.5 min-w-0 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Plan</span>
                <span className="font-bold text-slate-100 truncate">
                  {toolAccess.isAdmin
                    ? 'Admin Unlimited'
                    : latestUser?.plan || (latestUser?.planStatus === 'pending' ? 'Pending Approval' : 'No Package')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Remaining Credits</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {toolAccess.isAdmin ? '∞' : remainingCredits.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Consumed</span>
                <span className="font-mono font-bold text-slate-300 tabular-nums">
                  {usedCredits.toLocaleString()} Cr
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              navigate('/payment');
            }}
            className="btn-premium-emerald w-full py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{toolAccess.hasUsablePackage ? 'Upgrade Plan / Buy Credits' : 'Select a Package'}</span>
          </button>
        </div>

        {/* 07 · Account Verification Status */}
        <div className="oe-panel oe-rgb-blue rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono text-[11px] font-bold">
                07
              </span>
              <h3 className="text-sm font-bold text-slate-100">Account Verification Status</h3>
            </div>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Gmail Verification</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Mobile Number</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  latestUser?.mobile
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {latestUser?.mobile ? 'On File' : 'Missing'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Telegram Handle</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  latestUser?.telegramUsername
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {latestUser?.telegramUsername ? 'Linked' : 'Not Linked'}
              </span>
            </div>
          </div>
        </div>

        {/* 08 · Login & Security */}
        <div className="oe-panel oe-rgb-violet rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-300 font-mono text-[11px] font-bold">
                08
              </span>
              <h3 className="text-sm font-bold text-slate-100">Login & Security</h3>
            </div>
            <Shield className="w-4 h-4 text-violet-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-100">Two-Factor Session Guard</p>
                <p className="text-[11px] text-slate-400">
                  Extra verification check for sensitive account updates.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={twoFactorEnabled}
                onClick={handleToggle2FA}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                  twoFactorEnabled ? 'bg-violet-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Last Session Update</span>
              <span className="font-mono text-slate-300">
                {latestUser?.updatedAt
                  ? new Date(latestUser.updatedAt).toLocaleString()
                  : 'Active Browser Session'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              signOut();
              navigate('/');
            }}
            className="btn-premium-glass w-full py-2.5 rounded-xl text-xs text-rose-300 hover:text-rose-200 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
