import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Filter,
  Copy,
  Download,
  Bookmark,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { motion } from 'motion/react';
import { useDbSync } from '../../hooks/useDbSync';

export const DuplicateTextRemoverPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  useDbSync();

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

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
      if (trimWhitespace) line = line.trim();
      if (removeEmptyLines && line === '') continue;
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
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
    playUiSound('generate');

    db.recordUsage(
      user.id,
      'duplicate-text-remover',
      'Duplicate Text Remover',
      uniqueResult.length,
      'Success',
      `Original: ${originalCount} · Unique: ${uniqueResult.length} · Removed: ${removedCount} (Free)`
    );

    showToast(`Deduplicated text! Removed ${removedCount} redundant lines (Free).`, 'success');
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
    playUiSound('copy');
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
    playUiSound('copy');
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
    playUiSound('generate');
    showToast('Saved result to your dashboard vault!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="oe-panel rounded-3xl p-6 sm:p-7 flex items-center gap-4">
        <RealisticToolIcon slug="duplicate-text-remover" size="lg" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Data Sanitization Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              100% Free Forever
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <span>Duplicate Text Remover</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Scrub email lists, keyword tables, URLs, or bulk copy to isolate unique entries with case & trim filters.
          </p>
        </div>
      </div>

      <div className="oe-panel rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[
            {
              label: 'Case Sensitive',
              desc: 'Differentiate ABC vs abc',
              active: caseSensitive,
              toggle: () => setCaseSensitive(!caseSensitive),
            },
            {
              label: 'Trim Whitespace',
              desc: 'Strip leading/trailing spaces',
              active: trimWhitespace,
              toggle: () => setTrimWhitespace(!trimWhitespace),
            },
            {
              label: 'Remove Empty Lines',
              desc: 'Filter out blank rows',
              active: removeEmptyLines,
              toggle: () => setRemoveEmptyLines(!removeEmptyLines),
            },
          ].map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                playUiSound('click');
                item.toggle();
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                item.active
                  ? 'border-amber-400/70 bg-amber-500/15 text-slate-100'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100'
              }`}
            >
              <div>
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  item.active ? 'bg-amber-400 text-zinc-950' : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Original Raw Text
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {inputText ? inputText.split(/\r?\n/).length : 0} lines
                </span>
                <button
                  type="button"
                  onClick={loadSample}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
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
              className="w-full p-4 rounded-2xl border font-mono text-xs text-slate-200 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Final Unique Text
              </label>
              <span className="text-[11px] text-amber-300 font-mono font-bold">
                {outputText ? outputText.split(/\r?\n/).length : 0} unique lines ready
              </span>
            </div>
            <textarea
              readOnly
              rows={12}
              value={outputText}
              placeholder="Clean deduplicated unique text will appear here..."
              className="w-full p-4 rounded-2xl border font-mono text-xs text-slate-200 resize-none leading-relaxed"
            />
          </div>
        </div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5"
          >
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Original Lines</div>
              <div className="text-xl font-extrabold font-mono text-slate-100">{stats.originalLines}</div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400 uppercase font-bold">Unique Retained</div>
              <div className="text-xl font-extrabold font-mono text-emerald-400">{stats.uniqueLines}</div>
            </div>
            <div>
              <div className="text-[10px] text-rose-400 uppercase font-bold">Duplicates Removed</div>
              <div className="text-xl font-extrabold font-mono text-rose-400">{stats.removedLines}</div>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleProcess}
            className="btn-premium-vivid w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Remove Duplicates (Free)</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setOutputText('');
                setStats(null);
              }}
              className="btn-premium-glass px-4 py-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              type="button"
              onClick={copyResult}
              disabled={!outputText}
              className="btn-premium-emerald px-4 py-3 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              disabled={!outputText}
              className="btn-premium-cyan px-4 py-3 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={saveResult}
              disabled={!outputText}
              className="btn-premium-primary px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Result</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
