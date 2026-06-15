'use client';

import { motion, useScroll, useTransform } from 'motion/react';

/**
 * Athletics-track background. A winding multi-lane running track flows down the
 * full height of the page: faint lane lines + dashed lane dividers form the
 * track surface, and a bright volt "lead lane" fills as you scroll — turning
 * the whole site into a track you progress down.
 */

// The master racing line. All lanes are offset copies of this curve.
const TRACK_D = `M 500,0
  C 820,520 180,1040 500,1560
  C 820,2080 180,2600 500,3120`;

// Horizontal lane offsets (viewBox units). 0 = the bright lead lane.
const LANES = [-90, -45, 45, 90];

export function TrackBackground() {
  const { scrollYProgress } = useScroll();
  const pathLength = useTransform(scrollYProgress, [0, 0.92], [0, 1]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 3200"
        preserveAspectRatio="xMidYMax slice"
        className="opacity-[0.55]"
      >
        <defs>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CCFF00" stopOpacity="1" />
            <stop offset="55%" stopColor="#CCFF00" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FAFAFA" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="trackFade" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="70%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.15" />
          </radialGradient>
          <mask id="trackMask">
            <rect width="1000" height="3200" fill="url(#trackFade)" />
          </mask>
        </defs>

        <g mask="url(#trackMask)">
          {/* Wide track "surface" */}
          <path
            d={TRACK_D}
            stroke="rgba(255,255,255,0.035)"
            strokeWidth="170"
            fill="none"
            strokeLinecap="round"
          />

          {/* Outer lane lines (offset copies of the racing line) */}
          {LANES.map((dx) => (
            <path
              key={dx}
              d={TRACK_D}
              transform={`translate(${dx},0)`}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="2"
              fill="none"
            />
          ))}

          {/* Dashed lane dividers either side of the lead lane */}
          {[-22, 22].map((dx) => (
            <path
              key={dx}
              d={TRACK_D}
              transform={`translate(${dx},0)`}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="2"
              strokeDasharray="14 18"
              fill="none"
            />
          ))}

          {/* Soft glow under the lead lane */}
          <motion.path
            d={TRACK_D}
            stroke="#CCFF00"
            strokeWidth="22"
            fill="none"
            className="blur-2xl"
            style={{ pathLength, opacity: 0.35 }}
          />

          {/* Bright animated lead lane (your progress) */}
          <motion.path
            d={TRACK_D}
            stroke="url(#trackGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            style={{ pathLength }}
          />
        </g>
      </svg>
    </div>
  );
}
