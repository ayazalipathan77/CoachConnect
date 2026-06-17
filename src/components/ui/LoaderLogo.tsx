'use client';

import { motion } from 'motion/react';

/**
 * Looping variant of the brand logo mark, used as the visual for the global
 * loading overlay. Vector (not a gif/raster) so it stays crisp at any size
 * and at any pixel density, and costs ~1KB vs. a multi-frame raster loop.
 */
export function LoaderLogo({ className = 'w-20 h-20 sm:w-28 sm:h-28' }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
    >
      <circle
        cx="18" cy="18" r="14"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="3"
        strokeDasharray="4 4"
      />
      <motion.path
        d="M 6 18 C 6 10 12 4 18 4 C 24 4 30 10 30 18"
        stroke="#CCFF00"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.circle
        cx="18" cy="18" r="4"
        fill="#FAFAFA"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
      />
    </motion.svg>
  );
}
