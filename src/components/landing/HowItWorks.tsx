'use client';

import { motion } from 'motion/react';
import { Search, CreditCard, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Find Your Coach',
    description:
      'Browse hundreds of verified elite coaches by sport, location, price and rating. Use the map view to discover coaches near you or filter by discipline.',
    cta: { label: 'Browse coaches', href: '/discover' },
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Book & Pay Securely',
    description:
      'Choose a slot that fits your schedule and pay through our secure escrow system. Your funds are held safely until your session is complete — no risk to you.',
    cta: null,
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Train & Progress',
    description:
      'Show up, put the work in, and let your coach drive the results. After each session, leave a review and track your progress over time through your dashboard.',
    cta: null,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 z-10 bg-[#050505]">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="px-6 lg:px-12">
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-brand text-sm font-bold uppercase tracking-widest mb-3">Simple by design</p>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-white tracking-tighter">
            Three steps to<br />
            <span className="text-brand">elite coaching.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
              className="relative flex flex-col"
            >
              {/* Step number badge + icon */}
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-3xl bg-[#111] border border-white/10 flex items-center justify-center group-hover:border-brand/40 transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent" />
                  <step.icon className="w-10 h-10 text-brand relative z-10" />
                </div>
                <span className="absolute -top-3 -right-3 font-display font-bold text-4xl text-white/8 select-none">
                  {step.number}
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl text-white mb-4">{step.title}</h3>
              <p className="text-white/60 leading-relaxed text-base flex-1">{step.description}</p>

              {step.cta && (
                <Link
                  href={step.cta.href}
                  className="mt-6 inline-flex items-center gap-2 text-brand font-bold text-sm hover:gap-3 transition-all group"
                >
                  {step.cta.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
