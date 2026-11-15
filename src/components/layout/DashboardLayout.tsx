import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
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
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { TOOL_REALISTIC_IMAGES } from '../ui/RealisticIcon';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';

const LOCKED_PATH_PREFIXES = ['/tools', '/resources', '/history', '/saved-results'];

function isPathLockedForFreeUser(targetPath: string): boolean {
  return LOCKED_PATH_PREFIXES.some(
    prefix => targetPath === prefix || targetPath.startsWith(`${prefix}/`)
  );
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useDbSync();
  const { path, navigate } = useRouter();
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(path.startsWith('/tools'));
  const [resourcesExpanded, setResourcesExpanded] = useState(path.startsWith('/resources'));
  const [packagePromptFeature, setPackagePromptFeature] = useState<string | null>(null);

  const toolAccess = db.canUseTool(user?.id);
  const packages = db.getPaymentPackages();
  const isWorkspaceUnlocked = toolAccess.isAdmin || toolAccess.hasUsablePackage;
  const isCurrentRouteLocked = !isWorkspaceUnlocked && isPathLockedForFreeUser(path);

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

  const packageCreditTotal = toolAccess.packageCredits ?? toolAccess.remainingCredits;
  const creditProgressPercent =
    packageCreditTotal > 0
      ? Math.min(100, Math.max(0, Math.round((toolAccess.remainingCredits / packageCreditTotal) * 100)))
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Package Required Click Modal */}
      {packagePromptFeature && (
        <div
          onClick={() => setPackagePromptFeature(null)}
          className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="max-w-3xl w-full rounded-3xl border border-rose-500/40 bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                  {toolAccess.planStatus === 'pending' ? (
                    <Clock className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Package Required
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-1.5">
                    {toolAccess.planStatus === 'pending'
                      ? 'Payment Pending Admin Approval'
                      : `Take a Package to Unlock ${packagePromptFeature}`}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {toolAccess.planStatus === 'pending'
                      ? `Your payment for ${toolAccess.planName || 'your package'}${
                          toolAccess.packageCredits ? ` (${toolAccess.packageCredits.toLocaleString()} Credits)` : ''
                        } is waiting for Admin approval. Tools and resources remain locked until approved.`
                      : 'Nothing works without an active package and credits. Select a credit package below to activate your account immediately after payment verification.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPackagePromptFeature(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {packages.map((pkg, idx) => (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 ${
                    idx === 1
                      ? 'border-blue-500/60 bg-blue-950/30'
                      : 'border-slate-800 bg-slate-950/70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase text-blue-400">
                        {pkg.durationLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Coins className="w-3 h-3" />
                        <span>{pkg.credits.toLocaleString()} Credits</span>
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-white">{pkg.name}</h4>
                    <div className="flex items-baseline justify-between font-mono pt-1">
                      <span className="text-xl font-black text-white">৳{pkg.priceBdt.toLocaleString()}</span>
                      <span className="text-xs font-bold text-amber-400">${pkg.priceUsdt} USDT</span>
                    </div>
                    <ul className="space-y-1 pt-2 border-t border-slate-800/80">
                      {pkg.features.map(f => (
                        <li key={f} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPackagePromptFeature(null);
                      navigate(`/payment?pkg=${pkg.id}`);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      idx === 1
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-800 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <span>Take Package ({pkg.credits.toLocaleString()} Cr)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Pay via bKash, Nagad, Rocket, or Binance Pay / USDT.
              </span>
              <button
                type="button"
                onClick={() => {
                  setPackagePromptFeature(null);
                  navigate('/payment');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Go to Packages & Payment</span>
              </button>
            </div>
          </div>
        </div>
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
              const isItemLocked = !isWorkspaceUnlocked && isPathLockedForFreeUser(item.href);

              if (item.hasSubmenu) {
                return (
                  <div key={item.label} className="space-y-0.5">
                    <button
                      onClick={() => {
                        if (isItemLocked) {
                          item.setExpanded(!item.expanded);
                          openPackagePrompt(item.label);
                          return;
                        }
                        item.setExpanded(!item.expanded);
                        if (path !== item.href && !path.startsWith(item.href)) {
                          navigate(item.href);
                          setSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400'
                          : isItemLocked
                          ? 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isItemLocked && <Lock className="w-3 h-3 text-rose-400" />}
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            item.expanded ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
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
                                if (!isWorkspaceUnlocked && isPathLockedForFreeUser(sub.href)) {
                                  openPackagePrompt(sub.label);
                                  return;
                                }
                                navigate(sub.href);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] rounded-lg transition-all text-left cursor-pointer ${
                                isSubActive
                                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                  : isItemLocked
                                  ? 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-300'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
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
                              </div>
                              {isItemLocked && <Lock className="w-3 h-3 text-rose-400 shrink-0" />}
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
                    if (isItemLocked) {
                      openPackagePrompt(item.label);
                      return;
                    }
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : isItemLocked
                      ? 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isItemLocked && <Lock className="w-3 h-3 text-rose-400 shrink-0" />}
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Admin Console</span>
                </button>
              </div>
            )}
          </nav>

          {/* Bottom Package Status & User Card */}
          <div className="mt-auto p-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            {/* Package & Credit Visibility Card */}
            <div
              onClick={() => {
                navigate('/payment');
                setSidebarOpen(false);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-colors space-y-2 ${
                toolAccess.isAdmin
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : toolAccess.hasUsablePackage
                  ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15'
                  : toolAccess.planStatus === 'pending'
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/15'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {toolAccess.isAdmin ? 'Admin Plan' : 'Active Package'}
                </span>
                {toolAccess.isAdmin ? (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                ) : toolAccess.hasUsablePackage ? (
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>

              {toolAccess.isAdmin ? (
                <div>
                  <p className="text-xs font-bold text-white">Admin Unlimited</p>
                  <p className="text-[10px] font-mono text-emerald-400">Unlimited Credits · All Unlocked</p>
                </div>
              ) : toolAccess.hasUsablePackage ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-white truncate">
                      {toolAccess.planName || 'Active Package'}
                    </p>
                    <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">
                      {packageCreditTotal.toLocaleString()} Cr Pack
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-950/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all"
                      style={{ width: `${creditProgressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-slate-300 tabular-nums">
                    <strong className="text-white">{toolAccess.remainingCredits.toLocaleString()}</strong> /{' '}
                    {packageCreditTotal.toLocaleString()} Credits Remaining
                  </p>
                </div>
              ) : toolAccess.planStatus === 'pending' ? (
                <div>
                  <p className="text-xs font-bold text-amber-300 truncate">
                    {toolAccess.planName || 'Package'} · Pending
                  </p>
                  <p className="text-[10px] font-mono text-amber-200/80">
                    {toolAccess.packageCredits
                      ? `${toolAccess.packageCredits.toLocaleString()} Cr Pack · Awaiting Approval`
                      : 'Awaiting Admin Approval'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-rose-300">No Package · 0 Credits</p>
                  <p className="text-[10px] text-rose-200/80">Click here to take a package →</p>
                </div>
              )}
            </div>

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
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
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
            <button
              onClick={() => navigate('/payment')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                toolAccess.isAdmin
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : toolAccess.hasUsablePackage
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
              }`}
              title="View Package & Credit Balance"
            >
              {toolAccess.isAdmin || toolAccess.hasUsablePackage ? (
                <Coins className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span className="font-mono tabular-nums">
                {toolAccess.isAdmin
                  ? 'Admin Unlimited'
                  : toolAccess.hasUsablePackage
                  ? `${toolAccess.planName || 'Plan'} (${packageCreditTotal.toLocaleString()} Cr) · ${toolAccess.remainingCredits.toLocaleString()} Left`
                  : toolAccess.planStatus === 'pending'
                  ? `Pending (${toolAccess.packageCredits ? `${toolAccess.packageCredits.toLocaleString()} Cr` : 'Review'})`
                  : 'No Package · Take Package'}
              </span>
            </button>
            <ThemeSwitcher />
            <button
              onClick={() => navigate('/')}
              className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors hidden sm:inline cursor-pointer"
            >
              Homepage
            </button>
          </div>
        </header>

        {/* Content Body (Full Package Lock Gate on locked routes for unpaid/zero-credit users) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isCurrentRouteLocked ? (
            <div className="max-w-5xl mx-auto py-6 space-y-7">
              <div className="p-6 sm:p-8 rounded-3xl border border-rose-500/40 bg-gradient-to-br from-rose-950/60 via-slate-900/95 to-slate-950 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                      {toolAccess.planStatus === 'pending' ? (
                        <Clock className="w-6 h-6 text-amber-400" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        {toolAccess.planStatus === 'pending'
                          ? 'Verification Pending'
                          : 'Package Required · Account Locked'}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {toolAccess.planStatus === 'pending'
                          ? 'Your Package Payment is Under Review'
                          : toolAccess.hasActivePackage && toolAccess.remainingCredits === 0
                          ? '0 Credits Left — Take a Package to Continue'
                          : 'Please Take a Package First to Use Any Tool'}
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        {toolAccess.reason ||
                          'Tools, Resources, Usage History, and Saved Results stay completely locked until you take a package with credits.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/payment')}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer shrink-0"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{toolAccess.planStatus === 'pending' ? 'Check Payment Status' : 'Take a Package Now'}</span>
                  </button>
                </div>
              </div>

              {/* Package Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {packages.map((pkg, idx) => (
                  <div
                    key={pkg.id}
                    className={`p-6 rounded-3xl border flex flex-col justify-between space-y-5 shadow-xl ${
                      idx === 1
                        ? 'border-blue-500/60 bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950'
                        : 'border-slate-800 bg-slate-900/80'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          {pkg.durationLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-extrabold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{pkg.credits.toLocaleString()} Credits</span>
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-white">{pkg.name}</h2>
                      <p className="text-xs text-slate-400 leading-relaxed">{pkg.description}</p>
                      <div className="flex items-baseline justify-between font-mono pt-2 border-t border-slate-800">
                        <span className="text-2xl font-black text-white">৳{pkg.priceBdt.toLocaleString()} BDT</span>
                        <span className="text-sm font-bold text-amber-400">${pkg.priceUsdt} USDT</span>
                      </div>
                      <ul className="space-y-2 pt-2">
                        {pkg.features.map(f => (
                          <li key={f} className="text-xs text-slate-300 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/payment?pkg=${pkg.id}`)}
                      className={`w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        idx === 1
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25'
                          : 'bg-slate-800 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <span>Select {pkg.name} ({pkg.credits.toLocaleString()} Credits)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
