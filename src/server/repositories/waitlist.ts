import "server-only";
import { and, eq, inArray, isNull, desc } from "drizzle-orm";
import { db, schema } from "@/server/db";

/** All active (waiting/notified) waitlist entries for a slot, with client names. */
export async function getWaitlistForSlot(slotId: string) {
  return db
    .select({
      id: schema.waitlist.id,
      status: schema.waitlist.status,
      notifiedAt: schema.waitlist.notifiedAt,
      createdAt: schema.waitlist.createdAt,
      clientId: schema.waitlist.clientId,
      clientName: schema.users.name,
    })
    .from(schema.waitlist)
    .innerJoin(schema.clientProfiles, eq(schema.clientProfiles.id, schema.waitlist.clientId))
    .innerJoin(schema.users, eq(schema.users.id, schema.clientProfiles.userId))
    .where(
      and(
        eq(schema.waitlist.slotId, slotId),
        inArray(schema.waitlist.status, ["waiting", "notified"]),
      ),
    )
    .orderBy(schema.waitlist.createdAt);
}

/** All active waitlist entries for a coach (slot-specific + coach-level). */
export async function getWaitlistForCoach(coachId: string) {
  return db
    .select({
      id: schema.waitlist.id,
      slotId: schema.waitlist.slotId,
      status: schema.waitlist.status,
      notifiedAt: schema.waitlist.notifiedAt,
      createdAt: schema.waitlist.createdAt,
      clientName: schema.users.name,
    })
    .from(schema.waitlist)
    .innerJoin(schema.clientProfiles, eq(schema.clientProfiles.id, schema.waitlist.clientId))
    .innerJoin(schema.users, eq(schema.users.id, schema.clientProfiles.userId))
    .where(
      and(
        eq(schema.waitlist.coachId, coachId),
        inArray(schema.waitlist.status, ["waiting", "notified"]),
      ),
    )
    .orderBy(schema.waitlist.createdAt);
}

/** A client's own active waitlist entries, with coach + slot info. */
export async function getClientWaitlistEntries(clientUserId: string) {
  const [client] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, clientUserId))
    .limit(1);
  if (!client) return [];

  return db
    .select({
      id: schema.waitlist.id,
      status: schema.waitlist.status,
      slotId: schema.waitlist.slotId,
      coachId: schema.waitlist.coachId,
      coachName: schema.users.name,
      createdAt: schema.waitlist.createdAt,
      startAt: schema.slots.startAt,
      sessionType: schema.slots.sessionType,
    })
    .from(schema.waitlist)
    .innerJoin(schema.coachProfiles, eq(schema.coachProfiles.id, schema.waitlist.coachId))
    .innerJoin(schema.users, eq(schema.users.id, schema.coachProfiles.userId))
    .leftJoin(schema.slots, eq(schema.slots.id, schema.waitlist.slotId))
    .where(
      and(
        eq(schema.waitlist.clientId, client.id),
        inArray(schema.waitlist.status, ["waiting", "notified"]),
      ),
    )
    .orderBy(desc(schema.waitlist.createdAt));
}

/** Whether a client already has an active waitlist entry for this slot/coach. */
export async function isOnWaitlist(
  clientId: string,
  slotId: string | null,
  coachId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: schema.waitlist.id })
    .from(schema.waitlist)
    .where(
      and(
        eq(schema.waitlist.clientId, clientId),
        eq(schema.waitlist.coachId, coachId),
        slotId ? eq(schema.waitlist.slotId, slotId) : isNull(schema.waitlist.slotId),
        inArray(schema.waitlist.status, ["waiting", "notified"]),
      ),
    )
    .limit(1);
  return !!row;
}
