'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bell, BookCheck, MessageSquare, Star, XCircle, Loader2, ChevronDown } from 'lucide-react';
import { loadMoreNotifications } from '@/server/notifications/actions';
import { NOTIFICATIONS_PAGE_SIZE } from '@/server/repositories/notifications';

const TYPE_ICON: Record<string, React.FC<{ className?: string }>> = {
  booking_confirmed: BookCheck,
  new_booking: BookCheck,
  booking_cancelled_by_client: XCircle,
  booking_cancelled_by_coach: XCircle,
  session_completed: Star,
  new_message: MessageSquare,
};

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
};

export function NotificationList({
  initial,
  totalCount,
}: {
  initial: Notification[];
  totalCount: number;
}) {
  const [items, setItems] = useState<Notification[]>(initial);
  const [isPending, startTransition] = useTransition();
  const hasMore = items.length < totalCount && items.length % NOTIFICATIONS_PAGE_SIZE === 0;

  function loadMore() {
    startTransition(async () => {
      const next = await loadMoreNotifications(items.length);
      setItems((prev) => [...prev, ...(next as Notification[])]);
    });
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-12 text-center">
        <Bell className="w-10 h-10 text-white/20 mx-auto mb-4" />
        <p className="text-white/40 text-sm">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {items.map((n) => {
        const Icon = TYPE_ICON[n.type] ?? Bell;
        const wasUnread = !n.readAt;
        const href = n.data?.conversationId
          ? `/messages/${String(n.data.conversationId)}`
          : n.data?.bookingId
          ? `/bookings`
          : '#';

        return (
          <Link
            key={n.id}
            href={href}
            className={`flex items-start gap-4 rounded-2xl px-5 py-4 border transition-colors hover:border-brand/30 ${
              wasUnread ? 'bg-brand/5 border-brand/20' : 'bg-[#111111] border-white/10'
            }`}
          >
            <div
              className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                wasUnread ? 'bg-brand/15 text-brand' : 'bg-white/5 text-white/40'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${wasUnread ? 'text-white' : 'text-white/70'}`}>
                {n.title}
              </p>
              <p className="text-white/50 text-sm mt-0.5 leading-snug">{n.body}</p>
              <p className="text-white/25 text-xs mt-1">
                {formatDistanceToNow(n.createdAt, { addSuffix: true })}
              </p>
            </div>
            {wasUnread && <div className="shrink-0 mt-2 w-2 h-2 rounded-full bg-brand" />}
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

      {!hasMore && items.length > NOTIFICATIONS_PAGE_SIZE && (
        <p className="text-center text-white/25 text-xs py-2">All caught up</p>
      )}
    </div>
  );
}
