'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import { GlobalLoaderOverlay } from '@/components/ui/GlobalLoaderOverlay';

type LoadingContextValue = { start: () => void; stop: () => void };

const LoadingContext = createContext<LoadingContextValue | null>(null);

/** Safety net in case a navigation never resolves (e.g. aborted/offline). */
const NAV_TIMEOUT_MS = 8000;

/**
 * Counter-based so overlapping operations (e.g. a transition kicked off
 * while a form is still submitting) don't hide the overlay until *all* of
 * them resolve.
 */
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const start = useCallback(() => setCount((c) => c + 1), []);
  const stop = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  // App Router doesn't reliably show route-level Suspense fallbacks for
  // client-side <Link> transitions (it keeps the previous page on screen
  // until the new one is ready), so plain in-app navigation never trips
  // loading.tsx. Catch every internal link click here instead — one
  // listener covers every sidebar/nav <Link> in the app with zero
  // per-component wiring — and clear it once the pathname actually changes.
  const navPendingRef = useRef(false);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      navPendingRef.current = true;
      start();
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = setTimeout(() => {
        if (navPendingRef.current) {
          navPendingRef.current = false;
          stop();
        }
      }, NAV_TIMEOUT_MS);
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [start, stop]);

  useEffect(() => {
    if (navPendingRef.current) {
      navPendingRef.current = false;
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      stop();
    }
  }, [pathname, stop]);

  return (
    <LoadingContext.Provider value={{ start, stop }}>
      {children}
      <AnimatePresence>{count > 0 && <GlobalLoaderOverlay key="global-loader" />}</AnimatePresence>
    </LoadingContext.Provider>
  );
}

function useLoadingContext(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoadingContext must be used within LoadingProvider');
  return ctx;
}

/**
 * Drop-in for any `pending`/`isPending` flag (useActionState, useTransition)
 * to surface it on the global overlay — one line per call site, no
 * per-component loader UI to build or maintain.
 */
export function usePendingLoader(pending: boolean): void {
  const { start, stop } = useLoadingContext();
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending && !wasPending.current) {
      wasPending.current = true;
      start();
    } else if (!pending && wasPending.current) {
      wasPending.current = false;
      stop();
    }
  }, [pending, start, stop]);

  useEffect(() => {
    return () => {
      if (wasPending.current) stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
