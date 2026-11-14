import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Shield,
  Save,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  useDbSync();
  const { user, updateProfile } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const latestUser = user ? db.getUserById(user.id) || user : null;
  const toolAccess = db.canUseTool(user?.id);
  const packageCreditTotal = toolAccess.packageCredits ?? toolAccess.remainingCredits;

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobile, setMobile] = useState(user?.mobile || '');

  // Password management
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Full name cannot be empty.', 'error');
      return;
    }
    if (!mobile.trim()) {
      showToast('Mobile number cannot be empty.', 'error');
      return;
    }

    setSavingProfile(true);
    const res = await updateProfile({ fullName, mobile });
    setSavingProfile(false);

    if (res.success) {
      showToast('Profile information updated successfully!', 'success');
    } else {
      showToast(res.error || 'Failed to update profile.', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setSavingPassword(true);
    const res = await updateProfile({ newPassword });
    setSavingPassword(false);

    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated securely with SHA-256 hash!', 'success');
    } else {
      showToast(res.error || 'Failed to update password.', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-widest">
          <UserIcon className="w-4 h-4" />
          <span>Account Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your personal credentials, contact mobile number, and password security.
        </p>
      </div>

      {/* Account Overview Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-600/20">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.fullName}</h2>
            <p className="text-xs text-slate-500 font-mono">{user?.gmail}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Account</span>
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-[11px] text-slate-500">
                Registered {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/payment')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-colors ${
              toolAccess.isAdmin || toolAccess.hasUsablePackage
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : latestUser?.planStatus === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="font-mono">
              {toolAccess.isAdmin
                ? 'Admin Unlimited'
                : toolAccess.hasUsablePackage
                ? `${toolAccess.planName || 'Plan'} (${packageCreditTotal.toLocaleString()} Cr Pack) · ${toolAccess.remainingCredits.toLocaleString()} Left`
                : latestUser?.planStatus === 'pending'
                ? `Pending: ${toolAccess.planName || 'Package'}${
                    toolAccess.packageCredits ? ` (${toolAccess.packageCredits.toLocaleString()} Cr)` : ''
                  }`
                : 'No Package · 0 Credits (Take Package)'}
            </span>
          </button>

          {user?.role === 'admin' && (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-bold flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Master Administrator</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Profile Information
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Registered Gmail (Immutable)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={user?.gmail || ''}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="block text-[11px] text-slate-500 mt-1">
                Gmail address is permanently bound to this account.
              </span>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Password Management Form */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Password Management
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
              Your password is encrypted with cryptographic SHA-256 and salted locally before storage.
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
