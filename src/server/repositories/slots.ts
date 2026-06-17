import "server-only";
import { and, desc, eq, ne } from "drizzle-orm";
import { db, schema } from "@/server/db";

export async function getCoachSlots(coachId: string) {
  return db
    .select({
      id: schema.slots.id,
      startAt: schema.slots.startAt,
      durationMin: schema.slots.durationMin,
      sessionType: schema.slots.sessionType,
      feeMinor: schema.slots.feeMinor,
      status: schema.slots.status,
      maxParticipants: schema.slots.maxParticipants,
      currentParticipants: schema.slots.currentParticipants,
      venueName: schema.venues.name,
      venueCity: schema.venues.city,
    })
    .from(schema.slots)
    .leftJoin(schema.venues, eq(schema.venues.id, schema.slots.venueId))
    .where(eq(schema.slots.coachId, coachId))
    .orderBy(desc(schema.slots.startAt));
}

export async function getCoachVenues(coachId: string) {
  return db
    .select({ id: schema.venues.id, name: schema.venues.name, city: schema.venues.city })
    .from(schema.venues)
    .where(eq(schema.venues.coachId, coachId));
}

export async function getBookableSlot(slotId: string) {
  const [row] = await db
    .select({
      id: schema.slots.id,
      startAt: schema.slots.startAt,
      durationMin: schema.slots.durationMin,
      sessionType: schema.slots.sessionType,
      feeMinor: schema.slots.feeMinor,
      currency: schema.slots.currency,
      status: schema.slots.status,
      maxParticipants: schema.slots.maxParticipants,
      currentParticipants: schema.slots.currentParticipants,
      coachId: schema.coachProfiles.id,
      coachName: schema.users.name,
      coachImage: schema.users.image,
      venueName: schema.venues.name,
      city: schema.users.locationCity,
    })
    .from(schema.slots)
    .innerJoin(schema.coachProfiles, eq(schema.coachProfiles.id, schema.slots.coachId))
    .innerJoin(schema.users, eq(schema.users.id, schema.coachProfiles.userId))
    .leftJoin(schema.venues, eq(schema.venues.id, schema.slots.venueId))
    .where(and(eq(schema.slots.id, slotId), ne(schema.slots.status, "cancelled")))
    .limit(1);
  return row ?? null;
}
