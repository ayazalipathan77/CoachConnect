"use server";

import { requireUser } from "@/server/auth/current-user";
import { getNotifications } from "@/server/repositories/notifications";
import { NOTIFICATIONS_PAGE_SIZE } from "@/lib/pagination";

export async function loadMoreNotifications(offset: number) {
  const user = await requireUser();
  return getNotifications(user.userId, NOTIFICATIONS_PAGE_SIZE, offset);
}
