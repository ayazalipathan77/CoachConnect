"use client";

import { MapPin, ShieldCheck, MessagesSquare, Star, Wallet, Video } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/primitives";
import { TiltCard } from "@/components/motion/TiltCard";
import { Badge } from "@/components/ui";

export function Bento() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mb-12 text-center">
        <Badge tone="volt" className="mx-auto mb-4">
          Built for trust
        </Badge>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Everything that makes a booking{" "}
          <span className="cc-volt-text">feel safe</span>
        </h2>
      </Reveal>

      <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
        {/* Big feature — location */}
        <RevealItem className="group md:col-span-2 md:row-span-2">
          <TiltCard max={6} className="h-full">
            <div className="relative flex h-full min-h-[300px] flex-col justify-between overflow-hidden rounded-cc-lg border border-border bg-surface p-7 group-hover:border-volt-deep">
              <div className="cc-grid-bg absolute inset-0 opacity-30" />
              <div
                className="absolute -right-10 -top-10 h-56 w-56 rounded-full blur-[70px]"
                style={{ background: "var(--cc-volt-glow)" }}
              />
              <div className="relative">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-cc bg-volt/15 text-volt">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl font-bold">
                  Location-smart discovery
                </h3>
                <p className="mt-2 max-w-md text-fg-muted">
                  Proximity-ranked results with map clustering. Find the right
                  coach within 5, 10 or 25 miles — sorted by a blend of distance
                  and rating.
                </p>
              </div>
              <div className="relative mt-6 flex gap-2">
                {["5 mi", "10 mi", "25 mi", "Any"].map((d, i) => (
                  <span
                    key={d}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      i === 1
                        ? "border-volt bg-volt/10 text-volt"
                        : "border-border text-fg-subtle"
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </TiltCard>
        </RevealItem>

        {[
          { icon: ShieldCheck, title: "Escrow payments", body: "Funds released only after your session completes." },
          { icon: Star, title: "Verified reviews", body: "Real ratings from completed bookings only." },
          { icon: MessagesSquare, title: "In-app messaging", body: "Enquire before you book, chat after." },
          { icon: Video, title: "Coach videos", body: "See their style before committing." },
        ].map((f) => (
          <RevealItem key={f.title} className="group">
            <TiltCard className="h-full">
              <div className="h-full rounded-cc-lg border border-border bg-surface p-5 transition-colors group-hover:border-volt-deep">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-cc bg-surface-2 text-volt">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-fg-muted">{f.body}</p>
              </div>
            </TiltCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
