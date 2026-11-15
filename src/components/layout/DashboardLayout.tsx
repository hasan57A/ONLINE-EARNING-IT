import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import {
  LayoutDashboard,
  Wrench,
  Globe2,
  History,
  Bookmark,
  LifeBuoy,
  User,
  Shield,
  LogOut,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Smartphone,
  Users,
  Shuffle,
  Filter,
  PhoneCall,
  Mail,
  Network,
  Server,
  Layers,
  CreditCard,
  Cloud,
  Coins,
  Lock,
  Crown,
  Bell,
  Search,
  Settings,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';

const LOCKED_PATH_PREFIXES = ['/tools', '/resources', '/history', '/saved-results'];
const FREE_PATHS = [
  '/tools',
  '/tools/text-shuffler',
  '/tools/duplicate-text-remover',
  '/history',
  '/saved-results',
];

function isPathLockedForFreeUser(targetPath: string): boolean {
  if (FREE_PATHS.includes(targetPath)) return false;
  return LOCKED_PATH_PREFIXES.some(
    prefix => targetPath === prefix || targetPath.startsWith(`${prefix}/`)
  );
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useDbSync();
  const { path, navigate } = useRouter();
  const { user, isAuthenticated, isAdmin, cloudConnected, signInWithGoogle, signOut } = useAuth();
  const { showToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(path.startsWith('/tools'));
  const [resourcesExpanded, setResourcesExpanded] = useState(path.startsWith('/resources'));
  const [packagePromptFeature, setPackagePromptFeature] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const toolAccess = db.canUseTool(user?.id);
  const packages = db.getPaymentPackages();
  const announcements = db.getAnnouncements().filter(a => a.status === 'Published' || a.status === 'Sent');
  const isCompactSidebar = db.getUserPreferences().sidebarStyle === 'compact';
  const isWorkspaceUnlocked = toolAccess.isAdmin || toolAccess.hasUsablePackage;
  const isCurrentRouteLocked = !isWorkspaceUnlocked && isPathLockedForFreeUser(path);

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

  const searchItems = useMemo(
    () => [
      { label: 'Dashboard Overview', category: 'Main', href: '/dashboard' },
      { label: 'User Agent Generator', category: 'Tool', href: '/tools/user-agent-generator' },
      { label: 'Phone Number Generator', category: 'Tool', href: '/tools/number-generator' },
      { label: 'Lead Generator', category: 'Tool', href: '/tools/lead-generator' },
      { label: 'Mail Generator', category: 'Tool', href: '/tools/mail-generator' },
      { label: 'Text Shuffler', category: 'Tool', href: '/tools/text-shuffler' },
      { label: 'Duplicate Text Remover', category: 'Tool', href: '/tools/duplicate-text-remover' },
      { label: 'Resources Hub', category: 'Resources', href: '/resources' },
      { label: 'Best CPA Networks', category: 'Resources', href: '/resources/cpa-networks' },
      { label: 'Best Proxy Sites', category: 'Resources', href: '/resources/proxy-sites' },
      { label: 'Best Antidetect Browsers', category: 'Resources', href: '/resources/antidetect-browsers' },
      { label: 'Payments & Plans', category: 'Billing', href: '/payment' },
      { label: 'My Profile', category: 'Account', href: '/profile' },
      { label: 'Settings', category: 'Account', href: '/settings' },
      { label: 'Announcements & Updates', category: 'Updates', href: '/announcements' },
      { label: 'Support Center', category: 'Help', href: '/support' },
    ],
    []
  );

  const filteredSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return searchItems.slice(0, 6);
    return searchItems.filter(
      item => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [searchItems, searchQuery]);

  const openPackagePrompt = (featureLabel: string) => {
    setSidebarOpen(false);
    setPackagePromptFeature(featureLabel);
    showToast(
      toolAccess.planStatus === 'pending'
        ? `Your package payment is pending approval. "${featureLabel}" unlocks once approved.`
        : `Package required! Please take a package first to unlock ${featureLabel}.`,
      'error'
    );
  };

  const handleGuardedNavigate = (href: string, label: string) => {
    playUiSound('click');
    setSearchFocused(false);
    setSearchQuery('');
    if (!isWorkspaceUnlocked && isPathLockedForFreeUser(href)) {
      openPackagePrompt(label);
      return;
    }
    navigate(href);
    setSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-3xl oe-panel text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Authentication Required</h2>
            <p className="text-xs text-slate-400 mt-1">
              Please sign in to access your tools, saved results, and dashboard.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/signin?redirect=' + encodeURIComponent(path))}
              className="flex-1 py-2.5 text-xs rounded-xl btn-premium-primary cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="flex-1 py-2.5 text-xs rounded-xl btn-premium-glass cursor-pointer"
            >
              Create Account
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-slate-100 cursor-pointer"
          >
            ← Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const toolSubItems = [
    { label: 'User Agent Generator', href: '/tools/user-agent-generator', icon: Smartphone },
    { label: 'Lead Generator', href: '/tools/lead-generator', icon: Users },
    { label: 'Mail Generator', href: '/tools/mail-generator', icon: Mail },
    { label: 'Phone Generator', href: '/tools/number-generator', icon: PhoneCall },
    { label: 'Duplicate Remover', href: '/tools/duplicate-text-remover', icon: Filter },
    { label: 'Text Shuffler', href: '/tools/text-shuffler', icon: Shuffle },
  ];

  const resourceSubItems = [
    { label: 'Best CPA Networks', href: '/resources/cpa-networks', icon: Network },
    { label: 'Best Proxy Sites', href: '/resources/proxy-sites', icon: Server },
    { label: 'Antidetect Browsers', href: '/resources/antidetect-browsers', icon: Layers },
  ];

  const userInitial = (user?.fullName || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Left Obsidian Sidebar */}
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
              onClick={() => {
                playUiSound('click');
                navigate('/dashboard');
              }}
              title="Online Earning IT"
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
                <span className="text-[10px] text-slate-400 block leading-none">
                  Creator Workspace
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

          {/* Navigation Scroll Area */}
          <nav className={`flex-1 overflow-y-auto px-3 py-4 space-y-5 ${isCompactSidebar ? 'lg:px-2' : ''}`}>
            {/* MAIN */}
            <div className="space-y-1">
              <div className={`px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${isCompactSidebar ? 'lg:hidden' : ''}`}>
                Main
              </div>
              <button
                type="button"
                title="Dashboard"
                onClick={() => handleGuardedNavigate('/dashboard', 'Dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCompactSidebar ? 'lg:justify-center lg:px-2' : ''
                } ${
                  path === '/dashboard'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className={isCompactSidebar ? 'lg:hidden' : ''}>Dashboard</span>
              </button>

              {/* Tools Expandable */}
              <div className="space-y-1">
                <button
                  type="button"
                  title="Tools"
                  onClick={() => {
                    playUiSound('click');
                    if (isCompactSidebar && window.innerWidth >= 1024) {
                      navigate('/tools');
                    } else {
                      setToolsExpanded(prev => !prev);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCompactSidebar ? 'lg:justify-center lg:px-2' : ''
                  } ${
                    path.startsWith('/tools')
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 shrink-0" />
                    <span className={isCompactSidebar ? 'lg:hidden' : ''}>Tools</span>
                  </div>
                  <span className={isCompactSidebar ? 'lg:hidden' : ''}>
                    {toolsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {toolsExpanded && (
                  <div className={`pl-3 space-y-0.5 pt-0.5 ${isCompactSidebar ? 'lg:hidden' : ''}`}>
                    <button
                      type="button"
                      onClick={() => handleGuardedNavigate('/tools', 'All Tools')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        path === '/tools'
                          ? 'text-violet-300 bg-violet-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span>All Tools Directory</span>
                    </button>
                    {toolSubItems.map(sub => {
                      const SubIcon = sub.icon;
                      const isSubActive = path === sub.href;
                      const locked = !isWorkspaceUnlocked && isPathLockedForFreeUser(sub.href);
                      return (
                        <button
                          key={sub.href}
                          type="button"
                          onClick={() => handleGuardedNavigate(sub.href, sub.label)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                            isSubActive
                              ? 'text-slate-100 bg-violet-500/15 border border-violet-500/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-violet-300' : 'text-slate-500'}`} />
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {locked && <Lock className="w-3 h-3 text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Resources Expandable */}
              <div className="space-y-1">
                <button
                  type="button"
                  title="Resources Hub"
                  onClick={() => {
                    playUiSound('click');
                    if (isCompactSidebar && window.innerWidth >= 1024) {
                      navigate('/resources');
                    } else {
                      setResourcesExpanded(prev => !prev);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCompactSidebar ? 'lg:justify-center lg:px-2' : ''
                  } ${
                    path.startsWith('/resources')
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Globe2 className="w-4 h-4 shrink-0" />
                    <span className={isCompactSidebar ? 'lg:hidden' : ''}>Resources Hub</span>
                  </div>
                  <span className={isCompactSidebar ? 'lg:hidden' : ''}>
                    {resourcesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {resourcesExpanded && (
                  <div className={`pl-3 space-y-0.5 pt-0.5 ${isCompactSidebar ? 'lg:hidden' : ''}`}>
                    {resourceSubItems.map(sub => {
                      const SubIcon = sub.icon;
                      const isSubActive = path === sub.href;
                      const locked = !isWorkspaceUnlocked && isPathLockedForFreeUser(sub.href);
                      return (
                        <button
                          key={sub.href}
                          type="button"
                          onClick={() => handleGuardedNavigate(sub.href, sub.label)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                            isSubActive
                              ? 'text-slate-100 bg-violet-500/15 border border-violet-500/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <SubIcon className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {locked && <Lock className="w-3 h-3 text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* WORKSPACE & BILLING */}
            <div className="space-y-1">
              <div className={`px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${isCompactSidebar ? 'lg:hidden' : ''}`}>
                Workspace
              </div>
              {[
                { label: 'Usage History', href: '/history', icon: History },
                { label: 'Saved Results', href: '/saved-results', icon: Bookmark },
                { label: 'Payments & Plans', href: '/payment', icon: CreditCard },
                { label: 'Updates & News', href: '/announcements', icon: Megaphone },
              ].map(item => {
                const Icon = item.icon;
                const active = path === item.href;
                return (
                  <button
                    key={item.href}
                    type="button"
                    title={item.label}
                    onClick={() => handleGuardedNavigate(item.href, item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCompactSidebar ? 'lg:justify-center lg:px-2' : ''
                    } ${
                      active
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className={isCompactSidebar ? 'lg:hidden' : ''}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ACCOUNT */}
            <div className="space-y-1">
              <div className={`px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${isCompactSidebar ? 'lg:hidden' : ''}`}>
                Account
              </div>
              {[
                { label: 'My Profile', href: '/profile', icon: User },
                { label: 'Settings', href: '/settings', icon: Settings },
                { label: 'Support Center', href: '/support', icon: LifeBuoy },
              ].map(item => {
                const Icon = item.icon;
                const active = path === item.href;
                return (
                  <button
                    key={item.href}
                    type="button"
                    title={item.label}
                    onClick={() => handleGuardedNavigate(item.href, item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCompactSidebar ? 'lg:justify-center lg:px-2' : ''
                    } ${
                      active
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className={isCompactSidebar ? 'lg:hidden' : ''}>{item.label}</span>
                  </button>
                );
              })}

              {isAdmin && (
                <button
                  type="button"
                  title="Open Admin Panel"
                  onClick={() => {
                    playUiSound('click');
                    navigate('/admin');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer mt-1 ${
                    isCompactSidebar ? 'lg:justify-center lg:px-2' : ''
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className={isCompactSidebar ? 'lg:hidden' : ''}>Open Admin Panel</span>
                </button>
              )}
            </div>
          </nav>

          {/* Bottom Upgrade Card & User Mini Strip */}
          <div className={`p-3 border-t border-slate-800/80 space-y-2.5 shrink-0 ${isCompactSidebar ? 'lg:px-2' : ''}`}>
            <div className={`p-3.5 rounded-2xl border border-violet-500/30 bg-violet-500/10 dark:bg-gradient-to-br dark:from-violet-950/70 dark:via-slate-900 dark:to-indigo-950/60 text-center space-y-2.5 ${isCompactSidebar ? 'lg:p-2' : ''}`}>
              <button
                type="button"
                title={toolAccess.hasUsablePackage ? 'Add Credits' : 'Upgrade to Premium'}
                onClick={() => {
                  playUiSound('click');
                  navigate('/payment');
                  setSidebarOpen(false);
                }}
                className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
              </button>
              <div className={isCompactSidebar ? 'lg:hidden' : ''}>
                <p className="text-xs font-bold text-slate-100">
                  {toolAccess.isAdmin
                    ? 'Admin Unlimited'
                    : toolAccess.hasUsablePackage
                    ? toolAccess.planName || 'Active Plan'
                    : 'Upgrade to Premium'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                  {toolAccess.isAdmin
                    ? 'All tools & pools unlocked'
                    : `${toolAccess.remainingCredits.toLocaleString()} Credits available`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playUiSound('click');
                  navigate('/payment');
                  setSidebarOpen(false);
                }}
                className={`w-full py-2 px-3 rounded-xl btn-premium-vivid text-[11px] flex items-center justify-center gap-1.5 cursor-pointer ${
                  isCompactSidebar ? 'lg:hidden' : ''
                }`}
              >
                <span>{toolAccess.hasUsablePackage ? 'Add Credits' : 'Upgrade Now'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className={`flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800/80 ${isCompactSidebar ? 'lg:flex-col lg:gap-1.5 lg:px-1' : ''}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <div className={`min-w-0 ${isCompactSidebar ? 'lg:hidden' : ''}`}>
                  <p className="text-[11px] font-semibold text-slate-100 truncate">{user?.fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role || 'Member'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${isCompactSidebar ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-800 text-slate-300 hover:text-slate-100 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Center/Left Command Search */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tools, pages..."
                className="w-full pl-10 pr-16 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 placeholder:text-slate-500"
              />
              <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded bg-slate-800/90 text-[10px] font-mono text-slate-400 pointer-events-none">
                Ctrl /
              </span>

              {searchFocused && (
                <div className="absolute left-0 right-0 top-11 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-2 space-y-1 z-50">
                  {filteredSearch.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-500">No matching tools or pages.</p>
                  ) : (
                    filteredSearch.map(item => (
                      <button
                        key={item.href}
                        type="button"
                        onMouseDown={() => handleGuardedNavigate(item.href, item.label)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-violet-600/20 hover:text-slate-100 transition-colors cursor-pointer text-left"
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="text-[10px] text-slate-400">{item.category}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live Credits Chip */}
            <button
              type="button"
              onClick={() => navigate('/payment')}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-xs font-semibold text-violet-200 transition-colors cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="tabular-nums font-mono">
                {toolAccess.isAdmin ? 'Unlimited' : `${toolAccess.remainingCredits.toLocaleString()} Cr`}
              </span>
            </button>

            {cloudConnected ? (
              <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-medium">
                <Cloud className="w-3.5 h-3.5" />
                <span>Supabase Synced</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:border-violet-500/40 text-slate-300 text-[11px] font-medium cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-violet-400" />
                <span>Supabase Sync</span>
              </button>
            )}

            <ThemeSwitcher />

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  playUiSound('click');
                  setNotifOpen(prev => !prev);
                  setProfileMenuOpen(false);
                }}
                className="relative p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 hover:border-violet-500/40 transition-colors cursor-pointer"
                title="Announcements & Notifications"
              >
                <Bell className="w-4 h-4" />
                {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-[9px] font-bold text-white flex items-center justify-center tabular-nums">
                    {announcements.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-3 space-y-2.5 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-100">Announcements</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/announcements');
                      }}
                      className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {announcements.slice(0, 4).map(a => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate('/announcements');
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-violet-600/15 border border-slate-800/80 transition-colors cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-100 truncate">{a.title}</span>
                          <span className="text-[10px] text-violet-400 shrink-0">{a.type}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{a.message}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(prev => !prev);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-xl border border-slate-800 bg-slate-900 hover:border-violet-500/40 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 text-white text-xs font-bold flex items-center justify-center">
                  {userInitial}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-100 max-w-[110px] truncate">
                  {user?.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-2 space-y-1 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-violet-600/20 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-violet-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-violet-600/20 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('/payment');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-violet-600/20 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>Payments & Plans</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      signOut();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isCurrentRouteLocked ? (
            <div className="max-w-3xl mx-auto my-6 p-6 sm:p-8 rounded-3xl oe-panel space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                    {toolAccess.planStatus === 'pending' ? (
                      <Clock className="w-6 h-6 text-amber-400" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-100">
                      {toolAccess.planStatus === 'pending'
                        ? 'Package Payment Pending Approval'
                        : 'Package Required to Unlock Pro Tools'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {toolAccess.reason ||
                        'Please purchase and activate a credit package to unlock generator tools and resources.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages.map(pkg => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-2"
                  >
                    <p className="text-xs font-bold text-slate-100">{pkg.name}</p>
                    <p className="text-lg font-extrabold text-violet-300 font-mono tabular-nums">
                      ৳{pkg.priceBdt.toLocaleString()} <span className="text-xs text-slate-500">/ ${pkg.priceUsdt}</span>
                    </p>
                    <p className="text-[11px] font-mono text-emerald-400 font-semibold">
                      {pkg.credits.toLocaleString()} Credits
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/payment')}
                  className="btn-premium-vivid px-6 py-3 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Select & Activate Package</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-premium-glass px-4 py-3 rounded-xl text-xs cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Package Upgrade Prompt Modal */}
      {packagePromptFeature && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-3xl oe-panel space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Unlock {packagePromptFeature}</h3>
                  <p className="text-[11px] text-slate-400">Active package credits required</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPackagePromptFeature(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {toolAccess.reason || 'Activate any credit package via bKash, Nagad, Rocket, or Binance to unlock full tool access.'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPackagePromptFeature(null)}
                className="px-4 py-2 rounded-xl btn-premium-glass text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setPackagePromptFeature(null);
                  navigate('/payment');
                }}
                className="px-5 py-2 rounded-xl btn-premium-primary text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>View Packages</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
