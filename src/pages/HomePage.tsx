import React, { useMemo, useState } from 'react';
import { useRouter, PLATFORM_LOGO_URL } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { db } from '../services/db';
import { playUiSound } from '../services/sound';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import heroPreviewImg from '../assets/images/hero_command_preview_1794739934854.jpg';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Plus,
  Minus,
  Send,
  MessageSquare,
  Sparkles,
  Globe2,
  ExternalLink,
  Compass,
  Mail,
  PhoneCall,
  Shield,
  Zap,
  Layers,
} from 'lucide-react';
import { RealisticToolIcon } from '../components/ui/RealisticIcon';
import { motion, AnimatePresence } from 'motion/react';
import {
  SplitText,
  Magnetic,
  CountUp,
  Marquee,
  ScrollParallaxMedia,
  Reveal,
} from '../components/motion/kit';
import { ToolCarousel3D, RevealWords } from '../components/motion/Extras';
import { AnimatedLogoGlobe } from '../components/motion/AnimatedLogoGlobe';

const HERO_GLOBE_LOGO_URL = '/assets/aistudio/image_c01f7dbb.png';

const EASE = [0.16, 1, 0.3, 1] as const;

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const content = db.getWebsiteContent();
  const tools = db.getTools();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toolFilter, setToolFilter] = useState<'all' | 'pool' | 'free'>('all');

  const filteredTools = useMemo(() => {
    const isFreeSlug = (slug: string) => slug === 'text-shuffler' || slug === 'duplicate-text-remover';
    if (toolFilter === 'free') return tools.filter(t => isFreeSlug(t.slug));
    if (toolFilter === 'pool') return tools.filter(t => !isFreeSlug(t.slug));
    return tools;
  }, [tools, toolFilter]);

  const pillars = [
    {
      num: '01',
      tag: 'High-Yield Acquisition',
      title: 'CPA Marketing & Conversion Funnels',
      description:
        'Battle-tested affiliate frameworks, pre-landing architectures, and precision GEO routing built for sustained ROI across global tier-1 networks.',
      href: '/resources/cpa-networks',
      cta: 'Browse CPA Catalog',
      icon: Compass,
      accent: 'text-amber-300',
    },
    {
      num: '02',
      tag: 'Dedicated Pool Isolation',
      title: 'Zero-Duplicate Admin Pool Engine',
      description:
        'Every User Agent, Phone Number, Gmail address, and Lead record pulled from the synced pool is immediately retired so delivered data never repeats.',
      href: '/tools',
      cta: 'Inspect Tool Suite',
      icon: Shield,
      accent: 'text-emerald-300',
    },
    {
      num: '03',
      tag: 'Browser & Webview Sync',
      title: '5-Version Parallel Signature Cycling',
      description:
        'Combine Chrome, Firefox, Safari, Edge, or Opera with Facebook, Instagram, TikTok, or WeChat webview versions under language-free Android rules.',
      href: '/tools/user-agent-generator',
      cta: 'Open UA Engine',
      icon: Zap,
      accent: 'text-sky-300',
    },
    {
      num: '04',
      tag: 'Curated Infrastructure',
      title: 'Proxies, Antidetect & Traffic Networks',
      description:
        'Direct access to vetted residential proxy hubs, Adsterra/Monetag monetization guides, and antidetect browser stacks built for scale.',
      href: '/resources/proxy-sites',
      cta: 'Explore Resource Hub',
      icon: Layers,
      accent: 'text-blue-300',
    },
  ];

  const packages = db.getPaymentPackages();
  const membershipPlans = packages.map((pkg, idx) => ({
    id: pkg.id,
    name: pkg.name,
    price: `৳${pkg.priceBdt.toLocaleString()}`,
    usdt: `$${pkg.priceUsdt} USDT`,
    credits: pkg.credits,
    period: pkg.durationLabel,
    description: pkg.description,
    features: pkg.features,
    popular: idx === 1,
  }));

  const faqs = [
    {
      q: 'What is ONLINE LEARNING PRO?',
      a: 'ONLINE LEARNING PRO is a modern marketing engineering platform providing media buyers, CPA affiliates, and QA teams with high-throughput utilities (User Agent Generator with dual browser and in-app version control, Lead Generator, Mail Generator with @gmail.com filtering, Phone Number Generator, Text Shuffler, and Duplicate Text Remover) alongside curated network, proxy, and antidetect catalogs.',
    },
    {
      q: 'How does the Package & Credit System work?',
      a: 'Text Shuffler and Duplicate Text Remover are 100% Free. Generator tools require an active approved package and credits: User Agent (1 Credit), Number Generator (2 Credits), Mail Generator (3 Credits), and Lead Generator (5 Credits). Choose Starter Pass (500 Credits), Pro Marketer (1,500 Credits), or Agency Lifetime (10,000 Credits) via bKash, Nagad, Rocket, or Binance.',
    },
    {
      q: 'Can I customize both Browser and In-App Webview versions?',
      a: 'Yes. The User Agent Generator lets you select both a Web Browser (Chrome, Firefox, Safari, Edge, Opera) and an In-App Webview (Facebook, Facebook Lite, Instagram, TikTok, Twitter, LinkedIn, Snapchat, WeChat) simultaneously with up to 5 parallel version presets.',
    },
    {
      q: 'How does the Android language-free rule work?',
      a: 'All Android user agents produced by our engine are strictly language-free. No locale tags (such as en_US or FBLC/en_US) are injected into Android strings, ensuring clean compatibility across international GEO campaigns.',
    },
    {
      q: 'How does zero-duplicate pool cutting work?',
      a: 'When an administrator populates the master User Agent, Lead, Number, or Mail database pools, each generated entry matching your country, device, or domain (@gmail.com) filters is marked as consumed and permanently cut from the active pool.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playUiSound('click');
    setSubmittingContact(true);
    const result = db.submitContactInquiry({
      name: contactName,
      email: contactEmail,
      message: contactMsg,
      user,
    });
    setSubmittingContact(false);
    if (!result.saved) {
      showToast('Could not send your inquiry. Please try again.', 'error');
      return;
    }
    setContactName('');
    setContactEmail('');
    setContactMsg('');
    playUiSound('notification');
    showToast(
      result.ticketId
        ? 'Your inquiry was added to Support Center! Our team will reply shortly.'
        : 'Thank you! Your inquiry has been received.',
      'success'
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      <Navbar />

      {/* Deep Horizon Ambient Illumination */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[8%] right-[4%] w-[680px] h-[680px] bg-gradient-to-bl from-blue-600/20 via-sky-500/10 to-transparent rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 24, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[10%] left-[2%] w-[520px] h-[520px] bg-gradient-to-tr from-amber-500/10 via-blue-600/8 to-transparent rounded-full blur-[160px]"
        />
      </div>

      {/* ============================================================
          CHAPTER 1: EDITORIAL LEFT + HUGE OPEN-CANVAS RIGHT LOGO STAGE
         ============================================================ */}
      <section className="relative z-10 pt-6 pb-16 lg:pt-10 lg:pb-24 border-b border-slate-800/70">
        <div className="pointer-events-none absolute inset-0 bg-subtle-grid opacity-45" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-digital-dots opacity-25" aria-hidden="true" />

        <div className="relative max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Minimalist Top Bar: Motto + Theme Switcher */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="flex flex-wrap items-center justify-between gap-4 pb-6 lg:pb-8 border-b border-slate-800/60"
          >
            <div className="flex items-center gap-3 text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase">
              <span className="oe-gold-spear-left w-8 sm:w-12" />
              <span className="text-amber-300">
                LEARN <span className="text-sky-300">•</span> GROW <span className="text-sky-300">•</span> ACHIEVE
              </span>
              <span className="oe-gold-spear-right w-8 sm:w-12" />
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-xs text-slate-400 font-medium">
                ONLINE LEARNING PRO · Performance Suite
              </span>
              <ThemeSwitcher />
            </div>
          </motion.div>

          {/* 12-Column Asymmetric Hero: Left 5 Cols Editorial + Right 7 Cols Giant Logo Monolith */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-8 lg:pt-12">
            {/* Left 5 Columns: Crisp Swiss-Luxury Editorial & Inline Metrics */}
            <div className="lg:col-span-5 space-y-7 text-center lg:text-left flex flex-col items-center lg:items-start">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="text-xs font-mono uppercase tracking-[0.2em] text-sky-300 font-semibold"
              >
                01 · Precision Marketing Infrastructure
              </motion.p>

              <h1 className="font-display text-4xl sm:text-5xl xl:text-[3.85rem] font-black tracking-tight text-slate-100 leading-[1.06] text-balance">
                <SplitText text="Built for High-Scale" delay={0.08} />
                <SplitText
                  text="Traffic & Device"
                  delay={0.32}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-300 to-blue-400"
                />
                <SplitText text="Automation" delay={0.54} />
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.32, ease: EASE }}
                className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed"
              >
                {content.heroDescription ||
                  'Precision web toolsets crafted for CPA affiliates, media buyers, and QA teams. Generate dual-version user agents, pull zero-duplicate @gmail.com & lead pools, and sanitize campaign lists instantaneously.'}
              </motion.p>

              {/* Single Dominant Primary CTA + Clean Text-Line Secondary Controls */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.42, ease: EASE }}
                className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 w-full"
              >
                {isAuthenticated ? (
                  <Magnetic className="w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        playUiSound('click');
                        navigate('/dashboard');
                      }}
                      className="oe-cta w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
                    >
                      <span>Open User Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Magnetic>
                ) : (
                  <Magnetic className="w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        playUiSound('click');
                        navigate('/signup');
                      }}
                      className="oe-cta w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 cursor-pointer group whitespace-nowrap"
                    >
                      <span>Get Started Free</span>
                      <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                    </motion.button>
                  </Magnetic>
                )}

                <button
                  onClick={() => {
                    playUiSound('click');
                    navigate(isAuthenticated ? '/tools' : '/signin');
                  }}
                  className="btn-premium-glass w-full sm:w-auto px-6 py-4 rounded-2xl text-sm cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2"
                >
                  <span>{isAuthenticated ? 'Browse 6 Tools' : 'Sign In to Workspace'}</span>
                  <ArrowUpRight className="w-4 h-4 text-amber-300" />
                </button>
              </motion.div>

              {/* Inline 4-Metric Hairline Ledger integrated directly into Left Hero */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.52, ease: EASE }}
                className="w-full pt-5 mt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-5 text-center lg:text-left"
              >
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-blue-300 font-mono tabular-nums block">
                    <CountUp value="6+" />
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Web Utilities</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-sky-300 font-mono tabular-nums block">
                    <CountUp value="1,000" />
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Max Batch / Run</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tabular-nums block">
                    <CountUp value="58" />
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Global GEOs</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono tabular-nums block">
                    <CountUp value="500+" />
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Starter Credits</span>
                </div>
              </motion.div>
            </div>

            {/* Right 7 Columns: Larger Background-Free Logo with Animated 3D Globe */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-end justify-center relative">
              <div className="relative w-full max-w-[760px] xl:max-w-[800px] lg:-mr-4 flex flex-col items-center">
                <AnimatedLogoGlobe
                  src={HERO_GLOBE_LOGO_URL}
                  alt="ONLINE LEARNING PRO Global Emblem"
                />

                {/* Clean Horizon Spear Caption beneath the Logo */}
                <div className="w-[78%] mt-5 flex items-center gap-3 relative z-10">
                  <span className="oe-gold-spear-left flex-1" />
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.24em] text-amber-300 font-bold whitespace-nowrap">
                    Global Network · 58 GEOs
                  </span>
                  <span className="oe-gold-spear-right flex-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MINIMALIST UNBOXED TOOL TICKER STRIP
         ============================================================ */}
      <section className="relative z-10 py-4 border-b border-slate-800/70 bg-slate-950/50 backdrop-blur-sm">
        <Marquee speed={40}>
          {[...tools, ...tools].map((t, i) => {
            const isFree = t.slug === 'text-shuffler' || t.slug === 'duplicate-text-remover';
            return (
              <button
                key={`${t.id}-${i}`}
                type="button"
                onClick={() => {
                  playUiSound('click');
                  navigate(`/tools/${t.slug}`);
                }}
                className="flex items-center gap-3 px-4 py-1.5 cursor-pointer group transition-opacity hover:opacity-100 opacity-85"
              >
                <RealisticToolIcon slug={t.slug} size="sm" />
                <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors whitespace-nowrap">
                  {t.name}
                </span>
                <span className={`text-[11px] font-mono whitespace-nowrap ${isFree ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {isFree ? 'Free' : 'Pool'}
                </span>
                <span className="text-slate-700 pl-3" aria-hidden="true">/</span>
              </button>
            );
          })}
        </Marquee>
      </section>

      {/* ============================================================
          CHAPTER 2: HAIRLINE MOSAIC TOOL GRID + LIVE TERMINAL SHEET
         ============================================================ */}
      <section id="tools-showcase" className="relative z-10 py-20 lg:py-24 border-b border-slate-800/70">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
          <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-amber-300 font-bold">
                02 · Interactive Studio
              </p>
              <h2 data-rw className="font-display text-3xl sm:text-5xl font-black text-slate-100 tracking-tight text-balance">
                <RevealWords text="Unified Tool Workbench" />
              </h2>
              <p className="text-sm text-slate-400">
                Filter between pool-synced generators and instant free text normalization tools.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
                {[
                  { id: 'all' as const, label: 'All 6 Tools' },
                  { id: 'pool' as const, label: 'Pool Generators' },
                  { id: 'free' as const, label: 'Free Utilities' },
                ].map(tab => {
                  const active = toolFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setToolFilter(tab.id);
                      }}
                      className={`relative px-3.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        active ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="tools-filter-tab"
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 via-sky-500 to-amber-500 shadow"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  playUiSound('click');
                  navigate('/tools');
                }}
                className="btn-premium-glass text-xs font-bold text-blue-300 flex items-center gap-2 cursor-pointer py-2.5 px-4 rounded-xl whitespace-nowrap shrink-0"
              >
                <span>Open Full Directory</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          </Reveal>

          {/* Full-Width Architectural Hairline Mosaic Grid (3x2) */}
          <div className="rounded-3xl border border-slate-800/90 bg-slate-800/50 overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool, index) => {
                const isFree = tool.slug === 'text-shuffler' || tool.slug === 'duplicate-text-remover';
                return (
                  <motion.div
                    layout
                    key={tool.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      playUiSound('click');
                      navigate(`/tools/${tool.slug}`);
                    }}
                    className="group p-7 flex flex-col justify-between gap-6 cursor-pointer transition-colors bg-slate-950/90 hover:bg-slate-900/90"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <RealisticToolIcon slug={tool.slug} size="md" />
                        <div className="text-right font-mono text-[11px]">
                          <span className={isFree ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                            {isFree ? '100% Free' : 'Pool Synced'}
                          </span>
                          <span className="block text-slate-500 text-[10px]">0{index + 1}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-1.5">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/70">
                      <span className="text-[11px] font-mono text-slate-400">{tool.category}</span>
                      <span className="text-xs font-bold text-sky-300 group-hover:text-amber-300 inline-flex items-center gap-1 transition-colors">
                        <span>Launch</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 3: WIDESCREEN PARALLAX SHOWCASE + 3D ORBIT + PILLARS
         ============================================================ */}
      <section id="services" className="relative z-10 py-20 lg:py-24 border-b border-slate-800/70 bg-slate-900/20 overflow-hidden">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 space-y-20">
          {/* Top Widescreen Split: Parallax Command Visual (7 Cols) + Numbered Engineering Rows (5 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <Reveal className="lg:col-span-6 space-y-5">
              <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-[0_28px_70px_-20px_rgba(37,99,235,0.4)] relative aspect-[16/11]">
                <ScrollParallaxMedia className="w-full h-full">
                  <img
                    src={heroPreviewImg}
                    alt="ONLINE LEARNING PRO Command Architecture"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </ScrollParallaxMedia>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-black/75 backdrop-blur-md border border-amber-400/25">
                  <div className="flex items-center gap-3">
                    <img
                      src={PLATFORM_LOGO_URL}
                      alt="ONLINE LEARNING PRO"
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <span className="text-xs font-bold text-white">Live Credit & Pool Console</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300">Zero-Duplicate Isolation</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    playUiSound('click');
                    navigate(isAuthenticated ? '/dashboard' : '/signup');
                  }}
                  className="btn-premium-primary px-6 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>{isAuthenticated ? 'Open Studio Dashboard' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    playUiSound('click');
                    navigate('/resources');
                  }}
                  className="btn-premium-glass px-5 py-3 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Globe2 className="w-4 h-4 text-sky-300" />
                  <span>Resource Directory</span>
                </button>
              </div>
            </Reveal>

            <div className="lg:col-span-6 space-y-6">
              <Reveal className="space-y-2.5">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-amber-300 font-bold">
                  03 · Engineering Architecture
                </p>
                <h2 data-rw className="font-display text-3xl sm:text-4xl font-black text-slate-100 tracking-tight text-balance">
                  <RevealWords text="Clean Operations from End to End" />
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {content.aboutText ||
                    'ONLINE LEARNING PRO replaces fragmented scripts with unified device signatures, pool-isolated generators, and curated traffic catalogs.'}
                </p>
              </Reveal>

              <div className="divide-y divide-slate-800/80 border-y border-slate-800/80">
                {pillars.map(pillar => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.num}
                      onClick={() => {
                        playUiSound('click');
                        navigate(pillar.href);
                      }}
                      className="group py-4 px-2 -mx-2 rounded-xl hover:bg-slate-900/50 transition-colors cursor-pointer flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <span className="font-mono text-sm font-black text-amber-300 pt-0.5 tabular-nums">
                          {pillar.num}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <Icon className={`w-3.5 h-3.5 ${pillar.accent}`} />
                            <span className="font-semibold">{pillar.tag}</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                            {pillar.title}
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {pillar.description}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-amber-300 mt-1 transition-colors" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive 3D Tool Ring Stage */}
          <div className="space-y-6 pt-4">
            <div className="text-center space-y-2.5 max-w-2xl mx-auto">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-amber-300 font-bold">
                3D Orbital Stage · Sweep & Click
              </p>
              <h2 data-rw className="font-display text-3xl sm:text-4xl font-black text-slate-100 tracking-tight text-balance">
                <RevealWords text="Explore the Six-Tool Orbit" />
              </h2>
            </div>
            <ToolCarousel3D
              tools={tools}
              onOpen={slug => {
                playUiSound('click');
                navigate(`/tools/${slug}`);
              }}
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 4: ARCHITECTURAL PRICING LEDGER
         ============================================================ */}
      <section id="pricing-section" className="relative z-10 py-20 lg:py-24 border-b border-slate-800/70">
        <div id="plans" className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-amber-300 font-bold">
                04 · Membership & Credits
              </p>
              <h2 data-rw className="font-display text-3xl sm:text-5xl font-black text-slate-100 tracking-tight text-balance">
                <RevealWords text="Transparent Credit Tiers" />
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md font-mono">
              UA 1 Cr · Number 2 Cr · Mail 3 Cr · Lead 5 Cr · Text Tools 100% Free
            </p>
          </Reveal>

          {/* Architectural 3-Column Connected Ledger */}
          <div className="rounded-3xl border border-slate-800/90 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800/90 bg-slate-950/75">
            {membershipPlans.map(plan => (
              <div
                key={plan.name}
                className={`p-7 sm:p-9 flex flex-col justify-between relative ${
                  plan.popular
                    ? 'bg-gradient-to-b from-blue-950/45 via-slate-900/90 to-amber-950/15'
                    : 'bg-slate-950/75'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 via-amber-300 to-sky-400" />
                )}

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-amber-300 font-bold tabular-nums">
                        {plan.credits.toLocaleString()} Credits
                      </span>
                      <span className="text-sky-300 font-semibold">
                        {plan.popular ? 'Recommended' : plan.period}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-100">{plan.name}</h3>
                    <p className="text-xs text-slate-400">{plan.description}</p>
                  </div>

                  <div className="py-4 border-y border-slate-800/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-4xl font-black text-slate-100 font-mono tabular-nums">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">{plan.period}</span>
                    </div>
                    <span className="text-sm font-bold text-amber-300 font-mono tabular-nums">
                      {plan.usdt}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-amber-300' : 'text-blue-300'}`} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => {
                      playUiSound('click');
                      navigate(isAuthenticated ? `/payment?pkg=${plan.id}` : '/signup');
                    }}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      plan.popular ? 'btn-premium-vivid' : 'btn-premium-glass'
                    }`}
                  >
                    Select {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400">
            Instant verification available via <span className="text-slate-200 font-semibold">bKash · Nagad · Rocket · Binance Pay (USDT)</span>
          </p>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 5: MINIMALIST FAQ & CONCIERGE DESK SPLIT
         ============================================================ */}
      <section id="contact-section" className="relative z-10 py-20 lg:py-24">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 6 Columns: Minimalist Accordion */}
            <div className="lg:col-span-6 space-y-6">
              <Reveal className="space-y-2.5">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-amber-300 font-bold">
                  05 · Knowledge Base
                </p>
                <h2 data-rw className="font-display text-3xl sm:text-4xl font-black text-slate-100 tracking-tight text-balance">
                  <RevealWords text="Platform Answers" />
                </h2>
                <p className="text-sm text-slate-400">
                  Everything you need to know about pool cutting, credit deduction, and dual-version exports.
                </p>
              </Reveal>

              <div className="divide-y divide-slate-800/80 border-y border-slate-800/80">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={faq.q}>
                      <button
                        onClick={() => {
                          playUiSound('click');
                          setOpenFaq(isOpen ? null : idx);
                        }}
                        className="w-full py-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-slate-100 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-xs font-mono text-amber-300 tabular-nums">0{idx + 1}</span>
                          <span>{faq.q}</span>
                        </span>
                        <span className="shrink-0 text-sky-300">
                          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: EASE }}
                          >
                            <div className="pb-5 pl-7 text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 6 Columns: Direct Concierge Studio */}
            <Reveal delay={0.1} className="lg:col-span-6">
              <div className="oe-panel rounded-3xl p-7 sm:p-8 space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.16em] text-amber-300 font-bold">
                      Direct Concierge
                    </p>
                    <h3 className="text-2xl font-black text-slate-100 mt-1">Message Our Team</h3>
                  </div>
                  <img
                    src={PLATFORM_LOGO_URL}
                    alt="ONLINE LEARNING PRO"
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-amber-400/40 shrink-0"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </div>
                    <p className="text-slate-200 font-medium truncate">{content.contactEmail}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Phone</span>
                    </div>
                    <p className="text-slate-200 font-mono tabular-nums truncate">{content.contactPhone}</p>
                  </div>
                  <a
                    href={content.socialLinks?.telegram || 'https://t.me/OnlineLearningPro'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 hover:border-sky-400/40 transition-colors space-y-1 block"
                  >
                    <div className="flex items-center justify-between text-sky-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" />
                        <span>Telegram</span>
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                    <p className="text-slate-200 font-medium truncate">{content.contactTelegram}</p>
                  </a>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Gmail Address</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="alex@gmail.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Message</label>
                    <textarea
                      rows={4}
                      required
                      value={contactMsg}
                      onChange={e => setContactMsg(e.target.value)}
                      placeholder="Describe your inquiry, pool requirements, or package request..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingContact}
                    className="btn-premium-vivid w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{submittingContact ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
