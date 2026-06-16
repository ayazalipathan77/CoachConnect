'use client';

import { useActionState, useState } from 'react';
import { Loader2, CalendarPlus } from 'lucide-react';
import { createSlot, type SlotState } from '@/server/coach/actions';

const SESSION_TYPES = ['Beginner Lesson', 'Technique Drill', 'Fitness', 'Match Practice', 'Assessment'];
const DURATIONS = [15, 30, 45, 60, 90];

type Opt = { id: string; label: string };

export function SlotForm({ venues, sports }: { venues: Opt[]; sports: Opt[] }) {
  const [state, action, pending] = useActionState<SlotState, FormData>(createSlot, undefined);
  const [venue, setVenue] = useState(venues[0]?.id ?? 'new');

  return (
    <form action={action} className="flex flex-col gap-5 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date"><input type="date" name="date" required className={input} /></Field>
        <Field label="Start time"><input type="time" name="time" required className={input} /></Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Duration">
          <select name="durationMin" defaultValue={60} className={input}>
            {DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
          </select>
        </Field>
        <Field label="Session fee (£)">
          <input type="number" name="feeGBP" min="0" step="1" defaultValue={50} required className={input} />
        </Field>
      </div>

      <Field label="Session type">
        <select name="sessionType" defaultValue={SESSION_TYPES[0]} className={input}>
          {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>

      <Field label="Sport">
        <select name="sportId" defaultValue={sports[0]?.id} className={input}>
          {sports.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </Field>

      <Field label="Venue">
        <select name="venueId" value={venue} onChange={(e) => setVenue(e.target.value)} className={input}>
          {venues.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          <option value="new">+ Add a new venue</option>
        </select>
      </Field>

      {venue === 'new' && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Venue name"><input name="newVenueName" placeholder="e.g. Riverside Courts" className={input} /></Field>
          <Field label="City"><input name="newVenueCity" placeholder="e.g. London" className={input} /></Field>
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{state.error}</p>
      )}

      <button type="submit" disabled={pending} className="bg-brand text-black px-6 py-3.5 rounded-full font-bold hover:bg-brand-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60">
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CalendarPlus className="w-4 h-4" /> Create session slot</>}
      </button>
    </form>
  );
}

const input = "w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all [color-scheme:dark]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-white/70">{label}</span>
      {children}
    </label>
  );
}
