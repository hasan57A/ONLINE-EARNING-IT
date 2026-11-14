import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { db } from '../../services/db';
import {
  Globe2,
  Network,
  Server,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const ResourcesHubPage: React.FC = () => {
  const { navigate } = useRouter();
  const cpaCount = db.getCpaNetworks().length;
  const proxyCount = db.getProxySites().length;
  const browserCount = db.getAntidetectBrowsers().length;

  const cards = [
    {
      title: 'Best CPA Networks',
      slug: 'cpa-networks',
      description: 'Vetted high-paying performance networks, smartlinks, and outcome-based affiliate hubs with payout schedules.',
      countText: `${cpaCount} Networks Listed`,
      icon: Network,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/resources/cpa-networks',
    },
    {
      title: 'Best Proxy Sites',
      slug: 'proxy-sites',
      description: 'Top-tier residential, mobile, and datacenter proxy providers with pricing breakdowns, traffic limits, and validity rules.',
      countText: `${proxyCount} Providers Listed`,
      icon: Server,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      href: '/resources/proxy-sites',
    },
    {
      title: 'Best Antidetect Browsers',
      slug: 'antidetect-browsers',
      description: 'Multi-accounting and fingerprint management browsers for scaling media buying campaigns across ad platforms.',
      countText: `${browserCount} Browsers Listed`,
      icon: Layers,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      href: '/resources/antidetect-browsers',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-widest">
          <Globe2 className="w-4 h-4" />
          <span>Affiliate & Arbitrage Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Resources Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Curated industry intelligence, vetted CPA networks, proxy provider catalogs, and antidetect browser solutions.
        </p>
      </div>

      {/* 3 Premium Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => navigate(card.href)}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-950/10 transition-all cursor-pointer flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${card.bgColor} ${card.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {card.countText}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-500">
                <span>Browse Directory</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
