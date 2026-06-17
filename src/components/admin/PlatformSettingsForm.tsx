'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { updatePlatformSettings, type SettingsState } from '@/server/admin/settings-actions';
import { usePendingLoader } from '@/components/providers/LoadingProvider';

type Defaults = {
  platformCommissionPercent: number;
  platformMinFeeGBP: number;
  stripeAccountLabel: string | null;
  supportEmail: string | null;
  payoutInstructions: string | null;
};

export function PlatformSettingsForm({ defaults: d }: { defaults: Defaults }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updatePlatformSettings,
    undefined,
  );
  usePendingLoader(pending);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.success && (
        <div className="flex items-center gap-2 text-brand text-sm bg-brand/10 border border-brand/20 rounded-xl px-4 py-2.5">
          <CheckCircle2 className="w-4 h-4" /> Settings saved.
        </div>
      )}
      {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Platform commission (%)</span>
          <input
            name="platformCommissionPercent"
            type="number"
            min={0}
            max={100}
            step={0.1}
            defaultValue={d.platformCommissionPercent}
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Minimum session fee (£)</span>
          <input
            name="platformMinFeeGBP"
            type="number"
            min={0}
            step={0.5}
            defaultValue={d.platformMinFeeGBP}
            className={input}
          />
        </label>
      </div>

      <hr className="border-white/10" />
      <p className="text-xs font-bold uppercase tracking-widest text-white/40">Payments & payouts</p>
      <p className="text-white/30 text-xs -mt-2">
        Live Stripe keys are set via environment variables and require a redeploy — this section is
        configuration metadata only, not a place to store secrets.
      </p>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Stripe Connect platform account label</span>
        <input name="stripeAccountLabel" maxLength={160} defaultValue={d.stripeAccountLabel ?? ''} placeholder="e.g. acct_1Pxxxxx (display only)" className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Support email</span>
        <input name="supportEmail" type="email" defaultValue={d.supportEmail ?? ''} placeholder="support@coachconnect.app" className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Payout instructions (shown to coaches)</span>
        <textarea
          name="payoutInstructions"
          rows={4}
          defaultValue={d.payoutInstructions ?? ''}
          placeholder="e.g. Payouts run weekly via Stripe Connect, 2-3 business days to arrive."
          className={input}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start flex items-center justify-center gap-2 bg-brand text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save settings'}
      </button>
    </form>
  );
}

const input =
  'w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all [color-scheme:dark]';
