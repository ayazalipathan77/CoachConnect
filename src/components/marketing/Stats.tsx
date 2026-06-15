"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const STATS = [
  { value: 8400, suffix: "+", label: "Verified coaches" },
  { value: 20, suffix: "", label: "Sports & disciplines" },
  { value: 96, suffix: "%", label: "Re-book rate" },
  { value: 4, prefix: "<", suffix: " min", label: "Avg. time to book" },
];

export function Stats() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const nums = gsap.utils.toArray<HTMLElement>(".cc-stat-num");
      nums.forEach((el) => {
        const target = Number(el.dataset.value);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toLocaleString();
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="border-y border-border bg-bg-elev/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-6 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="px-2 py-12 text-center">
            <div className="font-display text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">
              {s.prefix}
              <span className="cc-stat-num" data-value={s.value}>
                0
              </span>
              <span className="text-volt">{s.suffix}</span>
            </div>
            <div className="mt-2 text-sm text-fg-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
