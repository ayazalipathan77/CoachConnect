'use client';

import { motion } from 'motion/react';
import { ShieldCheck, MapPin, Trophy, Users, ArrowRight } from 'lucide-react';

const stats = [
  { num: '50,000', suffix: '+', label: 'Athletes coached' },
  { num: '8,400', suffix: '+', label: 'Verified coaches' },
  { num: '120', suffix: '', label: 'UK cities covered' },
  { num: '1.2', suffix: 'M', label: 'Sessions booked' },
];

const values = [
  { icon: ShieldCheck, title: 'Trust by default', body: 'Every coach is identity-checked and their qualifications admin-verified. Payments sit in escrow until your session is done.' },
  { icon: MapPin, title: 'Access for all', body: 'Location-based discovery means elite coaching is no longer a big-city privilege. Find world-class talent in your postcode.' },
  { icon: Trophy, title: 'Relentless excellence', body: 'We surface the coaches who actually move the needle — ranked by real reviews from completed sessions, never pay-to-win.' },
  { icon: Users, title: 'A community of progress', body: 'Coaches and athletes growing together. Message, book, train, review — one continuous loop of improvement.' },
];

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AboutContent() {
  return (
    <main className="relative z-10 w-full">
      {/* Hero */}
      <section className="relative px-6 lg:px-12 pt-40 pb-20">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-border text-sm font-medium mb-8 border border-white/10 text-white/80">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            Our Story
          </div>
        </Reveal>
        <motion.h1
          className="font-display font-bold text-6xl md:text-8xl xl:text-[8.5rem] leading-[0.95] tracking-tighter text-white max-w-6xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          We turn potential into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark italic">
            performance.
          </span>
        </motion.h1>
        <motion.p
          className="mt-8 text-xl md:text-2xl text-white/60 max-w-3xl font-sans"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          CoachConnect is the marketplace where dedicated athletes meet the coaches who can take them further — wherever they are, whatever their sport.
        </motion.p>
      </section>

      {/* The Track concept */}
      <section className="relative px-6 lg:px-12 py-24 border-y border-white/5 bg-[#0A0A0A]/60">
        <div className="w-full grid lg:grid-cols-12 gap-12 items-center">
          <Reveal className="lg:col-span-6">
            <h2 className="font-display font-bold text-4xl md:text-6xl text-white tracking-tighter leading-[1.02]">
              Every athlete <br /> follows a <span className="text-brand">track.</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl text-white/60 max-w-xl">
              Progress is never random — it&apos;s a line you run, lap after lap, marginal gain after marginal gain. We built the entire platform around that idea: a clear path from discovery, to booking, to your next personal best. The glowing lane running through this site is the same one your training follows.
            </p>
          </Reveal>

          {/* Lane visual */}
          <Reveal delay={0.15} className="lg:col-span-6">
            <div className="relative h-80 w-full rounded-3xl border border-white/10 bg-black/40 overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 320" preserveAspectRatio="none">
                {[40, 90, 140, 190, 240, 290].map((y, i) => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray={i === 2 ? '0' : '10 12'} />
                ))}
                <motion.line
                  x1="0" y1="140" x2="400" y2="140"
                  stroke="#CCFF00" strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                />
                <motion.circle
                  cx="0" cy="140" r="7" fill="#CCFF00"
                  initial={{ cx: 0 }}
                  whileInView={{ cx: 400 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                  className="drop-shadow-[0_0_12px_#CCFF00]"
                />
              </svg>
              <div className="absolute bottom-4 left-5 font-mono text-xs text-white/40 uppercase tracking-widest">Lane 4 · Your progress</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 lg:px-12 py-20">
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-y-10">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="font-display font-bold text-4xl md:text-6xl text-white tracking-tighter">
                {s.num}<span className="text-brand">{s.suffix}</span>
              </div>
              <div className="text-white/50 text-sm md:text-base mt-2">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="px-6 lg:px-12 py-24 border-t border-white/5">
        <Reveal className="mb-16 max-w-3xl">
          <h2 className="font-display font-bold text-4xl md:text-6xl text-white tracking-tighter">
            What we stand <span className="text-brand">for.</span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1}>
              <div className="group h-full bg-[#111111]/80 border border-white/10 rounded-3xl p-8 hover:border-brand/50 transition-colors duration-500">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-black text-brand transition-colors duration-500">
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-3">{v.title}</h3>
                <p className="text-white/60 text-lg leading-relaxed">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 pb-28">
        <Reveal>
          <div className="relative w-full rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#141414] to-[#0A0A0A] px-8 md:px-16 py-20 overflow-hidden">
            <div className="absolute -top-20 right-0 w-96 h-96 bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
            <h2 className="relative font-display font-bold text-4xl md:text-7xl text-white tracking-tighter max-w-4xl leading-[0.98]">
              Your next personal best starts with one booking.
            </h2>
            <div className="relative mt-10 flex flex-wrap gap-4">
              <button className="bg-brand text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-dark transition-all flex items-center gap-2 group">
                Find a Coach
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-transparent text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                Become a Coach
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
