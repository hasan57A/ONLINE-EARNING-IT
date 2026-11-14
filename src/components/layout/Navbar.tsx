import React, { useState } from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useDbSync } from '../../hooks/useDbSync';
import { useToast } from '../ui/Toast';
import { db } from '../../services/db';
import { Menu, X, Shield, LayoutDashboard, LogOut, User as UserIcon, Sparkles, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export const Navbar: React.FC = () => {
  useDbSync();
  const { path, navigate } = useRouter();
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const toolAccess = db.canUseTool(user?.id);
  const isWorkspaceUnlocked = toolAccess.isAdmin || toolAccess.hasUsablePackage;

  const navLinks = [
    { label: 'Tools', href: '/tools' },
    { label: 'Resources', href: '/resources' },
    { label: 'Services', href: '/#services' },
    { label: 'Plans', href: '/#plans' },
    { label: 'Support', href: '/support' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if ((href === '/tools' || href === '/resources') && isAuthenticated && !isWorkspaceUnlocked) {
      showToast(
        toolAccess.planStatus === 'pending'
          ? 'Your package payment is pending admin approval.'
          : 'Please take a package first to unlock Tools & Resources!',
        'error'
      );
      navigate('/payment');
      return;
    }
    if (href.startsWith('/#')) {
      if (path !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(href.replace('/#', ''));
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(href.replace('/#', ''));
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-18">
        {/* Zone 1: Single Brand element */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0 group"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <img
              src={PLATFORM_LOGO_URL}
              alt="ONLINE EARNING IT Logo"
              className="relative w-10 h-10 rounded-xl object-contain shadow-md group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase leading-none">
                ONLINE EARNING <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-400">IT</span>
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              Learn · Earn · Grow
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 single-line clean text links with animated indicator */}
        <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full border border-white/5 bg-slate-900/60 backdrop-blur-lg">
          {navLinks.map(item => {
            const isActive = path === item.href || (item.href.startsWith('/#') && path === '/');
            const isLockedLink =
              (item.href === '/tools' || item.href === '/resources') && isAuthenticated && !isWorkspaceUnlocked;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/80 to-indigo-600/80 shadow-md shadow-blue-500/25 border border-blue-400/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
                {isLockedLink && <Lock className="w-3 h-3 text-rose-400 relative z-10" />}
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-3.5 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer rounded-full hover:bg-amber-500/10"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary action + Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Premium Theme Mode Switcher */}
          <ThemeSwitcher />

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-white transition-all cursor-pointer shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate font-semibold">{user?.fullName}</span>
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl p-2 shadow-2xl z-50 text-xs space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="font-bold text-white truncate">{user?.fullName}</p>
                      <p className="text-slate-400 truncate text-[11px]">{user?.gmail}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-600/15 text-slate-200 hover:text-blue-300 transition-colors text-left font-medium cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-400" />
                      <span>User Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-amber-500/15 text-amber-400 transition-colors text-left font-semibold cursor-pointer"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Console</span>
                      </button>
                    )}
                    <div className="my-1 border-t border-white/5" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/15 text-rose-400 transition-colors text-left font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/signin')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="relative group px-4 py-2 text-xs font-bold text-white rounded-xl shadow-lg shadow-blue-600/30 overflow-hidden cursor-pointer whitespace-nowrap shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all" />
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>Sign Up</span>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </span>
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-white/5 bg-slate-900 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-slate-950 px-4 pt-4 pb-6 space-y-2 overflow-hidden"
          >
            {navLinks.map(item => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="block w-full text-left py-2.5 px-3 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-xl transition-colors"
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/admin');
                }}
                className="block w-full text-left py-2.5 px-3 text-sm font-semibold text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
              >
                Admin Panel
              </button>
            )}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full py-3 px-4 text-center text-xs font-bold rounded-xl bg-blue-600 text-white"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full py-2.5 px-4 text-center text-xs font-semibold rounded-xl text-rose-400 border border-rose-500/30"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/signin');
                    }}
                    className="py-2.5 text-center text-xs font-semibold rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-900"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/signup');
                    }}
                    className="py-2.5 text-center text-xs font-bold rounded-xl bg-blue-600 text-white"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

