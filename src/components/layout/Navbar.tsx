import React, { useState } from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import { Menu, X, ArrowRight, Shield, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export const Navbar: React.FC = () => {
  const { path, navigate } = useRouter();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toolAccess = db.canUseTool(user?.id);
  const isWorkspaceUnlocked = toolAccess.isAdmin || toolAccess.hasUsablePackage;

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/#tools-showcase' },
    { label: 'Pricing', href: '/#pricing-section' },
    { label: 'Resources', href: '/resources' },
    { label: 'Contact', href: '/#contact-section' },
  ];

  const handleNavClick = (href: string) => {
    playUiSound('click');
    setMobileOpen(false);
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      if (path !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }, 140);
      } else {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    navigate(href);
  };

  return (
    <header className="oe-public-nav sticky z-40">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer group text-left"
        >
          <img
            src={PLATFORM_LOGO_URL}
            alt="Online Learning Pro"
            className="w-9 h-9 rounded-xl object-cover ring-1 ring-amber-400/35 shadow-md group-hover:scale-105 transition-transform"
          />
          <span className="text-base sm:text-lg font-extrabold tracking-tight whitespace-nowrap shrink-0">
            <span className="text-amber-400 dark:text-amber-300">ONLINE</span>{' '}
            <span className="text-blue-400 dark:text-sky-300">LEARNING</span>{' '}
            <span className="text-amber-400 dark:text-amber-300">PRO</span>
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(item => {
            const isActive = path === item.href;
            const isLocked = item.href === '/resources' && isAuthenticated && !isWorkspaceUnlocked;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className={`relative py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                  isActive ? 'text-slate-100' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <span>{item.label}</span>
                {isLocked && <Lock className="w-3 h-3 text-rose-400" />}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-amber-400" />
                )}
              </button>
            );
          })}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavClick('/admin')}
              className="py-1 text-xs font-semibold text-amber-400 dark:text-amber-300 hover:text-slate-100 inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick(isAuthenticated ? '/dashboard' : '/signin')}
            className="hidden sm:inline-flex btn-premium-primary px-4 py-2 rounded-xl text-xs whitespace-nowrap shrink-0 items-center gap-1.5 cursor-pointer"
          >
            <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(prev => !prev)}
            className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-slate-100 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800/80 px-4 py-4 space-y-2 overflow-hidden"
          >
            {navLinks.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-blue-600/15 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNavClick('/admin')}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/15 transition-colors cursor-pointer"
              >
                Admin Console
              </button>
            )}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Color & Display Mode</span>
              <ThemeSwitcher />
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleNavClick(isAuthenticated ? '/dashboard' : '/signin')}
                className="w-full btn-premium-primary py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Open Dashboard' : 'Sign In / Get Started'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
