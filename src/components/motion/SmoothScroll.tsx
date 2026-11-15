import React from 'react';
import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Inertial, buttery page scrolling (the single biggest "premium" feel upgrade).
 * Nested scroll areas (sidebar, textareas, result boxes) keep native scrolling.
 */
export const SmoothScroll: React.FC = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      prevent: (node: Element) =>
        !!node.closest?.('aside, textarea, pre, [data-lenis-prevent], .overflow-y-auto, .overflow-auto'),
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Anchor links like /#plans scroll smoothly through Lenis too
    const onHash = () => {
      const id = window.location.hash.replace('#', '');
      const el = id ? document.getElementById(id) : null;
      if (el) lenis.scrollTo(el, { offset: -90 });
    };
    window.addEventListener('hashchange', onHash);

    return () => {
      window.removeEventListener('hashchange', onHash);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
};
