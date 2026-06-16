'use client';

import { useActionState, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { editSlot, type SlotState } from '@/server/coach/actions';
import { ThemedSelect } from '@/components/ui/ThemedSelect';

const SESSION_TYPES = ['Beginner Lesson', 'Technique Drill', 'Fitness', 'Match Practice', 'Assessment'];
const DURATIONS = [15, 30, 45, 60, 90];

type Opt = { id: string; label: string };

type Props = {
  slotId: string;
  venues: Opt[];
  sports: Opt[];
  defaults: {
    date: string;
    time: string;
    durationMin: number;
    sessionType: string;
    feeGBP: number;
    venueId: string | null;
    sportId: string | null;
  };
};

export function SlotEditForm({ slotId, venues, sports, defaults }: Props) {
  const [state, action, pending] = useActionState<SlotState, FormData>(editSlot, undefined);
  const [venue, setVenue] = useState(defaults.venueId ?? 'new');

  return (
    <form action={action} className="flex flex-col gap-5 max-w-xl">
      <input type="hidden" name="slotId" value={slotId} />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date"><input type="date" name="date" required defaultValue={defaults.date} className={input} /></Field>
        <Field label="Start time"><input type="time" name="time" required defaultValue={defaults.time} className={input} /></Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Duration">
          <ThemedSelect
            name="durationMin"
            defaultValue={String(defaults.durationMin)}
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} min` }))}
          />
        </Field>
        <Field label="Session fee (£)">
          <input type="number" name="feeGBP" min="0" step="1" defaultValue={defaults.feeGBP} required className={input} />
        </Field>
      </div>

      <Field label="Session type">
        <ThemedSelect
          name="sessionType"
          defaultValue={defaults.sessionType}
          options={SESSION_TYPES.map((t) => ({ value: t, label: t }))}
        />
      </Field>

      <Field label="Sport">
        <ThemedSelect
          name="sportId"
          defaultValue={defaults.sportId ?? ''}
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
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save changes</>}
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
