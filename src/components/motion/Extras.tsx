import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { RealisticToolIcon } from '../ui/RealisticIcon';

const LOGO = '/assets/aistudio/photo_2026-11-23_12-53-09_1226b515.jpg';
const EASE = [0.16, 1, 0.3, 1] as const;

/** Cinematic first-visit intro: logo ignites, wordmark rises, screen wipes open. */
export const IntroSplash: React.FC = () => {
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem('oe_intro_seen');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!show) return;
    try {
      sessionStorage.setItem('oe_intro_seen', '1');
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => setShow(false), 1900);
    return () => window.clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950"
          initial={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ clipPath: 'circle(0% at 50% 50%)', transition: { duration: 0.9, ease: EASE } }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.28),transparent_58%)]" />
          <motion.div
            className="relative w-28 h-28"
            initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <div className="oe-splash-ring" />
            <img src={LOGO} alt="Online Learning Pro" className="relative w-full h-full object-cover rounded-2xl border border-amber-400/30 shadow-2xl" />
          </motion.div>
          <div className="relative mt-7 overflow-hidden text-center">
            <motion.p
              className="font-display font-black tracking-[0.24em] text-sm sm:text-base uppercase"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            >
              <span className="oe-text-gold">ONLINE</span>{' '}
              <span className="oe-text-sapphire">LEARNING</span>{' '}
              <span className="oe-text-gold">PRO</span>
            </motion.p>
            <motion.div
              className="mt-2 flex items-center justify-center gap-2.5 text-[10px] font-bold tracking-[0.28em] text-slate-300 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <span className="oe-gold-spear-left w-8" />
              <span>LEARN</span>
              <span className="text-blue-400">•</span>
              <span>GROW</span>
              <span className="text-blue-400">•</span>
              <span>ACHIEVE</span>
              <span className="oe-gold-spear-right w-8" />
            </motion.div>
          </div>
          <div className="relative mt-6 h-[2px] w-44 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-amber-400"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Floating back-to-top button with a scroll-progress ring */
export const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const dash = useTransform(progress, v => v);

  useEffect(() => {
    const on = () => setVisible(window.scrollY > 700);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          className="fixed bottom-5 left-5 z-[55] w-12 h-12 rounded-full bg-slate-900/85 backdrop-blur-xl border border-slate-800 flex items-center justify-center text-slate-100 cursor-pointer shadow-[0_12px_32px_-10px_var(--oe-glow)]"
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="2" />
            <motion.circle
              cx="24"
              cy="24"
              r="21"
              fill="none"
              stroke="var(--color-blue-400)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength: dash }}
            />
          </svg>
          <ArrowUp className="w-4 h-4 relative" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const ORBIT: Array<{ slug: string; pos: string; size: 'md' | 'lg'; dur: number; amp: number; delay: number }> = [
  { slug: 'text-shuffler', pos: '-left-14 top-2', size: 'lg', dur: 6.5, amp: 14, delay: 0 },
  { slug: 'user-agent-generator', pos: '-right-12 top-16', size: 'md', dur: 7.5, amp: 12, delay: 0.8 },
  { slug: 'lead-generator', pos: '-left-16 top-[46%]', size: 'md', dur: 8, amp: 16, delay: 0.4 },
  { slug: 'mail-generator', pos: '-right-16 top-[58%]', size: 'lg', dur: 6, amp: 13, delay: 1.2 },
  { slug: 'duplicate-text-remover', pos: '-left-10 bottom-6', size: 'lg', dur: 7, amp: 15, delay: 0.6 },
  { slug: 'number-generator', pos: '-right-10 -bottom-4', size: 'md', dur: 8.5, amp: 11, delay: 1.5 },
];

const LOGO_PIXELS = [
  { pos: '-left-8 top-12 w-3.5 h-3.5', tone: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.75)]', dur: 4.5 },
  { pos: '-left-14 top-24 w-2.5 h-2.5', tone: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.75)]', dur: 5.2 },
  { pos: '-left-5 top-36 w-2 h-2', tone: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.75)]', dur: 3.9 },
  { pos: '-right-7 bottom-24 w-3.5 h-3.5', tone: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.75)]', dur: 4.8 },
  { pos: '-right-12 bottom-36 w-2.5 h-2.5', tone: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.75)]', dur: 5.6 },
];

/** Real 3D tool icons, golden orbital arc, & digital pixels floating around hero card */
export const HeroOrbit: React.FC = () => {
  const { scrollY } = useScroll();
  const shift = useTransform(scrollY, [0, 700], [0, -70]);
  return (
    <motion.div style={{ y: shift }} className="absolute inset-0 pointer-events-none hidden xl:block" aria-hidden="true">
      {/* Tilted Golden Orbital Ring behind showcase */}
      <svg
        viewBox="0 0 560 560"
        className="absolute -inset-12 w-[calc(100%+6rem)] h-[calc(100%+6rem)] opacity-55"
        fill="none"
      >
        <defs>
          <linearGradient id="olpGoldOrbit" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" stopOpacity="0.15" />
            <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <ellipse
          cx="280"
          cy="280"
          rx="252"
          ry="112"
          transform="rotate(-24 280 280)"
          stroke="url(#olpGoldOrbit)"
          strokeWidth="2.5"
        />
      </svg>

      {/* Dispersing Sapphire & Gold Square Pixels matching the logo */}
      {LOGO_PIXELS.map((px, i) => (
        <motion.span
          key={i}
          className={`absolute ${px.pos} rounded-[3px] z-20 ${px.tone}`}
          animate={{ y: [0, -10, 0], opacity: [0.65, 1, 0.65] }}
          transition={{ duration: px.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
        />
      ))}

      {ORBIT.map(o => (
        <motion.div
          key={o.slug}
          className={`absolute ${o.pos} z-20`}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1, y: [0, -o.amp, 0], rotate: [-3, 3, -3] }}
          transition={{
            opacity: { duration: 0.8, delay: 0.9 + o.delay * 0.3 },
            scale: { type: 'spring', stiffness: 160, damping: 14, delay: 0.9 + o.delay * 0.3 },
            y: { duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.delay },
            rotate: { duration: o.dur * 1.2, repeat: Infinity, ease: 'easeInOut', delay: o.delay },
          }}
        >
          <RealisticToolIcon slug={o.slug} size={o.size} />
        </motion.div>
      ))}
    </motion.div>
  );
};

const AUTH_ICONS: Array<{ slug: string; cls: string; dur: number; delay: number }> = [
  { slug: 'text-shuffler', cls: 'left-[6%] top-[14%]', dur: 7, delay: 0 },
  { slug: 'user-agent-generator', cls: 'left-[14%] top-[58%]', dur: 8, delay: 0.7 },
  { slug: 'lead-generator', cls: 'left-[4%] bottom-[8%]', dur: 6.5, delay: 1.2 },
  { slug: 'mail-generator', cls: 'right-[6%] top-[12%]', dur: 7.5, delay: 0.4 },
  { slug: 'duplicate-text-remover', cls: 'right-[13%] top-[52%]', dur: 6, delay: 1 },
  { slug: 'number-generator', cls: 'right-[5%] bottom-[9%]', dur: 8.5, delay: 0.2 },
];

/** Decorative real-icon scene behind the sign in / sign up card (large screens) */
export const AuthBackdrop: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden hidden lg:block" aria-hidden="true">
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[46rem] h-[46rem] rounded-full bg-blue-500/10 blur-3xl" />
    {AUTH_ICONS.map(o => (
      <motion.div
        key={o.slug}
        className={`absolute ${o.cls}`}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1, y: [0, -18, 0], rotate: [-4, 4, -4] }}
        transition={{
          opacity: { duration: 0.8, delay: 0.3 + o.delay * 0.3 },
          scale: { type: 'spring', stiffness: 130, damping: 12, delay: 0.3 + o.delay * 0.3 },
          y: { duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.delay },
          rotate: { duration: o.dur * 1.3, repeat: Infinity, ease: 'easeInOut', delay: o.delay },
        }}
      >
        <RealisticToolIcon slug={o.slug} size="xl" />
      </motion.div>
    ))}
  </div>
);

/** Custom cursor: precise dot + springy ring that swells over interactive elements */
export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const dot = React.useRef<HTMLDivElement>(null);
  const ring = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add('oe-cursor');

    let tx = -100, ty = -100, rx = -100, ry = -100, raf = 0;
    let hot = false, down = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const el = e.target as Element | null;
      hot = !!el?.closest?.('a, button, [role="button"], .cursor-pointer, summary, label[for]');
    };
    const onDown = () => (down = true);
    const onUp = () => (down = false);

    const tick = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%) scale(${hot ? 0.4 : down ? 0.7 : 1})`;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%) scale(${down ? 0.8 : hot ? 1.7 : 1})`;
        ring.current.style.background = hot ? 'color-mix(in srgb, var(--color-blue-400) 14%, transparent)' : 'transparent';
        ring.current.style.borderColor = hot ? 'var(--color-blue-300)' : 'color-mix(in srgb, var(--color-blue-300) 55%, transparent)';
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('oe-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div ref={ring} className="oe-cursor-ring" aria-hidden="true" />
      <div ref={dot} className="oe-cursor-dot" aria-hidden="true" />
    </>
  );
};

/** Section headline: words rise out of a mask when scrolled into view */
export const RevealWords: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
  <>
    {text.split(' ').map((word, i) => (
      <React.Fragment key={`${word}-${i}`}>
        <span className="inline-block overflow-hidden align-bottom pb-[0.16em] -mb-[0.16em]">
          <motion.span
            className={`oe-word inline-block ${className}`}
            initial={{ y: '120%', rotate: 4, opacity: 0 }}
            whileInView={{ y: '0%', rotate: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: i * 0.06, ease: EASE }}
          >
            {word}
          </motion.span>
        </span>{' '}
      </React.Fragment>
    ))}
  </>
);

/** Page-change curtain: a luminous wipe that sweeps across on every route change */
export const RouteCurtain: React.FC<{ path: string }> = ({ path }) => {
  const first = React.useRef(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setTick(t => t + 1);
  }, [path]);
  if (tick === 0) return null;
  return (
    <div className="fixed inset-0 z-[90] pointer-events-none overflow-hidden" aria-hidden="true">
      <motion.div
        key={tick}
        className="absolute inset-0 bg-gradient-to-br from-blue-800 via-slate-950 to-amber-900/40"
        initial={{ y: '100%' }}
        animate={{ y: ['100%', '0%', '0%', '-100%'] }}
        transition={{ duration: 0.95, times: [0, 0.4, 0.55, 1], ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.18),transparent_55%)]" />
      </motion.div>
    </div>
  );
};

type CarouselTool = { id: string; slug: string; name: string; category?: string };

/** 3D ring carousel of the real tool icons: depth-scaled, mouse-steered, click to open */
export const ToolCarousel3D: React.FC<{ tools: CarouselTool[]; onOpen: (slug: string) => void }> = ({ tools, onOpen }) => {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const state = React.useRef({ angle: 0, speed: 0.12, target: 0.12 });
  const FREE = ['text-shuffler', 'duplicate-text-remover'];

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const n = tools.length || 1;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;
      s.speed += (s.target - s.speed) * 0.06;
      if (!reduce) s.angle += s.speed * dt * 60 * 0.6;
      const box = boxRef.current;
      const W = box ? box.clientWidth : 900;
      const R = Math.min(W * 0.36, 420);
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = ((s.angle + (i * 360) / n) * Math.PI) / 180;
        const x = Math.sin(a) * R;
        const depth = (Math.cos(a) + 1) / 2; // 0 back .. 1 front
        const scale = 0.52 + depth * 0.62;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${(-depth * 18).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        el.style.opacity = String(0.62 + depth * 0.38);
        el.style.zIndex = String(Math.round(depth * 100));
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [tools.length]);

  const steer = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    state.current.target = px * 2.2; // left/right of centre steers rotation direction
  };

  return (
    <div
      ref={boxRef}
      onPointerMove={steer}
      onPointerLeave={() => (state.current.target = 0.12)}
      className="relative h-[430px] sm:h-[470px] select-none"
    >
      <div className="absolute left-1/2 bottom-6 -translate-x-1/2 w-[70%] h-24 rounded-[50%] bg-blue-500/25 blur-3xl" />
      <div className="absolute left-1/2 bottom-10 -translate-x-1/2 w-[62%] h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      {tools.map((t, i) => (
        <div
          key={t.id}
          ref={el => {
            itemRefs.current[i] = el;
          }}
          className="absolute left-1/2 top-1/2 -ml-[88px] -mt-[150px] w-[176px] will-change-transform"
        >
          <button
            type="button"
            onClick={() => onOpen(t.slug)}
            className="oe-panel oe-panel-hover group w-full flex flex-col items-center gap-3.5 p-5 rounded-3xl backdrop-blur-xl cursor-pointer"
          >
            <RealisticToolIcon slug={t.slug} size="xl" />
            <span className="text-sm font-bold text-slate-100 text-center leading-tight">{t.name}</span>
            <span
              className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                FREE.includes(t.slug) ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {FREE.includes(t.slug) ? 'Free · Instant' : 'Credits · Pool'}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
};
