import "server-only";
import { and, eq, gt, sql } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { config } from "@/server/config";
import { integrations } from "@/server/integrations";
import { notifyBookingConfirmed } from "@/server/notifications/service";
import { getPlatformSettings } from "@/server/repositories/settings";
import { getBestDiscountForBooking } from "@/server/repositories/discounts";

export type BookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

/** Calendar-month key (UTC), e.g. "2026-06", that the free-intro cap resets on. */
function currentMonthKey(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Platform service fee for a given coach fee (BRD §8.2). */
export function serviceFeeFor(
  coachFeeMinor: number,
  rate: number = config.PLATFORM_COMMISSION_RATE,
): number {
  return Math.round(coachFeeMinor * rate);
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
  if (!slot) return { ok: false, error: "This session is fully booked." };

  const isFreeIntro = slot.feeMinor === 0;
  const monthKey = currentMonthKey();

  const settings = await getPlatformSettings();
  const discount = await getBestDiscountForBooking(slot.coachId, slot.id, slot.startAt);
  const discountMinor = discount ? Math.round((slot.feeMinor * discount.percentOff) / 100) : 0;
  const coachFee = slot.feeMinor - discountMinor;
  const serviceFee = serviceFeeFor(coachFee, settings.platformCommissionRate);
  const total = coachFee + serviceFee;

  // Create booking + lock slot atomically.
  let bookingId: string;
  try {
    bookingId = await db.transaction(async (tx) => {
      // Atomically claim a participant slot. Marks the slot "booked" once full.
      const locked = await tx
        .update(schema.slots)
        .set({
          currentParticipants: sql`${schema.slots.currentParticipants} + 1`,
          status: sql`CASE WHEN current_participants + 1 >= max_participants THEN 'booked'::slot_status ELSE status END`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.slots.id, input.slotId),
            eq(schema.slots.status, "open"),
            sql`${schema.slots.currentParticipants} < ${schema.slots.maxParticipants}`,
          ),
        )
        .returning({ id: schema.slots.id });
      if (locked.length === 0) throw new Error("FULL");

      // BRD §5.4 — free intro cap: max 2 per calendar month per coach.
      // Reserve atomically within the same transaction (check-and-increment in
      // one statement) so concurrent free bookings can't both slip past the
      // cap. The month key resets the counter when a new month begins.
      if (isFreeIntro) {
        const reserved = await tx
          .update(schema.coachProfiles)
          .set({
            freeIntroUsedMonth: sql`CASE WHEN ${schema.coachProfiles.freeIntroMonthKey} = ${monthKey} THEN ${schema.coachProfiles.freeIntroUsedMonth} + 1 ELSE 1 END`,
            freeIntroMonthKey: monthKey,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(schema.coachProfiles.id, slot.coachId),
              sql`(${schema.coachProfiles.freeIntroMonthKey} IS DISTINCT FROM ${monthKey} OR ${schema.coachProfiles.freeIntroUsedMonth} < 2)`,
            ),
          )
          .returning({ id: schema.coachProfiles.id });
        if (reserved.length === 0) throw new Error("FREE_INTRO_CAP");
      }

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
          discountMinor,
          currency: slot.currency,
          clientMessage: input.message ?? null,
        })
        .returning({ id: schema.bookings.id });
      return booking.id;
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FREE_INTRO_CAP") {
      return { ok: false, error: "This coach has reached the limit of 2 free intro sessions this month." };
    }
    if (err instanceof Error && err.message === "FULL") {
      return { ok: false, error: "This session is fully booked." };
    }
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

  // Payment failed: the seat (and any free-intro reservation) were already
  // claimed inside the transaction above, so we must compensate — otherwise an
  // unpaid booking permanently consumes a slot. Roll it all back and bail.
  if (confirmed.status !== "succeeded") {
    await db.transaction(async (tx) => {
      await tx.delete(schema.bookings).where(eq(schema.bookings.id, bookingId));
      await tx
        .update(schema.slots)
        .set({
          currentParticipants: sql`GREATEST(${schema.slots.currentParticipants} - 1, 0)`,
          status: sql`CASE WHEN ${schema.slots.status} = 'booked' THEN 'open'::slot_status ELSE ${schema.slots.status} END`,
          updatedAt: new Date(),
        })
        .where(eq(schema.slots.id, slot.id));
      if (isFreeIntro) {
        await tx
          .update(schema.coachProfiles)
          .set({ freeIntroUsedMonth: sql`GREATEST(${schema.coachProfiles.freeIntroUsedMonth} - 1, 0)` })
          .where(
            and(
              eq(schema.coachProfiles.id, slot.coachId),
              eq(schema.coachProfiles.freeIntroMonthKey, monthKey),
            ),
          );
      }
    });
    return { ok: false, error: "Payment could not be completed. Please try again." };
  }

  await db
    .update(schema.bookings)
    .set({
      status: "confirmed",
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
