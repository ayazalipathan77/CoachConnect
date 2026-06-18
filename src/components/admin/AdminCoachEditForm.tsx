'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { adminUpdateCoachProfile, type AdminCoachState } from '@/server/admin/actions';
import { ThemedSelect } from '@/components/ui/ThemedSelect';
import { usePendingLoader } from '@/components/providers/LoadingProvider';

type Defaults = {
  coachId: string;
  headline: string | null;
  bio: string | null;
  defaultRateGBP: number | null;
  visibility: 'public' | 'unlisted' | 'paused';
  status: 'pending_review' | 'active' | 'paused' | 'suspended';
};

const VISIBILITY = [
  { value: 'public', label: 'Public — visible in search' },
  { value: 'unlisted', label: 'Unlisted — link only' },
  { value: 'paused', label: 'Paused — hidden from search' },
];
const STATUS = [
  { value: 'pending_review', label: 'Pending review' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'suspended', label: 'Suspended' },
];

export function AdminCoachEditForm({ defaults: d }: { defaults: Defaults }) {
  const [state, action, pending] = useActionState<AdminCoachState, FormData>(
    adminUpdateCoachProfile,
    undefined,
  );
  usePendingLoader(pending);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="coachId" value={d.coachId} />

      {state?.success && (
        <div className="flex items-center gap-2 text-brand text-sm bg-brand/10 border border-brand/20 rounded-xl px-4 py-2.5">
          <CheckCircle2 className="w-4 h-4" /> Coach profile updated.
        </div>
      )}
      {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Headline</span>
        <input name="headline" maxLength={160} defaultValue={d.headline ?? ''} className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Bio</span>
        <textarea name="bio" rows={4} maxLength={2000} defaultValue={d.bio ?? ''} className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Default rate (£/hr)</span>
        <input name="defaultRateGBP" type="number" min={0} step={0.5} defaultValue={d.defaultRateGBP ?? ''} className={input} />
      </label>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Visibility</span>
          <ThemedSelect name="visibility" defaultValue={d.visibility} options={VISIBILITY} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Status</span>
          <ThemedSelect name="status" defaultValue={d.status} options={STATUS} />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start flex items-center justify-center gap-2 bg-brand text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
      </button>
    </form>
  );
}

const input =
  'w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all [color-scheme:dark]';
