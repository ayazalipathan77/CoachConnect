'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter } from 'lucide-react';
import { coaches, sports } from './data';
import { CoachCard } from './CoachCard';

export function CoachDiscovery() {
  const [activeSport, setActiveSport] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCoaches = coaches.filter(coach => {
    const matchesSport = activeSport === 'All' || coach.sport === activeSport;
    const matchesSearch = coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          coach.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <section id="discover" className="relative py-24 z-10">
      <div className="max-w-none mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12"
        >
          <div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Discover <span className="text-brand">Coaches</span>
            </h2>
            <p className="text-white/60 font-sans max-w-xl text-lg">
              Find the perfect coach nearby. Filter by discipline, location, experience level, and price.
            </p>
          </div>

          <div className="w-full md:w-auto flex items-center gap-4">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-full py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
            </div>
            <button className="bg-surface border border-white/10 p-3.5 rounded-full text-white hover:text-brand hover:border-brand transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Categories Track */}
        <motion.div
          className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0 mb-10"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <button
            onClick={() => setActiveSport('All')}
            className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm transition-all ${
              activeSport === 'All'
                ? 'bg-brand text-black'
                : 'bg-surface border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            All Sports
          </button>
          {sports.map(sport => (
            <button
              key={sport.id}
              onClick={() => setActiveSport(sport.name)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm transition-all ${
                activeSport === sport.name
                  ? 'bg-brand text-black'
                  : 'bg-surface border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {sport.name}
            </button>
          ))}
        </motion.div>

        {/* Coach Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach, idx) => (
            <CoachCard key={coach.id} coach={coach} index={idx} />
          ))}
        </div>

        {filteredCoaches.length === 0 && (
          <div className="text-center py-20 text-white/40">
            No coaches found matching your criteria.
          </div>
        )}

      </div>
    </section>
  );
}
