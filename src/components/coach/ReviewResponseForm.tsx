'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { respondToReview, type ReviewState } from '@/server/review/actions';

export function ReviewResponseForm({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(respondToReview, undefined);

  if (state?.success) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-brand font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" /> Reply posted. Reload to see it.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 mt-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <textarea
        name="coachResponse"
        rows={2}
        placeholder="Reply to this review (optional)…"
        maxLength={1000}
        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none [color-scheme:dark]"
      />
      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start flex items-center gap-1.5 text-xs font-bold border border-white/20 text-white/60 hover:text-white hover:border-white/40 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
      >
        {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
        Post reply
      </button>
    </form>
  );
}
