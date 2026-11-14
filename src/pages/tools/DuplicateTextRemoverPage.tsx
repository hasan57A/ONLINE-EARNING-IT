import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import {
  Filter,
  Copy,
  Download,
  Bookmark,
  RotateCcw,
  Check,
  CheckCircle2,
  Sparkles,
  Layers,
  Sliders,
  Percent,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { motion, AnimatePresence } from 'motion/react';
import { useDbSync } from '../../hooks/useDbSync';

export const DuplicateTextRemoverPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  useDbSync();

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // Toggles
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Statistics
  const [stats, setStats] = useState<{
    originalLines: number;
    uniqueLines: number;
    removedLines: number;
  } | null>(null);

  const handleProcess = () => {
    if (!user) {
      showToast('Please sign in to use Duplicate Text Remover.', 'error');
      return;
    }

    if (!inputText.trim()) {
      showToast('Please paste or write some lines to process.', 'error');
      return;
    }

    const rawLines = inputText.split(/\r?\n/);
    const originalCount = rawLines.length;

    const seen = new Set<string>();
    const uniqueResult: string[] = [];

    for (let line of rawLines) {
      if (trimWhitespace) {
        line = line.trim();
      }

      if (removeEmptyLines && line === '') {
        continue;
      }

      const comparisonKey = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(comparisonKey)) {
        seen.add(comparisonKey);
        uniqueResult.push(line);
      }
    }

    const finalText = uniqueResult.join('\n');
    setOutputText(finalText);

    const removedCount = originalCount - uniqueResult.length;
    setStats({
      originalLines: originalCount,
      uniqueLines: uniqueResult.length,
      removedLines: removedCount,
    });

    db.recordUsage(
      user.id,
      'duplicate-text-remover',
      'Duplicate Text Remover',
      uniqueResult.length,
      'Success',
      `Original: ${originalCount} · Unique: ${uniqueResult.length} · Removed: ${removedCount} (Free)`
    );

    showToast(
      `Deduplicated text! Removed ${removedCount} redundant lines (Free).`,
      'success'
    );
  };

  const loadSample = () => {
    const sample = `alex.cpa@example.com
marketer@gmail.com
john.doe@test.com
alex.cpa@example.com
media_buyer@yahoo.com
marketer@gmail.com
traffic.scale@agency.com
john.doe@test.com
global.affiliate@outlook.com
alex.cpa@example.com`;
    setInputText(sample);
    showToast('Loaded sample email list with duplicates.', 'success');
  };

  const copyResult = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    showToast('Copied unique text to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deduplicated_text_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded unique text file.', 'success');
  };

  const saveResult = () => {
    if (!user || !outputText) return;
    db.saveResult(
      user.id,
      'duplicate-text-remover',
      'Duplicate Text Remover',
      `Deduplicated List (${stats?.uniqueLines || 0} unique rows)`,
      outputText,
      stats?.uniqueLines || 0
    );
    showToast('Saved result to your dashboard!', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Luxury Tool Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <RealisticToolIcon slug="duplicate-text-remover" size="lg" />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wider uppercase">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Data Sanitization Engine
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  50,000+ Lines Supported
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Free Tool
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
                Duplicate Text Remover
                <Sparkles className="w-5 h-5 text-amber-400" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Scrub email lists, keyword tables, URLs, or bulk copy to isolate unique entries with precise case, trim, and whitespace controls.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl space-y-7">
        {/* Tactile Toggle Switches Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              1. Deduplication Parameters
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-400">
              Zero Redundancy Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Case Sensitive */}
            <button
              type="button"
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                caseSensitive
                  ? 'border-amber-500 bg-amber-950/40 text-white ring-1 ring-amber-500/50 shadow-md'
                  : 'border-white/5 bg-slate-950 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <div>
                <div className="text-xs font-bold">Case Sensitive</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Differentiate ABC vs abc</div>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  caseSensitive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-600'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </button>

            {/* Trim Whitespace */}
            <button
              type="button"
              onClick={() => setTrimWhitespace(!trimWhitespace)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                trimWhitespace
                  ? 'border-amber-500 bg-amber-950/40 text-white ring-1 ring-amber-500/50 shadow-md'
                  : 'border-white/5 bg-slate-950 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <div>
                <div className="text-xs font-bold">Trim Whitespace</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Strip leading/trailing spaces</div>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  trimWhitespace ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-600'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </button>

            {/* Remove Empty Lines */}
            <button
              type="button"
              onClick={() => setRemoveEmptyLines(!removeEmptyLines)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                removeEmptyLines
                  ? 'border-amber-500 bg-amber-950/40 text-white ring-1 ring-amber-500/50 shadow-md'
                  : 'border-white/5 bg-slate-950 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <div>
                <div className="text-xs font-bold">Remove Empty Lines</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Filter out blank rows</div>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  removeEmptyLines ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-600'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </button>
          </div>
        </div>

        {/* Textareas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Original Raw Text
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {inputText ? inputText.split(/\r?\n/).length : 0} lines
                </span>
                <button
                  type="button"
                  onClick={loadSample}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Load Sample
                </button>
              </div>
            </div>
            <textarea
              rows={12}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste rows, emails, keywords, or URLs here..."
              className="w-full p-4 rounded-2xl border border-white/10 bg-slate-950 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none leading-relaxed shadow-inner"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Final Unique Text
              </label>
              <span className="text-[11px] text-amber-400 font-mono font-bold tabular-nums">
                {outputText ? outputText.split(/\r?\n/).length : 0} unique lines ready
              </span>
            </div>
            <textarea
              readOnly
              rows={12}
              value={outputText}
              placeholder="Clean deduplicated unique text will be rendered here..."
              className="w-full p-4 rounded-2xl border border-white/10 bg-slate-950 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed shadow-inner"
            />
          </div>
        </div>

        {/* Reduction Analytics HUD */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-950 text-xs shadow-md"
          >
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Original Lines</span>
              <div className="text-xl font-black font-mono text-white tabular-nums">
                {stats.originalLines}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Unique Retained</span>
              <div className="text-xl font-black font-mono text-emerald-400 tabular-nums">
                {stats.uniqueLines}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-rose-500/20 space-y-1">
              <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Duplicates Removed</span>
              <div className="text-xl font-black font-mono text-rose-400 tabular-nums">
                {stats.removedLines} ({stats.originalLines > 0 ? Math.round((stats.removedLines / stats.originalLines) * 100) : 0}% scrubbed)
              </div>
            </div>
          </motion.div>
        )}

        {/* Buttons: Remove Duplicates, Copy Result, Download TXT, Save Result */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
          <button
            onClick={handleProcess}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/30 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Remove Duplicates (Free)</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setInputText('');
                setOutputText('');
                setStats(null);
              }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-white/10 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={copyResult}
              disabled={!outputText}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-white/10 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={downloadTxt}
              disabled={!outputText}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-white/10 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download</span>
            </button>
            <button
              onClick={saveResult}
              disabled={!outputText}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-200" />
              <span>Save Result</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

