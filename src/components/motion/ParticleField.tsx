import React, { useEffect, useRef } from 'react';

type P = { x: number; y: number; vx: number; vy: number; r: number };

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.trim().replace('#', '');
  if (h.length < 6) return [132, 104, 255];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

/** Living particle network: nodes drift, link up, and flow around the cursor. */
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
    let rgb: [number, number, number] = [132, 104, 255];
    let rgb2: [number, number, number] = [198, 88, 241];
    const mouse = { x: -9999, y: -9999 };

    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      rgb = hexToRgb(cs.getPropertyValue('--oe-accent-1') || cs.getPropertyValue('--color-blue-400') || '#7c3aed');
      rgb2 = hexToRgb(cs.getPropertyValue('--oe-accent-3') || cs.getPropertyValue('--color-indigo-400') || '#3b82f6');
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(56, Math.max(26, (w * h) / 30000)));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const LINK = 135;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        // cursor interaction: gentle attraction, strong swirl very close
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

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.75)`;
        ctx.fill();

        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const ax = p.x - q.x;
          const ay = p.y - q.y;
          const dist = ax * ax + ay * ay;
          if (dist < LINK * LINK) {
            const a = (1 - Math.sqrt(dist) / LINK) * 0.28;
            ctx.strokeStyle = `rgba(${rgb2[0]},${rgb2[1]},${rgb2[2]},${a.toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        // links to cursor
        if (d2 < 30000) {
          const a = (1 - Math.sqrt(d2) / 173) * 0.5;
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`;
          ctx.lineWidth = 0.9;
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
