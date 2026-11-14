import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { db } from '../services/db';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  ChevronDown,
  Layers,
  Send,
  MessageSquare,
  Sparkles,
  Copy,
  Globe2,
  Cpu,
  BarChart3,
  ExternalLink,
  CheckCircle2,
  Terminal,
  Activity,
  Compass,
  Database,
  Mail,
  PhoneCall,
} from 'lucide-react';
import { RealisticToolIcon } from '../components/ui/RealisticIcon';
import { DeviceIcons, BrowserIcons, InAppIcons } from '../components/ui/BrandIcons';
import { motion, AnimatePresence } from 'motion/react';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const content = db.getWebsiteContent();
  const tools = db.getTools();

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Live Hero Preview Widget State
  const [heroTab, setHeroTab] = useState<'ua' | 'lead' | 'contact'>('ua');
  const [sampleUaDevice, setSampleUaDevice] = useState<'Android' | 'iPhone' | 'Windows'>('Android');
  const [sampleUaBrowser, setSampleUaBrowser] = useState<'Chrome' | 'Facebook' | 'Instagram'>('Chrome');
  const [sampleUaVersion, setSampleUaVersion] = useState<string>('124.0.6367.60');
  const [isCopied, setIsCopied] = useState(false);

  // Computed live sample
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
    setIsCopied(true);
    showToast('Copied string to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const services = [
    {
      num: '01',
      title: 'CPA Marketing',
      description: 'Battle-tested affiliate frameworks, conversion funnels, pre-landing architectures, and high-ROI traffic routing models for global campaigns.',
      badge: 'High Yield',
      accent: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/30',
    },
    {
      num: '02',
      title: 'Adsterra Methods',
      description: 'Specialized direct-link scaling, social traffic arbitrage strategies, anti-bot filtering, and verified CPM maximization tactics.',
      badge: 'Arbitrage',
      accent: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/30',
    },
    {
      num: '03',
      title: 'Monetag Methods',
      description: 'In-page push, smartlink triggers, and vignette monetization setups designed to maximize yields without hurting user retention.',
      badge: 'Smartlinks',
      accent: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/30',
    },
    {
      num: '04',
      title: 'Pro Marketing Tools',
      description: 'Enterprise-grade user agent generators, clean lead test pools, text normalizers, and formatting utilities powered by affordable credit packages.',
      badge: 'Credit Powered',
      accent: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/30',
    },
    {
      num: '05',
      title: 'CPA Account Buy & Sell',
      description: 'Informational marketplace guidance for verified advertiser accounts, network approvals, and seamless onboarding transitions.',
      badge: 'Account Hub',
      accent: 'from-cyan-500/20 to-cyan-600/5',
      border: 'border-cyan-500/30',
    },
  ];

  const packages = db.getPaymentPackages();
  const membershipPlans = packages.map((pkg, idx) => ({
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
      a: 'ONLINE EARNING IT is a comprehensive, modern platform providing digital marketers, media buyers, and developers with high-yield web tools (such as User Agent Generator with custom browser & in-app version control, Lead Generator, Text Shuffler, Duplicate Remover, and Number/Mail utilities) alongside curated catalogs of CPA networks, proxy providers, and antidetect browsers.',
    },
    {
      q: 'How does the Package & Credit System work?',
      a: 'Text Shuffler and Duplicate Text Remover are 100% Free. Generator tools require an active approved package and credits: User Agent (1 Credit), Number Generator (2 Credits), Mail Generator (3 Credits), and Lead Generator (5 Credits). Choose Starter Pass (500 Credits), Pro Marketer (1,500 Credits), or Agency Lifetime (10,000 Credits), submit your payment via bKash, Nagad, Rocket, or Binance, and start generating immediately once approved.',
    },
    {
      q: 'Can I customize both Browser and In-App Webview versions?',
      a: 'Yes. Our User Agent Generator allows you to choose both a Web Browser (Chrome, Firefox, Safari, Edge, Opera) and an In-App Webview (Facebook, Facebook Lite, Instagram, TikTok, Twitter, LinkedIn, Snapchat) simultaneously, entering exact version numbers or selecting from our verified presets.',
    },
    {
      q: 'How does the Android language-free rule work?',
      a: 'In accordance with modern mobile traffic arbitrage standards, all Android user agents generated by our system are strictly language-free. No language or locale tags (such as en_US or FBLC/en_US) are attached to Android signatures, ensuring complete compatibility with clean GEO routing.',
    },
    {
      q: 'How does exclusive database matching work?',
      a: 'When an administrator adds verified User Agent, Lead, Number, or Mail records to the database pool, the generator automatically matches your device, browser, and country filters. Each generated pool entry is flagged as used and exclusively assigned to your account, preventing duplicate delivery across users.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingContact(true);
    setTimeout(() => {
      setSubmittingContact(false);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
      showToast('Thank you! Your message has been sent successfully.', 'success');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      <Navbar />

      {/* Dynamic Aurora Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] left-[15%] w-[650px] h-[650px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-[140px] animate-aurora" />
        <div className="absolute top-[40%] -right-[10%] w-[550px] h-[550px] bg-gradient-to-bl from-amber-500/10 via-rose-500/5 to-transparent rounded-full blur-[160px] animate-aurora delay-1000" />
        <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-[150px] animate-aurora delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-20 lg:pt-24 lg:pb-32 border-b border-white/5 bg-subtle-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-7 text-center lg:text-left"
            >
              {/* Top Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-950/80 to-slate-900/80 backdrop-blur-md shadow-lg shadow-blue-950/40">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">
                  ONLINE EARNING IT · Performance Toolset
                </span>
              </div>

              {/* Refined Display Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] text-balance">
                High Performance{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
                  Marketing Tools
                </span>{' '}
                & Device Engine
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {content.heroDescription ||
                  'Professional web toolsets engineered for CPA affiliates, media buyers, and traffic arbiters. Generate precision user agents with dual version control, test leads, and clean marketing data in milliseconds.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                {isAuthenticated ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <span>Launch User Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/signup')}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
                    >
                      <span>Create Account</span>
                      <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                    </motion.button>
                    <button
                      onClick={() => navigate('/signin')}
                      className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-white/10 hover:border-white/20 bg-slate-900/60 hover:bg-slate-900 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate('/tools')}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-white/5 hover:border-blue-500/40 bg-slate-950/60 hover:bg-slate-900 text-slate-300 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-blue-400" />
                  <span>Explore 6 Tools</span>
                </button>
              </div>

              {/* Clean Trust Proof Metadata */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Package Credit System
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  Instant TXT / CSV Export
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  Targeted Tier-1 GEO Pools
                </span>
              </div>
            </motion.div>

            {/* Right Column: Holographic Interactive Live Studio */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 shadow-2xl backdrop-blur-2xl space-y-5">
                {/* Ambient glow inside card */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Header with Emblem & Active Radar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/aistudio/Online_Earning_IT_Logo__e2215d9f_e2215d9f.png"
                      alt="ONLINE EARNING IT"
                      className="w-11 h-11 object-contain drop-shadow-[0_4px_16px_rgba(37,99,235,0.4)]"
                    />
                    <div>
                      <span className="text-xs font-black text-white tracking-tight uppercase block">
                        ONLINE EARNING IT
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span>Interactive Sampler</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2.5 py-1 rounded-full font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live Output
                  </span>
                </div>

                {/* Segmented Mode Picker */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-white/5 text-xs">
                  {(['ua', 'lead', 'contact'] as const).map(tab => {
                    const label = tab === 'ua' ? 'User Agent' : tab === 'lead' ? 'Lead Sample' : 'Phone & Mail';
                    const isActive = heroTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setHeroTab(tab)}
                        className={`relative py-2 text-center font-bold rounded-xl transition-all cursor-pointer ${
                          isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="hero-sampler-tab"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Sampler Display Area */}
                <AnimatePresence mode="wait">
                  {heroTab === 'ua' && (
                    <motion.div
                      key="ua"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {/* Configuration Chips */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Active Signature:</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSampleUaDevice('Android');
                              setSampleUaBrowser('Chrome');
                              setSampleUaVersion('124.0.6367.60');
                            }}
                            className={`px-2 py-0.5 rounded-lg font-mono text-[10px] transition-colors cursor-pointer ${
                              sampleUaDevice === 'Android' && sampleUaBrowser === 'Chrome'
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Android
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSampleUaDevice('Android');
                              setSampleUaBrowser('Facebook');
                              setSampleUaVersion('448.0.0.32.115');
                            }}
                            className={`px-2 py-0.5 rounded-lg font-mono text-[10px] transition-colors cursor-pointer ${
                              sampleUaBrowser === 'Facebook'
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            FB In-App
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSampleUaDevice('iPhone');
                              setSampleUaBrowser('Chrome');
                              setSampleUaVersion('17.4.1');
                            }}
                            className={`px-2 py-0.5 rounded-lg font-mono text-[10px] transition-colors cursor-pointer ${
                              sampleUaDevice === 'iPhone'
                                ? 'bg-amber-600 text-white font-bold'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            iPhone
                          </button>
                        </div>
                      </div>

                      {/* Code Block Box */}
                      <div className="p-4 rounded-2xl border border-white/10 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed break-all relative group shadow-inner">
                        <div className="text-[10px] text-blue-400 font-bold uppercase mb-1 flex items-center justify-between">
                          <span>{sampleUaDevice} · {sampleUaBrowser} (v{sampleUaVersion})</span>
                          <span className="text-emerald-400">Verified Syntax</span>
                        </div>
                        <p className="text-slate-200 select-all">{getLiveSampleUA()}</p>
                        <button
                          onClick={() => copyLiveSample(getLiveSampleUA())}
                          className="mt-3 text-xs font-sans font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400">Copied to Clipboard!</span>
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 text-xs"
                    >
                      <div className="p-4 rounded-2xl border border-white/10 bg-slate-950 space-y-2.5 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Full Name:</span>
                          <span className="font-bold text-white">David Miller (Test Lead)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Gender & Target GEO:</span>
                          <span className="text-blue-400 font-mono font-semibold">Male · United States</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Simulated Gmail:</span>
                          <span className="font-mono text-slate-200">david.miller.cpa@gmail.com</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Formatted Phone:</span>
                          <span className="font-mono text-emerald-400 font-bold">+1 (202) 555-0143</span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          copyLiveSample('David Miller, Male, david.miller.cpa@gmail.com, +1 (202) 555-0143, United States')
                        }
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Formatted Test Lead</span>
                      </button>
                    </motion.div>
                  )}

                  {heroTab === 'contact' && (
                    <motion.div
                      key="contact"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 text-xs"
                    >
                      <div className="p-4 rounded-2xl border border-white/10 bg-slate-950 space-y-2.5 font-mono text-xs shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-sans">US Mobile:</span>
                          <span className="text-cyan-400 font-bold">+1 (312) 555-0198</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-sans">UK Mobile:</span>
                          <span className="text-cyan-400 font-bold">+44 7911 123456</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-sans">Test Mail:</span>
                          <span className="text-purple-400 font-bold">marketer.us.01@example.com</span>
                        </div>
                      </div>
                      <button
                        onClick={() => copyLiveSample('+1 (312) 555-0198\n+44 7911 123456\nmarketer.us.01@example.com')}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Test Numbers & Email</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Direct Action Link */}
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/tools/user-agent-generator')}
                    className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Launch 1,000 UA Batch Generator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Holographic Telemetry & Metrics Ribbon */}
      <section className="relative z-10 py-10 border-b border-white/5 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="p-4 rounded-2xl border border-white/5 bg-slate-950/60 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">6+</span>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Enterprise Tools</p>
            </div>
            <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-950/20 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-blue-400 font-mono tracking-tight">1,000</span>
              <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Max Batch Limit</p>
            </div>
            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-950/20 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">10</span>
              <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Global Tier-1 GEOs</p>
            </div>
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">500+</span>
              <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Starter Package Credits</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative z-10 py-24 border-b border-white/5 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            About ONLINE EARNING IT
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {content.aboutTitle || 'Empowering Modern Media Buyers & Arbitrageurs'}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {content.aboutText ||
              'ONLINE EARNING IT was built to eliminate the tedious technical roadblocks faced by performance marketers. From client signatures and lead simulation to text normalization and proxy research, our infrastructure gives you the competitive edge.'}
          </p>
        </div>
      </section>

      {/* Our Services Section (Modern Bento Layout) */}
      <section id="services" className="relative z-10 py-24 border-b border-white/5 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Our Professional Services
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Strategic execution models and specialized toolsets tailored for modern digital media campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, idx) => (
              <motion.div
                key={s.title}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ duration: 0.2 }}
                className={`p-7 rounded-3xl border ${s.border} bg-gradient-to-br ${s.accent} bg-slate-900/80 shadow-xl space-y-4 relative group`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-black text-slate-500 group-hover:text-blue-400 transition-colors">
                    {s.num}
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-mono font-bold bg-white/10 text-white border border-white/10">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Tools Grid Section */}
      <section className="relative z-10 py-24 border-b border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                Production Suite
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Available Marketing Tools
              </h2>
              <p className="text-sm text-slate-400">
                High-utility credit-powered processors unlocked with an active package for verified batch generation.
              </p>
            </div>
            <button
              onClick={() => navigate('/tools')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors cursor-pointer py-2 px-4 rounded-xl border border-blue-500/30 bg-blue-500/10"
            >
              <span>Explore All 6 Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => (
              <motion.div
                key={tool.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="p-7 rounded-3xl border border-white/10 bg-slate-900/80 hover:border-blue-500/50 hover:bg-slate-900 transition-all shadow-xl flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <RealisticToolIcon slug={tool.slug} size="lg" />
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Ready</span>
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[11px] text-blue-400 uppercase tracking-wider font-bold mt-0.5">
                      {tool.category}
                    </p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{tool.description}</p>
                </div>

                <button
                  onClick={() => navigate(`/tools/${tool.slug}`)}
                  className="w-full py-3 text-xs font-bold rounded-2xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:shadow-blue-600/30"
                >
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative z-10 py-24 border-b border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              Performance Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Why Choose ONLINE EARNING IT
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Engineered by experienced media buyers who understand the demands of high-throughput traffic arbitrage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl border border-white/10 bg-slate-900/70 space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-md">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Data Processing</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate up to 1,000 user agents, deduplicate 50,000 text lines, or synthesize test leads in under 200 milliseconds.
              </p>
            </div>

            <div className="p-7 rounded-3xl border border-white/10 bg-slate-900/70 space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Exclusive Database Matching</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our master database pool marks consumed entries as used per user account, ensuring zero duplication across campaigns.
              </p>
            </div>

            <div className="p-7 rounded-3xl border border-white/10 bg-slate-900/70 space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Package & Credit Control</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Activate Starter, Pro, or Agency credit packages via bKash, Nagad, Rocket, or Binance with transparent per-item credit tracking.
              </p>
            </div>

            <div className="p-7 rounded-3xl border border-white/10 bg-slate-900/70 space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-md">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Dual Custom Versioning</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Select both a Web Browser and an In-App Webview simultaneously with full custom version numbers and verified presets.
              </p>
            </div>

            <div className="p-7 rounded-3xl border border-white/10 bg-slate-900/70 space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-md">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Android Language-Free Rules</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Strict adherence to language-free Android specifications so your signatures blend seamlessly across all mobile networks.
              </p>
            </div>

            <div className="p-7 rounded-3xl border border-white/10 bg-slate-900/70 space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-md">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Curated Resources Catalogs</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Browse hand-picked CPA networks, reliable residential/mobile proxy providers, and top antidetect browser solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section id="plans" className="relative z-10 py-24 border-b border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              Tool Credit Packages
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Membership Credit Packages
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Choose a credit package to unlock User Agent (1 Cr), Number (2 Cr), Mail (3 Cr), and Lead (5 Cr) generators via bKash, Nagad, Rocket, or Binance. Text Shuffler & Duplicate Remover are free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipPlans.map(plan => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
                className={`p-7 rounded-3xl border flex flex-col justify-between relative transition-all shadow-xl ${
                  plan.popular
                    ? 'border-blue-500/80 bg-gradient-to-b from-blue-950/60 via-slate-900/90 to-slate-950 shadow-2xl shadow-blue-950/50 ring-1 ring-blue-500/60'
                    : 'border-white/10 bg-slate-900/70 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
                    Recommended Choice
                  </div>
                )}
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
                      {plan.credits.toLocaleString()} Credits
                    </span>
                  </div>
                  <div className="pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-4xl font-black text-white font-mono tabular-nums">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5 font-medium">{plan.period}</span>
                    </div>
                    <span className="text-sm font-bold text-amber-400 font-mono">{plan.usdt}</span>
                  </div>
                  <div className="space-y-2.5 pt-4 border-t border-white/10">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-7">
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate('/payment');
                      } else {
                        navigate('/signup');
                      }
                    }}
                    className={`w-full py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    Select {plan.name} Package
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with Smooth AnimatePresence Accordion */}
      <section className="relative z-10 py-24 border-b border-white/5 bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              Knowledge Base
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400">
              Clear answers regarding platform operations, generator data, and resources.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="border border-white/10 rounded-2xl bg-slate-900/80 overflow-hidden transition-colors hover:border-slate-700"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-slate-400"
                    >
                      <ChevronDown className="w-4 h-4 text-blue-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5">
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

      {/* Contact Section */}
      <section className="relative z-10 py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  Direct Inquiries
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
                  Connect with the Team
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Have questions about our tools, custom CPA arbitrage setups, or enterprise data feeds? Drop us a message or contact our official channels.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3.5 p-5 rounded-2xl border border-white/10 bg-slate-900/60">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Email Address</span>
                    <span className="text-white font-medium">{content.contactEmail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-5 rounded-2xl border border-white/10 bg-slate-900/60">
                  <PhoneCall className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Phone Support</span>
                    <span className="text-white font-medium">{content.contactPhone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-5 rounded-2xl border border-white/10 bg-slate-900/60">
                  <Send className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Telegram Official Channel</span>
                    <a
                      href={content.socialLinks?.telegram || 'https://t.me/OnlineEarningIT'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{content.contactTelegram}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-7 sm:p-9 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 shadow-2xl space-y-5">
              <h3 className="text-lg font-bold text-white">Send an Instant Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingContact}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{submittingContact ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
