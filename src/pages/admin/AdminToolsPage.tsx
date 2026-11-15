import React from 'react';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import { Wrench } from 'lucide-react';
import { RealisticToolIcon } from '../../components/ui/RealisticIcon';

export const AdminToolsPage: React.FC = () => {
  useDbSync();
  const { showToast } = useToast();
  const tools = db.getTools();

  const handleToggle = (toolId: string, current: boolean, name: string) => {
    db.toggleTool(toolId, !current);
    playUiSound('click');
    showToast(
      `${name} has been ${!current ? 'Enabled' : 'Disabled'} for all users.`,
      !current ? 'success' : 'info'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Wrench className="w-4 h-4" />
            <span>Generator & Processing Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Tool Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control the live availability of each individual tool across user dashboards and generator routes.
          </p>
        </div>

        <div className="oe-panel px-4 py-2 rounded-xl text-xs font-mono text-slate-300 self-start sm:self-auto">
          Active: <strong className="text-emerald-400">{tools.filter(t => t.enabled).length}</strong> / {tools.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <div
            key={tool.id}
            className={`oe-panel p-6 rounded-2xl flex flex-col justify-between space-y-5 transition-all ${
              tool.enabled ? 'oe-rgb-violet' : 'opacity-65'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <RealisticToolIcon slug={tool.slug} size="md" />
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    tool.enabled
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {tool.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">{tool.name}</h3>
                <p className="text-[11px] font-bold text-violet-400 uppercase tracking-wider mt-0.5">
                  {tool.category}
                </p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Platform Availability</span>
              <button
                type="button"
                onClick={() => handleToggle(tool.id, tool.enabled, tool.name)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  tool.enabled ? 'btn-premium-glass text-rose-300' : 'btn-premium-emerald'
                }`}
              >
                {tool.enabled ? 'Disable Tool' : 'Enable Tool'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
