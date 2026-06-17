import "server-only";
import { asc, eq, gt } from "drizzle-orm";
import { db, schema } from "@/server/db";

export async function getActiveFeaturedPlans() {
  return db
    .select()
    .from(schema.featuredPlans)
    .where(eq(schema.featuredPlans.active, true))
    .orderBy(asc(schema.featuredPlans.sortOrder));
}

export async function getCoachFeaturedStatus(coachId: string) {
  const [coach] = await db
    .select({ featuredUntil: schema.coachProfiles.featuredUntil })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.id, coachId))
    .limit(1);
  const featuredUntil = coach?.featuredUntil ?? null;
  return {
    featuredUntil,
    isFeatured: !!featuredUntil && featuredUntil.getTime() > Date.now(),
  };
}

export async function getFeaturedPromotionHistory(coachId: string) {
  return db
    .select({
      id: schema.featuredPromotions.id,
      planLabel: schema.featuredPlans.label,
      startAt: schema.featuredPromotions.startAt,
      endAt: schema.featuredPromotions.endAt,
      amountMinor: schema.featuredPromotions.amountMinor,
      currency: schema.featuredPromotions.currency,
      status: schema.featuredPromotions.status,
      createdAt: schema.featuredPromotions.createdAt,
    })
    .from(schema.featuredPromotions)
    .innerJoin(schema.featuredPlans, eq(schema.featuredPlans.id, schema.featuredPromotions.planId))
    .where(eq(schema.featuredPromotions.coachId, coachId))
    .orderBy(asc(schema.featuredPromotions.createdAt));
}

/** Coach rows currently featured, for "featured first" discover sorting. */
export function featuredNowFilter() {
  return gt(schema.coachProfiles.featuredUntil, new Date());
}
