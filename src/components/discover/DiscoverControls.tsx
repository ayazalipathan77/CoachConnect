'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutGrid, Map, Navigation, Search } from 'lucide-react';

type SportOpt = { name: string; slug: string };

export function DiscoverControls({
  sports,
  q = '',
  sport = '',
  sort = 'relevance',
  view = 'grid',
  near = '',
  maxPrice = '',
  minRating = '',
  level = '',
}: {
  sports: SportOpt[];
  q?: string;
  sport?: string;
  sort?: string;
  view?: string;
  near?: string;
  maxPrice?: string;
  minRating?: string;
  level?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const [nearQuery, setNearQuery] = useState(near);

  function navigate(next: Partial<{ q: string; sport: string; sort: string; view: string; near: string; maxPrice: string; minRating: string; level: string }>) {
    const params = new URLSearchParams();
    const merged = { q: query, sport, sort, view, near: nearQuery, maxPrice, minRating, level, ...next };
    if (merged.q) params.set('q', merged.q);
    if (merged.sport) params.set('sport', merged.sport);
    if (merged.sort && merged.sort !== 'relevance') params.set('sort', merged.sort);
    if (merged.view && merged.view !== 'grid') params.set('view', merged.view);
    if (merged.near) params.set('near', merged.near);
    if (merged.maxPrice) params.set('maxPrice', merged.maxPrice);
    if (merged.minRating) params.set('minRating', merged.minRating);
    if (merged.level) params.set('level', merged.level);
    router.push(`/discover${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4">
        <form
          className="relative flex-1"
          onSubmit={(e) => { e.preventDefault(); navigate({ q: query }); }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coach name or city…"
            className="w-full bg-surface border border-white/10 rounded-full py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </form>

        {/* Proximity filter — only relevant in map view */}
        <form
          className="relative md:w-56"
          onSubmit={(e) => { e.preventDefault(); navigate({ near: nearQuery, view: 'map' }); }}
        >
          <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            value={nearQuery}
            onChange={(e) => setNearQuery(e.target.value)}
            placeholder="Near city or postcode…"
            className="w-full bg-surface border border-white/10 rounded-full py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </form>

        <select
          value={sort}
          onChange={(e) => navigate({ sort: e.target.value })}
          className="bg-surface border border-white/10 rounded-full px-5 py-3.5 text-white text-sm focus:outline-none focus:border-brand md:w-44 [color-scheme:dark]"
        >
          <option value="relevance">Highest rated</option>
          <option value="price">Lowest price</option>
          <option value="reviews">Most reviewed</option>
        </select>

        <select
          value={maxPrice}
          onChange={(e) => navigate({ maxPrice: e.target.value })}
          className="bg-surface border border-white/10 rounded-full px-5 py-3.5 text-white text-sm focus:outline-none focus:border-brand md:w-36 [color-scheme:dark]"
        >
          <option value="">Any price</option>
          <option value="30">Up to £30/hr</option>
          <option value="50">Up to £50/hr</option>
          <option value="75">Up to £75/hr</option>
          <option value="100">Up to £100/hr</option>
        </select>

        <select
          value={minRating}
          onChange={(e) => navigate({ minRating: e.target.value })}
          className="bg-surface border border-white/10 rounded-full px-5 py-3.5 text-white text-sm focus:outline-none focus:border-brand md:w-36 [color-scheme:dark]"
        >
          <option value="">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
          <option value="5">5 stars</option>
        </select>

        <select
          value={level}
          onChange={(e) => navigate({ level: e.target.value })}
          className="bg-surface border border-white/10 rounded-full px-5 py-3.5 text-white text-sm focus:outline-none focus:border-brand md:w-44 [color-scheme:dark]"
        >
          <option value="">All levels</option>
          <option value="beginner_friendly">Beginner-friendly</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        {/* Grid / Map toggle */}
        <div className="flex rounded-full border border-white/10 overflow-hidden shrink-0">
          <button
            onClick={() => navigate({ view: 'grid' })}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-colors ${view === 'grid' ? 'bg-brand text-black' : 'bg-surface text-white/60 hover:text-white'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
          <button
            onClick={() => navigate({ view: 'map' })}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-colors ${view === 'map' ? 'bg-brand text-black' : 'bg-surface text-white/60 hover:text-white'}`}
          >
            <Map className="w-4 h-4" /> Map
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        <Pill active={!sport} onClick={() => navigate({ sport: '' })}>All sports</Pill>
        {sports.map((s) => (
          <Pill key={s.slug} active={sport === s.slug} onClick={() => navigate({ sport: s.slug })}>
            {s.name}
          </Pill>
        ))}
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
        active ? 'bg-brand text-black' : 'bg-surface border border-white/10 text-white/70 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}
