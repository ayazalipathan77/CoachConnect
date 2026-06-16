'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Convo = {
  id: string;
  coachUserId: string;
  clientUserId: string;
  coachName: string | null;
  clientName: string | null;
  lastMessageAt: Date | null;
};

export function MessageDropdown({
  items,
  currentUserId,
}: {
  items: Convo[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function otherName(c: Convo) {
    return currentUserId === c.coachUserId ? c.clientName : c.coachName;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-white/50 hover:text-brand transition-colors"
        title="Messages"
        aria-label="Messages"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <span className="text-sm font-bold text-white">Messages</span>
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-white/40 text-center">No conversations yet.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {items.map((c) => (
                <Link
                  key={c.id}
                  href={`/messages/${c.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold shrink-0">
                    {(otherName(c) ?? '?')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {otherName(c) ?? 'Unknown'}
                    </p>
                    {c.lastMessageAt && (
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {formatDistanceToNow(c.lastMessageAt, { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="border-t border-white/10 px-4 py-2.5">
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-sm text-brand font-medium hover:text-brand-dark transition-colors"
            >
              View all messages <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
