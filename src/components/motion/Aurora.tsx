"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Animated aurora / mesh-gradient field — three large blurred colour blobs
 * (volt, cyan, magenta) drifting on independent loops. The signature ambient
 * lighting behind hero and section headers.
 */
export function Aurora({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const blobs = [
    { c: "rgba(204,255,0,0.22)", x: "12%", y: "10%", s: 520, d: 18 },
    { c: "rgba(0,229,255,0.16)", x: "70%", y: "0%", s: 460, d: 22 },
    { c: "rgba(255,45,126,0.12)", x: "55%", y: "55%", s: 420, d: 26 },
  ];
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[90px]"
          style={{
            left: b.x,
            top: b.y,
            width: b.s,
            height: b.s,
            background: `radial-gradient(circle, ${b.c} 0%, transparent 70%)`,
          }}
          animate={
            reduce
              ? undefined
              : { x: [0, 40, -30, 0], y: [0, -30, 40, 0], scale: [1, 1.12, 0.95, 1] }
          }
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
