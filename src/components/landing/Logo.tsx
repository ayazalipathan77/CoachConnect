'use client';

import { motion } from 'motion/react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 z-50 relative pointer-events-auto">
      <motion.svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Animated track lines in logo */}
        <motion.path
          d="M 6 18 C 6 10 12 4 18 4 C 24 4 30 10 30 18 C 30 26 24 32 18 32 C 12 32 6 26 6 18"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
          strokeDasharray="4 4"
        />
        <motion.path
          d="M 6 18 C 6 10 12 4 18 4 C 24 4 30 10 30 18"
          stroke="#CCFF00"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.circle
          cx="18" cy="18" r="4"
          fill="#FAFAFA"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 1 }}
        />
      </motion.svg>
      <div className="flex flex-col justify-center">
        <span className="font-display font-bold text-xl leading-none tracking-tight text-white m-0 p-0">
          Coach<span className="text-[#CCFF00]">Connect</span>
        </span>
      </div>
    </div>
  );
}
