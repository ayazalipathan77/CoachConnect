'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { addSport, type SportState } from '@/server/admin/actions';

export function AddSportForm() {
  const [state, action, pending] = useActionState<SportState, FormData>(addSport, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      {state?.success && (
        <div className="flex items-center gap-2 text-brand text-sm">
          <CheckCircle2 className="w-4 h-4" /> Sport added.
        </div>
      )}
      {state?.error && <p className="text-red-400 text-xs">{state.error}</p>}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Sport name</span>
        <input name="name" required maxLength={80} placeholder="e.g. Padel" className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Category</span>
        <input name="category" required maxLength={80} placeholder="e.g. Racket Sports" className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">Icon slug (optional)</span>
        <input name="icon" maxLength={80} placeholder="e.g. padel" className={input} />
      </label>

      <button type="submit" disabled={pending} className="flex items-center justify-center gap-2 bg-brand text-black px-4 py-2.5 rounded-full font-bold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add sport'}
      </button>
    </form>
  );
}

const input = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all [color-scheme:dark]";
