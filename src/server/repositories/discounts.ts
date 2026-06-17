import "server-only";
import { and, eq, isNull, or } from "drizzle-orm";
import { db, schema } from "@/server/db";

export type ApplicableDiscount = {
  id: string;
  label: string;
  type: "early_bird" | "flat_percent";
  percentOff: number;
};

/**
 * The best (highest percentOff) active discount rule a coach has that
 * applies to this slot/booking-time combination, or null. Early-bird rules
 * only qualify when the booking is made at least `minDaysBeforeStart` days
 * before the slot's start time.
 */
export async function getBestDiscountForBooking(
  coachId: string,
  slotId: string,
  slotStartAt: Date,
  now: Date = new Date(),
): Promise<ApplicableDiscount | null> {
  const rules = await db
    .select({
      id: schema.discountRules.id,
      label: schema.discountRules.label,
      type: schema.discountRules.type,
      percentOff: schema.discountRules.percentOff,
      minDaysBeforeStart: schema.discountRules.minDaysBeforeStart,
    })
    .from(schema.discountRules)
    .where(
      and(
        eq(schema.discountRules.coachId, coachId),
        eq(schema.discountRules.active, true),
        or(isNull(schema.discountRules.slotId), eq(schema.discountRules.slotId, slotId)),
      ),
    );

  const daysBeforeStart = (slotStartAt.getTime() - now.getTime()) / 86_400_000;

  const qualifying = rules.filter((r) => {
    if (r.type === "early_bird") {
      return r.minDaysBeforeStart != null && daysBeforeStart >= r.minDaysBeforeStart;
    }
    return true; // flat_percent always qualifies
  });

  if (qualifying.length === 0) return null;

  const best = qualifying.reduce((a, b) => (b.percentOff > a.percentOff ? b : a));
  return { id: best.id, label: best.label, type: best.type, percentOff: best.percentOff };
}
