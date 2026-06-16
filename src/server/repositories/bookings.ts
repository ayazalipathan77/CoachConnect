import "server-only";
import { eq, desc } from "drizzle-orm";
import { db, schema } from "@/server/db";

export async function getClientBookings(clientUserId: string) {
  const [client] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, clientUserId))
    .limit(1);
  if (!client) return [];

  return db
    .select({
      id: schema.bookings.id,
      status: schema.bookings.status,
      totalMinor: schema.bookings.totalMinor,
      createdAt: schema.bookings.createdAt,
      startAt: schema.slots.startAt,
      sessionType: schema.slots.sessionType,
      durationMin: schema.slots.durationMin,
      coachId: schema.coachProfiles.id,
      coachName: schema.users.name,
      coachImage: schema.users.image,
      clientProfileId: schema.clientProfiles.id,
    })
    .from(schema.bookings)
    .innerJoin(schema.slots, eq(schema.slots.id, schema.bookings.slotId))
    .innerJoin(schema.coachProfiles, eq(schema.coachProfiles.id, schema.bookings.coachId))
    .innerJoin(schema.users, eq(schema.users.id, schema.coachProfiles.userId))
    .innerJoin(schema.clientProfiles, eq(schema.clientProfiles.id, schema.bookings.clientId))
    .where(eq(schema.bookings.clientId, client.id))
    .orderBy(desc(schema.slots.startAt));
}

export async function getCoachBookings(coachUserId: string) {
  const [coach] = await db
    .select({ id: schema.coachProfiles.id })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, coachUserId))
    .limit(1);
  if (!coach) return [];

  return db
    .select({
      id: schema.bookings.id,
      status: schema.bookings.status,
      coachFeeMinor: schema.bookings.coachFeeMinor,
      startAt: schema.slots.startAt,
      sessionType: schema.slots.sessionType,
      clientName: schema.users.name,
    })
    .from(schema.bookings)
    .innerJoin(schema.slots, eq(schema.slots.id, schema.bookings.slotId))
    .innerJoin(schema.clientProfiles, eq(schema.clientProfiles.id, schema.bookings.clientId))
    .innerJoin(schema.users, eq(schema.users.id, schema.clientProfiles.userId))
    .where(eq(schema.bookings.coachId, coach.id))
    .orderBy(desc(schema.slots.startAt));
}
