import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db";

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
    .where(eq(schema.slots.id, slotId))
    .limit(1);
  return row ?? null;
}
