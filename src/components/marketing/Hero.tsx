"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Star, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui";
import { Aurora } from "@/components/motion/Aurora";
import { Magnetic } from "@/components/motion/Magnetic";
import { VoltGlobe } from "./VoltGlobe";

/** Floating glass stat chip with parallax + idle float. */
function FloatChip({
  className,
  depth,
  delay,
  children,
}: {
  className: string;
  depth: number;
  delay: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`absolute z-20 hidden lg:block ${className}`}
      style={depth ? { y: depth } : undefined}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 5 + delay * 2, repeat: Infinity, ease: "easeInOut" }}
        className="cc-glass flex items-center gap-2.5 rounded-cc px-3.5 py-2.5 shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Layered parallax — each plane moves at its own rate on scroll.
  const yText = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
  const yGlobe = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);
  const scaleGlobe = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const chipA = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const chipB = useTransform(scrollYProgress, [0, 1], [0, -150]);

  const enter = (delay: number, y = 22) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden pt-28 pb-16">
      <Aurora />
      <div className="cc-grid-bg pointer-events-none absolute inset-0 -z-10" />

      {/* 3D globe centerpiece */}
      <motion.div
        style={{ y: yGlobe, scale: scaleGlobe, opacity }}
        className="pointer-events-auto absolute left-1/2 top-[42%] -z-[5] w-[min(80vw,720px)] -translate-x-1/2 -translate-y-1/2"
      >
        <VoltGlobe />
      </motion.div>

      {/* Floating glass chips (parallax planes) */}
      <FloatChip className="left-[8%] top-[30%]" depth={chipA as unknown as number} delay={0.5}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-volt/15">
          <Star className="h-4 w-4 text-volt" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-fg">4.9 rating</div>
          <div className="text-xs text-fg-subtle">12,480 reviews</div>
        </div>
      </FloatChip>

      <FloatChip className="right-[9%] top-[34%]" depth={chipB as unknown as number} delay={0.65}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan/15">
          <ShieldCheck className="h-4 w-4 text-cyan" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-fg">Escrow secured</div>
          <div className="text-xs text-fg-subtle">Pay after the session</div>
        </div>
      </FloatChip>

      <FloatChip className="right-[14%] bottom-[20%]" depth={chipA as unknown as number} delay={0.8}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-magenta/15">
          <Zap className="h-4 w-4 text-magenta" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-fg">Booked in 4 min</div>
          <div className="text-xs text-fg-subtle">avg. checkout</div>
        </div>
      </FloatChip>

      {/* Headline plane */}
      <motion.div
        style={{ y: yText, opacity }}
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        <motion.div {...enter(0, 12)}>
          <Badge tone="volt" className="mx-auto mb-6">
            <Zap className="h-3.5 w-3.5" /> 20+ disciplines · live across the UK
          </Badge>
        </motion.div>

        <motion.h1
          className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl md:text-8xl"
          {...enter(0.05, 26)}
        >
          Find your edge.
          <br />
          <span className="cc-sheen">Book your coach.</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-7 max-w-xl text-lg text-fg-muted"
          {...enter(0.15)}
        >
          The marketplace for elite sports coaching. Discover verified coaches
          near you, see real credentials and reviews, and book in minutes.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          {...enter(0.25)}
        >
          <Magnetic>
            <Link href="/discover">
              <Button size="lg" className="animate-pulse-glow">
                Find a coach <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/become-a-coach">
              <Button size="lg" variant="secondary">
                Become a coach
              </Button>
            </Link>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-border-strong p-1.5">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-volt"
            animate={reduce ? undefined : { y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
