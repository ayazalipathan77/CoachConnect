import Link from 'next/link';
import { MapPin, Star, BadgeCheck, ArrowRight, Sparkles } from 'lucide-react';
import { gbp } from '@/lib/money';
import type { CoachCard } from '@/server/repositories/coaches';

const LEVEL_LABEL: Record<string, string> = {
  beginner_friendly: 'Beginner-friendly',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  elite: 'Elite',
};

export function CoachGridCard({ coach }: { coach: CoachCard }) {
  return (
    <Link
      href={`/coach/${coach.id}`}
      className="group relative bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-brand/50 transition-colors flex flex-col"
    >
      <div className="relative h-60 overflow-hidden">
        {coach.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coach.image} alt={coach.name ?? 'Coach'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-surface-light" />
        )}
        <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
          {coach.featured && (
            <span className="inline-flex items-center gap-1 bg-brand text-black font-bold px-2.5 py-1 rounded-full text-xs">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-brand fill-brand" />
            <span className="text-white font-bold text-sm">{coach.ratingAvg.toFixed(1)}</span>
            <span className="text-white/60 text-xs">({coach.ratingCount})</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-brand text-black font-bold px-3 py-1 rounded-full text-sm shadow-[0_0_15px_rgba(204,255,0,0.4)]">
          {gbp(coach.rateMinor, { perHour: true })}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent pointer-events-none" />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-2xl text-white">{coach.name}</h3>
          {coach.verified && <BadgeCheck className="w-5 h-5 text-brand" />}
        </div>
        <p className="text-brand font-medium">{coach.sport ?? 'Multi-sport'}</p>
        <div className="flex items-center gap-2 mt-3 text-sm text-white/60">
          <MapPin className="w-4 h-4" /> {coach.city ?? 'Remote'}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs text-white/80">
            {LEVEL_LABEL[coach.experienceLevel] ?? coach.experienceLevel}
          </span>
        </div>
        <div className="mt-auto pt-6 flex items-center justify-between text-white group-hover:text-brand transition-colors">
          <span className="font-bold">View profile & book</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
