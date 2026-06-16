'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, BadgeCheck, CalendarDays, DollarSign, Globe } from 'lucide-react';

const perks = [
  {
    icon: CalendarDays,
    title: 'Your schedule, your rules',
    description: 'Open only the slots you want. One session a week or twenty — you set the pace.',
  },
  {
    icon: DollarSign,
    title: 'Set your own rate',
    description: 'Charge what you\'re worth. Funds are held in escrow and released to you automatically when the session completes.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified badge builds trust',
    description: 'Pass our review process and earn the CoachConnect verified badge — shown prominently on your profile and search results.',
  },
  {
    icon: Globe,
    title: 'Location or remote',
    description: 'Offer in-person sessions at your venue, online sessions, or both. Our platform handles bookings for every format.',
  },
];

export function BecomeCoach() {
  return (
    <section id="become-coach" className="relative py-32 z-10 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute bottom-0 left-1/3 w-[700px] h-[400px] bg-brand/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-brand text-sm font-bold uppercase tracking-widest mb-3">For coaches</p>
              <h2 className="font-display font-bold text-4xl md:text-6xl text-white tracking-tighter leading-[1] mb-6">
                Turn your expertise<br />
                into <span className="text-brand">income.</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed max-w-md mb-10">
                Join thousands of elite coaches already growing their client base on CoachConnect.
                No admin headaches, no chasing payments — just coaching.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup?role=coach"
                  className="bg-brand text-black px-8 py-4 rounded-full font-bold text-base hover:bg-brand-dark transition-all flex items-center gap-2 group"
                >
                  Apply as a coach
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/discover"
                  className="border border-white/20 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white/5 transition-all"
                >
                  See the platform
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right — perks grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: 'easeOut' }}
                className="bg-[#111] border border-white/8 rounded-2xl p-6 hover:border-brand/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4 group-hover:bg-brand/15 transition-colors">
                  <perk.icon className="w-5 h-5 text-brand" />
                </div>
                <h3 className="font-bold text-white mb-2">{perk.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{perk.description}</p>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <p className="text-white/40 text-sm">
            Trusted by coaches across 20+ sports in the UK & beyond.
          </p>
          <div className="flex items-center gap-8 text-white/50 text-sm">
            {[
              { value: '8,400+', label: 'Active coaches' },
              { value: '£2.4m+', label: 'Paid to coaches' },
              { value: '4.9 ★', label: 'Avg. coach rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-xl text-white">{stat.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
