'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { updateCoachProfile, type ProfileState } from '@/server/coach/actions';

const EXPERIENCE_LEVELS = [
  { value: 'beginner_friendly', label: 'Beginner-friendly' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];
const VISIBILITY = [
  { value: 'public', label: 'Public — visible in search' },
  { value: 'unlisted', label: 'Unlisted — link only' },
  { value: 'paused', label: 'Paused — hidden from search' },
];

type Props = {
  defaultValues: {
    headline: string | null;
    bio: string | null;
    philosophy: string | null;
    experienceYears: number;
    experienceLevel: string;
    defaultRateMinor: number | null;
    visibility: string;
    locationCity: string | null;
  };
};

export function ProfileForm({ defaultValues: d }: Props) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    updateCoachProfile,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      {state?.success && (
        <div className="flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-xl px-4 py-3 text-brand text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile saved.
        </div>
      )}
      {state?.error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{state.error}</p>
      )}

      <Section title="Identity">
        <Field label="Headline (160 chars)">
          <input name="headline" defaultValue={d.headline ?? ''} maxLength={160} placeholder="e.g. UEFA B-Licence coach · 10 years · London" className={input} />
        </Field>
        <Field label="Bio">
          <textarea name="bio" defaultValue={d.bio ?? ''} rows={5} placeholder="Tell clients about your coaching style and background…" className={`${input} resize-none`} />
        </Field>
        <Field label="Coaching philosophy (optional)">
          <textarea name="philosophy" defaultValue={d.philosophy ?? ''} rows={3} placeholder="What do you believe makes a great athlete?" className={`${input} resize-none`} />
        </Field>
      </Section>

      <Section title="Experience">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Years of experience">
            <input type="number" name="experienceYears" min={0} max={50} defaultValue={d.experienceYears} className={input} />
          </Field>
          <Field label="Level focus">
            <select name="experienceLevel" defaultValue={d.experienceLevel} className={input}>
              {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Pricing & Visibility">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Default session rate (£/hr)">
            <input type="number" name="defaultRateMinor" min={0} step={1} defaultValue={d.defaultRateMinor != null ? d.defaultRateMinor / 100 : ''} placeholder="60" className={input} />
          </Field>
          <Field label="Profile visibility">
            <select name="visibility" defaultValue={d.visibility} className={input}>
              {VISIBILITY.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Location">
        <Field label="City">
          <input name="locationCity" defaultValue={d.locationCity ?? ''} placeholder="e.g. London" className={input} />
        </Field>
      </Section>

      <button type="submit" disabled={pending} className="self-start bg-brand text-black px-6 py-3 rounded-full font-bold hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-60">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save profile'}
      </button>
    </form>
  );
}

const input = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all [color-scheme:dark]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-white/70">{label}</span>
      {children}
    </label>
  );
}
