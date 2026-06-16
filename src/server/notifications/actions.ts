"use server";

import { requireUser } from "@/server/auth/current-user";
import { getNotifications, NOTIFICATIONS_PAGE_SIZE } from "@/server/repositories/notifications";

export async function loadMoreNotifications(offset: number) {
  const user = await requireUser();
  return getNotifications(user.userId, NOTIFICATIONS_PAGE_SIZE, offset);
}
