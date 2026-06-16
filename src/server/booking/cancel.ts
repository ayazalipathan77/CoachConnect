"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";
import { createPaymentProvider } from "@/server/integrations/payments";

/**
 * BRD §8.1 cancellation matrix (client-initiated):
 *   ≥ 48 h before session  → full refund (100%)
 *   24–48 h before session → partial refund (50%)
 *   < 24 h before session  → no refund (0%)
 */
export function refundPercent(sessionStart: Date, cancelledAt: Date = new Date()): number {
  const hoursUntil = (sessionStart.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);
  if (hoursUntil >= 48) return 100;
  if (hoursUntil >= 24) return 50;
  return 0;
}

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
      clientId: schema.bookings.clientId,
      status: schema.bookings.status,
      totalMinor: schema.bookings.totalMinor,
      paymentIntentId: schema.bookings.paymentIntentId,
      startAt: schema.slots.startAt,
    })
    .from(schema.bookings)
    .innerJoin(schema.slots, eq(schema.slots.id, schema.bookings.slotId))
    .where(
      and(eq(schema.bookings.id, bookingId), eq(schema.bookings.clientId, client.id)),
    )
    .limit(1);

  if (!booking || booking.status !== "confirmed") return;

  const now = new Date();
  const pct = refundPercent(booking.startAt, now);
  const refundMinor = Math.round((booking.totalMinor * pct) / 100);

  // Issue refund via payment adapter.
  if (refundMinor > 0 && booking.paymentIntentId) {
    const payments = createPaymentProvider();
    await payments.refund(booking.paymentIntentId, refundMinor);
  }

  const newStatus = pct === 100
    ? "refunded"
    : ("cancelled_by_client" as const);

  await db
    .update(schema.bookings)
    .set({
      status: newStatus,
      refundMinor,
      cancelledAt: now,
      updatedAt: now,
    })
    .where(eq(schema.bookings.id, bookingId));

  // Re-open the slot so another client can book it.
  await db
    .update(schema.slots)
    .set({ status: "open", updatedAt: now })
    .where(eq(schema.slots.id, booking.slotId));

  revalidatePath("/bookings");
  redirect("/bookings?cancelled=1");
}
