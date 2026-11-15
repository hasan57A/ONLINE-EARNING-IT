import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Server,
  ExternalLink,
  ArrowLeft,
  Shield,
} from 'lucide-react';

export const ProxySitesPage: React.FC = () => {
  const { navigate } = useRouter();
  const { isAdmin } = useAuth();
  const proxySites = db.getProxySites();

  return (
    <div className="space-y-8">
      {/* Top back & Header */}
      <div className="space-y-4">
        <button
          onClick={() => {
            playUiSound('click');
            navigate('/resources');
          }}
          className="btn-premium-glass inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Resources Hub</span>
        </button>

        <div className="oe-panel oe-rgb-emerald rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-widest">
              <Server className="w-4 h-4" />
              <span>Network Infrastructure Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mt-1">
              Best Proxy Sites
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Curated overview of industry-leading residential, 4G/5G mobile, and datacenter proxy providers.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin/settings')}
              className="btn-premium-glass py-2.5 px-4 text-xs font-semibold rounded-xl text-amber-300 border-amber-500/30 flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Manage Proxies</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {proxySites.length === 0 ? (
        <div className="oe-panel oe-rgb-emerald p-12 rounded-3xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mx-auto">
            <Server className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">
              No Proxy Providers Published Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Public resource listings remain empty until an administrator publishes them or seeds curated provider lists.
            </p>
          </div>
          {isAdmin ? (
            <button
              onClick={() => navigate('/admin/settings')}
              className="btn-premium-emerald py-2.5 px-5 text-xs rounded-xl cursor-pointer"
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
              className="oe-panel oe-panel-hover oe-rgb-emerald p-6 rounded-3xl flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-100">
                    {site.name}
                  </h3>
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono tabular-nums shrink-0 whitespace-nowrap">
                    {site.price}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Validity Period:</span>
                    <span className="font-semibold text-slate-100">{site.validity}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>GB / Traffic:</span>
                    <span className="font-semibold text-slate-100">{site.traffic}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <a
                  href={site.buyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-premium-emerald w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap"
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
