'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Activity, Dumbbell, Target, Timer } from 'lucide-react';

export function SportsShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const showcaseItems = [
    { title: 'Strength', icon: Dumbbell, img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80', delay: 0 },
    { title: 'Agility', icon: Activity, img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80', delay: 0.1 },
    { title: 'Precision', icon: Target, img: 'https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&w=600&q=80', delay: 0.2 },
    { title: 'Endurance', icon: Timer, img: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80', delay: 0.3 },
  ];

  return (
    <section ref={sectionRef} className="relative py-32 z-10 overflow-hidden">
      <div className="max-w-none mx-auto px-6 lg:px-12">
        <motion.div
          className="text-center mb-20"
          style={{ opacity, scale }}
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Any Discipline. <span className="text-white/40">Mastered.</span>
          </h2>
          <p className="text-white/60 font-sans max-w-2xl mx-auto text-lg">
            Our platform connects you with verified experts across all major sports.
            From court to pool, track to ring.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
          {showcaseItems.map((item, i) => (
            <motion.div
              key={item.title}
              className="relative group h-96 rounded-3xl overflow-hidden border border-white/5"
              style={{ y: i % 2 === 0 ? y1 : y2 }}
              initial={{ opacity: 0, rotateX: 20 }}
              whileInView={{ opacity: 1, rotateX: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8, delay: item.delay }}
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100 mix-blend-luminosity hover:mix-blend-normal"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <span className="font-display font-bold text-2xl text-white">{item.title}</span>
                <div className="w-10 h-10 rounded-full bg-brand/20 backdrop-blur-md flex items-center justify-center text-brand">
                  <item.icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
