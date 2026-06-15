'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

type SportOpt = { name: string; slug: string };

export function DiscoverControls({
  sports,
  q = '',
  sport = '',
  sort = 'relevance',
}: {
  sports: SportOpt[];
  q?: string;
  sport?: string;
  sort?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);

  function navigate(next: Partial<{ q: string; sport: string; sort: string }>) {
    const params = new URLSearchParams();
    const merged = { q: query, sport, sort, ...next };
    if (merged.q) params.set('q', merged.q);
    if (merged.sport) params.set('sport', merged.sport);
    if (merged.sort && merged.sort !== 'relevance') params.set('sort', merged.sort);
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
        <select
          value={sort}
          onChange={(e) => navigate({ sort: e.target.value })}
          className="bg-surface border border-white/10 rounded-full px-5 py-3.5 text-white text-sm focus:outline-none focus:border-brand md:w-56"
        >
          <option value="relevance">Highest rated</option>
          <option value="price">Lowest price</option>
          <option value="reviews">Most reviewed</option>
        </select>
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
