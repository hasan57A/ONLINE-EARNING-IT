import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import {
  Layers,
  Download,
  ArrowLeft,
  Shield,
  ExternalLink,
} from 'lucide-react';

export const AntidetectBrowsersPage: React.FC = () => {
  const { navigate } = useRouter();
  const { isAdmin } = useAuth();
  const browsers = db.getAntidetectBrowsers();

  return (
    <div className="space-y-8">
      {/* Top back & Header */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/resources')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Resources Hub</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 uppercase tracking-widest">
              <Layers className="w-4 h-4" />
              <span>Multi-Accounting & Fingerprinting</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Best Antidetect Browsers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Leading antidetect browsers with fingerprint customization, proxy integration, and automated profile management.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin/settings')}
              className="py-2 px-3 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Manage Browsers</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {browsers.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Antidetect Browsers Published Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Per platform rules, public resource listings remain empty until an administrator publishes them or seeds curated browser lists.
            </p>
          </div>
          {isAdmin ? (
            <button
              onClick={() => navigate('/admin/settings')}
              className="py-2.5 px-5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Go to Admin Settings to Add / Seed
            </button>
          ) : (
            <p className="text-[11px] text-slate-400">
              Please check back shortly or contact our support team.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {browsers.map((b, index) => (
            <div
              key={b.id || index}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                    {b.name.charAt(0)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {b.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {b.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={b.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Browser</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
