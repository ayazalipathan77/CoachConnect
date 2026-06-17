"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";
import { createPaymentProvider } from "@/server/integrations/payments";
import { refundPercent } from "@/lib/cancellation";
import { notifyCancelledByClient } from "@/server/notifications/service";
import { notifyWaitlistOnSpotOpened } from "@/server/booking/waitlist";

export async function cancelBooking(formData: FormData): Promise<void> {
  const user = await requireRole("client");
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;

  const [client] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, user.userId))
    .limit(1);
  if (!client) return;

  const [booking] = await db
    .select({
      id: schema.bookings.id,
      slotId: schema.bookings.slotId,
      coachId: schema.bookings.coachId,
      status: schema.bookings.status,
      totalMinor: schema.bookings.totalMinor,
      paymentIntentId: schema.bookings.paymentIntentId,
      startAt: schema.slots.startAt,
      sessionType: schema.slots.sessionType,
    })
    .from(schema.bookings)
    .innerJoin(schema.slots, eq(schema.slots.id, schema.bookings.slotId))
    .where(and(eq(schema.bookings.id, bookingId), eq(schema.bookings.clientId, client.id)))
    .limit(1);

  if (!booking || booking.status !== "confirmed") return;

  const now = new Date();
  const pct = refundPercent(booking.startAt, now);
  const refundMinor = Math.round((booking.totalMinor * pct) / 100);

  if (refundMinor > 0 && booking.paymentIntentId) {
    await createPaymentProvider().refund(booking.paymentIntentId, refundMinor);
  }

  await db
    .update(schema.bookings)
    .set({ status: pct === 100 ? "refunded" : "cancelled_by_client", refundMinor, cancelledAt: now, updatedAt: now })
    .where(eq(schema.bookings.id, bookingId));

  await db
    .update(schema.slots)
    .set({
      currentParticipants: sql`GREATEST(0, ${schema.slots.currentParticipants} - 1)`,
      status: sql`CASE WHEN status = 'booked' THEN 'open'::slot_status ELSE status END`,
      updatedAt: now,
    })
    .where(eq(schema.slots.id, booking.slotId));

  await notifyWaitlistOnSpotOpened(booking.slotId);

  const [coachUser] = await db
    .select({ userId: schema.coachProfiles.userId })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.id, booking.coachId))
    .limit(1);

  if (coachUser) {
    await notifyCancelledByClient({
      coachUserId: coachUser.userId,
      clientName: user.name ?? "A client",
      sessionType: booking.sessionType,
      startAt: booking.startAt,
    });
  }

  revalidatePath("/bookings");
  redirect("/bookings?cancelled=1");
}
