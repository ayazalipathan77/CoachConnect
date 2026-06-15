'use client';

import { motion } from 'motion/react';
import { ArrowRight, PlayCircle } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden z-10 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-border text-sm font-medium mb-6 border border-white/10 text-white/80">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              The #1 Sports Coaching Marketplace
            </div>
            <h1 className="font-display font-bold text-6xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tighter text-white">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark italic pr-4">
                Discipline.
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-white/60 max-w-lg font-sans"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            Connect with elite coaches, book sessions seamlessly, and elevate your game to the next level. Location-based discovery for true athletes.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
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

        <div className="relative h-[600px] w-full hidden lg:block perspective-1000">
          <motion.div
            className="absolute inset-0 flex items-center justify-center transform-style-3d"
            initial={{ rotateY: 20, rotateX: 10, opacity: 0, scale: 0.8 }}
            animate={{ rotateY: 0, rotateX: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          >
            {/* 3D Floating Elements Assembly */}
            <div className="relative w-full h-full max-w-md mx-auto">
              <motion.div
                className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(204,255,0,0.15)]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
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
                className="absolute bottom-8 -left-12 bg-surface/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4"
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
                className="absolute top-12 -right-8 bg-surface/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl"
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
    </section>
  );
}
