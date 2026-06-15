"use client";

import { Search, CalendarCheck, ShieldCheck, Trophy } from "lucide-react";
import { Reveal, RevealGroup, RevealItem, HoverLift } from "@/components/motion/primitives";
import { Card } from "@/components/ui";

const SPORTS = [
  "Football", "Tennis", "Golf", "Swimming", "Boxing", "Rugby",
  "Basketball", "Cricket", "Athletics", "Cycling", "Yoga", "Martial Arts",
  "Gymnastics", "Badminton", "Surfing", "Skiing",
];

/** Infinite volt marquee of supported sports. */
export function SportsMarquee() {
  return (
    <section className="border-y border-border py-6">
      <div className="relative flex overflow-hidden">
        <div className="flex shrink-0 animate-marquee gap-3 pr-3">
          {[...SPORTS, ...SPORTS].map((s, i) => (
            <span
              key={i}
              className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-fg-muted"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Search,
    title: "Discover nearby",
    body: "Search by sport and location. Filter by price, rating, availability and experience level.",
  },
  {
    icon: Trophy,
    title: "Compare credentials",
    body: "Verified qualifications, coaching videos, and real client reviews — all in one profile.",
  },
  {
    icon: CalendarCheck,
    title: "Book in minutes",
    body: "Pick an open slot, confirm details, and pay securely. Confirmation lands instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Train protected",
    body: "Payments held in escrow and released only after your session — with a fair cancellation policy.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          From search to session in{" "}
          <span className="cc-volt-text">four steps</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-fg-muted">
          A friction-free path built for both first-timers and serious athletes.
        </p>
      </Reveal>

      <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <RevealItem key={step.title}>
            <HoverLift>
              <Card className="h-full">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-cc bg-volt/15 text-volt">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="mb-1 font-mono text-xs text-fg-subtle">
                  0{i + 1}
                </div>
                <h3 className="mb-1.5 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-sm text-fg-muted">{step.body}</p>
              </Card>
            </HoverLift>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-fg-subtle sm:flex-row">
        <span>© {new Date().getFullYear()} CoachConnect. Built in the UK.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-fg transition-colors">Terms</a>
          <a href="#" className="hover:text-fg transition-colors">Privacy</a>
          <a href="#" className="hover:text-fg transition-colors">Coach Code</a>
        </div>
      </div>
    </footer>
  );
}
