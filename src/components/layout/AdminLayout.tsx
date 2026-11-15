import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Users,
  Wrench,
  Database,
  LifeBuoy,
  Settings,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  CreditCard,
  Cloud,
} from 'lucide-react';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useDbSync();
  const { path, navigate } = useRouter();
  const { user, isAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pendingPayments = db.getPaymentRequests().filter(r => r.status === 'pending').length;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-3xl border border-rose-500/30 bg-slate-900/90 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">Owner Authorization Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {user
                ? 'Your account does not possess administrative privileges. Only the verified platform owner can access the admin control center.'
                : 'Administrative console access is restricted to the platform owner.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-lg shadow-blue-600/20"
              >
                Return to User Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/signin')}
                className="w-full py-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-lg shadow-blue-600/20"
              >
                Sign In to Owner Account
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              ← Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const adminNav = [
    { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Tool Management', href: '/admin/tools', icon: Wrench },
    { label: 'Generator Databases', href: '/admin/database', icon: Database },
    { label: 'Payment Approvals', href: '/admin/payments', icon: CreditCard, badge: pendingPayments },
    { label: 'Support Inquiries', href: '/admin/support', icon: LifeBuoy },
    { label: 'Content & Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-900 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-tight text-white uppercase block leading-none">
                  Admin Console
                </span>
                <span className="text-[10px] text-amber-400 font-mono">Master Mode</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1 overflow-y-auto">
            {adminNav.map(item => {
              const Icon = item.icon;
              const isActive = path === item.href;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold tabular-nums ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer controls */}
          <div className="mt-auto p-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>User Dashboard</span>
            </button>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-white">{user?.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.gmail}</p>
              </div>
              <button
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-medium text-slate-400">
              System Control · ONLINE EARNING IT
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <button
              onClick={() => navigate('/')}
              className="text-xs font-medium text-slate-300 hover:text-blue-400 transition-colors hidden sm:inline"
            >
              View Public Site
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
