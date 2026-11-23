import React, { useEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
  useInView,
  animate,
  type HTMLMotionProps,
} from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;
const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Thin gradient bar at the very top that fills as the page scrolls */
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, transformOrigin: '0% 50%' }}
      className="fixed top-0 left-0 right-0 h-[3px] z-[70] bg-gradient-to-r from-blue-600 via-sky-400 to-amber-400 shadow-[0_0_18px_var(--color-blue-500)]"
    />
  );
};

/** Word-by-word masked rise reveal for big headlines */
export const SplitText: React.FC<{
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}> = ({ text, className = '', delay = 0, stagger = 0.07 }) => (
  <>
    {text.split(' ').map((word, i) => (
      <React.Fragment key={`${word}-${i}`}>
        <span className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]">
          <motion.span
            className={`inline-block will-change-transform ${className}`}
            initial={{ y: '115%', rotate: 5, opacity: 0 }}
            animate={{ y: '0%', rotate: 0, opacity: 1 }}
            transition={{ duration: 1, delay: delay + i * stagger, ease: EASE }}
          >
            {word}
          </motion.span>
        </span>{' '}
      </React.Fragment>
    ))}
  </>
);

/** Fade / rise / un-blur when scrolled into view */
export const Reveal: React.FC<
  { delay?: number; y?: number } & Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView'>
> = ({ delay = 0, y = 36, children, ...rest }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.9, delay, ease: EASE }}
    {...rest}
  >
    {children}
  </motion.div>
);

/** Spring-based 3D tilt that follows the pointer. Accepts all motion.div props. */
export const TiltCard: React.FC<HTMLMotionProps<'div'> & { max?: number }> = ({
  max = 8,
  style,
  children,
  onPointerMove,
  onPointerLeave,
  ...rest
}) => {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 220, damping: 20, mass: 0.6 });
  const sy = useSpring(ry, { stiffness: 220, damping: 20, mass: 0.6 });

  return (
    <motion.div
      {...rest}
      style={{ ...style, rotateX: sx, rotateY: sy, transformPerspective: 1000 }}
      onPointerMove={e => {
        onPointerMove?.(e);
        if (reduced() || e.pointerType === 'touch') return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onPointerLeave={e => {
        onPointerLeave?.(e);
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
};

/** Wrapper that pulls its child gently toward the cursor */
export const Magnetic: React.FC<{ children: React.ReactNode; strength?: number; className?: string }> = ({
  children,
  strength = 0.28,
  className = '',
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 16, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 16, mass: 0.5 });
  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={e => {
        if (reduced() || e.pointerType === 'touch') return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
};

/** Counts up to the number found in `value` (keeps prefix/suffix like "500+" or "1,000") */
export const CountUp: React.FC<{ value: string; className?: string; duration?: number }> = ({
  value,
  className = '',
  duration = 2.2,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const match = value.match(/^(\D*)([\d,]+)(.*)$/);

  useEffect(() => {
    if (!inView || !match || !ref.current) return;
    const target = parseInt(match[2].replace(/,/g, ''), 10);
    const controls = animate(0, target, {
      duration: reduced() ? 0 : duration,
      ease: EASE,
      onUpdate: v => {
        if (ref.current) {
          ref.current.textContent = `${match[1]}${Math.round(v).toLocaleString('en-US')}${match[3]}`;
        }
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={className}>
      {match ? `${match[1]}0${match[3]}` : value}
    </span>
  );
};

/** Infinite horizontal marquee (pauses on hover) */
export const Marquee: React.FC<{ children: React.ReactNode; speed?: number; className?: string }> = ({
  children,
  speed = 38,
  className = '',
}) => (
  <div className={`oe-marquee group relative overflow-hidden ${className}`}>
    <div className="oe-marquee-track flex w-max gap-4" style={{ animationDuration: `${speed}s` }}>
      <div className="flex gap-4 shrink-0">{children}</div>
      <div className="flex gap-4 shrink-0" aria-hidden="true">{children}</div>
    </div>
  </div>
);

/** Scroll-linked parallax wrapper */
export const Parallax: React.FC<{ children: React.ReactNode; offset?: number; className?: string }> = ({
  children,
  offset = 80,
  className = '',
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, offset]);
  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

/** Cursor-tracking radial spotlight card (compositor opacity only, zero layout reflow) */
export const SpotlightCard: React.FC<
  Omit<HTMLMotionProps<'div'>, 'children'> & {
    spotlightColor?: string;
    children: React.ReactNode;
  }
> = ({
  className = '',
  spotlightColor = 'rgba(var(--oe-accent-rgb), 0.16)',
  children,
  onPointerMove,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    if (reduced() || e.pointerType === 'touch' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--sx', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--sy', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handleMove}
      {...rest}
      className={`group/spot relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 group-hover/spot:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(420px circle at var(--sx, 50%) var(--sy, 50%), ${spotlightColor}, transparent 68%)`,
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between">{children}</div>
    </motion.div>
  );
};

/** Staggered scroll-reveal container and item */
export const StaggerGrid: React.FC<HTMLMotionProps<'div'> & { stagger?: number }> = ({
  stagger = 0.06,
  children,
  ...rest
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: reduced() ? 0 : stagger,
        },
      },
    }}
    {...rest}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<HTMLMotionProps<'div'>> = ({ children, ...rest }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 26 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reduced() ? 0 : 0.65, ease: EASE },
      },
    }}
    {...rest}
  >
    {children}
  </motion.div>
);

/** Scroll-linked subtle zoom & vertical glide for showcase photography */
export const ScrollParallaxMedia: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.06, 1, 1.04]);
  const y = useTransform(scrollYProgress, [0, 1], [-14, 14]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={reduced() ? undefined : { scale, y }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  );
};
