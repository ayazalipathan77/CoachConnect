'use client';

import { motion } from 'motion/react';
import { MapPin, Star, Clock, ArrowRight } from 'lucide-react';
import { Coach } from './types';

interface CoachCardProps {
  coach: Coach;
  index: number;
}

export function CoachCard({ coach, index }: CoachCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-brand/50 transition-colors flex flex-col"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={coach.imageUrl}
          alt={coach.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg">
          <Star className="w-4 h-4 text-brand fill-brand" />
          <span className="text-white font-bold text-sm">{coach.rating}</span>
          <span className="text-white/60 text-xs">({coach.reviews})</span>
        </div>
        <div className="absolute top-4 right-4 bg-brand text-black font-bold px-3 py-1 rounded-full text-sm shadow-[0_0_15px_rgba(204,255,0,0.4)]">
          £{coach.hourlyRate}/hr
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent pointer-events-none" />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-display font-bold text-2xl text-white">{coach.name}</h3>
            <p className="text-brand font-medium">{coach.sport}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 text-sm text-white/60 font-sans mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{coach.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-white/80">{coach.availability}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs text-white/80">
            {coach.experienceLevel}
          </span>
          {coach.tags.map(tag => (
            <span key={tag} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs text-white/50">
              {tag}
            </span>
          ))}
        </div>

        <button className="mt-auto w-full group/btn relative overflow-hidden bg-white/5 hover:bg-brand border border-white/10 hover:border-brand transition-colors rounded-xl py-3.5 flex items-center justify-center gap-2">
          <span className="font-bold text-white group-hover/btn:text-black transition-colors relative z-10">
            View Profile & Book
          </span>
          <ArrowRight className="w-4 h-4 text-white group-hover/btn:text-black transition-colors relative z-10" />
        </button>
      </div>
    </motion.div>
  );
}
