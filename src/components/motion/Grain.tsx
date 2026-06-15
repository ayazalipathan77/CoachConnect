"use client";

/**
 * Fixed film-grain / noise overlay. Adds the subtle organic texture that
 * separates "flat dark theme" from "premium dark theme". SVG fractal noise,
 * GPU-composited, ignores pointer events.
 */
export function Grain({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "180px 180px",
        mixBlendMode: "overlay",
      }}
    />
  );
}
