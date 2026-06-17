'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { GlobalLoaderOverlay } from '@/components/ui/GlobalLoaderOverlay';

type LoadingContextValue = { start: () => void; stop: () => void };

const LoadingContext = createContext<LoadingContextValue | null>(null);

/**
 * Counter-based so overlapping operations (e.g. a transition kicked off
 * while a form is still submitting) don't hide the overlay until *all* of
 * them resolve.
 */
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const start = useCallback(() => setCount((c) => c + 1), []);
  const stop = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

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
