'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Loader2, ChevronDown } from 'lucide-react';
import { loadMoreConversations } from '@/server/messaging/actions';
import { CONVERSATIONS_PAGE_SIZE } from '@/lib/pagination';
import { usePendingLoader } from '@/components/providers/LoadingProvider';

type Conversation = {
  id: string;
  lastMessageAt: Date | null;
  coachUserId: string;
  clientUserId: string;
  coachName: string | null;
  clientName: string | null;
};

export function ConversationList({
  initial,
  currentUserId,
  currentUserRole,
  totalCount,
  emptySlot,
}: {
  initial: Conversation[];
  currentUserId: string;
  currentUserRole: string;
  totalCount: number;
  emptySlot?: React.ReactNode;
}) {
  const [items, setItems] = useState<Conversation[]>(initial);
  const [isPending, startTransition] = useTransition();
  usePendingLoader(isPending);
  const hasMore = items.length < totalCount && items.length % CONVERSATIONS_PAGE_SIZE === 0;

  function loadMore() {
    startTransition(async () => {
      const next = await loadMoreConversations(items.length);
      setItems((prev) => [...prev, ...(next as Conversation[])]);
    });
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-12 text-center">
        <MessageSquare className="w-10 h-10 text-white/20 mx-auto mb-4" />
        <p className="text-white/40 text-sm">No conversations yet.</p>
        {emptySlot}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-2xl">
      {items.map((c) => {
        const otherName = currentUserId === c.coachUserId ? c.clientName : c.coachName;
        const otherRole = currentUserId === c.coachUserId ? 'Client' : 'Coach';
        const initial = (otherName ?? '?')[0]?.toUpperCase();

        return (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className="flex items-center gap-4 bg-[#111111] border border-white/10 rounded-2xl px-5 py-4 hover:border-brand/30 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
              <span className="text-brand font-bold text-sm">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold group-hover:text-brand transition-colors truncate">
                  {otherName ?? 'Unknown'}
                </span>
                {c.lastMessageAt && (
                  <span className="text-white/30 text-xs shrink-0">
                    {formatDistanceToNow(c.lastMessageAt, { addSuffix: true })}
                  </span>
                )}
              </div>
              <span className="text-white/40 text-xs">{otherRole}</span>
            </div>
          </Link>
        );
      })}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50 mt-1"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {isPending ? 'Loading…' : 'Load more'}
        </button>
      )}

      {!hasMore && items.length > CONVERSATIONS_PAGE_SIZE && (
        <p className="text-center text-white/25 text-xs py-2">All conversations loaded</p>
      )}
    </div>
  );
}
