import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import {
  Server,
  ExternalLink,
  ArrowLeft,
  Shield,
  Zap,
} from 'lucide-react';

export const ProxySitesPage: React.FC = () => {
  const { navigate } = useRouter();
  const { isAdmin } = useAuth();
  const proxySites = db.getProxySites();

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
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 uppercase tracking-widest">
              <Server className="w-4 h-4" />
              <span>Network Infrastructure Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Best Proxy Sites
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Curated overview of industry-leading residential, 4G/5G mobile, and datacenter proxy providers. (Informational catalog only).
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin/settings')}
              className="py-2 px-3 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Manage Proxies</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {proxySites.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <Server className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Proxy Providers Published Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Per platform rules, public resource listings remain empty until an administrator publishes them or seeds curated provider lists.
            </p>
          </div>
          {isAdmin ? (
            <button
              onClick={() => navigate('/admin/settings')}
              className="py-2.5 px-5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Go to Admin Settings to Add / Seed
            </button>
          ) : (
            <p className="text-[11px] text-slate-400">
              Please check back shortly or reach out to support.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proxySites.map((site, index) => (
            <div
              key={site.id || index}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {site.name}
                  </h3>
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold font-mono tabular-nums shrink-0">
                    {site.price}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="text-slate-500">Validity Period:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{site.validity}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="text-slate-500">GB / Traffic:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{site.traffic}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={site.buyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Buy Proxy</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
