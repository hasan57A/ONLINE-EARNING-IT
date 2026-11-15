import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Shuffle,
  Copy,
  Download,
  Bookmark,
  RotateCcw,
  Sparkles,
  AlignLeft,
  Type,
  FileCode2,
  Check,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { useDbSync } from '../../hooks/useDbSync';

export const TextShufflerPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  useDbSync();

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [shuffleMode, setShuffleMode] = useState<'lines' | 'words' | 'characters'>('lines');
  const [isCopied, setIsCopied] = useState(false);

  const shuffleModes = [
    {
      id: 'lines',
      title: 'Shuffle Lines',
      desc: 'Randomizes every line or row independently. Ideal for keywords, URLs, and proxies.',
      icon: AlignLeft,
    },
    {
      id: 'words',
      title: 'Shuffle Words',
      desc: 'Splits text into words and randomizes order for spun marketing variations.',
      icon: Type,
    },
    {
      id: 'characters',
      title: 'Shuffle Characters',
      desc: 'Character-level permutation for passwords, test hashes, and obfuscation.',
      icon: FileCode2,
    },
  ] as const;

  const fisherYatesShuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const handleShuffle = () => {
    if (!user) {
      showToast('Please sign in to use Text Shuffler.', 'error');
      return;
    }

    if (!inputText.trim()) {
      showToast('Please enter some text to shuffle.', 'error');
      return;
    }

    let result = '';
    if (shuffleMode === 'lines') {
      const lines = inputText.split(/\r?\n/).filter(line => line.length > 0);
      result = fisherYatesShuffle(lines).join('\n');
    } else if (shuffleMode === 'words') {
      const words = inputText.split(/\s+/).filter(word => word.length > 0);
      result = fisherYatesShuffle(words).join(' ');
    } else if (shuffleMode === 'characters') {
      const chars = inputText.split('');
      result = fisherYatesShuffle(chars).join('');
    }

    setOutputText(result);
    playUiSound('generate');

    db.recordUsage(
      user.id,
      'text-shuffler',
      'Text Shuffler',
      1,
      'Success',
      `Mode: ${shuffleMode} (Free)`
    );
    showToast(`Shuffled text by ${shuffleMode} (Free)!`, 'success');
  };

  const loadSample = () => {
    const sample = `Tier-1 Traffic Arbitrage Strategy
Facebook Social In-App Webview Engine
Google Chrome 124.0.6367.60 Release
High Converting CPA Landing Architecture
Adsterra Push Notification Matrix
Monetag Smartlink Pre-lander Workflow`;
    setInputText(sample);
    showToast('Loaded sample text block.', 'success');
  };

  const copyResult = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    playUiSound('copy');
    setIsCopied(true);
    showToast('Copied shuffled text to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shuffled_text_${shuffleMode}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    playUiSound('copy');
    showToast('Downloaded text file.', 'success');
  };

  const saveResult = () => {
    if (!user || !outputText) return;
    db.saveResult(
      user.id,
      'text-shuffler',
      'Text Shuffler',
      `Shuffled Content (${shuffleMode.toUpperCase()})`,
      outputText,
      1
    );
    playUiSound('generate');
    showToast('Result saved to your dashboard vault!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="oe-panel rounded-3xl p-6 sm:p-7 flex items-center gap-4">
        <RealisticToolIcon slug="text-shuffler" size="lg" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Fisher-Yates Permutation
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              100% Free Forever
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <span>Text Shuffler</span>
            <Sparkles className="w-5 h-5 text-fuchsia-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Randomize copy, split-test variants, lines of lists, individual words, or character sequences instantaneously.
          </p>
        </div>
      </div>

      <div className="oe-panel rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
              1. Select Permutation Mode
            </span>
            <span className="text-xs font-bold text-violet-300 font-mono">
              Active: {shuffleMode.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {shuffleModes.map(mode => {
              const IconComp = mode.icon;
              const isSelected = shuffleMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setShuffleMode(mode.id);
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-violet-500 bg-violet-500/15 text-slate-100 shadow-[0_0_20px_-6px_rgba(var(--oe-accent-rgb),0.55)]'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 w-fit">
                    <IconComp className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{mode.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{mode.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Original Input Text
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {inputText.length} chars · {inputText ? inputText.split(/\r?\n/).length : 0} lines
                </span>
                <button
                  type="button"
                  onClick={loadSample}
                  className="text-[11px] font-bold text-violet-400 hover:text-violet-300 underline cursor-pointer"
                >
                  Load Sample
                </button>
              </div>
            </div>
            <textarea
              rows={12}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste lines, keywords, or content here to shuffle..."
              className="w-full p-4 rounded-2xl border font-mono text-xs text-slate-200 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Shuffled Output Result
              </label>
              <span className="text-[11px] text-violet-300 font-mono font-bold">
                {outputText.length} chars ready
              </span>
            </div>
            <textarea
              readOnly
              rows={12}
              value={outputText}
              placeholder="Your randomized text result will appear here..."
              className="w-full p-4 rounded-2xl border font-mono text-xs text-slate-200 resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleShuffle}
            className="btn-premium-vivid w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle Now (Free)</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setOutputText('');
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
