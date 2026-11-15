import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Layers,
  Download,
  ArrowLeft,
  Shield,
} from 'lucide-react';

export const AntidetectBrowsersPage: React.FC = () => {
  const { navigate } = useRouter();
  const { isAdmin } = useAuth();
  const browsers = db.getAntidetectBrowsers();

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

        <div className="oe-panel oe-rgb-cyan rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-widest">
              <Layers className="w-4 h-4" />
              <span>Multi-Accounting & Fingerprinting</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mt-1">
              Best Antidetect Browsers
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Leading antidetect browsers with fingerprint customization, proxy integration, and automated profile management.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin/settings')}
              className="btn-premium-glass py-2.5 px-4 text-xs font-semibold rounded-xl text-amber-300 border-amber-500/30 flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Manage Browsers</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {browsers.length === 0 ? (
        <div className="oe-panel oe-rgb-cyan p-12 rounded-3xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">
              No Antidetect Browsers Published Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Public resource listings remain empty until an administrator publishes them or seeds curated browser lists.
            </p>
          </div>
          {isAdmin ? (
            <button
              onClick={() => navigate('/admin/settings')}
              className="btn-premium-cyan py-2.5 px-5 text-xs rounded-xl cursor-pointer"
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
              className="oe-panel oe-panel-hover oe-rgb-cyan p-6 rounded-3xl flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-black">
                    {b.name.charAt(0)}
                  </div>
                  <h3 className="text-base font-bold text-slate-100">
                    {b.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {b.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <a
                  href={b.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-premium-cyan w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap"
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
