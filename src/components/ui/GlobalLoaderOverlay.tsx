'use client';

import { motion } from 'motion/react';
import { LoaderLogo } from './LoaderLogo';

/**
 * Full-viewport blurred backdrop + looping logo. Purely presentational so it
 * can be reused both by the context-driven overlay (LoadingProvider) and by
 * Next's route-level loading.tsx (which Next mounts/unmounts automatically).
 */
export function GlobalLoaderOverlay() {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <LoaderLogo />
    </motion.div>
  );
}
