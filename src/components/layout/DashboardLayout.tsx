import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';
import { TOOL_REALISTIC_IMAGES } from '../ui/RealisticIcon';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path, navigate } = useRouter();
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(path.startsWith('/tools'));
  const [resourcesExpanded, setResourcesExpanded] = useState(path.startsWith('/resources'));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-2xl border border-slate-800 bg-slate-900/90 text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Authentication Required</h2>
            <p className="text-xs text-slate-400 mt-1">Please sign in to access your tools and dashboard.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/signin?redirect=' + encodeURIComponent(path))}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
            >
              Create Account
            </button>
          </div>
          <button onClick={() => navigate('/')} className="text-xs text-slate-500 hover:text-slate-300">
            ← Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      label: 'Tools & Utilities',
      href: '/tools',
      icon: Wrench,
      hasSubmenu: true,
      expanded: toolsExpanded,
      setExpanded: setToolsExpanded,
      subItems: [
        { label: 'User Agent Generator', href: '/tools/user-agent-generator', icon: Smartphone },
        { label: 'Lead Generator', href: '/tools/lead-generator', icon: Users },
        { label: 'Text Shuffler', href: '/tools/text-shuffler', icon: Shuffle },
        { label: 'Duplicate Text Remover', href: '/tools/duplicate-text-remover', icon: Filter },
        { label: 'Number Generator', href: '/tools/number-generator', icon: PhoneCall },
        { label: 'Mail Generator', href: '/tools/mail-generator', icon: Mail },
      ],
    },
    {
      label: 'Resources Hub',
      href: '/resources',
      icon: Globe2,
      hasSubmenu: true,
      expanded: resourcesExpanded,
      setExpanded: setResourcesExpanded,
      subItems: [
        { label: 'Best CPA Networks', href: '/resources/cpa-networks', icon: Network },
        { label: 'Best Proxy Sites', href: '/resources/proxy-sites', icon: Server },
        { label: 'Best Antidetect Browsers', href: '/resources/antidetect-browsers', icon: Layers },
      ],
    },
    { label: 'Usage History', href: '/history', icon: History },
    { label: 'Saved Results', href: '/saved-results', icon: Bookmark },
    { label: 'Payments & Plans', href: '/payment', icon: CreditCard },
    { label: 'Support Tickets', href: '/support', icon: LifeBuoy },
    { label: 'My Profile', href: '/profile', icon: User },
  ];

  const getBreadcrumbs = () => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return ['Home'];
    return parts.map(p =>
      p
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo Zone */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div
              onClick={() => {
                navigate('/');
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <img
                src="/assets/aistudio/Online_Earning_IT_Logo__e2215d9f_e2215d9f.png"
                alt="ONLINE EARNING IT"
                className="w-8 h-8 rounded-lg object-contain"
              />
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase leading-tight">
                ONLINE EARNING <span className="text-blue-500">IT</span>
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = path === item.href || (item.subItems && path.startsWith(item.href));

              if (item.hasSubmenu) {
                return (
                  <div key={item.label} className="space-y-0.5">
                    <button
                      onClick={() => {
                        item.setExpanded(!item.expanded);
                        if (path !== item.href && !path.startsWith(item.href)) {
                          navigate(item.href);
                          setSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          item.expanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {item.expanded && (
                      <div className="pl-6 pr-1 py-1 space-y-0.5">
                        {item.subItems?.map(sub => {
                          const SubIcon = sub.icon;
                          const isSubActive = path === sub.href;
                          const toolSlug = sub.href.startsWith('/tools/') ? sub.href.replace('/tools/', '') : '';
                          const realisticThumb = TOOL_REALISTIC_IMAGES[toolSlug];

                          return (
                            <button
                              key={sub.label}
                              onClick={() => {
                                navigate(sub.href);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[11px] rounded-lg transition-all text-left ${
                                isSubActive
                                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                              }`}
                            >
                              {realisticThumb ? (
                                <img
                                  src={realisticThumb}
                                  alt={sub.label}
                                  className="w-4 h-4 rounded-md object-cover shrink-0 border border-slate-700/50 shadow-xs"
                                />
                              ) : (
                                <SubIcon className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span className="truncate">{sub.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isAdmin && (
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    navigate('/admin');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Admin Console</span>
                </button>
              </div>
            )}
          </nav>

          {/* Bottom User Card */}
          <div className="mt-auto p-3 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-slate-900 dark:text-white leading-tight">
                    {user?.fullName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.gmail}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              {getBreadcrumbs().map((crumb, idx, arr) => (
                <React.Fragment key={crumb}>
                  <span className={idx === arr.length - 1 ? 'font-semibold text-slate-900 dark:text-slate-100' : ''}>
                    {crumb}
                  </span>
                  {idx < arr.length - 1 && <span className="opacity-40">/</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <button
              onClick={() => navigate('/')}
              className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors hidden sm:inline"
            >
              Homepage
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
