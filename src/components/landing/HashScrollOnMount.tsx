'use client';

import { useEffect } from 'react';

/**
 * Handles `/#section` links clicked from a *different* route. Next.js
 * attempts a scroll-into-view immediately after navigation, but on this
 * page that can race with images/scroll-jacking sections still laying out,
 * landing nowhere. Retry on mount until the target exists.
 */
export function HashScrollOnMount() {
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    let attempt = 0;
    let frame: number;
    function tryScroll() {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempt++ < 20) {
        frame = requestAnimationFrame(tryScroll);
      }
    }
    tryScroll();

    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}
