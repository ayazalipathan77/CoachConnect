'use client';

import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "Marcus completely transformed my serve. The video analysis sessions were a game changer, allowing me to see exactly where my kinetic chain was breaking down.",
    author: "James T.",
    role: "Amateur Tennis Player",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    coach: "Trained with Marcus Chen"
  },
  {
    id: 2,
    quote: "I've worked with dozens of PTs, but Sarah's bespoke plans are on another level. She scales the intensity perfectly around my competition schedule.",
    author: "Elena R.",
    role: "Competitive Lifter",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    coach: "Trained with Sarah Jenkins"
  },
  {
    id: 3,
    quote: "The 1-on-1 sparring and technical breakdowns gave me the confidence to step into the ring for my first amateur bout. Pure elite coaching.",
    author: "Michael B.",
    role: "Amateur Boxer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    coach: "Trained with David Okafor"
  }
];

export function Testimonials() {
  return (
    <section className="relative py-32 z-10 overflow-hidden bg-[#050505]">
      {/* Decorative background gradients */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#CCFF00]/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />

      <div className="max-w-none mx-auto px-6 lg:px-12">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Athlete <span className="text-brand">Triumphs.</span>
          </h2>
          <p className="text-white/60 font-sans max-w-2xl mx-auto text-lg">
            Real results from real athletes. See how our elite coaches are transforming potential into performance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.2, ease: "easeOut" }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-[#CCFF00]/50 transition-colors duration-500 group flex flex-col"
            >
              {/* Large ambient quote icon */}
              <Quote className="absolute top-6 right-6 w-16 h-16 text-white/5 rotate-12 group-hover:text-[#CCFF00]/10 transition-colors duration-500 pointer-events-none" />

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" />
                ))}
              </div>

              <p className="font-sans text-white/80 text-lg leading-relaxed mb-8 flex-1 relative z-10">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-4 mt-auto relative z-10">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#CCFF00] transition-colors duration-500">
                  <img src={t.image} alt={t.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-white font-bold">{t.author}</h4>
                  <p className="text-white/40 text-xs">{t.role}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[#CCFF00]/80 text-xs font-medium uppercase tracking-wider">
                  {t.coach}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
