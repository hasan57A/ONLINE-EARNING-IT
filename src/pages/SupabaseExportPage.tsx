import React, { useState } from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../context/RouterContext';
import { useToast } from '../components/ui/Toast';
import schemaSql from '../../supabase/schema.sql?raw';
import {
  ArrowLeft,
  Check,
  Copy,
  Database,
  Download,
  FileArchive,
  FileCode2,
  Loader2,
} from 'lucide-react';

export const SupabaseExportPage: React.FC = () => {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const response = await fetch('/online-earning-it-supabase.zip', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'online-earning-it-supabase.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast('Supabase ZIP download started!', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Download failed';
      showToast(`Could not download ZIP (${msg}).`, 'error');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadSql = () => {
    const blob = new Blob([schemaSql], { type: 'application/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'supabase-schema.sql';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast('supabase-schema.sql downloaded!', 'success');
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(schemaSql);
      setCopiedSql(true);
      showToast('Supabase SQL copied to clipboard!', 'success');
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      showToast('Clipboard copy failed. Use the Download .sql button instead.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 relative z-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-premium-glass inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2.5">
            <img
              src={PLATFORM_LOGO_URL}
              alt="ONLINE EARNING IT"
              className="w-8 h-8 rounded-xl object-contain"
            />
            <span className="text-sm font-extrabold tracking-tight text-slate-100">
              ONLINE EARNING IT · Supabase Package
            </span>
          </div>
        </div>

        <div className="oe-panel oe-rgb-violet p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>Firebase Removed · Supabase Ready</span>
              </div>
              <h1 className="text-2xl font-black text-slate-100">
                Download Project ZIP &amp; Supabase SQL
              </h1>
              <p className="text-xs text-slate-400">
                Download the complete Firebase-free Supabase codebase and PostgreSQL schema directly from the preview.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-violet-500/30 bg-slate-900/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                  <FileArchive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">Complete Source ZIP</h2>
                  <p className="text-[11px] text-slate-400">online-earning-it-supabase.zip</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Includes full React + Vite + TypeScript source, <code className="text-violet-300">supabase/schema.sql</code>, <code className="text-violet-300">.env.example</code>, and all assets with zero Firebase dependencies.
              </p>
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={downloadingZip}
                className="btn-premium-vivid w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {downloadingZip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Downloading ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Supabase ZIP</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-slate-900/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">Supabase SQL Schema</h2>
                  <p className="text-[11px] text-slate-400">Tables, RLS, Triggers, Realtime &amp; Seeds</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste directly into your Supabase Dashboard → SQL Editor and click <strong>Run</strong> to provision all 17 tables and security policies.
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="btn-premium-emerald flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Copied SQL' : 'Copy SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="btn-premium-glass px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>.sql</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">supabase/schema.sql Preview</span>
              <span className="text-[11px] text-slate-500 font-mono">{schemaSql.split('\n').length} lines</span>
            </div>
            <pre className="max-h-80 overflow-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed">
              {schemaSql}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
