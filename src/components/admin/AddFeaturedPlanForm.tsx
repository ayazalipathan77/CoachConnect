'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { addFeaturedPlan, type SettingsState } from '@/server/admin/settings-actions';
import { usePendingLoader } from '@/components/providers/LoadingProvider';

export function AddFeaturedPlanForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(addFeaturedPlan, undefined);
  usePendingLoader(pending);

  return (
    <form action={action} className="flex flex-col gap-3">
      {state?.success && (
        <div className="flex items-center gap-2 text-brand text-sm">
          <CheckCircle2 className="w-4 h-4" /> Plan added.
        </div>
      )}
      {state?.error && <p className="text-red-400 text-xs">{state.error}</p>}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Key (unique, e.g. &quot;weekly&quot;)</span>
        <input name="key" required maxLength={40} placeholder="weekly" className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Label</span>
        <input name="label" required maxLength={120} placeholder="Weekly boost" className={input} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Duration (days)</span>
          <input name="durationDays" type="number" required min={1} max={3650} placeholder="7" className={input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Price (£)</span>
          <input name="priceGBP" type="number" required min={0} step={0.5} placeholder="15" className={input} />
        </label>
      </div>

      <button type="submit" disabled={pending} className="flex items-center justify-center gap-2 bg-brand text-black px-4 py-2.5 rounded-full font-bold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add plan'}
      </button>
    </form>
  );
}

const input =
  'w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all [color-scheme:dark]';
