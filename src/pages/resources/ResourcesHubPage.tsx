import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  Globe2,
  Network,
  Server,
  Layers,
  ArrowRight,
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
      iconStyle: 'bg-violet-500/15 border-violet-500/35 text-violet-300',
      rgbClass: 'oe-rgb-violet',
      ctaText: 'text-violet-300',
      href: '/resources/cpa-networks',
    },
    {
      title: 'Best Proxy Sites',
      slug: 'proxy-sites',
      description: 'Top-tier residential, mobile, and datacenter proxy providers with pricing breakdowns, traffic limits, and validity rules.',
      countText: `${proxyCount} Providers Listed`,
      icon: Server,
      iconStyle: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300',
      rgbClass: 'oe-rgb-emerald',
      ctaText: 'text-emerald-300',
      href: '/resources/proxy-sites',
    },
    {
      title: 'Best Antidetect Browsers',
      slug: 'antidetect-browsers',
      description: 'Multi-accounting and fingerprint management browsers for scaling media buying campaigns across ad platforms.',
      countText: `${browserCount} Browsers Listed`,
      icon: Layers,
      iconStyle: 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300',
      rgbClass: 'oe-rgb-cyan',
      ctaText: 'text-cyan-300',
      href: '/resources/antidetect-browsers',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="oe-panel oe-rgb-violet rounded-3xl p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-widest">
          <Globe2 className="w-4 h-4" />
          <span>Affiliate & Arbitrage Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Resources Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
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
              onClick={() => {
                playUiSound('click');
                navigate(card.href);
              }}
              className={`oe-panel oe-panel-hover ${card.rgbClass} p-6 rounded-3xl cursor-pointer flex flex-col justify-between space-y-6 group`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-12 h-12 rounded-2xl border ${card.iconStyle} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-300 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg tabular-nums whitespace-nowrap">
                    {card.countText}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className={`pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold ${card.ctaText}`}>
                <span>Browse Directory</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
