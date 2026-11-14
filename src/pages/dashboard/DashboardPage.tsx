import React, { useMemo } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
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
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { motion } from 'motion/react';
import { useDbSync } from '../../hooks/useDbSync';

export const DashboardPage: React.FC = () => {
  useDbSync();
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const currentUserRecord = user ? db.getUserById(user.id) || user : null;

  const tools = db.getTools();
  const history = db.getUsageHistory(user?.id);
  const savedResults = db.getSavedResults(user?.id || '');

  const totalToolsAvailable = tools.filter(t => t.enabled).length;
  const totalToolsUsed = history.length;
  const totalSavedResults = savedResults.length;

  // 7-day usage aggregation
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
    navigator.clipboard.writeText(text);
    showToast('Copied saved results to clipboard!', 'success');
  };

  const downloadText = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded text file successfully.', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 sm:p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-950 via-blue-950/60 to-slate-950 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-3.5 py-1 rounded-full backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Authenticated Workspace · Session Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
            Hello, Welcome to ONLINE EARNING IT!
            <Sparkles className="w-5 h-5 text-amber-300 hidden sm:inline" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ready to generate high-performance user agents, simulate test leads, or clean bulk copy? Select any tool below to begin your workflow.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/payment')}
              className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 text-xs font-bold text-blue-200 inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {currentUserRecord?.planStatus === 'active' && currentUserRecord.plan
                  ? `${currentUserRecord.plan} · Active`
                  : currentUserRecord?.planStatus === 'pending'
                  ? 'Payment Pending Approval'
                  : 'Upgrade Plan (bKash / Nagad / Rocket / Binance)'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats Row (No credits/balance) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="p-6 rounded-3xl border border-white/10 bg-slate-900/80 hover:border-blue-500/50 hover:bg-slate-900 transition-all flex items-center gap-4 shadow-xl group"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tools Available</p>
            <p className="text-3xl font-black text-white font-mono tabular-nums mt-0.5">
              {totalToolsAvailable}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="p-6 rounded-3xl border border-white/10 bg-slate-900/80 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex items-center gap-4 shadow-xl group"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tools Used</p>
            <p className="text-3xl font-black text-white font-mono tabular-nums mt-0.5">
              {totalToolsUsed}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="p-6 rounded-3xl border border-white/10 bg-slate-900/80 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex items-center gap-4 shadow-xl group"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Saved Results</p>
            <p className="text-3xl font-black text-white font-mono tabular-nums mt-0.5">
              {totalSavedResults}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Middle Split: 7-Day Usage Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Usage Chart */}
        <div className="lg:col-span-7 p-7 rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">7-Day Tool Usage Activity</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Real-time daily tool execution metrics</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {history.length} Events
            </span>
          </div>

          {/* Interactive Bar Chart */}
          <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-white/5">
            {sevenDayChartData.map((d, idx) => {
              const heightPercent = Math.max(12, Math.round((d.count / maxChartCount) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] text-white font-mono pointer-events-none whitespace-nowrap z-20 border border-white/10 shadow-lg">
                    {d.count} runs on {d.dateStr}
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-950 rounded-t-xl h-40 flex items-end justify-center p-1 border border-white/5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                      className={`w-full rounded-lg transition-colors ${
                        d.count > 0 ? 'bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400' : 'bg-slate-800'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 font-mono">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Telemetry updated live</span>
            <button
              onClick={() => navigate('/history')}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View Usage Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-5 p-7 rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity</h2>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-blue-400 hover:underline font-bold cursor-pointer"
            >
              View All
            </button>
          </div>

          {history.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-30 text-blue-400" />
              <p className="font-semibold text-slate-300">No activity yet</p>
              <p className="text-slate-500">Run any tool to record your first execution log.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-60 pr-1">
              {history.slice(0, 5).map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-white/5 bg-slate-950/70 flex items-center justify-between gap-3 text-xs hover:border-white/10 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">
                      {item.toolName}
                    </p>
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

          <div className="pt-2 border-t border-white/5">
            <p className="text-[11px] text-slate-500">
              Private user activity stored locally in browser sandbox.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Tools */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Quick Access Tools</h2>
            <p className="text-xs text-slate-400">Fast one-click access to all available utilities</p>
          </div>
          <button
            onClick={() => navigate('/tools')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <span>All 6 Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map(tool => (
            <motion.div
              key={tool.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/tools/${tool.slug}`)}
              className="p-6 rounded-3xl border border-white/10 bg-slate-900/80 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between space-y-3.5 shadow-xl group"
            >
              <div className="flex items-start justify-between">
                <RealisticToolIcon slug={tool.slug} size="md" />
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ready</span>
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                  {tool.description}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Saved Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Saved Results</h2>
            <p className="text-xs text-slate-400">Exports and generator outputs you pinned for quick retrieval</p>
          </div>
          <button
            onClick={() => navigate('/saved-results')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({savedResults.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {savedResults.length === 0 ? (
          <div className="p-10 rounded-3xl border border-white/10 bg-slate-900/60 text-center text-xs text-slate-400 space-y-2">
            <Bookmark className="w-8 h-8 mx-auto opacity-30 text-blue-400" />
            <p className="font-bold text-white">No saved results yet</p>
            <p className="text-slate-400">Click "Save Results" inside any tool to bookmark outputs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {savedResults.slice(0, 3).map(saved => (
              <div
                key={saved.id}
                className="p-6 rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-blue-400 font-mono">{saved.toolName}</span>
                    <span className="font-mono tabular-nums text-slate-400">{saved.count} entries</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">
                    {saved.title}
                  </h4>
                  <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-xl overflow-x-auto max-h-24 whitespace-pre-wrap leading-tight border border-white/5">
                    {saved.resultsText.slice(0, 160)}
                    {saved.resultsText.length > 160 ? '...' : ''}
                  </pre>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(saved.resultsText)}
                    className="flex-1 py-2 px-3 text-xs font-bold rounded-xl border border-white/10 hover:bg-slate-800 flex items-center justify-center gap-1.5 text-slate-200 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => downloadText(saved.title, saved.resultsText)}
                    className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
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

