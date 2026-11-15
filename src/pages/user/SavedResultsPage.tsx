import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
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
  useDbSync();
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
    playUiSound('copy');
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
    playUiSound('click');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest">
            <Bookmark className="w-4 h-4" />
            <span>Vault & Archives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Saved Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Bookmarked data exports, lead profiles, and processed lists saved to your personal vault.
          </p>
        </div>

        <span className="oe-panel px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-violet-300 self-start sm:self-auto tabular-nums">
          {savedResults.length} Items Saved
        </span>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search saved results by title, tool, or content..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-100"
        />
      </div>

      {/* Results Grid */}
      {filteredResults.length === 0 ? (
        <div className="oe-panel p-12 rounded-3xl text-center space-y-3">
          <Bookmark className="w-10 h-10 mx-auto opacity-30 text-violet-400" />
          <h3 className="text-base font-bold text-slate-100">No Saved Results Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Run any generator tool and click "Save to My List" to store outputs here for quick export.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResults.map(item => (
            <div
              key={item.id}
              className="oe-panel oe-panel-hover p-5 rounded-2xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                    {item.toolName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    {item.savedDate}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 truncate">{item.title}</h3>

                <div className="relative">
                  <pre className="p-3 rounded-xl border border-slate-800 bg-slate-950/90 font-mono text-[11px] text-slate-300 max-h-24 overflow-hidden whitespace-pre-wrap leading-relaxed">
                    {item.resultsText.slice(0, 180)}
                    {item.resultsText.length > 180 ? '...' : ''}
                  </pre>
                  <button
                    onClick={() => setViewingResult(item)}
                    className="mt-1.5 text-[11px] text-violet-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Expand Preview</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyText(item.resultsText)}
                  className="btn-premium-emerald flex-1 py-2 px-2.5 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadFile(item.title, item.resultsText)}
                  className="btn-premium-cyan flex-1 py-2 px-2.5 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>TXT</span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteResult(item.id)}
                  className="btn-premium-glass p-2 rounded-xl text-rose-400 hover:text-rose-300 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="oe-panel oe-rgb-violet max-w-2xl w-full p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">{viewingResult.title}</h3>
                <span className="text-xs text-slate-400">
                  {viewingResult.toolName} · Saved {viewingResult.savedDate}
                </span>
              </div>
              <button
                onClick={() => setViewingResult(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              readOnly
              rows={14}
              value={viewingResult.resultsText}
              className="w-full p-4 rounded-xl border font-mono text-xs text-slate-200 resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => deleteResult(viewingResult.id)}
                className="btn-premium-glass py-2 px-3.5 text-xs rounded-xl text-rose-400 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyText(viewingResult.resultsText)}
                  className="btn-premium-emerald py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All</span>
                </button>
                <button
                  onClick={() => downloadFile(viewingResult.title, viewingResult.resultsText)}
                  className="btn-premium-cyan py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
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
