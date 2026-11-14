import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { SavedResult } from '../../types';
import {
  Bookmark,
  Copy,
  Download,
  Trash2,
  Search,
  Eye,
  X,
} from 'lucide-react';

export const SavedResultsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [viewingResult, setViewingResult] = useState<SavedResult | null>(null);

  const savedResults = db.getSavedResults(user?.id || '');

  const filteredResults = savedResults.filter(
    r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.toolName.toLowerCase().includes(search.toLowerCase()) ||
      r.resultsText.toLowerCase().includes(search.toLowerCase())
  );

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied saved result to clipboard!', 'success');
  };

  const downloadFile = (title: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded TXT export.', 'success');
  };

  const deleteResult = (id: string) => {
    if (!user) return;
    db.deleteSavedResult(id, user.id);
    if (viewingResult?.id === id) {
      setViewingResult(null);
    }
    showToast('Removed saved result.', 'info');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 uppercase tracking-widest">
            <Bookmark className="w-4 h-4" />
            <span>Vault & Archives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Saved Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Bookmarked data exports, lead profiles, and processed lists saved to your personal account.
          </p>
        </div>

        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto tabular-nums">
          {savedResults.length} Items Saved
        </span>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search saved results by title, tool, or content..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Results Grid */}
      {filteredResults.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center space-y-3">
          <Bookmark className="w-10 h-10 mx-auto opacity-30 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Saved Results Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Run any generator tool and click "Save Results" to store outputs here for later export.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map(item => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">
                    {item.toolName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                    {item.savedDate}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {item.title}
                </h3>

                {/* Result Preview snippet */}
                <div className="relative">
                  <pre className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-h-24 overflow-hidden whitespace-pre-wrap leading-relaxed">
                    {item.resultsText.slice(0, 180)}
                    {item.resultsText.length > 180 ? '...' : ''}
                  </pre>
                  <button
                    onClick={() => setViewingResult(item)}
                    className="mt-1 text-[11px] text-blue-500 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Expand Preview</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Copy Results, Download TXT, Delete Saved Result */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyText(item.resultsText)}
                  className="flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy Results"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadFile(item.title, item.resultsText)}
                  className="flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Download TXT"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>TXT</span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteResult(item.id)}
                  className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete Saved Result"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Result Modal */}
      {viewingResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {viewingResult.title}
                </h3>
                <span className="text-xs text-slate-500">
                  {viewingResult.toolName} · Saved {viewingResult.savedDate}
                </span>
              </div>
              <button
                onClick={() => setViewingResult(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              readOnly
              rows={14}
              value={viewingResult.resultsText}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => deleteResult(viewingResult.id)}
                className="py-2 px-3 text-xs font-semibold rounded-xl text-rose-500 hover:bg-rose-500/10 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Result</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyText(viewingResult.resultsText)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All</span>
                </button>
                <button
                  onClick={() => downloadFile(viewingResult.title, viewingResult.resultsText)}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download TXT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
