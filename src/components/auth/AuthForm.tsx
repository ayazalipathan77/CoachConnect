'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { login, signup, type AuthState } from '@/server/auth/actions';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const action = mode === 'signup' ? signup : login;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );
  const [role, setRole] = useState<'client' | 'coach'>('client');

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mode === 'signup' && (
        <>
          <input type="hidden" name="role" value={role} />
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-surface border border-white/10">
            {(['client', 'coach'] as const).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`relative rounded-xl py-2.5 text-sm font-bold transition-colors ${
                  role === r ? 'text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                {role === r && (
                  <motion.span
                    layoutId="role-pill"
                    className="absolute inset-0 rounded-xl bg-brand"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {r === 'client' ? "I'm an Athlete" : "I'm a Coach"}
                </span>
              </button>
            ))}
          </div>

          <Field label="Full name" name="name" type="text" placeholder="Alex Carter" autoComplete="name" />
        </>
      )}

      <Field label="Email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
      <Field
        label="Password"
        name="password"
        type="password"
        placeholder={mode === 'signup' ? 'Min. 8 chars, 1 letter, 1 number' : '••••••••'}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />

      {state?.error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 bg-brand text-black px-6 py-3.5 rounded-full font-bold text-base hover:bg-brand-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {mode === 'signup' ? 'Create account' : 'Log in'}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-white/50">
        {mode === 'signup' ? (
          <>Already have an account?{' '}
            <Link href="/login" className="text-brand font-medium hover:underline">Log in</Link>
          </>
        ) : (
          <>New to CoachConnect?{' '}
            <Link href="/signup" className="text-brand font-medium hover:underline">Create an account</Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-white/70">{label}</span>
      <input
        {...props}
        required
        className="bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
      />
    </label>
  );
}
