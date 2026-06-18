"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";
import { integrations } from "@/server/integrations";
import { coachProfileId } from "@/server/coach/actions";

export type FeaturedState = { error?: string; success?: boolean } | undefined;

const purchaseSchema = z.object({ planId: z.string().min(1) });

/**
 * Coach purchases featured placement: charges the plan's price via the
 * payment provider (mock or Stripe), then extends featuredUntil from
 * whichever is later — now, or the coach's current featuredUntil (so
 * back-to-back purchases stack instead of overlapping/wasting time).
 */
export async function purchaseFeaturedPlan(
  _prev: FeaturedState,
  formData: FormData,
): Promise<FeaturedState> {
  const user = await requireRole("coach");
  const coachId = await coachProfileId(user.userId);
  if (!coachId) return { error: "Coach profile not found." };

  const parsed = purchaseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid plan." };

  const [plan] = await db
    .select()
    .from(schema.featuredPlans)
    .where(eq(schema.featuredPlans.id, parsed.data.planId))
    .limit(1);
  if (!plan || !plan.active) return { error: "That plan is no longer available." };

  const [coach] = await db
    .select({ featuredUntil: schema.coachProfiles.featuredUntil })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.id, coachId))
    .limit(1);

  const now = new Date();
  const base = coach?.featuredUntil && coach.featuredUntil.getTime() > now.getTime() ? coach.featuredUntil : now;
  const endAt = new Date(base.getTime() + plan.durationDays * 86_400_000);

  const [promotion] = await db
    .insert(schema.featuredPromotions)
    .values({
      coachId,
      planId: plan.id,
      startAt: now,
      endAt,
      amountMinor: plan.priceMinor,
      currency: plan.currency,
      status: "pending_payment",
    })
    .returning({ id: schema.featuredPromotions.id });

  const charge = await integrations.payments.charge(plan.priceMinor, plan.currency, {
    coachId,
    featuredPromotionId: promotion.id,
  });

  if (charge.status !== "succeeded") {
    await db
      .update(schema.featuredPromotions)
      .set({ paymentIntentId: charge.paymentIntentId })
      .where(eq(schema.featuredPromotions.id, promotion.id));
    return { error: "Payment did not complete. Please try again." };
  }

  await db
    .update(schema.featuredPromotions)
    .set({ status: "active", paymentIntentId: charge.paymentIntentId })
    .where(eq(schema.featuredPromotions.id, promotion.id));

  await db
    .update(schema.coachProfiles)
    .set({ featuredUntil: endAt, updatedAt: now })
    .where(eq(schema.coachProfiles.id, coachId));

  revalidatePath("/dashboard/coach/featured");
  revalidatePath("/discover");
  return { success: true };
}
