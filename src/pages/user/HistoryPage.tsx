import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import {
  History,
  Search,
  Trash2,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  useDbSync();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedTool, setSelectedTool] = useState('All');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const history = db.getUsageHistory(user?.id);
  const tools = db.getTools();

  const filteredHistory = history.filter(item => {
    const matchTool = selectedTool === 'All' || item.toolSlug === selectedTool;
    const matchSearch =
      item.toolName.toLowerCase().includes(search.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(search.toLowerCase())) ||
      item.date.includes(search);
    return matchTool && matchSearch;
  });

  const handleClearHistory = () => {
    if (!user) return;
    db.clearUsageHistory(user.id);
    setConfirmClearOpen(false);
    showToast('Usage history cleared successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest">
            <History className="w-4 h-4" />
            <span>Telemetry & Execution Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Usage History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit log of all tool executions, generated item counts, and timestamps.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setConfirmClearOpen(true)}
            className="btn-premium-glass py-2 px-3.5 text-xs rounded-xl text-rose-400 hover:text-rose-300 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="oe-panel oe-rgb-rose max-w-sm w-full p-6 rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Clear Usage History?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete your tool execution log? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="btn-premium-glass flex-1 py-2 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by tool name, parameters, or date..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedTool}
            onChange={e => setSelectedTool(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
          >
            <option value="All">All Tools</option>
            {tools.map(t => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="oe-panel rounded-2xl overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto opacity-30 text-violet-400" />
            <p>No usage records match your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tool Name</th>
                  <th className="py-3 px-4">Parameters / Details</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Items Generated</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredHistory.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 px-4 font-bold text-slate-100 whitespace-nowrap">{item.toolName}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {item.summary || 'Standard Batch Run'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">{item.date}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-400 whitespace-nowrap">{item.time}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right font-bold text-violet-300">
                      {item.resultCount}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Success</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
