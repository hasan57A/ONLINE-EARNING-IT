import React, { useMemo, useState } from 'react';
import { useRouter } from '../context/RouterContext';
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
  ChevronDown,
  Send,
  MessageSquare,
  Sparkles,
  Copy,
  Globe2,
  ExternalLink,
  CheckCircle2,
  Compass,
  Mail,
  PhoneCall,
  Shield,
  Zap,
  Layers,
} from 'lucide-react';
import { RealisticToolIcon } from '../components/ui/RealisticIcon';
import { DeviceIcons, BrowserIcons, InAppIcons } from '../components/ui/BrandIcons';
import { motion, AnimatePresence } from 'motion/react';
import {
  SplitText,
  TiltCard,
  Magnetic,
  CountUp,
  Marquee,
  SpotlightCard,
  StaggerGrid,
  StaggerItem,
  ScrollParallaxMedia,
  Reveal,
} from '../components/motion/kit';
import { HeroOrbit, ToolCarousel3D, RevealWords } from '../components/motion/Extras';

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

  const [heroTab, setHeroTab] = useState<'ua' | 'lead' | 'contact'>('ua');
  const [sampleUaDevice, setSampleUaDevice] = useState<'Android' | 'iPhone' | 'Windows'>('Android');
  const [sampleUaBrowser, setSampleUaBrowser] = useState<'Chrome' | 'Facebook' | 'Instagram'>('Chrome');
  const [sampleUaVersion, setSampleUaVersion] = useState<string>('124.0.6367.60');
  const [isCopied, setIsCopied] = useState(false);

  const filteredTools = useMemo(() => {
    const isFreeSlug = (slug: string) => slug === 'text-shuffler' || slug === 'duplicate-text-remover';
    if (toolFilter === 'free') return tools.filter(t => isFreeSlug(t.slug));
    if (toolFilter === 'pool') return tools.filter(t => !isFreeSlug(t.slug));
    return tools;
  }, [tools, toolFilter]);

  const getLiveSampleUA = () => {
    if (sampleUaDevice === 'Android') {
      if (sampleUaBrowser === 'Facebook') {
        return `Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.60 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/${sampleUaVersion || '448.0.0.32.115'};FBBV/569201934;FBDV/SM-S918B;FBSN/Android;FBSV/14;]`;
      }
      if (sampleUaBrowser === 'Instagram') {
        return `Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.60 Mobile Safari/537.36 Instagram ${sampleUaVersion || '318.0.0.26.109'} Android (34/14; 480dpi; 1080x2340; samsung; SM-S918B)`;
      }
      return `Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${sampleUaVersion || '124.0.6367.60'} Mobile Safari/537.36`;
    } else if (sampleUaDevice === 'iPhone') {
      if (sampleUaBrowser === 'Facebook') {
        return `Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone;FBMD/Apple;FBSN/iOS;FBSV/17.4;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5;FBAV/${sampleUaVersion || '448.0.0.32.115'}]`;
      }
      return `Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${sampleUaVersion || '17.4'} Mobile/15E148 Safari/604.1`;
    } else {
      return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${sampleUaVersion || '124.0.6367.60'} Safari/537.36`;
    }
  };

  const copyLiveSample = (text: string) => {
    navigator.clipboard.writeText(text);
    playUiSound('copy');
    setIsCopied(true);
    showToast('Copied string to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const bentoCapabilities = [
    {
      num: '01',
      title: 'CPA Marketing & Conversion Funnels',
      category: 'High-Yield Acquisition',
      description:
        'Battle-tested affiliate frameworks, pre-landing architectures, and precision GEO traffic routing models built for sustained ROI across global tier-1 networks.',
      span: 'lg:col-span-7',
      rgbClass: 'oe-rgb-violet',
      spotlight: 'rgba(var(--oe-accent-rgb), 0.2)',
      href: '/resources/cpa-networks',
      cta: 'Browse CPA Catalog',
    },
    {
      num: '02',
      title: 'Adsterra Direct-Link Arbitrage',
      category: 'Traffic Scaling',
      description:
        'Specialized social arbitrage workflows, anti-bot signature filtering, and clean device rotation to maximize CPM efficiency.',
      span: 'lg:col-span-5',
      rgbClass: 'oe-rgb-amber',
      spotlight: 'rgba(245, 158, 11, 0.16)',
      href: '/tools/user-agent-generator',
      cta: 'Open UA Engine',
    },
    {
      num: '03',
      title: 'Monetag Smartlink Optimization',
      category: 'Retention-Safe Triggers',
      description:
        'In-page push and vignette monetization setups structured to capture higher fill rates without disrupting user flow.',
      span: 'lg:col-span-5',
      rgbClass: 'oe-rgb-emerald',
      spotlight: 'rgba(16, 185, 129, 0.16)',
      href: '/resources/proxy-sites',
      cta: 'View Proxy Index',
    },
    {
      num: '04',
      title: 'Zero-Duplicate Admin Pool Engine',
      category: 'Dedicated Isolation',
      description:
        'Every User Agent, Phone Number, Gmail/Mail address, and Lead record pulled from the synced pool is immediately retired so delivered data never repeats across campaigns.',
      span: 'lg:col-span-7',
      rgbClass: 'oe-rgb-cyan',
      spotlight: 'rgba(6, 182, 212, 0.18)',
      href: '/tools',
      cta: 'Inspect Tool Suite',
    },
    {
      num: '05',
      title: '5-Version Parallel Cycling',
      category: 'Browser & Webview Sync',
      description:
        'Combine Chrome, Safari, Edge, or Opera with Facebook, Instagram, TikTok, or WeChat webview versions under language-free Android rules.',
      span: 'lg:col-span-6',
      rgbClass: 'oe-rgb-pink',
      spotlight: 'rgba(236, 72, 153, 0.16)',
      href: '/tools/user-agent-generator',
      cta: 'Configure Versions',
    },
    {
      num: '06',
      title: 'Transparent Credit Packages',
      category: 'bKash · Nagad · Rocket · Binance',
      description:
        'Text Shuffler and Duplicate Remover remain 100% free. Generator pools run on clear per-item credit rates with instant TXT, CSV, and JSON exports.',
      span: 'lg:col-span-6',
      rgbClass: 'oe-rgb-blue',
      spotlight: 'rgba(var(--oe-accent2-rgb), 0.18)',
      href: '/payment',
      cta: 'Compare Plans',
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
      q: 'What is ONLINE EARNING IT?',
      a: 'ONLINE EARNING IT is a modern marketing engineering platform providing media buyers, CPA affiliates, and QA teams with high-throughput utilities (User Agent Generator with dual browser and in-app version control, Lead Generator, Mail Generator with @gmail.com filtering, Phone Number Generator, Text Shuffler, and Duplicate Text Remover) alongside curated network, proxy, and antidetect catalogs.',
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-violet-600 selection:text-white relative overflow-hidden">
      <Navbar />

      {/* Dynamic Theme-Reactive Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <motion.div
          animate={{ x: [0, 32, 0], y: [0, -24, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[10%] left-[10%] w-[680px] h-[680px] bg-gradient-to-tr from-violet-600/18 via-indigo-600/10 to-transparent rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -28, 0], y: [0, 26, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-[36%] -right-[10%] w-[580px] h-[580px] bg-gradient-to-bl from-pink-500/12 via-violet-600/8 to-transparent rounded-full blur-[160px]"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute bottom-[6%] left-[4%] w-[520px] h-[520px] bg-gradient-to-tr from-cyan-500/12 via-emerald-500/8 to-transparent rounded-full blur-[150px]"
        />
      </div>

      {/* ============================================================
          01. HERO SECTION — Editorial Value Prop + Live Sampler
         ============================================================ */}
      <section className="relative z-10 pt-10 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800/70 bg-subtle-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Primary Conversion Action */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: EASE }}
              className="lg:col-span-7 space-y-7 text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start gap-3 text-xs font-semibold text-slate-400">
                <span className="h-px w-8 bg-gradient-to-r from-violet-500 to-cyan-400" />
                <span className="text-violet-300 font-bold tracking-wide">Performance Marketing Suite</span>
                <span aria-hidden="true">·</span>
                <span>Zero-Duplicate Pool Architecture</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-[4.25rem] font-black tracking-tight text-slate-100 leading-[1.05] text-balance">
                <SplitText text="High Performance" delay={0.08} />
                <SplitText
                  text="Marketing Tools"
                  delay={0.34}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 dark:from-violet-400 dark:via-pink-400 dark:to-cyan-300"
                />
                <SplitText text="& Device Engine" delay={0.6} />
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
                className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0"
              >
                {content.heroDescription ||
                  'Precision web toolsets built for CPA affiliates, media buyers, and QA engineers. Generate custom dual-version user agents, extract clean @gmail.com & lead records, and sanitize campaign lists in milliseconds.'}
              </motion.p>

              {/* Action Controls: 1 Dominant Primary CTA + Clean Secondary Actions */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.45, ease: EASE }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1"
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
                  <>
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
                        <span>Create Free Account</span>
                        <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                      </motion.button>
                    </Magnetic>
                    <button
                      onClick={() => {
                        playUiSound('click');
                        navigate('/signin');
                      }}
                      className="btn-premium-glass w-full sm:w-auto px-7 py-4 rounded-2xl text-sm cursor-pointer whitespace-nowrap"
                    >
                      Sign In
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    playUiSound('click');
                    navigate('/tools');
                  }}
                  className="btn-premium-glass w-full sm:w-auto px-6 py-4 rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Compass className="w-4 h-4 text-violet-400" />
                  <span>Explore 6 Tools</span>
                </button>
              </motion.div>

              {/* Clean Unboxed Trust Metadata */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-400 font-medium"
              >
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Dedicated Admin-Fed Pools
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-violet-400" />
                  Instant TXT / CSV / JSON Export
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  Zero-Duplicate Cut Engine
                </span>
              </motion.div>
            </motion.div>

            {/* Right Column: Interactive Live Sampler Studio */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.18, ease: EASE }}
              className="lg:col-span-5 flex justify-center relative"
            >
              <HeroOrbit />
              <TiltCard
                max={4}
                className="oe-panel oe-rgb-violet relative w-full max-w-lg p-6 sm:p-7 rounded-3xl backdrop-blur-2xl space-y-5"
              >
                <div className="absolute -top-8 right-4 w-44 h-44 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Sampler Header */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src="/assets/aistudio/Online_Earning_IT_Logo__e2215d9f_e2215d9f.png"
                      alt="ONLINE EARNING IT"
                      className="w-10 h-10 object-contain drop-shadow-[0_4px_16px_rgba(var(--oe-accent-rgb),0.5)] shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-100 tracking-tight uppercase block truncate">
                        ONLINE EARNING IT
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono block truncate">
                        Interactive Output Preview
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ThemeSwitcher />
                  </div>
                </div>

                {/* Segmented Interactive Mode Switch */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs">
                  {(['ua', 'lead', 'contact'] as const).map(tab => {
                    const label = tab === 'ua' ? 'User Agent' : tab === 'lead' ? 'Lead Sample' : 'Phone & Mail';
                    const isActive = heroTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          playUiSound('click');
                          setHeroTab(tab);
                        }}
                        className={`relative py-2 text-center font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                          isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="hero-sampler-tab"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 shadow-md"
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10">{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Sampler Viewport */}
                <AnimatePresence mode="wait">
                  {heroTab === 'ua' && (
                    <motion.div
                      key="ua"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 gap-2">
                        <span className="font-semibold text-slate-300">Active Signature</span>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              playUiSound('click');
                              setSampleUaDevice('Android');
                              setSampleUaBrowser('Chrome');
                              setSampleUaVersion('124.0.6367.60');
                            }}
                            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] transition-all cursor-pointer flex items-center gap-1 ${
                              sampleUaDevice === 'Android' && sampleUaBrowser === 'Chrome'
                                ? 'bg-violet-600 text-white font-bold shadow-[0_0_12px_rgba(var(--oe-accent-rgb),0.5)]'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-800'
                            }`}
                          >
                            <DeviceIcons.Android className="w-3 h-3" />
                            <span>Android</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playUiSound('click');
                              setSampleUaDevice('Android');
                              setSampleUaBrowser('Facebook');
                              setSampleUaVersion('448.0.0.32.115');
                            }}
                            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] transition-all cursor-pointer flex items-center gap-1 ${
                              sampleUaBrowser === 'Facebook'
                                ? 'bg-indigo-600 text-white font-bold shadow-[0_0_12px_rgba(var(--oe-accent2-rgb),0.5)]'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-800'
                            }`}
                          >
                            <InAppIcons.Facebook className="w-3 h-3" />
                            <span>FB In-App</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playUiSound('click');
                              setSampleUaDevice('iPhone');
                              setSampleUaBrowser('Chrome');
                              setSampleUaVersion('17.4.1');
                            }}
                            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] transition-all cursor-pointer flex items-center gap-1 ${
                              sampleUaDevice === 'iPhone'
                                ? 'bg-pink-600 text-white font-bold shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-800'
                            }`}
                          >
                            <DeviceIcons.iPhone className="w-3 h-3" />
                            <span>iPhone</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/95 font-mono text-xs text-slate-300 leading-relaxed break-all relative shadow-inner">
                        <div className="text-[10px] text-violet-300 font-bold mb-1.5 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5">
                            {sampleUaBrowser === 'Facebook' ? (
                              <InAppIcons.Facebook className="w-3 h-3" />
                            ) : sampleUaBrowser === 'Instagram' ? (
                              <InAppIcons.Instagram className="w-3 h-3" />
                            ) : sampleUaDevice === 'iPhone' ? (
                              <BrowserIcons.Safari className="w-3 h-3" />
                            ) : (
                              <BrowserIcons.Chrome className="w-3 h-3" />
                            )}
                            <span>
                              {sampleUaDevice} · {sampleUaDevice === 'iPhone' && sampleUaBrowser === 'Chrome' ? 'Safari' : sampleUaBrowser} (v{sampleUaVersion})
                            </span>
                          </span>
                          <span className="text-emerald-400 shrink-0">Language-Free</span>
                        </div>
                        <p className="text-slate-200 select-all">{getLiveSampleUA()}</p>
                        <button
                          onClick={() => copyLiveSample(getLiveSampleUA())}
                          className="mt-3 text-xs font-sans font-bold text-violet-300 hover:text-slate-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400">Copied to Clipboard</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy User Agent</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {heroTab === 'lead' && (
                    <motion.div
                      key="lead"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="space-y-3 text-xs"
                    >
                      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/95 space-y-2.5 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Full Name</span>
                          <span className="font-bold text-slate-100">David Miller (Test Lead)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Gender & Target GEO</span>
                          <span className="text-violet-300 font-mono font-semibold">Male · United States</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Gmail Address</span>
                          <span className="font-mono text-slate-200">david.miller.cpa@gmail.com</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Formatted Phone</span>
                          <span className="font-mono text-emerald-400 font-bold tabular-nums">+1 (202) 555-0143</span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          copyLiveSample('David Miller, Male, david.miller.cpa@gmail.com, +1 (202) 555-0143, United States')
                        }
                        className="text-xs font-bold text-violet-300 hover:text-slate-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Formatted Test Lead</span>
                      </button>
                    </motion.div>
                  )}

                  {heroTab === 'contact' && (
                    <motion.div
                      key="contact"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="space-y-3 text-xs"
                    >
                      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/95 space-y-2.5 font-mono text-xs shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-sans">US Mobile</span>
                          <span className="text-cyan-400 font-bold tabular-nums">+1 (312) 555-0198</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-sans">UK Mobile</span>
                          <span className="text-cyan-400 font-bold tabular-nums">+44 7911 123456</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-sans">Gmail Pool Sample</span>
                          <span className="text-pink-400 font-bold">marketer.us.01@gmail.com</span>
                        </div>
                      </div>
                      <button
                        onClick={() => copyLiveSample('+1 (312) 555-0198\n+44 7911 123456\nmarketer.us.01@gmail.com')}
                        className="text-xs font-bold text-violet-300 hover:text-slate-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Numbers & Gmail</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      playUiSound('click');
                      navigate('/tools/user-agent-generator');
                    }}
                    className="btn-premium-vivid w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <span>Open Batch UA Generator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </TiltCard>
            </motion.div>
          </div>

          {/* Full-Width 4-Column Quantitative Proof Row below Hero Split */}
          <StaggerGrid className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            <StaggerItem>
              <SpotlightCard className="oe-panel oe-rgb-violet p-5 rounded-2xl text-center space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-100 font-mono tracking-tight tabular-nums block">
                  <CountUp value="6+" />
                </span>
                <p className="text-xs text-violet-300 font-semibold">Production Web Tools</p>
              </SpotlightCard>
            </StaggerItem>
            <StaggerItem>
              <SpotlightCard
                spotlightColor="rgba(236, 72, 153, 0.16)"
                className="oe-panel oe-rgb-pink p-5 rounded-2xl text-center space-y-1"
              >
                <span className="text-3xl sm:text-4xl font-black text-pink-300 font-mono tracking-tight tabular-nums block">
                  <CountUp value="1,000" />
                </span>
                <p className="text-xs text-pink-300/90 font-semibold">Max Batch Output / Run</p>
              </SpotlightCard>
            </StaggerItem>
            <StaggerItem>
              <SpotlightCard
                spotlightColor="rgba(245, 158, 11, 0.16)"
                className="oe-panel oe-rgb-amber p-5 rounded-2xl text-center space-y-1"
              >
                <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight tabular-nums block">
                  <CountUp value="58" />
                </span>
                <p className="text-xs text-amber-300/90 font-semibold">Supported Global GEOs</p>
              </SpotlightCard>
            </StaggerItem>
            <StaggerItem>
              <SpotlightCard
                spotlightColor="rgba(16, 185, 129, 0.16)"
                className="oe-panel oe-rgb-emerald p-5 rounded-2xl text-center space-y-1"
              >
                <span className="text-3xl sm:text-4xl font-black text-emerald-300 font-mono tracking-tight tabular-nums block">
                  <CountUp value="500+" />
                </span>
                <p className="text-xs text-emerald-300/90 font-semibold">Starter Package Credits</p>
              </SpotlightCard>
            </StaggerItem>
          </StaggerGrid>
        </div>
      </section>

      {/* ============================================================
          02. CLICKABLE TOOL MARQUEE RIBBON
         ============================================================ */}
      <section className="relative z-10 py-6 border-b border-slate-800/70 bg-slate-950/70">
        <Marquee speed={44}>
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
                className="oe-panel oe-panel-hover flex items-center gap-3 pl-2.5 pr-5 py-2 rounded-2xl cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                <RealisticToolIcon slug={t.slug} size="sm" />
                <span className="text-xs font-bold text-slate-100 whitespace-nowrap">{t.name}</span>
                <span className="text-[11px] text-slate-500" aria-hidden="true">·</span>
                <span className={`text-[10px] font-mono font-bold whitespace-nowrap ${isFree ? 'text-emerald-400' : 'text-violet-300'}`}>
                  {isFree ? 'Free' : 'Pool'}
                </span>
              </button>
            );
          })}
        </Marquee>
      </section>

      {/* ============================================================
          03. 3D INTERACTIVE ORBITAL TOOL SHOWCASE
         ============================================================ */}
      <section className="relative z-10 pt-20 pb-12 border-b border-slate-800/70 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-xs font-bold text-violet-300 tracking-wide">
              Interactive 3D Ring · Click Any Tool to Launch
            </p>
            <h2 data-rw className="font-display text-3xl sm:text-5xl font-black text-slate-100 tracking-tight text-balance">
              <RevealWords text="Six Tools. One Unified Studio." />
            </h2>
            <p className="text-sm text-slate-400">
              Sweep your cursor left or right to steer the orbital ring. Two core utilities remain 100% free forever.
            </p>
          </div>
          <ToolCarousel3D
            tools={tools}
            onOpen={slug => {
              playUiSound('click');
              navigate(`/tools/${slug}`);
            }}
          />
        </div>
      </section>

      {/* ============================================================
          04. ASYMMETRIC BENTO CAPABILITIES (01–06)
         ============================================================ */}
      <section id="services" className="relative z-10 py-24 border-b border-slate-800/70 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <p className="text-xs font-bold text-violet-300 tracking-wide">
                Core Capabilities · Editorial Matrix
              </p>
              <h2 data-rw className="font-display text-3xl sm:text-5xl font-black text-slate-100 tracking-tight text-balance">
                <RevealWords text="Built for High-Throughput Campaigns" />
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              Strategic traffic acquisition models paired with strict pool isolation and instant multi-format exports.
            </p>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            {bentoCapabilities.map(item => (
              <StaggerItem key={item.num} className={item.span}>
                <SpotlightCard
                  spotlightColor={item.spotlight}
                  onClick={() => {
                    playUiSound('click');
                    navigate(item.href);
                  }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className={`oe-panel oe-panel-hover ${item.rgbClass} h-full p-7 rounded-3xl cursor-pointer`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span className="font-mono font-bold text-violet-300">
                        {item.num}. <span className="text-slate-400 font-sans font-medium ml-1">{item.category}</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover/spot:text-violet-300 group-hover/spot:translate-x-0.5 group-hover/spot:-translate-y-0.5 transition-all" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 group-hover/spot:text-violet-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="pt-5 mt-5 border-t border-slate-800/70 flex items-center justify-between text-xs font-semibold text-violet-300">
                    <span>{item.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/spot:translate-x-1 transition-transform" />
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ============================================================
          05. SCROLL-PARALLAX COMMAND WORKBENCH SHOWCASE
         ============================================================ */}
      <section className="relative z-10 py-20 border-b border-slate-800/70 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="oe-panel oe-rgb-violet rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch overflow-hidden relative">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-violet-300 tracking-wide">
                  Command Workbench · Live Architecture
                </p>
                <h2 className="font-display text-2xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight text-balance">
                  Precision Filtering with Zero Pool Overlap
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {content.aboutText ||
                    'ONLINE EARNING IT eliminates manual data cleanup for performance marketers. Combine dual browser and in-app webview signatures, filter @gmail.com and regional lead pools, and export verified batches with zero repetition.'}
                </p>
              </div>

              <div className="divide-y divide-slate-800/80 border-y border-slate-800/80">
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-100">Permanent Pool Cut Engine</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">100% Unique Delivery</span>
                </div>
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-100">5-Version Matrix Cycling</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Parallel Browser & In-App</span>
                </div>
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-100">Multi-Domain & GEO Filtering</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">@gmail.com · 58 Countries</span>
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
                  <span>{isAuthenticated ? 'Open Studio Dashboard' : 'Start Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    playUiSound('click');
                    navigate('/resources');
                  }}
                  className="btn-premium-glass px-5 py-3 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Globe2 className="w-4 h-4 text-cyan-400" />
                  <span>Explore Resources</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="rounded-2xl overflow-hidden border border-violet-500/30 shadow-[0_24px_60px_-20px_rgba(var(--oe-accent-rgb),0.45)] relative w-full min-h-[280px] lg:h-full">
                <ScrollParallaxMedia className="w-full h-full">
                  <img
                    src={heroPreviewImg}
                    alt="ONLINE EARNING IT Marketing Command Studio"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </ScrollParallaxMedia>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[11px]">
                  <span className="font-mono text-white font-semibold">Live Credit & Pool Console</span>
                  <span className="text-emerald-400 font-bold">Realtime Supabase Sync</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          06. FILTERABLE PRODUCTION TOOLS MATRIX
         ============================================================ */}
      <section id="tools-showcase" className="relative z-10 py-24 border-b border-slate-800/70 bg-slate-900/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-violet-300 tracking-wide">
                Production Suite · 6 Interactive Tools
              </p>
              <h2 data-rw className="font-display text-3xl sm:text-5xl font-black text-slate-100 tracking-tight text-balance">
                <RevealWords text="Available Marketing Tools" />
              </h2>
              <p className="text-sm text-slate-400">
                Filter between pool-synced generators and instant free text normalization utilities.
              </p>
            </div>

            {/* Interactive Segmented Filter Control */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs">
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
                      className={`relative px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        active ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="tools-filter-pill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow"
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
                className="btn-premium-glass text-xs font-bold text-violet-200 flex items-center gap-2 cursor-pointer py-2.5 px-4 rounded-xl whitespace-nowrap shrink-0"
              >
                <span>All Directory</span>
                <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
              </button>
            </div>
          </Reveal>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTools.map(tool => {
                const isFree = tool.slug === 'text-shuffler' || tool.slug === 'duplicate-text-remover';
                return (
                  <motion.div
                    layout
                    key={tool.id}
                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <TiltCard max={6} className="h-full">
                      <SpotlightCard className="oe-panel oe-panel-hover h-full p-7 rounded-3xl">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <RealisticToolIcon slug={tool.slug} size="lg" />
                            <div className="text-right text-[11px] font-mono">
                              <span className={isFree ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
                                {isFree ? '100% Free' : 'Pool Synced'}
                              </span>
                              <span className="block text-slate-500 text-[10px]">{tool.category}</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-100 group-hover/spot:text-violet-300 transition-colors">
                              {tool.name}
                            </h3>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{tool.description}</p>
                        </div>

                        <div className="pt-6">
                          <button
                            onClick={() => {
                              playUiSound('click');
                              navigate(`/tools/${tool.slug}`);
                            }}
                            className="btn-premium-primary w-full py-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                          >
                            <span>Launch Tool</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover/spot:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </SpotlightCard>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          07. MEMBERSHIP CREDIT PACKAGES
         ============================================================ */}
      <section id="pricing-section" className="relative z-10 py-24 border-b border-slate-800/70 bg-slate-950">
        <div id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <Reveal className="text-center space-y-3">
            <p className="text-xs font-bold text-violet-300 tracking-wide">
              Tool Credit Packages · Instant Activation
            </p>
            <h2 data-rw className="font-display text-3xl sm:text-5xl font-black text-slate-100 tracking-tight text-balance">
              <RevealWords text="Membership Credit Packages" />
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Unlock User Agent (1 Cr), Number (2 Cr), Mail (3 Cr), and Lead (5 Cr) pools via bKash, Nagad, Rocket, or Binance. Text Shuffler & Duplicate Remover remain free.
            </p>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipPlans.map(plan => (
              <StaggerItem key={plan.name}>
                <SpotlightCard
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className={`oe-panel h-full p-7 rounded-3xl relative transition-all ${
                    plan.popular
                      ? 'oe-rgb-violet ring-1 ring-violet-500/60 bg-violet-500/5 dark:bg-gradient-to-b dark:from-violet-950/50 dark:via-slate-900/95 dark:to-slate-950'
                      : 'oe-panel-hover'
                  }`}
                >
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono mb-1">
                          <span className="text-amber-400 font-bold tabular-nums">
                            {plan.credits.toLocaleString()} Credits
                          </span>
                          {plan.popular && (
                            <>
                              <span aria-hidden="true" className="text-slate-600">·</span>
                              <span className="text-violet-300 font-bold">Most Popular</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-100">{plan.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between">
                      <div>
                        <span className="text-4xl font-black text-slate-100 font-mono tabular-nums">
                          {plan.price}
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5 font-medium">{plan.period}</span>
                      </div>
                      <span className="text-sm font-bold text-amber-500 dark:text-amber-400 font-mono tabular-nums">
                        {plan.usdt}
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-7">
                    <button
                      onClick={() => {
                        playUiSound('click');
                        navigate(isAuthenticated ? `/payment?pkg=${plan.id}` : '/signup');
                      }}
                      className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        plan.popular ? 'btn-premium-vivid' : 'btn-premium-glass'
                      }`}
                    >
                      Select {plan.name}
                    </button>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ============================================================
          08. FAQ KNOWLEDGE BASE
         ============================================================ */}
      <section className="relative z-10 py-24 border-b border-slate-800/70 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <Reveal className="text-center space-y-3">
            <p className="text-xs font-bold text-violet-300 tracking-wide">
              Knowledge Base · Clear Operations
            </p>
            <h2 data-rw className="font-display text-3xl sm:text-5xl font-black text-slate-100 tracking-tight text-balance">
              <RevealWords text="Frequently Asked Questions" />
            </h2>
            <p className="text-sm text-slate-400">
              Platform workflows, generator pool cutting, @gmail.com filtering, and credit activation.
            </p>
          </Reveal>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className={`oe-panel rounded-2xl overflow-hidden transition-all ${
                    isOpen ? 'oe-rgb-violet' : 'hover:border-violet-500/30'
                  }`}
                >
                  <button
                    onClick={() => {
                      playUiSound('click');
                      setOpenFaq(isOpen ? null : idx);
                    }}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-slate-100 hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-mono text-violet-400">0{idx + 1}.</span>
                      <span>{faq.q}</span>
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="shrink-0 text-violet-400"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                      >
                        <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/70">
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
      </section>

      {/* ============================================================
          09. INTERACTIVE LEAD & INQUIRY STUDIO
         ============================================================ */}
      <section id="contact-section" className="relative z-10 py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal className="space-y-6">
              <div>
                <p className="text-xs font-bold text-violet-300 tracking-wide">
                  Direct Inquiries · Dedicated Support
                </p>
                <h2 data-rw className="font-display text-3xl sm:text-5xl font-black text-slate-100 tracking-tight mt-2 text-balance">
                  <RevealWords text="Connect with the Team" />
                </h2>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  Questions about tool pools, bulk @gmail.com data uploads, CPA workflows, or enterprise packages? Send an inquiry directly to our desk.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <SpotlightCard className="oe-panel oe-rgb-violet p-5 rounded-2xl">
                  <div className="flex items-center gap-3.5">
                    <Mail className="w-5 h-5 text-violet-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-slate-400 font-semibold">Email Address</span>
                      <span className="text-slate-100 font-medium">{content.contactEmail}</span>
                    </div>
                  </div>
                </SpotlightCard>

                <SpotlightCard
                  spotlightColor="rgba(16, 185, 129, 0.16)"
                  className="oe-panel oe-rgb-emerald p-5 rounded-2xl"
                >
                  <div className="flex items-center gap-3.5">
                    <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-slate-400 font-semibold">Phone Support</span>
                      <span className="text-slate-100 font-medium font-mono tabular-nums">{content.contactPhone}</span>
                    </div>
                  </div>
                </SpotlightCard>

                <SpotlightCard
                  spotlightColor="rgba(6, 182, 212, 0.16)"
                  className="oe-panel oe-rgb-cyan p-5 rounded-2xl"
                >
                  <div className="flex items-center gap-3.5">
                    <Send className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-slate-400 font-semibold">Telegram Official Channel</span>
                      <a
                        href={content.socialLinks?.telegram || 'https://t.me/OnlineEarningIT'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>{content.contactTelegram}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </SpotlightCard>
              </div>
            </Reveal>

            {/* Contact Form */}
            <Reveal delay={0.12}>
              <SpotlightCard className="oe-panel oe-rgb-violet p-7 sm:p-9 rounded-3xl">
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-slate-100">Send an Instant Message</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
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
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Message</label>
                      <textarea
                        rows={4}
                        required
                        value={contactMsg}
                        onChange={e => setContactMsg(e.target.value)}
                        placeholder="Describe your inquiry, project scope, or feedback..."
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
              </SpotlightCard>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
