'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Notif = {
  id: string;
  title: string;
  body: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export function NotifDropdown({
  items,
  unreadCount,
}: {
  items: Notif[];
  unreadCount: number;
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative text-white/50 hover:text-brand transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-brand text-black text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                {unreadCount} new
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-white/40 text-center">No notifications yet.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {items.map((n) => (
                <Link
                  key={n.id}
                  href="/notifications"
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 hover:bg-white/5 transition-colors ${!n.readAt ? 'bg-brand/5' : ''}`}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.readAt && (
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    )}
                    <div className={!n.readAt ? '' : 'pl-4'}>
                      <p className="text-sm font-medium text-white leading-snug">{n.title}</p>
                      {n.body && (
                        <p className="text-xs text-white/50 mt-0.5 line-clamp-1">{n.body}</p>
                      )}
                      <p className="text-[10px] text-white/30 mt-1">
                        {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="border-t border-white/10 px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-sm text-brand font-medium hover:text-brand-dark transition-colors"
            >
              View all notifications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
