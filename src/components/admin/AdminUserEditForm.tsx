'use client';

import { useActionState, useState } from 'react';
import { Loader2, Check, X, Pencil } from 'lucide-react';
import { adminUpdateUser, type AdminUserState } from '@/server/admin/actions';
import { ThemedSelect } from '@/components/ui/ThemedSelect';
import { usePendingLoader } from '@/components/providers/LoadingProvider';

type User = { id: string; name: string | null; email: string; role: 'coach' | 'client' | 'admin' };

const ROLES = [
  { value: 'client', label: 'Client' },
  { value: 'coach', label: 'Coach' },
  { value: 'admin', label: 'Admin' },
];

export function AdminUserEditForm({ user }: { user: User }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<AdminUserState, FormData>(
    adminUpdateUser,
    undefined,
  );
  usePendingLoader(pending);

  // Close the form on success — adjusted during render (React's recommended
  // alternative to an effect for "derive state from a prop/state change")
  // rather than in a useEffect, which would cost an extra commit.
  const [seenSuccess, setSeenSuccess] = useState(state?.success);
  if (state?.success !== seenSuccess) {
    setSeenSuccess(state?.success);
    if (state?.success) setEditing(false);
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/5 text-white/60 border border-white/10 hover:text-white hover:border-white/20 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" /> Edit
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <input
        name="name"
        defaultValue={user.name ?? ''}
        placeholder="Name"
        className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white w-28 focus:outline-none focus:border-brand"
      />
      <input
        name="email"
        type="email"
        required
        defaultValue={user.email}
        placeholder="Email"
        className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white w-40 focus:outline-none focus:border-brand"
      />
      <ThemedSelect name="role" defaultValue={user.role} options={ROLES} className="w-32" />
      <button type="submit" disabled={pending} title="Save" className="flex items-center justify-center w-7 h-7 rounded-full bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition-colors disabled:opacity-60">
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      </button>
      <button type="button" onClick={() => setEditing(false)} title="Cancel" className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-white/40 border border-white/10 hover:text-white transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
      {state?.error && <p className="text-red-400 text-xs w-full">{state.error}</p>}
    </form>
  );
}
