import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useDbSync } from '../../hooks/useDbSync';
import { db, TOOL_CREDIT_COSTS } from '../../services/db';
import { PackageCreditGuard } from '../../components/ui/PackageCreditGuard';
import {
  Search,
  ArrowRight,
  Sparkles,
  CreditCard,
  Lock,
  Gift,
  Crown,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { AnimatePresence } from 'motion/react';
import { TiltCard } from '../../components/motion/kit';

const FREE_TOOL_SLUGS = ['text-shuffler', 'duplicate-text-remover'];

export const ToolsListPage: React.FC = () => {
  useDbSync();
  const { navigate } = useRouter();
  const { user } = useAuth();
  const tools = db.getTools();
  const access = db.canUseTool(user?.id);
  const isUnlocked = access.isAdmin || access.hasUsablePackage;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Browser & Device', 'Marketing & Outreach', 'Content Processing', 'Data Cleaning', 'Telephony & Testing', 'Email & QA'];

  const filteredTools = tools
    .filter(tool => {
      const matchSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => Number(FREE_TOOL_SLUGS.includes(b.slug)) - Number(FREE_TOOL_SLUGS.includes(a.slug)));

  const getToolCreditInfo = (slug: string): { label: string; isFree: boolean } => {
    switch (slug) {
      case 'user-agent-generator':
        return { label: `${TOOL_CREDIT_COSTS.UA} Credit / UA`, isFree: false };
      case 'number-generator':
        return { label: `${TOOL_CREDIT_COSTS.NUMBER} Credits / Number`, isFree: false };
      case 'mail-generator':
        return { label: `${TOOL_CREDIT_COSTS.MAIL} Credits / Email`, isFree: false };
      case 'lead-generator':
        return { label: `${TOOL_CREDIT_COSTS.LEAD} Credits / Lead`, isFree: false };
      case 'text-shuffler':
      case 'duplicate-text-remover':
        return { label: '100% Free', isFree: true };
      default:
        return { label: '1 Credit / item', isFree: false };
    }
  };

  return (
    <div className="space-y-6">
      <div className="oe-panel rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-400/30">
              High-Precision Suite
            </span>
            <span className="text-[10px] font-bold text-emerald-300 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 inline-flex items-center gap-1">
              <Gift className="w-3 h-3" /> 2 TOOLS FREE FOREVER
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <span>Performance Marketing Tools</span>
            <Sparkles className="w-5 h-5 text-fuchsia-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Text Shuffler & Duplicate Remover are 100% free. Generator tools pull from synchronized Admin Pools: UA (1 Cr), Number (2 Cr), Mail (3 Cr), Lead (5 Cr).
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/payment')}
          className="btn-premium-vivid px-5 py-3 rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer shrink-0 self-start lg:self-auto"
        >
          <CreditCard className="w-4 h-4" />
          <span className="font-mono">
            {access.isAdmin
              ? 'Admin Unlimited Mode'
              : `${access.remainingCredits.toLocaleString()} Credits · Top Up`}
          </span>
        </button>
      </div>

      {isUnlocked ? (
        <PackageCreditGuard
          userId={user?.id}
          requiredCredits={1}
          creditUnitLabel="UA: 1 Cr · Number: 2 Cr · Mail: 3 Cr · Lead: 5 Cr · Text Tools: Free"
        />
      ) : (
        <div className="oe-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">
                {access.planStatus === 'pending'
                  ? 'Payment pending approval — free tools are open now'
                  : 'Free tools are unlocked — use them anytime'}
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Upgrade with any credit package to unlock the UA, Number, Mail & Lead pools.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/payment')}
            className="btn-premium-primary px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Crown className="w-4 h-4" />
            <span>{access.planStatus === 'pending' ? 'View Status' : 'Unlock All Tools'}</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tools by title or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs p-1.5 rounded-2xl oe-panel">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'btn-premium-primary text-white'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredTools.map((tool, index) => {
            const creditInfo = getToolCreditInfo(tool.slug);
            const needsPackage = !creditInfo.isFree && !isUnlocked;
            return (
              <TiltCard
                key={tool.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                whileHover={{ y: -5 }}
                className="relative oe-panel oe-panel-hover p-6 rounded-3xl flex flex-col justify-between space-y-5 group"
              >
                {creditInfo.isFree && (
                  <span className="absolute -top-2.5 left-6 px-3 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] inline-flex items-center gap-1 shadow-lg">
                    <Gift className="w-3 h-3" /> FREE
                  </span>
                )}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <RealisticToolIcon slug={tool.slug} size="lg" />
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          tool.enabled
                            ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                            : 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                        }`}
                      >
                        {tool.enabled ? 'Ready' : 'Maintenance'}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border text-violet-200 bg-violet-500/15 border-violet-500/30">
                        {creditInfo.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider mt-0.5">
                      {tool.category}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{tool.description}</p>
                </div>

                <button
                  type="button"
                  disabled={!tool.enabled}
                  onClick={() => navigate(needsPackage ? '/payment' : `/tools/${tool.slug}`)}
                  className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 ${
                    !tool.enabled
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : needsPackage
                      ? 'btn-premium-glass text-amber-300 cursor-pointer'
                      : 'btn-premium-vivid cursor-pointer'
                  }`}
                >
                  {needsPackage && <Lock className="w-3.5 h-3.5" />}
                  <span>
                    {!tool.enabled
                      ? 'Currently Disabled'
                      : needsPackage
                      ? 'Unlock with Package'
                      : 'Open Tool Console'}
                  </span>
                  {tool.enabled && !needsPackage && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </TiltCard>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
