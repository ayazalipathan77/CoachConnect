import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
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

/** Which of the given booking IDs already have a review from this client — one round trip instead of N. */
export async function getReviewedBookingIds(
  bookingIds: string[],
  clientProfileId: string,
): Promise<Set<string>> {
  if (bookingIds.length === 0) return new Set();
  const rows = await db
    .select({ bookingId: schema.reviews.bookingId })
    .from(schema.reviews)
    .where(and(inArray(schema.reviews.bookingId, bookingIds), eq(schema.reviews.clientId, clientProfileId)));
  return new Set(rows.map((r) => r.bookingId));
}
