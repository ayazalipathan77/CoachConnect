'use client';

import { useActionState, useState } from 'react';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { leaveReview, type ReviewState } from '@/server/review/actions';

export function ReviewForm({ bookingId, coachName }: { bookingId: string; coachName: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(leaveReview, undefined);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state?.success) {
    return (
      <div className="flex items-center gap-2 text-brand text-sm font-medium py-2">
        <CheckCircle2 className="w-4 h-4" /> Review submitted. Thank you!
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 mt-3 pt-3 border-t border-white/10">
      <p className="text-xs text-white/50 font-medium">Rate your session with {coachName}</p>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />

      {/* Star picker */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                n <= (hover || rating) ? 'fill-brand text-brand' : 'text-white/20'
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        rows={2}
        placeholder="Optional comment…"
        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none [color-scheme:dark]"
      />

      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="self-start text-xs font-bold bg-brand text-black px-4 py-2 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-1.5"
      >
        {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
        Submit review
      </button>
    </form>
  );
}
