'use client';

import { useActionState, useState } from 'react';
import { Loader2, CalendarPlus, Info } from 'lucide-react';
import { createSlot, type SlotState } from '@/server/coach/actions';
import { ThemedSelect } from '@/components/ui/ThemedSelect';
import { usePendingLoader } from '@/components/providers/LoadingProvider';

const SESSION_TYPES = ['Beginner Lesson', 'Technique Drill', 'Fitness', 'Match Practice', 'Assessment'];
const DURATIONS = [15, 30, 45, 60, 90];

type Opt = { id: string; label: string };

export type SlotFormDefaults = {
  durationMin?: number;
  sessionType?: string;
  feeGBP?: number;
  maxParticipants?: number;
  venueId?: string;
  sportId?: string;
  recreated?: boolean;
};

export function SlotForm({
  venues,
  sports,
  defaults,
}: {
  venues: Opt[];
  sports: Opt[];
  defaults?: SlotFormDefaults;
}) {
  const [state, action, pending] = useActionState<SlotState, FormData>(createSlot, undefined);
  usePendingLoader(pending);
  const [venue, setVenue] = useState(defaults?.venueId ?? venues[0]?.id ?? 'new');

  return (
    <form action={action} className="flex flex-col gap-5 max-w-xl">
      {defaults?.recreated && (
        <p className="flex items-start gap-2 text-sm text-brand bg-brand/10 border border-brand/20 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          Date and time needed — all other details pre-filled from your previous session.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date"><input type="date" name="date" required defaultValue="" className={input} /></Field>
        <Field label="Start time"><input type="time" name="time" required defaultValue="" className={input} /></Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Duration">
          <ThemedSelect
            name="durationMin"
            defaultValue={String(defaults?.durationMin ?? 60)}
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} min` }))}
          />
        </Field>
        <Field label="Session fee (£)">
          <input type="number" name="feeGBP" min="0" step="1" defaultValue={defaults?.feeGBP ?? 50} required className={input} />
        </Field>
      </div>

      <Field label="Session type">
        <ThemedSelect
          name="sessionType"
          defaultValue={defaults?.sessionType ?? SESSION_TYPES[0]}
          options={SESSION_TYPES.map((t) => ({ value: t, label: t }))}
        />
      </Field>

      <Field label="Max participants">
        <input type="number" name="maxParticipants" min="1" max="20" defaultValue={defaults?.maxParticipants ?? 1} className={input} />
      </Field>

      <Field label="Sport">
        <ThemedSelect
          name="sportId"
          defaultValue={defaults?.sportId ?? sports[0]?.id ?? ''}
          options={sports.map((s) => ({ value: s.id, label: s.label }))}
          placeholder="Select sport…"
        />
      </Field>

      <Field label="Venue">
        <ThemedSelect
          name="venueId"
          value={venue}
          onChange={(v) => setVenue(v)}
          options={[
            ...venues.map((v) => ({ value: v.id, label: v.label })),
            { value: 'new', label: '+ Add a new venue' },
          ]}
          placeholder="Select venue…"
        />
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
