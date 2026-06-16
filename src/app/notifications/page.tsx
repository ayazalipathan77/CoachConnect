import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, BookCheck, MessageSquare, Star, XCircle } from "lucide-react";
import { requireUser } from "@/server/auth/current-user";
import { getNotifications, markAllRead } from "@/server/repositories/notifications";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const TYPE_ICON: Record<string, React.FC<{ className?: string }>> = {
  booking_confirmed: BookCheck,
  new_booking: BookCheck,
  booking_cancelled_by_client: XCircle,
  booking_cancelled_by_coach: XCircle,
  session_completed: Star,
  new_message: MessageSquare,
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotifications(user.userId);
  await markAllRead(user.userId);

  return (
    <DashboardShell user={user}>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Notifications</h1>
      <p className="text-white/40 text-sm mb-8">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</p>

      {notifications.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-12 text-center">
          <Bell className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-w-2xl">
          {notifications.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Bell;
            const wasUnread = !n.readAt;
            const href = n.data?.conversationId
              ? `/messages/${n.data.conversationId}`
              : n.data?.bookingId
              ? `/bookings`
              : "#";

            return (
              <Link
                key={n.id}
                href={href}
                className={`flex items-start gap-4 rounded-2xl px-5 py-4 border transition-colors hover:border-brand/30 ${
                  wasUnread
                    ? "bg-brand/5 border-brand/20"
                    : "bg-[#111111] border-white/10"
                }`}
              >
                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${wasUnread ? "bg-brand/15 text-brand" : "bg-white/5 text-white/40"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${wasUnread ? "text-white" : "text-white/70"}`}>{n.title}</p>
                  <p className="text-white/50 text-sm mt-0.5 leading-snug">{n.body}</p>
                  <p className="text-white/25 text-xs mt-1">
                    {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                  </p>
                </div>
                {wasUnread && <div className="shrink-0 mt-2 w-2 h-2 rounded-full bg-brand" />}
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
