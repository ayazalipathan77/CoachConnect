'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

type Sport = { name: string; slug: string };

type Props = {
  sports: Sport[];
  value: string;
  onChange: (slug: string) => void;
  className?: string;
};

export function SportCombobox({ sports, value, onChange, className }: Props) {
  const selected = sports.find((s) => s.slug === value);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? sports.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : sports;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function pick(slug: string) {
    onChange(slug);
    setQuery('');
    setOpen(false);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  }

  const displayValue = open ? query : (selected?.name ?? '');

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          ref={inputRef}
          value={displayValue}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="All sports"
          className="w-full bg-surface border border-white/10 rounded-xl pl-10 pr-8 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
        />
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            aria-label="Clear sport filter"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 top-full mt-1.5 w-full min-w-[200px] max-h-64 overflow-y-auto bg-[#1a1a1a] border border-white/15 rounded-xl shadow-2xl shadow-black/60"
        >
          {/* All sports option */}
          <button
            type="button"
            onClick={() => pick('')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
              !value ? 'text-brand bg-brand/10 font-medium' : 'text-white/75 hover:bg-white/5 hover:text-white'
            }`}
          >
            All sports
            {!value && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
          </button>

          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-white/30">No sports match &quot;{query}&quot;</p>
          ) : (
            filtered.map((s) => {
              const active = s.slug === value;
              return (
                <button
                  key={s.slug}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(s.slug)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                    active
                      ? 'text-brand bg-brand/10 font-medium'
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {s.name}
                  {active && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
