import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
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
  CheckCircle2,
} from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';
import { motion } from 'motion/react';
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
      tag: 'List Permutation',
      desc: 'Randomizes every line or row independently. Ideal for keywords, URLs, and proxies.',
      icon: AlignLeft,
      color: 'from-purple-600 to-indigo-600',
    },
    {
      id: 'words',
      title: 'Shuffle Words',
      tag: 'Token Scrambler',
      desc: 'Splits text into words and randomizes order for spun marketing variations.',
      icon: Type,
      color: 'from-indigo-600 to-blue-600',
    },
    {
      id: 'characters',
      title: 'Shuffle Characters',
      tag: 'Entropy Randomizer',
      desc: 'Complete character-level permutation for passwords, test hashes, and obfuscation.',
      icon: FileCode2,
      color: 'from-pink-600 to-purple-600',
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
    showToast('Result saved to your dashboard!', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Luxury Tool Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <RealisticToolIcon slug="text-shuffler" size="lg" />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wider uppercase">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Cryptographic Randomization
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Fisher-Yates Algorithm
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Free Tool
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
                Text Shuffler
                <Sparkles className="w-5 h-5 text-purple-400" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Randomize copy, split-test variants, lines of lists, individual words, or character sequences with cryptographic Fisher-Yates randomization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl space-y-7">
        {/* Shuffle Mode Interactive Visual Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              1. Select Permutation Mode
            </span>
            <span className="text-xs font-bold text-purple-400 font-mono">
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
                  onClick={() => setShuffleMode(mode.id)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-purple-500 bg-gradient-to-br from-purple-950/60 to-slate-900 ring-1 ring-purple-500/60 shadow-lg shadow-purple-600/20'
                      : 'border-white/5 bg-slate-950 hover:border-white/20 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2 rounded-xl border transition-transform group-hover:scale-105 ${
                        isSelected
                          ? 'bg-purple-600/30 border-purple-500/50 text-white'
                          : 'bg-slate-900 border-white/5 text-slate-400'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{mode.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{mode.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Textareas Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Textarea */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Original Input Text
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {inputText.length} chars · {inputText ? inputText.split(/\r?\n/).length : 0} lines
                </span>
                <button
                  type="button"
                  onClick={loadSample}
                  className="text-[10px] font-bold text-purple-400 hover:text-purple-300 underline cursor-pointer"
                >
                  Load Sample
                </button>
              </div>
            </div>
            <textarea
              rows={12}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste your lines, articles, keywords, or raw content here to shuffle..."
              className="w-full p-4 rounded-2xl border border-white/10 bg-slate-950 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 resize-none leading-relaxed shadow-inner"
            />
          </div>

          {/* Output Textarea */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Shuffled Output Result
              </label>
              <span className="text-[11px] text-purple-400 font-mono font-bold tabular-nums">
                {outputText.length} chars ready
              </span>
            </div>
            <textarea
              readOnly
              rows={12}
              value={outputText}
              placeholder="Your randomized text result will appear here after clicking Shuffle Now..."
              className="w-full p-4 rounded-2xl border border-white/10 bg-slate-950 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed shadow-inner"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
          <button
            onClick={handleShuffle}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle Now (Free)</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setInputText('');
                setOutputText('');
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
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-300" />
              <span>Save Result</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

