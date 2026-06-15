"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/primitives";
import { Aurora } from "@/components/motion/Aurora";
import { Magnetic } from "@/components/motion/Magnetic";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="px-6 py-24">
      <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-cc-lg border border-border-strong bg-surface px-6 py-20 text-center">
        <Aurora />
        <div className="cc-grid-bg absolute inset-0 opacity-40" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Your next session is{" "}
            <span className="cc-sheen">one search away.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-fg-muted">
            Join thousands training smarter with the right coach beside them.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic>
              <Link href="/discover">
                <Button size="lg" className="animate-pulse-glow">
                  Find a coach <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/become-a-coach">
                <Button size="lg" variant="outline">
                  List your coaching
                </Button>
              </Link>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
