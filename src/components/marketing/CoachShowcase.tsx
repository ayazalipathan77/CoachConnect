"use client";

import { Star, MapPin, BadgeCheck } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/primitives";
import { TiltCard } from "@/components/motion/TiltCard";
import { Badge } from "@/components/ui";

type Coach = {
  name: string;
  sport: string;
  city: string;
  rating: number;
  reviews: number;
  price: number;
  level: string;
  verified: boolean;
  gradient: string;
};

const COACHES: Coach[] = [
  { name: "Marcus Bell", sport: "Football", city: "London", rating: 4.9, reviews: 214, price: 45, level: "Elite", verified: true, gradient: "from-[#CCFF00] to-[#00E5FF]" },
  { name: "Aisha Khan", sport: "Tennis", city: "Manchester", rating: 5.0, reviews: 168, price: 52, level: "Advanced", verified: true, gradient: "from-[#FF2D7E] to-[#CCFF00]" },
  { name: "Dane Okoye", sport: "Boxing", city: "Birmingham", rating: 4.8, reviews: 301, price: 38, level: "Elite", verified: true, gradient: "from-[#00E5FF] to-[#4F46E5]" },
  { name: "Sophie Reid", sport: "Swimming", city: "Bristol", rating: 4.9, reviews: 142, price: 40, level: "Advanced", verified: false, gradient: "from-[#CCFF00] to-[#FFB020]" },
];

function Avatar({ coach }: { coach: Coach }) {
  const initials = coach.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${coach.gradient} font-display text-sm font-bold text-black`}
    >
      {initials}
    </div>
  );
}

export function CoachShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge tone="volt" className="mb-4">
            Featured coaches
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Pros who move the needle
          </h2>
        </div>
        <p className="max-w-sm text-fg-muted">
          Hover a card — the same tactile depth your clients feel browsing real
          profiles.
        </p>
      </Reveal>

      <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {COACHES.map((coach) => (
          <RevealItem key={coach.name} className="group">
            <TiltCard className="h-full">
              <div className="relative h-full overflow-hidden rounded-cc-lg border border-border bg-surface p-5 transition-colors group-hover:border-volt-deep">
                {/* sheen top edge */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-volt/60 to-transparent" />
                <div className="mb-4 flex items-center justify-between">
                  <Avatar coach={coach} />
                  {coach.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-volt">
                      <BadgeCheck className="h-4 w-4" /> Verified
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold">{coach.name}</h3>
                <div className="mt-0.5 text-sm text-fg-muted">{coach.sport}</div>
                <div className="mt-3 flex items-center gap-3 text-sm text-fg-subtle">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-volt text-volt" />
                    {coach.rating.toFixed(1)}
                  </span>
                  <span>({coach.reviews})</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {coach.city}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <Badge tone="neutral">{coach.level}</Badge>
                  <div className="text-right">
                    <span className="font-display text-xl font-bold text-fg">
                      £{coach.price}
                    </span>
                    <span className="text-xs text-fg-subtle"> /session</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
