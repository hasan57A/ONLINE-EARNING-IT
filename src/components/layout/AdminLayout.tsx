import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Database,
  LifeBuoy,
  Settings,
  ArrowLeft,
  Shield,
  LogOut,
  Menu,
  X,
  CreditCard,
  Search,
  Bell,
  Megaphone,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useDbSync();
  const { path, navigate } = useRouter();
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const pendingPayments = db.getPaymentRequests().filter(r => r.status === 'pending').length;
  const openTickets = db.getSupportTickets().filter(t => t.status === 'open').length;
  const isCompactSidebar = db.getUserPreferences().sidebarStyle === 'compact';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const adminNavSections = useMemo(
    () => [
      {
        title: 'Main',
        items: [
          { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
          { label: 'User Control', href: '/admin/users', icon: Users },
          { label: 'Payments & Transactions', href: '/admin/payments', icon: CreditCard, badge: pendingPayments },
        ],
      },
      {
        title: 'Tools & Data',
        items: [
          { label: 'Tools Management', href: '/admin/tools', icon: Wrench },
          { label: 'UA & Data Manager', href: '/admin/database', icon: Database },
        ],
      },
      {
        title: 'Communications',
        items: [
          { label: 'Support Channels', href: '/admin/support-channels', icon: MessageCircle },
          { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
          { label: 'Chat & Support', href: '/admin/support', icon: LifeBuoy, badge: openTickets },
        ],
      },
      {
        title: 'System',
        items: [
          { label: 'Website Settings', href: '/admin/settings', icon: Settings },
        ],
      },
    ],
    [pendingPayments, openTickets]
  );

  const allAdminItems = useMemo(
    () => adminNavSections.flatMap(sec => sec.items),
    [adminNavSections]
  );

  const filteredSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allAdminItems;
    return allAdminItems.filter(item => item.label.toLowerCase().includes(q));
  }, [allAdminItems, searchQuery]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-3xl oe-panel text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Administrative Access Required</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in with a verified Administrator account to open the Master Control Console.
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 text-xs rounded-xl btn-premium-primary cursor-pointer"
              >
                Return to User Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/signin?redirect=/admin')}
                className="w-full py-3 text-xs rounded-xl btn-premium-primary cursor-pointer"
              >
                Sign In to Admin Account
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              ← Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 ${
          isCompactSidebar ? 'lg:w-20' : 'lg:w-64'
        } border-r border-slate-800/80 bg-slate-900 flex flex-col justify-between transition-all duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Lockup */}
          <div className={`h-16 px-4 border-b border-slate-800/80 flex items-center ${isCompactSidebar ? 'lg:justify-center lg:px-2' : 'justify-between'} shrink-0`}>
            <button
              type="button"
              title="Online Earning IT Admin"
              onClick={() => {
                playUiSound('click');
                navigate('/admin');
              }}
              className="flex items-center gap-2.5 cursor-pointer text-left"
            >
              <img
                src={PLATFORM_LOGO_URL}
                alt="Online Earning IT"
                className="w-8 h-8 rounded-xl object-contain shadow-md shrink-0"
              />
              <div className={isCompactSidebar ? 'lg:hidden' : ''}>
                <span className="text-sm font-extrabold tracking-tight text-slate-100 block leading-tight">
                  Online Earning IT
                </span>
                <span className="text-[10px] text-violet-400 font-semibold block leading-none">
                  Admin Panel
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 overflow-y-auto px-3 py-4 space-y-5 ${isCompactSidebar ? 'lg:px-2' : ''}`}>
            {adminNavSections.map(section => (
              <div key={section.title} className="space-y-1">
                <div className={`px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${isCompactSidebar ? 'lg:hidden' : ''}`}>
                  {section.title}
                </div>
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = path === item.href;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      title={item.label}
                      onClick={() => {
                        playUiSound('click');
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all text-left cursor-pointer ${
                        isCompactSidebar ? 'lg:justify-center lg:px-2' : ''
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className={`truncate ${isCompactSidebar ? 'lg:hidden' : ''}`}>{item.label}</span>
                      </div>
                      {'badge' in item && typeof item.badge === 'number' && item.badge > 0 ? (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold tabular-nums ${
                            isCompactSidebar ? 'lg:hidden' : ''
                          } ${
                            isActive ? 'bg-white/20 text-white' : 'bg-violet-600/20 text-violet-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 opacity-80 ${isCompactSidebar ? 'lg:hidden' : ''}`} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom User Dashboard & Admin Account */}
          <div className={`p-3 border-t border-slate-800/80 space-y-2.5 shrink-0 ${isCompactSidebar ? 'lg:px-2' : ''}`}>
            <div className={`p-3.5 rounded-2xl border border-violet-500/25 bg-violet-500/10 dark:bg-gradient-to-br dark:from-violet-950/60 dark:via-slate-900 dark:to-indigo-950/50 space-y-2 ${isCompactSidebar ? 'lg:p-2' : ''}`}>
              <p className={`text-xs font-bold text-slate-100 ${isCompactSidebar ? 'lg:hidden' : ''}`}>User Workspace</p>
              <p className={`text-[11px] text-slate-400 ${isCompactSidebar ? 'lg:hidden' : ''}`}>Preview tools & user flows live.</p>
              <button
                type="button"
                title="Open User Dashboard"
                onClick={() => {
                  playUiSound('click');
                  navigate('/dashboard');
                }}
                className="w-full py-2 px-3 rounded-xl btn-premium-primary text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span className={isCompactSidebar ? 'lg:hidden' : ''}>Open User Dashboard</span>
              </button>
            </div>

            <div className={`flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 ${isCompactSidebar ? 'lg:justify-center lg:px-1' : ''}`}>
              <div className={`min-w-0 ${isCompactSidebar ? 'lg:hidden' : ''}`}>
                <p className="text-xs font-semibold truncate text-slate-100">{user?.fullName}</p>
                <p className="text-[10px] text-violet-300 truncate">Super Administrator</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${isCompactSidebar ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-800 text-slate-300 hover:text-slate-100 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search anything..."
                className="w-full pl-10 pr-16 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 placeholder:text-slate-500"
              />
              <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded bg-slate-800/90 text-[10px] font-mono text-slate-400 pointer-events-none">
                Ctrl /
              </span>

              {searchFocused && (
                <div className="absolute left-0 right-0 top-11 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-2 space-y-1 z-50">
                  {filteredSearch.map(item => (
                    <button
                      key={item.href}
                      type="button"
                      onMouseDown={() => {
                        setSearchFocused(false);
                        setSearchQuery('');
                        navigate(item.href);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-violet-600/20 hover:text-slate-100 transition-colors cursor-pointer text-left"
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-[10px] text-violet-400">Open →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeSwitcher />

            <button
              type="button"
              onClick={() => navigate('/admin/announcements')}
              className="relative p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 cursor-pointer"
              title="Announcements & Alerts"
            >
              <Bell className="w-4 h-4" />
              {pendingPayments + openTickets > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center tabular-nums">
                  {pendingPayments + openTickets}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-xl btn-premium-glass text-xs cursor-pointer"
            >
              Public Site
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
