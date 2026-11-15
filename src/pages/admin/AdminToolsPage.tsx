import React from 'react';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import {
  Wrench,
  Smartphone,
  Users,
  Shuffle,
  Filter,
  PhoneCall,
  Mail,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminToolsPage: React.FC = () => {
  const { showToast } = useToast();
  const tools = db.getTools();

  const toolIcons: Record<string, React.ReactNode> = {
    'user-agent-generator': <Smartphone className="w-5 h-5 text-blue-500" />,
    'lead-generator': <Users className="w-5 h-5 text-emerald-500" />,
    'text-shuffler': <Shuffle className="w-5 h-5 text-indigo-500" />,
    'duplicate-text-remover': <Filter className="w-5 h-5 text-amber-500" />,
    'number-generator': <PhoneCall className="w-5 h-5 text-cyan-500" />,
    'mail-generator': <Mail className="w-5 h-5 text-purple-500" />,
  };

  const handleToggle = (toolId: string, current: boolean, name: string) => {
    db.toggleTool(toolId, !current);
    showToast(
      `${name} has been ${!current ? 'Enabled' : 'Disabled'} for all users.`,
      !current ? 'success' : 'info'
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
            <Wrench className="w-4 h-4" />
            <span>Generator & Processing Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Tool Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control the availability of each individual tool across user dashboards and generator routes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Active: <strong className="text-emerald-400">{tools.filter(t => t.enabled).length}</strong> / {tools.length}</span>
        </div>
      </div>

      {/* Tools List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <div
            key={tool.id}
            className={`p-6 rounded-2xl border flex flex-col justify-between space-y-5 transition-all ${
              tool.enabled
                ? 'border-slate-800 bg-slate-900/90 shadow-sm'
                : 'border-slate-800/50 bg-slate-900/40 opacity-70'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                  {toolIcons[tool.slug] || <Wrench className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      tool.enabled
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {tool.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{tool.name}</h3>
                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mt-0.5">
                  {tool.category}
                </p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Platform Availability</span>
              <button
                type="button"
                onClick={() => handleToggle(tool.id, tool.enabled, tool.name)}
                className={`py-1.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  tool.enabled
                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
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
