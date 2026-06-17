'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { requestPasswordReset, type ResetRequestState } from '@/server/auth/password-reset';

const input =
  'w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all';

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(
    requestPasswordReset,
    undefined,
  );

  if (state?.success) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 bg-brand/10 border border-brand/20 rounded-2xl px-5 py-4 text-brand">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium text-sm">Check your email for a reset link. It expires in 1 hour.</p>
        </div>
        <Link href="/login" className="text-sm font-bold text-brand hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white/70">Email</span>
        <input type="email" name="email" required placeholder="you@example.com" className={input} />
      </label>

      {state?.error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand text-black px-6 py-3.5 rounded-full font-bold hover:bg-brand-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send reset link <ArrowRight className="w-4 h-4" /></>}
      </button>

      <Link href="/login" className="text-center text-sm text-white/50 hover:text-brand transition-colors">
        Back to log in
      </Link>
    </form>
  );
}
