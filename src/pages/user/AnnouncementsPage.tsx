import React, { useMemo, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { db } from '../../services/db';
import { useDbSync } from '../../hooks/useDbSync';
import { AnnouncementPost } from '../../types';
import announcementBonusBanner from '../../assets/images/announcement_bonus_banner_1794739934535.jpg';
import {
  Megaphone,
  Search,
  Sparkles,
  Calendar,
  ArrowRight,
  Bell,
  Gift,
  Wrench,
  AlertCircle,
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  useDbSync();
  const { navigate } = useRouter();
  const [typeFilter, setTypeFilter] = useState<'All' | AnnouncementPost['type']>('All');
  const [search, setSearch] = useState('');

  const posts = db
    .getAnnouncements()
    .filter(p => p.status === 'Published' || p.status === 'Sent');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(p => {
      if (typeFilter !== 'All' && p.type !== typeFilter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.message.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [posts, typeFilter, search]);

  const badgeStyle = (type: AnnouncementPost['type']) => {
    switch (type) {
      case 'Announcement':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Update':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
      case 'Notice':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Greeting':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
    }
  };

  const typeIcon = (type: AnnouncementPost['type']) => {
    switch (type) {
      case 'Announcement':
        return <Gift className="w-4 h-4 text-emerald-400" />;
      case 'Update':
        return <Wrench className="w-4 h-4 text-violet-400" />;
      case 'Notice':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'Greeting':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="oe-panel rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 text-[11px] font-bold uppercase tracking-wider w-fit">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Official Platform Broadcasts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Announcements & Updates
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Stay up to date with new generator capabilities, fresh global UA & phone number pool uploads, and limited-time credit bonus offers.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/payment')}
              className="btn-premium-vivid px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
            >
              <span>View Credit Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/tools/user-agent-generator')}
              className="btn-premium-glass px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Launch UA Forge</span>
            </button>
          </div>
        </div>
        <div className="lg:col-span-5 relative min-h-[200px]">
          <img
            src={announcementBonusBanner}
            alt="Platform promotion and updates graphic"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent lg:block hidden" />
        </div>
      </div>

      {/* Filters */}
      <div className="oe-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Update', 'Announcement', 'Notice', 'Greeting'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setTypeFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === tab
                  ? 'btn-premium-primary text-white'
                  : 'text-slate-400 hover:text-slate-100 bg-slate-950/60 border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs text-slate-100"
          />
        </div>
      </div>

      {/* Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 oe-panel rounded-3xl p-12 text-center space-y-3">
            <Bell className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No announcements match your filter</p>
            <p className="text-xs text-slate-500">Check back soon for platform updates and pool drops.</p>
          </div>
        ) : (
          filtered.map(post => (
            <article
              key={post.id}
              className="oe-panel oe-panel-hover rounded-3xl p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeStyle(
                      post.type
                    )}`}
                  >
                    {typeIcon(post.type)}
                    <span>{post.type}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 leading-snug">{post.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{post.message}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Audience: {post.audience}</span>
                <span className="font-mono text-emerald-400 font-semibold">{post.status}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
