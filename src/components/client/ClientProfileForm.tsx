'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { updateClientProfile, type ClientProfileState } from '@/server/client/actions';
import { format } from 'date-fns';
import { usePendingLoader } from '@/components/providers/LoadingProvider';

type Props = {
  defaultValues: {
    name: string | null;
    locationCity: string | null;
    locationPostcode: string | null;
    dob: Date | null;
  };
};

export function ClientProfileForm({ defaultValues: d }: Props) {
  const [state, action, pending] = useActionState<ClientProfileState, FormData>(
    updateClientProfile,
    undefined,
  );
  usePendingLoader(pending);

  const dobStr = d.dob ? format(d.dob, 'yyyy-MM-dd') : '';

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

      <Field label="Full name">
        <input name="name" defaultValue={d.name ?? ''} required maxLength={120} placeholder="Your name" className={input} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City">
          <input name="locationCity" defaultValue={d.locationCity ?? ''} placeholder="e.g. London" className={input} />
        </Field>
        <Field label="Postcode (optional)">
          <input name="locationPostcode" defaultValue={d.locationPostcode ?? ''} placeholder="e.g. SW1A 1AA" className={input} />
        </Field>
      </div>

      <Field label="Date of birth (optional)">
        <input type="date" name="dob" defaultValue={dobStr} className={`${input} [color-scheme:dark]`} />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-brand text-black px-6 py-3 rounded-full font-bold hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-60"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save profile'}
      </button>
    </form>
  );
}

const input = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-white/70">{label}</span>
      {children}
    </label>
  );
}
