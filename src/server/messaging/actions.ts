"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/server/db";
import { requireUser } from "@/server/auth/current-user";
import { getOrCreateConversation } from "@/server/repositories/messages";

export async function startConversation(formData: FormData): Promise<void> {
  const user = await requireUser();
  const coachUserId = String(formData.get("coachUserId") ?? "");
  if (!coachUserId || coachUserId === user.userId) return;

  // Determine roles: the initiator is always the client side.
  // Coaches can also message clients who booked them — swap roles if needed.
  const clientUserId = user.role === "coach" ? coachUserId : user.userId;
  const coachId = user.role === "coach" ? user.userId : coachUserId;

  const conversationId = await getOrCreateConversation(coachId, clientUserId);
  redirect(`/messages/${conversationId}`);
}

export async function sendMessage(formData: FormData): Promise<void> {
  const user = await requireUser();
  const conversationId = String(formData.get("conversationId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  if (!conversationId || !content) return;

  // Verify sender is a participant.
  const [conv] = await db
    .select({ coachUserId: schema.conversations.coachUserId, clientUserId: schema.conversations.clientUserId })
    .from(schema.conversations)
    .where(eq(schema.conversations.id, conversationId))
    .limit(1);

  if (!conv) return;
  const isParticipant = conv.coachUserId === user.userId || conv.clientUserId === user.userId;
  if (!isParticipant) return;

  const now = new Date();
  await db.insert(schema.messages).values({
    conversationId,
    senderId: user.userId,
    content,
  });

  await db
    .update(schema.conversations)
    .set({ lastMessageAt: now })
    .where(eq(schema.conversations.id, conversationId));

  revalidatePath(`/messages/${conversationId}`);
}
