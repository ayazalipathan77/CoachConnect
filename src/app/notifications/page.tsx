import { Bell } from "lucide-react";
import { requireUser } from "@/server/auth/current-user";
import {
  getNotifications,
  markAllRead,
  countNotifications,
  NOTIFICATIONS_PAGE_SIZE,
} from "@/server/repositories/notifications";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NotificationList } from "@/components/notifications/NotificationList";

export default async function NotificationsPage() {
  const user = await requireUser();

  const [notifications, total] = await Promise.all([
    getNotifications(user.userId, NOTIFICATIONS_PAGE_SIZE, 0),
    countNotifications(user.userId),
  ]);

  // Mark all as read after fetching so unread styling still renders correctly this visit.
  await markAllRead(user.userId);

  return (
    <DashboardShell user={user}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-brand" />
        </div>
        <h1 className="font-display font-bold text-3xl tracking-tight">Notifications</h1>
      </div>
      <p className="text-white/40 text-sm mb-8">
        {total} notification{total !== 1 ? "s" : ""}
        {total > NOTIFICATIONS_PAGE_SIZE && (
          <span className="ml-1 text-white/25">· showing {Math.min(NOTIFICATIONS_PAGE_SIZE, total)} first</span>
        )}
      </p>

      <NotificationList initial={notifications} totalCount={total} />
    </DashboardShell>
  );
}
