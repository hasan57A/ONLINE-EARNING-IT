import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Mail, Phone, Send, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();
  const { isAdmin } = useAuth();
  const content = db.getWebsiteContent();
  const tools = db.getTools();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <img
                src="/assets/aistudio/Online_Earning_IT_Logo__e2215d9f_e2215d9f.png"
                alt="ONLINE EARNING IT"
                className="w-10 h-10 rounded-xl object-contain shadow-md"
              />
              <span className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                ONLINE EARNING <span className="text-blue-500">IT</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
              {content.footerDescription}
            </p>

            {/* Social Media Icons */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
                Official Channels
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={content.socialLinks.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                  title="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href={content.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
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
                  className="p-2 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors"
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
                  className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-colors"
                  title="TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .58.04.86.11V9.42a6.34 6.34 0 00-.86-.06 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.05a8.27 8.27 0 004.77 1.5V7.1a4.86 4.86 0 01-1-.41z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-blue-500 transition-colors">
                  Homepage
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-blue-500 transition-colors">
                  User Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/resources')} className="hover:text-blue-500 transition-colors">
                  Resources Hub
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/saved-results')} className="hover:text-blue-500 transition-colors">
                  Saved Results
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/history')} className="hover:text-blue-500 transition-colors">
                  Usage History
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/support')} className="hover:text-blue-500 transition-colors">
                  Support Ticket
                </button>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Our Services
            </h4>
            <ul className="space-y-2">
              <li className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/#services')}>
                CPA Marketing
              </li>
              <li className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/#services')}>
                Adsterra Methods
              </li>
              <li className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/#services')}>
                Monetag Methods
              </li>
              <li className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/tools')}>
                Free Marketing Tools
              </li>
              <li className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/#services')}>
                CPA Account Buy & Sell
              </li>
            </ul>
          </div>

          {/* Available Tools & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Available Tools
            </h4>
            <ul className="space-y-2">
              {tools.slice(0, 5).map(t => (
                <li key={t.id}>
                  <button
                    onClick={() => navigate(`/tools/${t.slug}`)}
                    className="hover:text-blue-500 transition-colors truncate max-w-[170px] text-left"
                  >
                    {t.name}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => navigate('/tools')} className="text-blue-500 hover:underline">
                  View All Tools →
                </button>
              </li>
            </ul>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{content.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{content.contactPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ONLINE EARNING IT. All rights reserved. Master Platform.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500">Privacy Policy · Secure & Confidential</span>
            <span className="text-slate-500">Terms of Service · Marketing & Dev Tools</span>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="hover:text-amber-500 flex items-center gap-1 transition-colors cursor-pointer text-amber-500/80"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
