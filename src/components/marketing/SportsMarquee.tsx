"use client";

import { SPORT_GLYPHS } from "@/components/brand/SportGlyphs";

/**
 * Dual-row infinite marquee of the custom animated SVG sport glyphs, scrolling
 * in opposite directions with edge fade — a living taxonomy strip.
 */
function Row({ reverse = false }: { reverse?: boolean }) {
  const items = [...SPORT_GLYPHS, ...SPORT_GLYPHS];
  return (
    <div className="flex overflow-hidden">
      <div
        className="flex shrink-0 items-center gap-4 pr-4"
        style={{
          animation: `marquee ${reverse ? "34s" : "30s"} linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {items.map(({ name, Comp }, i) => (
          <div
            key={name + i}
            className="flex items-center gap-3 rounded-cc-lg border border-border bg-surface px-5 py-3"
          >
            <Comp size={36} />
            <span className="font-display text-sm font-medium text-fg-muted">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SportsMarquee() {
  return (
    <section className="relative space-y-4 overflow-hidden border-y border-border py-10">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-bg to-transparent" />
      <Row />
      <Row reverse />
    </section>
  );
}
