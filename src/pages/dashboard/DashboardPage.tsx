import React, { useMemo } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Wrench,
  Activity,
  Bookmark,
  ArrowRight,
  Clock,
  Copy,
  Download,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  CreditCard,
  Coins,
  Lock,
} from 'lucide-react';
import { RealisticToolIcon, TOOL_REALISTIC_IMAGES } from '../../components/ui/RealisticIcon';
import { motion } from 'motion/react';
import { CountUp, TiltCard } from '../../components/motion/kit';
import { useDbSync } from '../../hooks/useDbSync';

export const DashboardPage: React.FC = () => {
  useDbSync();
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const currentUserRecord = user ? db.getUserById(user.id) || user : null;
  const toolAccess = db.canUseTool(user?.id);
  const isWorkspaceUnlocked = toolAccess.isAdmin || toolAccess.hasUsablePackage;
  const packageCreditTotal = toolAccess.packageCredits ?? toolAccess.remainingCredits;

  const tools = db.getTools();
  const FREE_SLUGS = ['text-shuffler', 'duplicate-text-remover'];
  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Good night';
  const firstName = (currentUserRecord?.fullName || user?.fullName || 'Member').split(' ')[0];
  const history = db.getUsageHistory(user?.id);
  const savedResults = db.getSavedResults(user?.id || '');

  const totalToolsAvailable = tools.filter(t => t.enabled).length;
  const totalToolsUsed = history.length;
  const totalSavedResults = savedResults.length;

  const FREE_TARGETS = ['/tools', '/tools/text-shuffler', '/tools/duplicate-text-remover', '/history', '/saved-results'];
  const handleLockedNavigation = (featureName: string, targetPath: string) => {
    playUiSound('click');
    if (!isWorkspaceUnlocked && !FREE_TARGETS.includes(targetPath)) {
      showToast(
        toolAccess.planStatus === 'pending'
          ? `Your package payment is pending admin approval. "${featureName}" unlocks once approved.`
          : `Please take a package first to unlock ${featureName}!`,
        'error'
      );
      navigate('/payment');
      return;
    }
    navigate(targetPath);
  };

  const sevenDayChartData = useMemo(() => {
    const days: Array<{ label: string; count: number; dateStr: string }> = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dayCount = history.filter(h => h.date === dateStr).length;
      days.push({ label: dayLabel, count: dayCount, dateStr });
    }
    return days;
  }, [history]);

  const maxChartCount = Math.max(1, ...sevenDayChartData.map(d => d.count));

  const copyToClipboard = (text: string) => {
    if (!isWorkspaceUnlocked) {
      showToast('Please take a package first to copy saved results!', 'error');
      navigate('/payment');
      return;
    }
    navigator.clipboard.writeText(text);
    playUiSound('copy');
    showToast('Copied saved results to clipboard!', 'success');
  };

  const downloadText = (filename: string, text: string) => {
    if (!isWorkspaceUnlocked) {
      showToast('Please take a package first to download saved results!', 'error');
      navigate('/payment');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    playUiSound('click');
    showToast('Downloaded text file successfully.', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="oe-panel oe-rgb-violet p-6 sm:p-10 rounded-3xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-8 items-center"
      >
        <div className="absolute -right-10 -top-24 w-[28rem] h-[28rem] bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-3.5 py-1 rounded-full backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Authenticated Workspace · Session Active</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-[1.1]">
            {greeting},{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-200">
              {firstName}
            </span>{' '}
            <Sparkles className="w-6 h-6 text-amber-300 hidden sm:inline -translate-y-1" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ready to generate high-performance user agents, extract fresh test leads, or normalize bulk copy? Select any tool below to begin.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/payment')}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                toolAccess.isAdmin
                  ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-400/30 text-emerald-200'
                  : toolAccess.hasUsablePackage
                  ? 'bg-violet-600/25 hover:bg-violet-600/35 border-violet-400/40 text-violet-100'
                  : 'bg-rose-600/25 hover:bg-rose-600/35 border-rose-400/40 text-rose-200'
              }`}
            >
              {isWorkspaceUnlocked ? (
                <Coins className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-rose-300" />
              )}
              <span>
                {toolAccess.isAdmin
                  ? 'Admin Unlimited Access · All Tools Unlocked'
                  : toolAccess.hasUsablePackage
                  ? `${toolAccess.planName || 'Active Package'} (${packageCreditTotal.toLocaleString()} Cr Pack) · ${toolAccess.remainingCredits.toLocaleString()} Credits Left`
                  : currentUserRecord?.planStatus === 'pending'
                  ? `Payment Pending (${toolAccess.planName || 'Package'}${
                      toolAccess.packageCredits ? ` · ${toolAccess.packageCredits.toLocaleString()} Cr` : ''
                    }) · Tools Locked`
                  : 'Package Required · Click Here to Take a Package'}
              </span>
            </button>

            {!toolAccess.isAdmin && toolAccess.hasUsablePackage && (
              <button
                onClick={() => navigate('/payment')}
                className="btn-premium-vivid px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Top Up Credits</span>
              </button>
            )}
          </div>
        </div>

        {/* Real 3D tool showcase */}
        <div className="relative z-10 hidden lg:block h-64">
          {[
            { slug: 'text-shuffler', cls: 'left-2 top-0', delay: 0 },
            { slug: 'duplicate-text-remover', cls: 'right-6 top-6', delay: 0.6 },
            { slug: 'user-agent-generator', cls: 'left-24 top-28', delay: 1.1 },
            { slug: 'mail-generator', cls: 'right-0 bottom-0', delay: 0.3 },
          ].map(it => (
            <motion.div
              key={it.slug}
              className={`absolute ${it.cls}`}
              initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -12, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 0.3 + it.delay * 0.3 },
                scale: { type: 'spring', stiffness: 150, damping: 13, delay: 0.3 + it.delay * 0.3 },
                rotate: { duration: 0.8, delay: 0.3 + it.delay * 0.3 },
                y: { duration: 6 + it.delay * 2, repeat: Infinity, ease: 'easeInOut', delay: it.delay },
              }}
            >
              <RealisticToolIcon slug={it.slug} size="xl" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Locked Account Alert Bar */}
      {!isWorkspaceUnlocked && (
        <div className="oe-panel oe-rgb-rose p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              {toolAccess.planStatus === 'pending' ? <Clock className="w-5 h-5 text-amber-400" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">
                {toolAccess.planStatus === 'pending'
                  ? 'Package Approval Pending — Features Remain Locked'
                  : 'No Active Package — Please Take a Package First'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {toolAccess.planStatus === 'pending'
                  ? 'Nothing works until Admin approves your pending package payment.'
                  : 'All 6 tools, Resources, Usage History, and Saved Results stay locked until you take a package with credits.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/payment')}
            className="btn-premium-vivid px-5 py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4" />
            <span>{toolAccess.planStatus === 'pending' ? 'View Payment Status' : 'Take a Package Now'}</span>
          </button>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate('/payment')}
          className={`oe-panel oe-panel-hover p-6 rounded-3xl flex items-center gap-4 group cursor-pointer ${
            isWorkspaceUnlocked ? 'oe-rgb-amber' : 'oe-rgb-rose'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md ${
              isWorkspaceUnlocked
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}
          >
            {isWorkspaceUnlocked ? <Coins className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Package Credits</p>
            <p className="text-3xl font-black text-slate-100 font-mono tabular-nums mt-0.5 truncate">
              {toolAccess.isAdmin ? 'Unlimited' : toolAccess.remainingCredits.toLocaleString()}
            </p>
            <p className="text-[11px] font-semibold text-amber-400 truncate mt-0.5">
              {toolAccess.isAdmin
                ? 'Admin Unlimited'
                : toolAccess.hasUsablePackage
                ? `${toolAccess.planName || 'Plan'} (${packageCreditTotal.toLocaleString()} Cr Pack)`
                : toolAccess.planStatus === 'pending'
                ? 'Approval Pending'
                : 'No Package · Click to Take'}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="oe-panel oe-panel-hover oe-rgb-violet p-6 rounded-3xl flex items-center gap-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tools Available</p>
            <p className="text-3xl font-black text-slate-100 font-mono tabular-nums mt-0.5">
              <CountUp value={String(totalToolsAvailable)} />
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="oe-panel oe-panel-hover oe-rgb-emerald p-6 rounded-3xl flex items-center gap-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tools Used</p>
            <p className="text-3xl font-black text-slate-100 font-mono tabular-nums mt-0.5">
              <CountUp value={String(totalToolsUsed)} />
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="oe-panel oe-panel-hover oe-rgb-cyan p-6 rounded-3xl flex items-center gap-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Saved Results</p>
            <p className="text-3xl font-black text-slate-100 font-mono tabular-nums mt-0.5">
              <CountUp value={String(totalSavedResults)} />
            </p>
          </div>
        </motion.div>
      </div>

      {/* Middle Split: 7-Day Usage Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Usage Chart */}
        <div className="lg:col-span-7 oe-panel p-7 rounded-3xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">7-Day Tool Usage Activity</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Real-time daily tool execution metrics</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {history.length} Events
            </span>
          </div>

          <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800/80">
            {sevenDayChartData.map((d, idx) => {
              const heightPercent = Math.max(12, Math.round((d.count / maxChartCount) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 px-2.5 py-1 rounded-lg bg-slate-900 text-[10px] text-slate-100 font-mono pointer-events-none whitespace-nowrap z-20 border border-slate-700 shadow-lg">
                    {d.count} runs on {d.dateStr}
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-950 rounded-t-xl h-40 flex items-end justify-center p-1 border border-slate-800">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                      className={`w-full rounded-lg transition-colors ${
                        d.count > 0
                          ? 'bg-gradient-to-t from-violet-600 via-indigo-500 to-cyan-400'
                          : 'bg-slate-800'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 font-mono">{d.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Telemetry updated live</span>
            <button
              onClick={() => handleLockedNavigation('Usage History', '/history')}
              className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              {!isWorkspaceUnlocked && <Lock className="w-3 h-3 text-rose-400" />}
              <span>View Usage Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-5 oe-panel p-7 rounded-3xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Recent Activity</h2>
            <button
              onClick={() => handleLockedNavigation('Usage History', '/history')}
              className="text-xs text-violet-400 hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
            >
              {!isWorkspaceUnlocked && <Lock className="w-3 h-3 text-rose-400" />}
              <span>View All</span>
            </button>
          </div>

          {history.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-30 text-violet-400" />
              <p className="font-semibold text-slate-300">No activity yet</p>
              <p className="text-slate-500">Run any tool to record your first execution log.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-60 pr-1">
              {history.slice(0, 5).map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/70 flex items-center justify-between gap-3 text-xs hover:border-violet-500/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-100 truncate">{item.toolName}</p>
                    <p className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                      {item.date} · {item.time} · {item.resultCount} items
                    </p>
                  </div>
                  <span className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Success</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-500">
              Private user activity tracked with real-time pool consumption.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Tools */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Quick Access Tools</h2>
            <p className="text-xs text-slate-400">
              {isWorkspaceUnlocked
                ? 'Fast one-click access to all available utilities'
                : 'Text Shuffler & Duplicate Remover are free — generators unlock with a package'}
            </p>
          </div>
          <button
            onClick={() => handleLockedNavigation('All Tools', '/tools')}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
          >
            {!isWorkspaceUnlocked && <Lock className="w-3 h-3 text-rose-400" />}
            <span>All 6 Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool, i) => {
            const isFree = FREE_SLUGS.includes(tool.slug);
            const open = isFree || isWorkspaceUnlocked;
            return (
              <TiltCard
                key={tool.id}
                max={7}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleLockedNavigation(tool.name, `/tools/${tool.slug}`)}
                className={`oe-panel oe-panel-hover relative overflow-hidden p-6 rounded-3xl cursor-pointer flex flex-col justify-between gap-5 group ${
                  isFree ? 'oe-rgb-emerald' : open ? 'oe-rgb-violet' : 'oe-rgb-amber'
                }`}
              >
                {TOOL_REALISTIC_IMAGES[tool.slug] && (
                  <img
                    src={TOOL_REALISTIC_IMAGES[tool.slug]}
                    alt=""
                    aria-hidden="true"
                    className="absolute -right-8 -bottom-8 w-40 h-40 object-cover rounded-full opacity-[0.14] group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 pointer-events-none blur-[1px]"
                  />
                )}
                <div className="relative flex items-start justify-between">
                  <RealisticToolIcon slug={tool.slug} size="lg" />
                  {isFree ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                      100% FREE
                    </span>
                  ) : open ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      <span>Package</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">{tool.description}</p>
                </div>
                <div
                  className={`relative flex items-center justify-between text-xs font-bold ${
                    isFree ? 'text-emerald-300' : open ? 'text-violet-300' : 'text-amber-300'
                  }`}
                >
                  <span>{isFree ? 'Use for Free' : open ? 'Launch Tool' : 'Take Package to Unlock'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* Recent Saved Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Recent Saved Results</h2>
            <p className="text-xs text-slate-400">Exports and generator outputs pinned for quick retrieval</p>
          </div>
          <button
            onClick={() => handleLockedNavigation('Saved Results', '/saved-results')}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
          >
            {!isWorkspaceUnlocked && <Lock className="w-3 h-3 text-rose-400" />}
            <span>View All ({savedResults.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {savedResults.length === 0 ? (
          <div className="oe-panel p-10 rounded-3xl text-center text-xs text-slate-400 space-y-2">
            <Bookmark className="w-8 h-8 mx-auto opacity-30 text-violet-400" />
            <p className="font-bold text-slate-100">No saved results yet</p>
            <p className="text-slate-400">Click "Save to My List" inside any tool to bookmark outputs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {savedResults.slice(0, 3).map(saved => (
              <div
                key={saved.id}
                className="oe-panel oe-panel-hover p-6 rounded-3xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-violet-400 font-mono">{saved.toolName}</span>
                    <span className="font-mono tabular-nums text-slate-400">{saved.count} entries</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 truncate">{saved.title}</h4>
                  <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-xl overflow-x-auto max-h-24 whitespace-pre-wrap leading-tight border border-slate-800">
                    {saved.resultsText.slice(0, 160)}
                    {saved.resultsText.length > 160 ? '...' : ''}
                  </pre>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(saved.resultsText)}
                    className="btn-premium-emerald flex-1 py-2 px-3 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => downloadText(saved.title, saved.resultsText)}
                    className="btn-premium-cyan flex-1 py-2 px-3 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
