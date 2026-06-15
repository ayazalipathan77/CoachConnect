'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { Calendar, Video, Target, LineChart } from 'lucide-react';

const services = [
  {
    id: 's1',
    title: '1-on-1 Expert Sessions',
    description: 'Book private slots with verified elite coaches. Master the fundamentals and push your limits with real-time feedback and direct mentorship.',
    icon: Calendar,
  },
  {
    id: 's2',
    title: 'Video Technique Analysis',
    description: 'Upload your game footage. Get frame-by-frame breakdowns, visual annotations, and actionable corrections right in your dashboard.',
    icon: Video,
  },
  {
    id: 's3',
    title: 'Bespoke Training Plans',
    description: 'Receive customized, recurring training schedules built around your specific availability, fitness level, and competitive goals.',
    icon: Target,
  },
  {
    id: 's4',
    title: 'Progress Analytics',
    description: 'Track your journey with coach session notes, performance metrics, and goal milestones plotted beautifully over time.',
    icon: LineChart,
  }
];

function BookingVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 1.05, rotateY: -10 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative perspective-1000 w-full h-full flex flex-col items-center justify-center p-8 lg:p-12"
    >
      <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#CCFF00] to-transparent" />
        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#CCFF00]" /> Upcoming Schedule
        </h4>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-[#222] border border-white/5 shadow-inner"
            >
              <div>
                <p className="text-white font-bold text-sm">Session {i}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[#CCFF00]/80 text-[10px] bg-[#CCFF00]/10 px-2 py-0.5 rounded">10:00 AM</span>
                  <span className="text-white/40 text-[10px] bg-white/5 px-2 py-0.5 rounded">60m</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-[#CCFF00] text-black px-4 py-2 rounded-full text-xs font-bold"
              >
                Book
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative floating balls */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-12 w-16 h-16 rounded-full bg-gradient-to-br from-[#CCFF00]/20 to-transparent blur-xl pointer-events-none"
      />
    </motion.div>
  );
}

function VideoAnalysisVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full h-full flex flex-col items-center justify-center p-8 lg:p-12"
    >
      <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(204,255,0,0.15)]">
        {/* Fake video background grid */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541252874014-4daae89b2713?auto=format&fit=crop&w=800&q=80')", filter: 'grayscale(100%) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Scanning bar */}
        <motion.div
          animate={{ y: ["0%", "400%", "0%"] }}
          transition={{ duration: 5, ease: "linear", repeat: Infinity }}
          className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-transparent to-[#CCFF00]/20 border-b border-[#CCFF00]"
        />

        {/* Motion Tracking HUD via SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.circle cx="45" cy="40" r="2" fill="#CCFF00" initial={{ scale: 0 }} animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
          <motion.circle cx="55" cy="60" r="2" fill="#CCFF00" initial={{ scale: 0 }} animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} />
          <motion.circle cx="35" cy="70" r="2" fill="#CCFF00" initial={{ scale: 0 }} animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} />
          <motion.path
            d="M 45 40 L 55 60 L 35 70"
            stroke="rgba(204,255,0,0.6)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="1 1"
          />

          {/* Analysis overlay box */}
          <motion.rect
            x="30" y="35" width="40" height="45"
            fill="none" stroke="#CCFF00" strokeWidth="0.25"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          />
        </svg>

        {/* Info HUD */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white font-mono text-[10px] p-2 py-1 flex items-center gap-2 rounded border border-white/10 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Analysis Active
        </div>
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-[#CCFF00] font-mono text-[10px] p-2 py-1 rounded border border-[#CCFF00]/20 uppercase tracking-widest">
          Posture: 88%
        </div>
      </div>
    </motion.div>
  );
}

function PlanVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full h-full flex flex-col justify-center items-center p-8 lg:p-12 gap-3"
    >
      {[
        { day: 'Day 1: Power & Speed', type: 'High Intensity', duration: '60m' },
        { day: 'Day 2: Technical Drills', type: 'Focus', duration: '45m' },
        { day: 'Day 3: Active Recovery', type: 'Light', duration: '30m' }
      ].map((item, i) => (
        <motion.div
          key={item.day}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 + i * 0.15, type: "spring", stiffness: 100 }}
          className="bg-[#1a1a1a] border border-white/5 rounded-2xl w-full max-w-sm p-5 relative overflow-hidden"
        >
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1 bg-[#CCFF00]"
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ delay: 0.6 + i * 0.2, duration: 0.4 }}
          />
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-[#CCFF00]" /> {item.day}
            </h4>
            <div className="w-5 h-5 rounded-full border-2 border-white/20" />
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded-full font-medium">{item.type}</span>
            <span className="text-[10px] text-white/50 bg-white/5 px-2.5 py-1 rounded-full">{item.duration}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function ChartVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full flex items-center justify-center p-8 lg:p-12 relative"
    >
      <div className="w-full max-w-sm aspect-square bg-[#1A1A1A] rounded-[2rem] border border-white/5 p-8 flex flex-col relative shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="mb-auto">
          <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Overall Growth</p>
          <div className="flex items-baseline gap-3">
            <motion.h3
              className="text-white font-display font-bold text-6xl tracking-tighter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              94<span className="text-2xl text-[#CCFF00]">.2</span>
            </motion.h3>
            <motion.span
              className="text-[#1A1A1A] bg-[#CCFF00] px-2 py-0.5 rounded text-xs font-bold"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
            >
              +12%
            </motion.span>
          </div>
        </div>

        <div className="relative h-40 w-full mt-auto border-l border-b border-white/10">
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M 0,80 C 20,70 40,90 60,40 S 80,30 100,10"
              fill="none"
              stroke="url(#gradientChart)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
            {/* Chart filled area */}
            <motion.path
              d="M 0,80 C 20,70 40,90 60,40 S 80,30 100,10 L 100,100 L 0,100 Z"
              fill="url(#fillChart)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            />

            <defs>
              <linearGradient id="gradientChart" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#CCFF00" stopOpacity="1"/>
              </linearGradient>
              <linearGradient id="fillChart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#CCFF00" stopOpacity="0"/>
              </linearGradient>
            </defs>

            {/* Data nodes */}
            {[
              { cx: 0, cy: 80, delay: 0.3 },
              { cx: 60, cy: 40, delay: 0.8 },
              { cx: 100, cy: 10, delay: 1.2 },
            ].map((pt, i) => (
              <motion.circle
                key={i}
                cx={pt.cx} cy={pt.cy} r="3"
                fill="#1A1A1A" stroke="#CCFF00" strokeWidth="1.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: pt.delay + 0.3, type: "spring" }}
              />
            ))}
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesScroll() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let nextIndex = Math.floor(latest * 4);
    if (nextIndex >= 4) nextIndex = 3;
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  });

  return (
    <>
      {/* Mobile view: Stacked and interleaved */}
      <section className="relative z-10 bg-[#0A0A0A] border-y border-white/5 lg:hidden py-24">
        <div className="max-w-none mx-auto px-6">
          <div className="flex flex-col flex-1">
            {services.map((service, i) => (
              <div key={service.id} className="flex flex-col mb-24 last:mb-0 relative">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-xl flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-[#CCFF00]" />
                   </div>
                   <h3 className="font-display font-bold text-2xl text-white">{service.title}</h3>
                </div>
                <p className="text-white/60 text-base leading-relaxed mb-8">{service.description}</p>
                <div className="h-[400px] w-full relative bg-[#111] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                  {i === 0 && <BookingVisual />}
                  {i === 1 && <VideoAnalysisVisual />}
                  {i === 2 && <PlanVisual />}
                  {i === 3 && <ChartVisual />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop view: Pinned scrolljacking */}
      <section ref={containerRef} className="relative z-10 bg-[#0A0A0A] border-y border-white/5 h-[400vh] hidden lg:block">
        <div className="sticky top-0 h-screen w-full flex items-center">
          <div className="max-w-none mx-auto w-full px-12 flex flex-row relative h-[600px]">

            {/* Left Hand Content Area (Text) */}
            <div className="w-[45%] flex flex-col justify-center relative pr-8">
              {/* Progress Indicator */}
              <div className="flex gap-3 mb-12">
                {services.map((_, idx) => (
                  <div key={idx} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden relative">
                    <motion.div
                      className="absolute top-0 left-0 bottom-0 bg-[#CCFF00]"
                      initial={{ width: "0%" }}
                      animate={{
                        width: activeIndex > idx ? "100%" : activeIndex === idx ? "100%" : "0%"
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="flex flex-col"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-[#CCFF00]/10 border border-[#CCFF00]/20">
                    {(() => {
                      const Icon = services[activeIndex].icon;
                      return <Icon className="w-8 h-8 text-[#CCFF00]" />;
                    })()}
                  </div>
                  <h3 className="font-display font-bold text-4xl lg:text-5xl text-white mb-6 leading-tight max-w-md">
                    {services[activeIndex].title}
                  </h3>
                  <p className="font-sans text-lg lg:text-xl text-white/60 leading-relaxed max-w-md">
                    {services[activeIndex].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Hand Content Area (Visuals) */}
            <div className="w-[55%] h-full flex items-center justify-center relative pl-8">
              <div className="w-full aspect-square relative bg-[#111] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[3rem] overflow-hidden">
                <div className="absolute inset-0 rounded-[3rem] shadow-[inset_0_0_50px_rgba(204,255,0,0.03)] pointer-events-none z-10" />

                <AnimatePresence mode="wait">
                  {activeIndex === 0 && <BookingVisual key="booking" />}
                  {activeIndex === 1 && <VideoAnalysisVisual key="video" />}
                  {activeIndex === 2 && <PlanVisual key="plan" />}
                  {activeIndex === 3 && <ChartVisual key="chart" />}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
