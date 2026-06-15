'use client';

import { useActionState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { confirmBooking, type BookState } from '@/server/booking/actions';

export function BookForm({ slotId, total }: { slotId: string; total: string }) {
  const [state, action, pending] = useActionState<BookState, FormData>(
    confirmBooking,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="slotId" value={slotId} />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white/70">Message to coach (optional)</span>
        <textarea
          name="message"
          rows={3}
          placeholder="Anything they should know before the session?"
          className="bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none"
        />
      </label>

      {state?.error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand text-black px-6 py-4 rounded-full font-bold text-base hover:bg-brand-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-4 h-4" /> Confirm & pay {total}</>}
      </button>
      <p className="text-center text-xs text-white/40">
        Test mode — no real payment is taken. Funds are held in escrow until your session completes.
      </p>
    </form>
  );
}
