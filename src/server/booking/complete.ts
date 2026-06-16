"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";
import { createPaymentProvider } from "@/server/integrations/payments";

/** Coach marks a session as completed — releases escrow to coach. */
export async function completeSession(formData: FormData): Promise<void> {
  const user = await requireRole("coach");
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;

  const [booking] = await db
    .select({
      id: schema.bookings.id,
      coachId: schema.bookings.coachId,
      slotId: schema.bookings.slotId,
      status: schema.bookings.status,
      paymentIntentId: schema.bookings.paymentIntentId,
    })
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .limit(1);

  if (!booking || booking.status !== "confirmed") return;

  // Verify caller owns this booking's coach profile.
  const [profile] = await db
    .select({ id: schema.coachProfiles.id })
    .from(schema.coachProfiles)
    .where(
      and(
        eq(schema.coachProfiles.id, booking.coachId),
        eq(schema.coachProfiles.userId, user.userId),
      ),
    )
    .limit(1);
  if (!profile) return;

  const now = new Date();

  if (booking.paymentIntentId) {
    await createPaymentProvider().releaseToCoach(booking.paymentIntentId);
  }

  await db
    .update(schema.bookings)
    .set({ status: "completed", completedAt: now, updatedAt: now })
    .where(eq(schema.bookings.id, bookingId));

  await db
    .update(schema.slots)
    .set({ status: "completed", updatedAt: now })
    .where(eq(schema.slots.id, booking.slotId));

  revalidatePath("/dashboard/coach");
  revalidatePath("/dashboard/coach/slots");
}

/** Coach cancels a confirmed booking — adds a strike, re-opens slot, no fee earned. */
export async function coachCancelBooking(formData: FormData): Promise<void> {
  const user = await requireRole("coach");
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;

  const [booking] = await db
    .select({
      id: schema.bookings.id,
      coachId: schema.bookings.coachId,
      slotId: schema.bookings.slotId,
      status: schema.bookings.status,
      totalMinor: schema.bookings.totalMinor,
      paymentIntentId: schema.bookings.paymentIntentId,
    })
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .limit(1);

  if (!booking || booking.status !== "confirmed") return;

  const [profile] = await db
    .select({ id: schema.coachProfiles.id, cancellationStrikes: schema.coachProfiles.cancellationStrikes })
    .from(schema.coachProfiles)
    .where(
      and(
        eq(schema.coachProfiles.id, booking.coachId),
        eq(schema.coachProfiles.userId, user.userId),
      ),
    )
    .limit(1);
  if (!profile) return;

  const now = new Date();

  // Full refund to client when coach cancels.
  if (booking.paymentIntentId) {
    await createPaymentProvider().refund(booking.paymentIntentId, booking.totalMinor);
  }

  await db
    .update(schema.bookings)
    .set({ status: "cancelled_by_coach", refundMinor: booking.totalMinor, cancelledAt: now, updatedAt: now })
    .where(eq(schema.bookings.id, bookingId));

  await db
    .update(schema.slots)
    .set({ status: "open", updatedAt: now })
    .where(eq(schema.slots.id, booking.slotId));

  // BRD §4.8: 3 strikes in 90 days → suspend coach.
  const newStrikes = profile.cancellationStrikes + 1;
  const newStatus = newStrikes >= 3 ? "paused" : undefined;

  await db
    .update(schema.coachProfiles)
    .set({
      cancellationStrikes: newStrikes,
      ...(newStatus ? { status: newStatus } : {}),
      updatedAt: now,
    })
    .where(eq(schema.coachProfiles.id, profile.id));

  revalidatePath("/dashboard/coach");
  revalidatePath("/dashboard/coach/slots");
}
