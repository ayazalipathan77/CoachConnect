'use client';

import { motion, useScroll, useTransform } from 'motion/react';

export function TrackBackground() {
  const { scrollYProgress } = useScroll();

  // Transform scroll progress to a path length
  const pathLength = useTransform(scrollYProgress, [0, 0.9], [0, 1]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-center opacity-40">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 3000"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CCFF00" stopOpacity="1" />
            <stop offset="50%" stopColor="#CCFF00" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FAFAFA" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Faint background track */}
        <path
          d="M 500,0
             C 800,500 200,1000 500,1500
             C 800,2000 200,2500 500,3000"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="60"
          fill="none"
        />
        <path
          d="M 500,0
             C 800,500 200,1000 500,1500
             C 800,2000 200,2500 500,3000"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="10 10"
        />

        {/* Animated fill track */}
        <motion.path
          d="M 500,0
             C 800,500 200,1000 500,1500
             C 800,2000 200,2500 500,3000"
          stroke="url(#trackGradient)"
          strokeWidth="4"
          fill="none"
          style={{ pathLength }}
        />

        {/* Glow effect on the line */}
        <motion.path
          d="M 500,0
             C 800,500 200,1000 500,1500
             C 800,2000 200,2500 500,3000"
          stroke="#CCFF00"
          strokeWidth="16"
          fill="none"
          className="blur-xl opacity-30"
          style={{ pathLength }}
        />
      </svg>
    </div>
  );
}
