import "server-only";
import { and, eq, desc, inArray } from "drizzle-orm";
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

export async function getCoachBookings(coachUserId: string, statusFilter?: string) {
  const [coach] = await db
    .select({ id: schema.coachProfiles.id })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, coachUserId))
    .limit(1);
  if (!coach) return [];

  const filters = [eq(schema.bookings.coachId, coach.id)];
  if (statusFilter && statusFilter !== "all") {
    // Accept comma-separated statuses e.g. "confirmed,completed"
    const statuses = statusFilter
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as (typeof schema.bookings.status._.data)[];
    if (statuses.length === 1) {
      filters.push(eq(schema.bookings.status, statuses[0]!));
    } else if (statuses.length > 1) {
      filters.push(inArray(schema.bookings.status, statuses));
    }
  }

  return db
    .select({
      id: schema.bookings.id,
      status: schema.bookings.status,
      coachFeeMinor: schema.bookings.coachFeeMinor,
      totalMinor: schema.bookings.totalMinor,
      refundMinor: schema.bookings.refundMinor,
      cancelledAt: schema.bookings.cancelledAt,
      clientMessage: schema.bookings.clientMessage,
      createdAt: schema.bookings.createdAt,
      startAt: schema.slots.startAt,
      durationMin: schema.slots.durationMin,
      sessionType: schema.slots.sessionType,
      slotFeeMinor: schema.slots.feeMinor,
      venueId: schema.slots.venueId,
      sportId: schema.slots.sportId,
      clientName: schema.users.name,
      clientImage: schema.users.image,
    })
    .from(schema.bookings)
    .innerJoin(schema.slots, eq(schema.slots.id, schema.bookings.slotId))
    .innerJoin(schema.clientProfiles, eq(schema.clientProfiles.id, schema.bookings.clientId))
    .innerJoin(schema.users, eq(schema.users.id, schema.clientProfiles.userId))
    .where(and(eq(schema.bookings.coachId, coach.id), ...filters.slice(1)))
    .orderBy(desc(schema.slots.startAt));
}
