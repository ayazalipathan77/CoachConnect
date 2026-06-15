"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Search, Trophy, CalendarCheck, Flame } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  TennisGlyph,
  BoxingGlyph,
  RunGlyph,
  SwimGlyph,
} from "@/components/brand/SportGlyphs";

const STEPS = [
  { icon: Search, kicker: "01 · Discover", title: "Search your postcode", body: "Filter 20+ sports by distance, price, rating, availability and level. Map or list — your call.", Glyph: TennisGlyph },
  { icon: Trophy, kicker: "02 · Compare", title: "Vet the credentials", body: "Verified qualifications, coaching videos and real client reviews — everything in one profile.", Glyph: BoxingGlyph },
  { icon: CalendarCheck, kicker: "03 · Book", title: "Lock your slot", body: "Pick an open session, confirm, and pay securely. Confirmation lands in under a minute.", Glyph: SwimGlyph },
  { icon: Flame, kicker: "04 · Train", title: "Show up and level up", body: "Payment held in escrow, released only after your session. Then rate and re-book in a tap.", Glyph: RunGlyph },
];

export function StickyStory() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>(".cc-story-step");
      panels.forEach((panel, i) => {
        ScrollTrigger.create({
          trigger: panel,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    },
    { scope: root },
  );

  const ActiveGlyph = STEPS[active].Glyph;

  return (
    <section ref={root} className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Sticky visual pane */}
        <div className="lg:sticky lg:top-28 lg:h-[60vh]">
          <div className="relative flex h-full min-h-[320px] items-center justify-center overflow-hidden rounded-cc-lg border border-border bg-surface">
            <div className="cc-grid-bg absolute inset-0 opacity-40" />
            <div
              className="absolute h-64 w-64 rounded-full blur-[80px]"
              style={{ background: "var(--cc-volt-glow)" }}
            />
            <div key={active} className="relative animate-[fadeIn_0.5s_ease]">
              <ActiveGlyph size={180} />
            </div>
            <div className="absolute bottom-5 left-5 font-mono text-xs text-fg-subtle">
              {STEPS[active].kicker}
            </div>
          </div>
        </div>

        {/* Scrolling steps */}
        <div>
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="cc-story-step flex min-h-[52vh] flex-col justify-center"
            >
              <div
                className={`transition-all duration-500 ${
                  active === i ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-cc transition-colors ${
                    active === i ? "bg-volt text-black" : "bg-surface-2 text-fg-muted"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="mb-2 font-mono text-xs text-volt">{step.kicker}</div>
                <h3 className="font-display text-3xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-lg text-fg-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
