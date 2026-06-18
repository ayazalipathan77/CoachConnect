"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";
import { coachProfileId } from "@/server/coach/actions";

export type DiscountState = { error?: string; success?: boolean } | undefined;

const discountSchema = z
  .object({
    label: z.string().min(1).max(120),
    type: z.enum(["early_bird", "flat_percent"]),
    percentOff: z.coerce.number().int().min(1).max(90),
    minDaysBeforeStart: z.coerce.number().int().min(0).max(365).optional(),
    slotId: z.string().optional(),
  })
  .refine((d) => d.type !== "early_bird" || d.minDaysBeforeStart != null, {
    message: "Early-bird discounts need a minimum days-before-start value.",
    path: ["minDaysBeforeStart"],
  });

export async function addDiscountRule(
  _prev: DiscountState,
  formData: FormData,
): Promise<DiscountState> {
  const user = await requireRole("coach");
  const coachId = await coachProfileId(user.userId);
  if (!coachId) return { error: "Coach profile not found." };

  const parsed = discountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  // Verify the slot (if any) actually belongs to this coach.
  let slotId: string | null = null;
  if (d.slotId && d.slotId !== "all") {
    const [slot] = await db
      .select({ id: schema.slots.id })
      .from(schema.slots)
      .where(and(eq(schema.slots.id, d.slotId), eq(schema.slots.coachId, coachId)))
      .limit(1);
    if (!slot) return { error: "That slot was not found." };
    slotId = slot.id;
  }

  await db.insert(schema.discountRules).values({
    coachId,
    slotId,
    label: d.label,
    type: d.type,
    percentOff: d.percentOff,
    minDaysBeforeStart: d.type === "early_bird" ? d.minDaysBeforeStart ?? null : null,
  });

  revalidatePath("/dashboard/coach/discounts");
  return { success: true };
}

export async function toggleDiscountRule(formData: FormData) {
  const user = await requireRole("coach");
  const coachId = await coachProfileId(user.userId);
  const ruleId = String(formData.get("ruleId") ?? "");
  const active = formData.get("active") === "true";
  if (!coachId || !ruleId) return;
  await db
    .update(schema.discountRules)
    .set({ active: !active })
    .where(and(eq(schema.discountRules.id, ruleId), eq(schema.discountRules.coachId, coachId)));
  revalidatePath("/dashboard/coach/discounts");
}

export async function deleteDiscountRule(formData: FormData) {
  const user = await requireRole("coach");
  const coachId = await coachProfileId(user.userId);
  const ruleId = String(formData.get("ruleId") ?? "");
  if (!coachId || !ruleId) return;
  await db
    .delete(schema.discountRules)
    .where(and(eq(schema.discountRules.id, ruleId), eq(schema.discountRules.coachId, coachId)));
  revalidatePath("/dashboard/coach/discounts");
}
