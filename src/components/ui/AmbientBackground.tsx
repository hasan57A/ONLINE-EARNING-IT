import React, { useEffect, useRef } from 'react';

/**
 * Premium ambient layer: drifting aurora orbs, a soft light that follows the
 * cursor, and a fine film grain. Purely decorative (pointer-events: none).
 */
export const AmbientBackground: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.3;
    let cx = tx;
    let cy = ty;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      // Cursor-following spotlight + gradient border on every card
      const card = (e.target as Element | null)?.closest?.<HTMLElement>('.rounded-3xl.border, .rounded-2xl.border');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--sx', `${(e.clientX - r.left).toFixed(0)}px`);
        card.style.setProperty('--sy', `${(e.clientY - r.top).toFixed(0)}px`);
      }
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty('--mx', `${cx.toFixed(1)}px`);
      el.style.setProperty('--my', `${cy.toFixed(1)}px`);
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      document.documentElement.dataset.scrolled = window.scrollY > 24 ? 'true' : 'false';
    };

    // Click ripple on premium (gradient) buttons
    const onDown = (e: PointerEvent) => {
      const btn = (e.target as Element | null)?.closest?.<HTMLElement>('button[class*="bg-gradient-to-r"], a[class*="bg-gradient-to-r"]');
      if (!btn || (btn as HTMLButtonElement).disabled) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.4;
      const dot = document.createElement('span');
      dot.className = 'oe-ripple';
      dot.style.width = dot.style.height = `${size}px`;
      dot.style.left = `${e.clientX - r.left}px`;
      dot.style.top = `${e.clientY - r.top}px`;
      btn.appendChild(dot);
      window.setTimeout(() => dot.remove(), 800);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ref} className="oe-ambient" aria-hidden="true">
        <div className="oe-orb oe-orb-1" />
        <div className="oe-orb oe-orb-2" />
        <div className="oe-orb oe-orb-3" />
        <div className="oe-cursor-light" />
      </div>
      <div className="oe-grain" aria-hidden="true" />
    </>
  );
};
