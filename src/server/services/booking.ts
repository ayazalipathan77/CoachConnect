import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { config } from "@/server/config";
import { integrations } from "@/server/integrations";
import { notifyBookingConfirmed } from "@/server/notifications/service";

export type BookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

/** Platform service fee for a given coach fee (BRD §8.2). */
export function serviceFeeFor(coachFeeMinor: number): number {
  return Math.round(coachFeeMinor * config.PLATFORM_COMMISSION_RATE);
}

/**
 * Books a slot for a client: validates availability, creates the booking,
 * locks the slot, and runs the (escrow) payment. With the mock provider the
 * payment auto-succeeds; with Stripe this would authorize and hold funds.
 */
export async function createBooking(input: {
  slotId: string;
  clientUserId: string;
  message?: string;
}): Promise<BookingResult> {
  const [client] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, input.clientUserId))
    .limit(1);
  if (!client) return { ok: false, error: "Only client accounts can book sessions." };

  const [slot] = await db
    .select()
    .from(schema.slots)
    .where(
      and(
        eq(schema.slots.id, input.slotId),
        eq(schema.slots.status, "open"),
        gt(schema.slots.startAt, new Date()),
      ),
    )
    .limit(1);
  if (!slot) return { ok: false, error: "This session is no longer available." };

  const coachFee = slot.feeMinor;
  const serviceFee = serviceFeeFor(coachFee);
  const total = coachFee + serviceFee;

  // Create booking + lock slot atomically.
  let bookingId: string;
  try {
    bookingId = await db.transaction(async (tx) => {
      const locked = await tx
        .update(schema.slots)
        .set({ status: "booked", updatedAt: new Date() })
        .where(and(eq(schema.slots.id, slot.id), eq(schema.slots.status, "open")))
        .returning({ id: schema.slots.id });
      if (locked.length === 0) throw new Error("RACE");

      const [booking] = await tx
        .insert(schema.bookings)
        .values({
          slotId: slot.id,
          clientId: client.id,
          coachId: slot.coachId,
          status: "pending_payment",
          coachFeeMinor: coachFee,
          serviceFeeMinor: serviceFee,
          totalMinor: total,
          currency: slot.currency,
          clientMessage: input.message ?? null,
        })
        .returning({ id: schema.bookings.id });
      return booking.id;
    });
  } catch {
    return { ok: false, error: "This session was just booked by someone else." };
  }

  // Escrow payment.
  const intent = await integrations.payments.createBookingPayment({
    bookingId,
    amountMinor: total,
    currency: slot.currency,
    serviceFeeMinor: serviceFee,
  });
  const confirmed = await integrations.payments.confirmPayment(intent.paymentIntentId);

  await db
    .update(schema.bookings)
    .set({
      status: confirmed.status === "succeeded" ? "confirmed" : "pending_payment",
      paymentIntentId: intent.paymentIntentId,
      paymentRef: intent.paymentIntentId,
      updatedAt: new Date(),
    })
    .where(eq(schema.bookings.id, bookingId));

  // Fetch names needed for notifications.
  const [coachProfile] = await db
    .select({ userId: schema.coachProfiles.userId })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.id, slot.coachId))
    .limit(1);

  const [clientUser, coachUser] = await Promise.all([
    db.select({ userId: schema.clientProfiles.userId, name: schema.users.name })
      .from(schema.clientProfiles)
      .innerJoin(schema.users, eq(schema.users.id, schema.clientProfiles.userId))
      .where(eq(schema.clientProfiles.id, client.id))
      .limit(1)
      .then((r) => r[0]),
    coachProfile
      ? db.select({ name: schema.users.name })
        .from(schema.users)
        .where(eq(schema.users.id, coachProfile.userId))
        .limit(1)
        .then((r) => r[0])
      : null,
  ]);

  if (coachProfile && clientUser && coachUser) {
    await notifyBookingConfirmed({
      clientUserId: clientUser.userId,
      coachUserId: coachProfile.userId,
      coachName: coachUser.name ?? "Your coach",
      clientName: clientUser.name ?? "A client",
      sessionType: slot.sessionType,
      startAt: slot.startAt,
      bookingId,
    });
  }

  return { ok: true, bookingId };
}
