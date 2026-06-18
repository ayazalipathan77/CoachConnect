'use client';

import { useActionState } from 'react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { purchaseFeaturedPlan, type FeaturedState } from '@/server/coach/featured-actions';
import { usePendingLoader } from '@/components/providers/LoadingProvider';
import { gbp } from '@/lib/money';

type Plan = { id: string; label: string; durationDays: number; priceMinor: number };

export function FeaturedPlanCard({ plan }: { plan: Plan }) {
  const [state, action, pending] = useActionState<FeaturedState, FormData>(
    purchaseFeaturedPlan,
    undefined,
  );
  usePendingLoader(pending);

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:border-brand/30 transition-colors">
      <div className="flex items-center gap-2 text-brand">
        <Sparkles className="w-4 h-4" />
        <h3 className="font-bold">{plan.label}</h3>
      </div>
      <p className="text-white/40 text-sm">{plan.durationDays} days of top placement in discover &amp; search results.</p>
      <p className="font-display font-bold text-3xl text-white">{gbp(plan.priceMinor)}</p>

      <form action={action} className="mt-auto">
        <input type="hidden" name="planId" value={plan.id} />
        {state?.error && <p className="text-red-400 text-xs mb-2">{state.error}</p>}
        {state?.success && (
          <p className="flex items-center gap-1.5 text-brand text-xs mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Purchased — you&apos;re featured now.
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 bg-brand text-black px-4 py-2.5 rounded-full font-bold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get featured'}
        </button>
      </form>
    </div>
  );
}
