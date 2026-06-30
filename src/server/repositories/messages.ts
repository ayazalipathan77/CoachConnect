import "server-only";
import { and, count, desc, eq, isNull, ne, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@/server/db";

const coachUser = alias(schema.users, "coach_user");
const clientUser = alias(schema.users, "client_user");

export async function countConversations(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: count(schema.conversations.id) })
    .from(schema.conversations)
    .where(
      or(
        eq(schema.conversations.coachUserId, userId),
        eq(schema.conversations.clientUserId, userId),
      ),
    );
  return row?.total ?? 0;
}

export async function getOrCreateConversation(coachUserId: string, clientUserId: string) {
  const [existing] = await db
    .select({ id: schema.conversations.id })
    .from(schema.conversations)
    .where(
      and(
        eq(schema.conversations.coachUserId, coachUserId),
        eq(schema.conversations.clientUserId, clientUserId),
      ),
    )
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(schema.conversations)
    .values({ coachUserId, clientUserId })
    .returning({ id: schema.conversations.id });
  return created.id;
}

import { CONVERSATIONS_PAGE_SIZE, MESSAGES_PAGE_SIZE } from "@/lib/pagination";

export async function getConversations(userId: string, limit = CONVERSATIONS_PAGE_SIZE, offset = 0) {
  return db
    .select({
      id: schema.conversations.id,
      lastMessageAt: schema.conversations.lastMessageAt,
      coachUserId: schema.conversations.coachUserId,
      clientUserId: schema.conversations.clientUserId,
      coachName: coachUser.name,
      clientName: clientUser.name,
    })
    .from(schema.conversations)
    .innerJoin(coachUser, eq(coachUser.id, schema.conversations.coachUserId))
    .innerJoin(clientUser, eq(clientUser.id, schema.conversations.clientUserId))
    .where(
      or(
        eq(schema.conversations.coachUserId, userId),
        eq(schema.conversations.clientUserId, userId),
      ),
    )
    .orderBy(desc(schema.conversations.lastMessageAt))
    .limit(limit)
    .offset(offset);
}

export async function getConversation(conversationId: string) {
  const [row] = await db
    .select({
      id: schema.conversations.id,
      coachUserId: schema.conversations.coachUserId,
      clientUserId: schema.conversations.clientUserId,
      coachName: coachUser.name,
      clientName: clientUser.name,
    })
    .from(schema.conversations)
    .innerJoin(coachUser, eq(coachUser.id, schema.conversations.coachUserId))
    .innerJoin(clientUser, eq(clientUser.id, schema.conversations.clientUserId))
    .where(eq(schema.conversations.id, conversationId))
    .limit(1);
  return row ?? null;
}

export async function getMessages(conversationId: string, limit = MESSAGES_PAGE_SIZE) {
  // Fetch the most recent `limit` messages (desc + limit), then return them in
  // chronological order for display. Avoids loading an entire long thread.
  const rows = await db
    .select({
      id: schema.messages.id,
      senderId: schema.messages.senderId,
      content: schema.messages.content,
      createdAt: schema.messages.createdAt,
      readAt: schema.messages.readAt,
    })
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, conversationId))
    .orderBy(desc(schema.messages.createdAt))
    .limit(limit);
  return rows.reverse();
}

export async function markMessagesRead(conversationId: string, readerId: string) {
  await db
    .update(schema.messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(schema.messages.conversationId, conversationId),
        ne(schema.messages.senderId, readerId),
        isNull(schema.messages.readAt),
      ),
    );
}

export async function countUnread(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: count(schema.messages.id) })
    .from(schema.messages)
    .innerJoin(
      schema.conversations,
      eq(schema.conversations.id, schema.messages.conversationId),
    )
    .where(
      and(
        or(
          eq(schema.conversations.coachUserId, userId),
          eq(schema.conversations.clientUserId, userId),
        ),
        ne(schema.messages.senderId, userId),
        isNull(schema.messages.readAt),
      ),
    );
  return row?.total ?? 0;
}
