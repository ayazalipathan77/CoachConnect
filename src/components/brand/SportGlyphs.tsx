"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Custom animated SVG sport glyphs — duotone line-art with the Electric Volt
 * gradient, drawn on as they enter view (stroke-dashoffset tween). Hand-built
 * paths, not an icon-font, so each scales razor-sharp and animates.
 */

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        delay: i * 0.12,
      },
      opacity: { duration: 0.2, delay: i * 0.12 },
    },
  }),
};

function Glyph({
  children,
  size = 72,
  label,
}: {
  children: ReactNode;
  size?: number;
  label: string;
}) {
  const reduce = useReducedMotion();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id="cc-sport" x1="10" y1="10" x2="90" y2="90">
          <stop stopColor="#E6FF4D" />
          <stop offset="1" stopColor="#A8D400" />
        </linearGradient>
      </defs>
      <motion.g
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        stroke="url(#cc-sport)"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </motion.g>
    </svg>
  );
}

const P = (d: string, i = 0, extra: Record<string, unknown> = {}) => (
  <motion.path key={d.slice(0, 8) + i} d={d} variants={draw} custom={i} {...extra} />
);
const C = (cx: number, cy: number, r: number, i = 0) => (
  <motion.circle key={`c${cx}${cy}${i}`} cx={cx} cy={cy} r={r} variants={draw} custom={i} />
);

export function TennisGlyph(p: { size?: number }) {
  return (
    <Glyph label="Tennis" {...p}>
      {C(50, 50, 30, 0)}
      {P("M28 28 C 44 40, 56 60, 72 72", 1)}
      {P("M30 70 C 44 58, 56 42, 70 30", 1)}
    </Glyph>
  );
}

export function FootballGlyph(p: { size?: number }) {
  return (
    <Glyph label="Football" {...p}>
      {C(50, 50, 30, 0)}
      {P("M50 35 L60 43 L56 55 L44 55 L40 43 Z", 1)}
      {P("M50 35 V22 M60 43 L72 38 M56 55 L64 67 M44 55 L36 67 M40 43 L28 38", 2)}
    </Glyph>
  );
}

export function BasketballGlyph(p: { size?: number }) {
  return (
    <Glyph label="Basketball" {...p}>
      {C(50, 50, 30, 0)}
      {P("M50 20 V80 M20 50 H80", 1)}
      {P("M29 29 C 42 42, 42 58, 29 71", 2)}
      {P("M71 29 C 58 42, 58 58, 71 71", 2)}
    </Glyph>
  );
}

export function BoxingGlyph(p: { size?: number }) {
  return (
    <Glyph label="Boxing" {...p}>
      {P("M34 40 C 34 30, 44 26, 54 28 C 66 30, 70 40, 70 50 L70 62 C 70 70, 64 74, 56 74 L44 74 C 38 74, 34 70, 34 64 Z", 0)}
      {P("M34 48 C 28 48, 26 52, 26 56 C 26 60, 30 62, 34 60", 1)}
      {P("M44 74 L44 62 M52 74 L52 62 M60 74 L60 62", 2)}
    </Glyph>
  );
}

export function SwimGlyph(p: { size?: number }) {
  return (
    <Glyph label="Swimming" {...p}>
      {C(64, 32, 6, 0)}
      {P("M22 52 L44 44 L54 52 L70 44", 1)}
      {P("M16 66 C 24 60, 30 72, 38 66 C 46 60, 52 72, 60 66 C 68 60, 74 72, 84 66", 2)}
    </Glyph>
  );
}

export function RunGlyph(p: { size?: number }) {
  return (
    <Glyph label="Athletics" {...p}>
      {C(60, 26, 6, 0)}
      {P("M40 50 L52 44 L62 50 L56 60 L66 66", 1)}
      {P("M52 44 L48 58 L38 70 M52 56 L60 72", 2)}
    </Glyph>
  );
}

export function CycleGlyph(p: { size?: number }) {
  return (
    <Glyph label="Cycling" {...p}>
      {C(28, 64, 14, 0)}
      {C(72, 64, 14, 0)}
      {P("M28 64 L44 64 L56 44 L40 44 M56 44 L72 64 M50 30 L58 30", 1)}
    </Glyph>
  );
}

export function GolfGlyph(p: { size?: number }) {
  return (
    <Glyph label="Golf" {...p}>
      {P("M42 74 L42 24 L66 34 L42 44", 0)}
      {C(58, 76, 4, 1)}
      {P("M30 80 H70", 2)}
    </Glyph>
  );
}

export function DumbbellGlyph(p: { size?: number }) {
  return (
    <Glyph label="Personal Training" {...p}>
      {P("M38 50 H62", 0)}
      {P("M30 40 V60 M24 44 V56 M70 40 V60 M76 44 V56", 1)}
    </Glyph>
  );
}

export function YogaGlyph(p: { size?: number }) {
  return (
    <Glyph label="Yoga" {...p}>
      {C(50, 26, 6, 0)}
      {P("M50 34 L50 52 M50 52 L34 62 M50 52 L66 62", 1)}
      {P("M30 70 H70", 2)}
    </Glyph>
  );
}

export const SPORT_GLYPHS = [
  { name: "Tennis", Comp: TennisGlyph },
  { name: "Football", Comp: FootballGlyph },
  { name: "Basketball", Comp: BasketballGlyph },
  { name: "Boxing", Comp: BoxingGlyph },
  { name: "Swimming", Comp: SwimGlyph },
  { name: "Athletics", Comp: RunGlyph },
  { name: "Cycling", Comp: CycleGlyph },
  { name: "Golf", Comp: GolfGlyph },
  { name: "Training", Comp: DumbbellGlyph },
  { name: "Yoga", Comp: YogaGlyph },
] as const;
