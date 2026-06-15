'use client';

import { motion } from 'motion/react';
import { ArrowRight, PlayCircle } from 'lucide-react';

const stats = [
  { num: '8,400', suffix: '+', label: 'Verified coaches' },
  { num: '20', suffix: '+', label: 'Sports & disciplines' },
  { num: '4.9', suffix: '', label: 'Average coach rating' },
  { num: '96', suffix: '%', label: 'Athlete re-book rate' },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden z-10 px-6 lg:px-12 pt-32 pb-12">
      <div className="w-full grid lg:grid-cols-12 gap-10 xl:gap-16 items-center flex-1">
        {/* Left: headline spans the majority of the width */}
        <div className="lg:col-span-7 flex flex-col gap-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-border text-sm font-medium mb-6 border border-white/10 text-white/80">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              The #1 Sports Coaching Marketplace
            </div>
            <h1 className="font-display font-bold text-6xl md:text-8xl xl:text-[9rem] leading-[0.95] tracking-tighter text-white">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark italic pr-4">
                Discipline.
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-lg md:text-2xl text-white/60 max-w-2xl font-sans"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            Connect with elite coaches, book sessions seamlessly, and elevate your game to the next level. Location-based discovery for true athletes.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          >
            <button className="bg-brand text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-dark transition-all flex items-center gap-2 group">
              Find a Coach
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-transparent text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              See How it Works
            </button>
          </motion.div>
        </div>

        {/* Right: larger visual, fills its column to the page edge */}
        <div className="lg:col-span-5 relative h-[520px] xl:h-[640px] w-full hidden lg:block perspective-1000">
          <motion.div
            className="absolute inset-0 flex items-center justify-center transform-style-3d"
            initial={{ rotateY: 20, rotateX: 10, opacity: 0, scale: 0.8 }}
            animate={{ rotateY: 0, rotateX: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          >
            <div className="relative w-full h-full">
              <motion.div
                className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_70px_rgba(204,255,0,0.18)]"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80"
                  alt="Athlete Training"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </motion.div>

              {/* Floating UI Cards */}
              <motion.div
                className="absolute bottom-8 -left-10 xl:-left-16 bg-surface/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                style={{ translateZ: 50 }}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=200&q=80" alt="Coach" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Marcus Chen</p>
                  <p className="text-brand text-xs">Tennis Coach • ⭐ 4.9</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-12 -right-6 xl:-right-12 bg-surface/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                style={{ translateZ: 80 }}
              >
                <p className="text-white/60 text-xs mb-1">Next Session</p>
                <p className="text-white font-bold text-lg">Today, 18:00</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Full-width stats band — anchors the hero edge to edge */}
      <motion.div
        className="w-full grid grid-cols-2 md:grid-cols-4 gap-px mt-12 border-t border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {stats.map((s) => (
          <div key={s.label} className="py-6 pr-6">
            <div className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight">
              {s.num}
              <span className="text-brand">{s.suffix}</span>
            </div>
            <div className="text-white/50 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
