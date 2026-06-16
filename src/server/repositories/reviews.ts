import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/server/db";

export async function getCoachReviews(coachId: string, limit = 20) {
  return db
    .select({
      id: schema.reviews.id,
      rating: schema.reviews.rating,
      comment: schema.reviews.comment,
      tags: schema.reviews.tags,
      coachResponse: schema.reviews.coachResponse,
      createdAt: schema.reviews.createdAt,
      clientName: schema.users.name,
    })
    .from(schema.reviews)
    .innerJoin(schema.clientProfiles, eq(schema.clientProfiles.id, schema.reviews.clientId))
    .innerJoin(schema.users, eq(schema.users.id, schema.clientProfiles.userId))
    .where(and(eq(schema.reviews.coachId, coachId), eq(schema.reviews.hidden, false)))
    .orderBy(desc(schema.reviews.createdAt))
    .limit(limit);
}

export async function hasReviewed(bookingId: string, clientProfileId: string) {
  const rows = await db
    .select({ id: schema.reviews.id })
    .from(schema.reviews)
    .where(and(eq(schema.reviews.bookingId, bookingId), eq(schema.reviews.clientId, clientProfileId)))
    .limit(1);
  return rows.length > 0;
}
