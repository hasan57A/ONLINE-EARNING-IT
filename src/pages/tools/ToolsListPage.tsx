import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { db } from '../../services/db';
import {
  Search,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { motion, AnimatePresence } from 'motion/react';

export const ToolsListPage: React.FC = () => {
  const { navigate } = useRouter();
  const tools = db.getTools();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Browser & Device', 'Marketing & Outreach', 'Content Processing', 'Data Cleaning', 'Telephony & Testing', 'Email & QA'];

  const filteredTools = tools.filter(tool => {
    const matchSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-950 via-blue-950/50 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30">
              High-Precision Suite
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">100% Free Access</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
            Performance Marketing Tools
            <Sparkles className="w-5 h-5 text-amber-300" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            All tools are fully accessible without credit deductions or token locks. Generate, format, deduplicate, and export production-ready data instantly.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tools by title, function, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-white/10 bg-slate-900/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner font-medium"
          />
        </div>

        {/* Category Segmented Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs p-1 rounded-2xl bg-slate-900/60 border border-white/5">
          {categories.slice(0, 4).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid with Motion Stagger */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className={`p-7 rounded-3xl border flex flex-col justify-between space-y-5 transition-all shadow-xl group ${
                tool.enabled
                  ? 'border-white/10 bg-slate-900/80 hover:border-blue-500/50 hover:bg-slate-900'
                  : 'border-white/5 bg-slate-900/40 opacity-70'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <RealisticToolIcon slug={tool.slug} size="lg" />
                  {tool.enabled ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      Maintenance
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider mt-0.5">
                    {tool.category}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-2">
                <button
                  disabled={!tool.enabled}
                  onClick={() => navigate(`/tools/${tool.slug}`)}
                  className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    tool.enabled
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>{tool.enabled ? 'Open Tool Console' : 'Currently Disabled'}</span>
                  {tool.enabled && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

