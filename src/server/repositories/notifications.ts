import "server-only";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/server/db";

export const NOTIFICATIONS_PAGE_SIZE = 10;

export async function getNotifications(userId: string, limit = NOTIFICATIONS_PAGE_SIZE, offset = 0) {
  return db
    .select({
      id: schema.notifications.id,
      type: schema.notifications.type,
      title: schema.notifications.title,
      body: schema.notifications.body,
      data: schema.notifications.data,
      readAt: schema.notifications.readAt,
      createdAt: schema.notifications.createdAt,
    })
    .from(schema.notifications)
    .where(and(eq(schema.notifications.userId, userId), eq(schema.notifications.channel, "in_app")))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function countNotifications(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: count(schema.notifications.id) })
    .from(schema.notifications)
    .where(and(eq(schema.notifications.userId, userId), eq(schema.notifications.channel, "in_app")));
  return row?.total ?? 0;
}

export async function countUnread(userId: string): Promise<number> {
  const rows = await db
    .select({ id: schema.notifications.id })
    .from(schema.notifications)
    .where(
      and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.channel, "in_app"),
        isNull(schema.notifications.readAt),
      ),
    );
  return rows.length;
}

export async function markAllRead(userId: string): Promise<void> {
  await db
    .update(schema.notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.userId, userId),
        isNull(schema.notifications.readAt),
      ),
    );
}

export async function reminderAlreadySent(userId: string, type: string): Promise<boolean> {
  const rows = await db
    .select({ id: schema.notifications.id })
    .from(schema.notifications)
    .where(and(eq(schema.notifications.userId, userId), eq(schema.notifications.type, type)))
    .limit(1);
  return rows.length > 0;
}
