'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function BecomeCoachTeaser() {
  return (
    <section className="relative py-20 z-10 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-brand/8 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 max-w-5xl mx-auto"
      >
        <div>
          <p className="text-brand text-sm font-bold uppercase tracking-widest mb-3">For coaches</p>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tighter leading-[1.05]">
            Turn your expertise into <span className="text-brand">income.</span>
          </h2>
          <p className="text-white/50 text-base mt-3 max-w-md">
            Set your own schedule and rate — we handle bookings and payments.
          </p>
        </div>

        <Link
          href="/become-a-coach"
          className="shrink-0 bg-brand text-black px-8 py-4 rounded-full font-bold text-base hover:bg-brand-dark transition-all flex items-center gap-2 group"
        >
          See how it works
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  );
}
