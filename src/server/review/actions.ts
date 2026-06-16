"use server";

import { z } from "zod";
import { and, avg, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";

export type ReviewState = { error?: string; success?: boolean } | undefined;

const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  tags: z.string().optional(),
});

export async function leaveReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const user = await requireRole("client");

  const [client] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, user.userId))
    .limit(1);
  if (!client) return { error: "Client profile not found." };

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  // Verify this booking belongs to this client and is in the past.
  const [booking] = await db
    .select({
      id: schema.bookings.id,
      coachId: schema.bookings.coachId,
      clientId: schema.bookings.clientId,
      status: schema.bookings.status,
      startAt: schema.slots.startAt,
    })
    .from(schema.bookings)
    .innerJoin(schema.slots, eq(schema.slots.id, schema.bookings.slotId))
    .where(and(eq(schema.bookings.id, d.bookingId), eq(schema.bookings.clientId, client.id)))
    .limit(1);

  if (!booking) return { error: "Booking not found." };
  if (booking.startAt > new Date()) return { error: "You can only review after the session." };
  if (booking.status !== "confirmed" && booking.status !== "completed") {
    return { error: "This booking is not eligible for a review." };
  }

  // Prevent duplicate reviews.
  const existing = await db
    .select({ id: schema.reviews.id })
    .from(schema.reviews)
    .where(and(eq(schema.reviews.bookingId, d.bookingId), eq(schema.reviews.clientId, client.id)))
    .limit(1);
  if (existing.length > 0) return { error: "You have already reviewed this session." };

  let tags: string[] = [];
  if (d.tags) {
    try { tags = JSON.parse(d.tags); } catch { tags = []; }
    if (!Array.isArray(tags)) tags = [];
  }

  await db.insert(schema.reviews).values({
    bookingId: d.bookingId,
    clientId: client.id,
    coachId: booking.coachId,
    rating: d.rating,
    comment: d.comment || null,
    tags,
  });

  // Update the coach's aggregate rating.
  const [agg] = await db
    .select({ avg: avg(schema.reviews.rating), count: count(schema.reviews.id) })
    .from(schema.reviews)
    .where(and(eq(schema.reviews.coachId, booking.coachId), eq(schema.reviews.hidden, false)));

  if (agg) {
    await db
      .update(schema.coachProfiles)
      .set({
        ratingAvg: Number(agg.avg ?? 0),
        ratingCount: Number(agg.count ?? 0),
        updatedAt: new Date(),
      })
      .where(eq(schema.coachProfiles.id, booking.coachId));
  }

  revalidatePath("/bookings");
  revalidatePath(`/coach/${booking.coachId}`);
  return { success: true };
}

export async function respondToReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const user = await requireRole("coach");

  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const response = String(formData.get("coachResponse") ?? "").trim().slice(0, 1000);
  if (!reviewId) return { error: "Review not found." };

  const [coachProfile] = await db
    .select({ id: schema.coachProfiles.id })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, user.userId))
    .limit(1);
  if (!coachProfile) return { error: "Coach profile not found." };

  const [review] = await db
    .select({ id: schema.reviews.id, coachId: schema.reviews.coachId })
    .from(schema.reviews)
    .where(and(eq(schema.reviews.id, reviewId), eq(schema.reviews.coachId, coachProfile.id)))
    .limit(1);
  if (!review) return { error: "Review not found or not yours." };

  await db
    .update(schema.reviews)
    .set({ coachResponse: response || null })
    .where(eq(schema.reviews.id, reviewId));

  revalidatePath("/dashboard/coach");
  revalidatePath(`/coach/${coachProfile.id}`);
  return { success: true };
}
