'use client';

import { useActionState } from 'react';
import { X, Plus } from 'lucide-react';
import { addClientSport, removeClientSport } from '@/server/client/actions';
import { ThemedSelect } from '@/components/ui/ThemedSelect';

type Sport = { id: string; name: string };

export function ClientSportsManager({
  currentSports,
  allSports,
}: {
  currentSports: Sport[];
  allSports: Sport[];
}) {
  const [, addAction, addPending] = useActionState(
    async (_: unknown, formData: FormData) => { await addClientSport(formData); },
    undefined,
  );

  const available = allSports.filter((s) => !currentSports.some((c) => c.id === s.id));

  return (
    <div className="flex flex-col gap-4">
      {currentSports.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {currentSports.map((sport) => (
            <form key={sport.id} action={removeClientSport} className="inline-flex">
              <input type="hidden" name="sportId" value={sport.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-brand/10 border border-brand/20 text-brand text-sm font-medium px-3 py-1.5 rounded-full hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-colors group"
              >
                {sport.name}
                <X className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
              </button>
            </form>
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">No sports added yet.</p>
      )}

      {available.length > 0 && (
        <form action={addAction} className="flex gap-2">
          <ThemedSelect
            name="sportId"
            defaultValue=""
            options={[
              { value: '', label: 'Select a sport…' },
              ...available.map((s) => ({ value: s.id, label: s.name })),
            ]}
            placeholder="Select a sport…"
            className="flex-1"
          />
          <button
            type="submit"
            disabled={addPending}
            className="flex items-center gap-1.5 bg-brand text-black px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors disabled:opacity-60 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      )}
    </div>
  );
}
