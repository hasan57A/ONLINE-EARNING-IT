import React, { useEffect, useRef } from 'react';

type P = { x: number; y: number; vx: number; vy: number; r: number; isSquare: boolean; isGold: boolean };

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.trim().replace('#', '');
  if (h.length < 6) return [37, 99, 235];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

/** Living digital pixel & constellation field matching the Sapphire & Gold emblem. */
export const ParticleField: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let parts: P[] = [];
    let raf = 0;
    let rgb: [number, number, number] = [37, 99, 235];
    let rgb2: [number, number, number] = [245, 158, 11];
    const mouse = { x: -9999, y: -9999 };

    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      rgb = hexToRgb(cs.getPropertyValue('--oe-accent-1') || cs.getPropertyValue('--color-blue-500') || '#2563eb');
      rgb2 = hexToRgb(cs.getPropertyValue('--oe-accent-3') || cs.getPropertyValue('--color-amber-400') || '#f59e0b');
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(54, Math.max(24, (w * h) / 31000)));
      parts = Array.from({ length: count }, (_, idx) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: idx % 3 === 0 ? Math.random() * 2.2 + 1.8 : Math.random() * 1.5 + 0.7,
        isSquare: idx % 3 === 0,
        isGold: idx % 4 === 0,
      }));
    };

    const LINK = 130;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 24000) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / 155) * 0.035;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;

        const c = p.isGold ? rgb2 : rgb;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${p.isSquare ? 0.65 : 0.72})`;
        if (p.isSquare) {
          const s = p.r * 1.5;
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const ax = p.x - q.x;
          const ay = p.y - q.y;
          const dist = ax * ax + ay * ay;
          if (dist < LINK * LINK) {
            const a = (1 - Math.sqrt(dist) / LINK) * 0.22;
            ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`;
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        if (d2 < 30000) {
          const a = (1 - Math.sqrt(d2) / 173) * 0.45;
          ctx.strokeStyle = `rgba(${rgb2[0]},${rgb2[1]},${rgb2[2]},${a.toFixed(3)})`;
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(draw);
    };

    readTheme();
    resize();
    window.addEventListener('oe-theme-changed', readTheme);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVis);
    if (reduce) draw(); else raf = requestAnimationFrame(draw);
    if (reduce) cancelAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('oe-theme-changed', readTheme);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1, opacity: 0.6 }}
    />
  );
};
