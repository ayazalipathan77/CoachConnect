import "server-only";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/server/db";

export type MonthlyEarnings = {
  month: string; // e.g. "Jan"
  earned: number; // coach fee from completed bookings (minor units)
  missed: number; // coach fee from cancelled bookings (minor units)
  commission: number; // platform service fee from completed bookings (minor units)
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Monthly earnings breakdown for a coach over the last N months, keyed by the
 * session start month. Buckets are dense (zero-filled) and chronological.
 */
export async function getCoachEarnings(
  coachId: string,
  months = 6,
): Promise<MonthlyEarnings[]> {
  const now = new Date();
  // Start of the window: first day of (months - 1) months ago.
  const windowStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const monthExpr = sql<string>`to_char(date_trunc('month', ${schema.slots.startAt}), 'YYYY-MM')`;

  const rows = await db
    .select({
      bucket: monthExpr,
      status: schema.bookings.status,
      coachFee: sql<number>`coalesce(sum(${schema.bookings.coachFeeMinor}), 0)`,
      serviceFee: sql<number>`coalesce(sum(${schema.bookings.serviceFeeMinor}), 0)`,
    })
    .from(schema.bookings)
    .innerJoin(schema.slots, eq(schema.slots.id, schema.bookings.slotId))
    .where(
      and(
        eq(schema.bookings.coachId, coachId),
        gte(schema.slots.startAt, windowStart),
        inArray(schema.bookings.status, [
          "completed",
          "cancelled_by_client",
          "cancelled_by_coach",
        ]),
      ),
    )
    .groupBy(monthExpr, schema.bookings.status);

  // Build dense, zero-filled buckets for the window.
  const buckets = new Map<string, MonthlyEarnings>();
  const keys: string[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(windowStart.getFullYear(), windowStart.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    keys.push(key);
    buckets.set(key, { month: MONTH_LABELS[d.getMonth()], earned: 0, missed: 0, commission: 0 });
  }

  for (const row of rows) {
    const bucket = buckets.get(row.bucket);
    if (!bucket) continue;
    const coachFee = Number(row.coachFee) || 0;
    const serviceFee = Number(row.serviceFee) || 0;
    if (row.status === "completed") {
      bucket.earned += coachFee;
      bucket.commission += serviceFee;
    } else {
      bucket.missed += coachFee;
    }
  }

  return keys.map((k) => buckets.get(k)!);
}
