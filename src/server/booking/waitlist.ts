"use server";

import { and, eq, isNull, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { requireUser } from "@/server/auth/current-user";
import { sendNotification } from "@/server/notifications/service";

/** Client joins a waitlist for a specific slot, or a coach's future sessions. */
export async function joinWaitlist(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (user.role !== "client") return;

  const coachId = String(formData.get("coachId") ?? "").trim();
  const slotIdRaw = String(formData.get("slotId") ?? "").trim();
  const slotId = slotIdRaw || null;
  if (!coachId) return;

  const [client] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, user.userId))
    .limit(1);
  if (!client) return;

  // Already on this waitlist?
  const [existing] = await db
    .select({ id: schema.waitlist.id, status: schema.waitlist.status })
    .from(schema.waitlist)
    .where(
      and(
        eq(schema.waitlist.clientId, client.id),
        eq(schema.waitlist.coachId, coachId),
        slotId ? eq(schema.waitlist.slotId, slotId) : isNull(schema.waitlist.slotId),
      ),
    )
    .limit(1);

  if (existing) {
    if (existing.status === "cancelled") {
      await db
        .update(schema.waitlist)
        .set({ status: "waiting", notifiedAt: null })
        .where(eq(schema.waitlist.id, existing.id));
    }
  } else {
    await db.insert(schema.waitlist).values({
      slotId,
      clientId: client.id,
      coachId,
      status: "waiting",
    });
  }

  if (slotId) revalidatePath(`/book/${slotId}`);
  revalidatePath("/bookings");
}

/** Client leaves a waitlist entry. */
export async function leaveWaitlist(formData: FormData): Promise<void> {
  const user = await requireUser();
  const waitlistId = String(formData.get("waitlistId") ?? "").trim();
  if (!waitlistId) return;

  const [client] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, user.userId))
    .limit(1);
  if (!client) return;

  await db
    .update(schema.waitlist)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(schema.waitlist.id, waitlistId),
        eq(schema.waitlist.clientId, client.id),
      ),
    );

  revalidatePath("/bookings");
}

/**
 * Internal: when a spot opens on a slot, notify the oldest waiting client.
 * Called from cancellation flows.
 */
export async function notifyWaitlistOnSpotOpened(slotId: string): Promise<void> {
  const [entry] = await db
    .select({ id: schema.waitlist.id, clientId: schema.waitlist.clientId })
    .from(schema.waitlist)
    .where(and(eq(schema.waitlist.slotId, slotId), eq(schema.waitlist.status, "waiting")))
    .orderBy(asc(schema.waitlist.createdAt))
    .limit(1);
  if (!entry) return;

  const [slot] = await db
    .select({ sessionType: schema.slots.sessionType, startAt: schema.slots.startAt })
    .from(schema.slots)
    .where(eq(schema.slots.id, slotId))
    .limit(1);

  const [clientUser] = await db
    .select({ userId: schema.clientProfiles.userId })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.id, entry.clientId))
    .limit(1);

  await db
    .update(schema.waitlist)
    .set({ status: "notified", notifiedAt: new Date() })
    .where(eq(schema.waitlist.id, entry.id));

  if (clientUser) {
    const dateStr = slot
      ? slot.startAt.toLocaleDateString("en-GB", {
          weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        })
      : "";
    await sendNotification({
      userId: clientUser.userId,
      type: "waitlist_spot_opened",
      title: "A spot just opened!",
      body: `A spot opened for the ${slot?.sessionType ?? "session"}${dateStr ? ` on ${dateStr}` : ""}. Book now before it's gone.`,
      channels: ["in_app", "email"],
      data: { slotId },
    });
  }
}

/**
 * Internal: when a coach creates a new slot, notify clients waiting at the
 * coach level (slotId IS NULL).
 */
export async function notifyWaitlistOnNewSlot(coachId: string): Promise<void> {
  const entries = await db
    .select({ id: schema.waitlist.id, clientId: schema.waitlist.clientId })
    .from(schema.waitlist)
    .where(
      and(
        eq(schema.waitlist.coachId, coachId),
        isNull(schema.waitlist.slotId),
        eq(schema.waitlist.status, "waiting"),
      ),
    );
  if (entries.length === 0) return;

  const [coachUser] = await db
    .select({ name: schema.users.name })
    .from(schema.coachProfiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.coachProfiles.userId))
    .where(eq(schema.coachProfiles.id, coachId))
    .limit(1);
  const coachName = coachUser?.name ?? "A coach";

  await Promise.all(
    entries.map(async (entry) => {
      const [clientUser] = await db
        .select({ userId: schema.clientProfiles.userId })
        .from(schema.clientProfiles)
        .where(eq(schema.clientProfiles.id, entry.clientId))
        .limit(1);
      if (!clientUser) return;
      await sendNotification({
        userId: clientUser.userId,
        type: "waitlist_new_slot",
        title: "New session available",
        body: `${coachName} just added a new session. Check it out and book before it fills up.`,
        channels: ["in_app", "email"],
        data: { coachId },
      });
    }),
  );
}
