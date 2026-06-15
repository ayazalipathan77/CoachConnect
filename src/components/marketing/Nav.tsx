"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export function MarketingNav() {
  const reduce = useReducedMotion();
  return (
    <motion.header
      initial={reduce ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-cc-lg px-4 py-2.5 cc-glass">
        <Link href="/" aria-label="CoachConnect home">
          <Wordmark glow />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-fg-muted md:flex">
          <Link href="/discover" className="hover:text-fg transition-colors">
            Discover
          </Link>
          <Link href="/#how" className="hover:text-fg transition-colors">
            How it works
          </Link>
          <Link href="/become-a-coach" className="hover:text-fg transition-colors">
            For coaches
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
