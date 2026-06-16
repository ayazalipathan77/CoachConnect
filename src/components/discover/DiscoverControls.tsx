'use client';

import { useRouter } from 'next/navigation';
import { LayoutGrid, Map, Navigation, Search } from 'lucide-react';
import { useState } from 'react';
import { ThemedSelect } from '@/components/ui/ThemedSelect';
import { SportCombobox } from '@/components/ui/SportCombobox';

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
    <div className="flex flex-col gap-4">
      {/* Row 1: search + near + view toggle */}
      <div className="flex flex-col md:flex-row gap-3">
        <form
          className="relative flex-1"
          onSubmit={(e) => { e.preventDefault(); navigate({ q: query }); }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coach name or city…"
            className="w-full bg-surface border border-white/10 rounded-full py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </form>

        <form
          className="relative md:w-52"
          onSubmit={(e) => { e.preventDefault(); navigate({ near: nearQuery, view: 'map' }); }}
        >
          <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
          <input
            value={nearQuery}
            onChange={(e) => setNearQuery(e.target.value)}
            placeholder="Near city or postcode…"
            className="w-full bg-surface border border-white/10 rounded-full py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </form>

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

      {/* Row 2: sport autocomplete + filter dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <SportCombobox
          sports={sports}
          value={sport}
          onChange={(s) => navigate({ sport: s })}
          className="sm:w-52"
        />

        <ThemedSelect
          value={sort}
          onChange={(v) => navigate({ sort: v })}
          options={[
            { value: 'relevance', label: 'Highest rated' },
            { value: 'price', label: 'Lowest price' },
            { value: 'reviews', label: 'Most reviewed' },
          ]}
          placeholder="Sort by"
          className="sm:w-44"
        />

        <ThemedSelect
          value={maxPrice}
          onChange={(v) => navigate({ maxPrice: v })}
          options={[
            { value: '', label: 'Any price' },
            { value: '30', label: 'Up to £30/hr' },
            { value: '50', label: 'Up to £50/hr' },
            { value: '75', label: 'Up to £75/hr' },
            { value: '100', label: 'Up to £100/hr' },
          ]}
          placeholder="Any price"
          className="sm:w-40"
        />

        <ThemedSelect
          value={minRating}
          onChange={(v) => navigate({ minRating: v })}
          options={[
            { value: '', label: 'Any rating' },
            { value: '4', label: '4+ stars' },
            { value: '4.5', label: '4.5+ stars' },
            { value: '5', label: '5 stars only' },
          ]}
          placeholder="Any rating"
          className="sm:w-36"
        />

        <ThemedSelect
          value={level}
          onChange={(v) => navigate({ level: v })}
          options={[
            { value: '', label: 'All levels' },
            { value: 'beginner_friendly', label: 'Beginner-friendly' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
          ]}
          placeholder="All levels"
          className="sm:w-44"
        />
      </div>
    </div>
  );
}
