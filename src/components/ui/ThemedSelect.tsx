'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export type SelectOption = { value: string; label: string };

type Props = {
  options: SelectOption[];
  /** Controlled value — provide this + onChange for controlled use (e.g. URL-driven filters). */
  value?: string;
  /** Uncontrolled starting value — for plain form use without external state. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** When provided, a hidden <input type="hidden"> is rendered so the field submits with a form. */
  name?: string;
  placeholder?: string;
  className?: string;
};

export function ThemedSelect({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  name,
  placeholder = 'Select…',
  className,
}: Props) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const value = isControlled ? controlledValue : internalValue;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); return; }
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = options[(idx + 1) % options.length];
      if (next) pick(next.value);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = options[(idx - 1 + options.length) % options.length];
      if (prev) pick(prev.value);
    }
  }

  function pick(v: string) {
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {/* Hidden field for form submission */}
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between gap-2 bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
      >
        <span className={selected ? 'text-white' : 'text-white/40'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-50 top-full mt-1.5 w-full min-w-max bg-[#1a1a1a] border border-white/15 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => pick(o.value)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  active
                    ? 'text-brand bg-brand/10 font-medium'
                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                }`}
              >
                {o.label}
                {active && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
