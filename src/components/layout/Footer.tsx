import React from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Mail, Phone, Send, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();
  const { isAdmin } = useAuth();
  const content = db.getWebsiteContent();
  const tools = db.getTools();

  return (
    <footer className="relative w-full border-t border-slate-800/80 bg-slate-900/90 text-slate-400 text-xs mt-16">
      <div className="absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer select-none text-left"
            >
              <img
                src={PLATFORM_LOGO_URL}
                alt="ONLINE EARNING IT"
                className="w-10 h-10 rounded-xl object-contain shadow-md"
              />
              <span className="text-base font-extrabold text-slate-100 tracking-tight">
                ONLINE EARNING{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                  IT
                </span>
              </span>
            </button>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {content.footerDescription}
            </p>
            <div className="pt-2">
              <span className="block text-[11px] font-semibold text-slate-200 mb-2.5">
                Official Channels
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href={content.socialLinks.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white transition-colors"
                  title="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href={content.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href={content.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500 hover:text-white transition-colors"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href={content.socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors"
                  title="TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Platform Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-100">Platform Tools</h4>
            <ul className="space-y-2">
              {tools.map(t => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/tools/${t.slug}`)}
                    className="hover:text-violet-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-100">Workspace</h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-violet-300 transition-colors cursor-pointer">
                  Dashboard
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/payment')} className="hover:text-violet-300 transition-colors cursor-pointer">
                  Plans & Credits
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/resources')} className="hover:text-violet-300 transition-colors cursor-pointer">
                  Resources Hub
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/support')} className="hover:text-violet-300 transition-colors cursor-pointer">
                  Support Center
                </button>
              </li>
              {isAdmin && (
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="text-violet-300 hover:text-violet-200 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-100">Direct Contact</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="truncate">{content.contactEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono tabular-nums">{content.contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{content.contactTelegram}</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => navigate('/support')}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-slate-100 cursor-pointer"
            >
              <span>Open Support Desk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ONLINE EARNING IT. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="hidden md:block">Built for performance marketers, media buyers, and QA engineers.</p>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
};
