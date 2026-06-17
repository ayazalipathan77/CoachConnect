'use client';

import { useActionState, useState } from 'react';
import { Loader2, CheckCircle2, Percent, Hourglass, X } from 'lucide-react';
import { addDiscountRule, toggleDiscountRule, deleteDiscountRule, type DiscountState } from '@/server/coach/discount-actions';
import { ThemedSelect } from '@/components/ui/ThemedSelect';
import { usePendingLoader } from '@/components/providers/LoadingProvider';
import { FormPendingLoader } from '@/components/ui/FormPendingLoader';

type Rule = {
  id: string;
  label: string;
  type: 'early_bird' | 'flat_percent';
  percentOff: number;
  minDaysBeforeStart: number | null;
  active: boolean;
  slotId: string | null;
};
type SlotOpt = { id: string; label: string };

const TYPE_OPTIONS = [
  { value: 'flat_percent', label: 'Flat % off' },
  { value: 'early_bird', label: 'Early-bird (book ahead)' },
];

export function DiscountRulesManager({ rules, slots }: { rules: Rule[]; slots: SlotOpt[] }) {
  const [type, setType] = useState<'early_bird' | 'flat_percent'>('flat_percent');
  const [state, action, pending] = useActionState<DiscountState, FormData>(addDiscountRule, undefined);
  usePendingLoader(pending);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-2">
        {rules.length === 0 ? (
          <p className="text-white/30 text-sm">No discount rules yet — add one to start offering automatic discounts.</p>
        ) : (
          rules.map((r) => (
            <div key={r.id} className={`flex items-center justify-between gap-4 bg-[#111111] border rounded-xl px-5 py-3 ${r.active ? "border-white/10" : "border-white/5 opacity-50"}`}>
              <div className="flex items-center gap-3">
                {r.type === 'early_bird' ? <Hourglass className="w-4 h-4 text-brand" /> : <Percent className="w-4 h-4 text-brand" />}
                <div>
                  <p className="font-medium text-sm">{r.label}</p>
                  <p className="text-white/40 text-xs">
                    -{r.percentOff}%{r.type === 'early_bird' ? ` · book ${r.minDaysBeforeStart}+ days ahead` : ''}
                    {r.slotId ? ' · one slot' : ' · all open slots'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleDiscountRule}>
                  <FormPendingLoader />
                  <input type="hidden" name="ruleId" value={r.id} />
                  <input type="hidden" name="active" value={String(r.active)} />
                  <button type="submit" className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${r.active ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "border-brand/20 text-brand hover:bg-brand/10"}`}>
                    {r.active ? "Deactivate" : "Activate"}
                  </button>
                </form>
                <form action={deleteDiscountRule}>
                  <FormPendingLoader />
                  <input type="hidden" name="ruleId" value={r.id} />
                  <button type="submit" title="Delete" className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-white/30 border border-white/10 hover:text-red-400 hover:border-red-500/20 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      <aside>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sticky top-8">
          <h2 className="font-bold mb-4">Add a discount rule</h2>
          <form action={action} className="flex flex-col gap-3">
            {state?.success && (
              <div className="flex items-center gap-2 text-brand text-sm">
                <CheckCircle2 className="w-4 h-4" /> Rule added.
              </div>
            )}
            {state?.error && <p className="text-red-400 text-xs">{state.error}</p>}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-white/60">Label</span>
              <input name="label" required maxLength={120} placeholder="e.g. Early bird special" className={input} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-white/60">Type</span>
              <ThemedSelect
                name="type"
                value={type}
                onChange={(v) => setType(v as 'early_bird' | 'flat_percent')}
                options={TYPE_OPTIONS}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-white/60">Discount (%)</span>
              <input name="percentOff" type="number" required min={1} max={90} placeholder="10" className={input} />
            </label>
            {type === 'early_bird' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-white/60">Minimum days before session</span>
                <input name="minDaysBeforeStart" type="number" required min={0} max={365} placeholder="7" className={input} />
              </label>
            )}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-white/60">Applies to</span>
              <ThemedSelect
                name="slotId"
                defaultValue="all"
                options={[
                  { value: 'all', label: 'All open slots' },
                  ...slots.map((s) => ({ value: s.id, label: s.label })),
                ]}
              />
            </label>

            <button type="submit" disabled={pending} className="flex items-center justify-center gap-2 bg-brand text-black px-4 py-2.5 rounded-full font-bold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60">
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add rule'}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}

const input =
  'w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all [color-scheme:dark]';
