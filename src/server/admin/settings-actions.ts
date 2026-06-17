"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";

async function requireAdmin() {
  return requireRole("admin");
}

export type SettingsState = { error?: string; success?: boolean } | undefined;

const settingsSchema = z.object({
  platformCommissionPercent: z.coerce.number().min(0).max(100).optional(),
  platformMinFeeGBP: z.coerce.number().min(0).optional(),
  stripeAccountLabel: z.string().max(160).optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
  payoutInstructions: z.string().max(4000).optional(),
});

/** Upserts the singleton platform_settings row (id=1). */
export async function updatePlatformSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const values = {
    platformCommissionRate:
      d.platformCommissionPercent != null ? d.platformCommissionPercent / 100 : null,
    platformMinFeeMinor:
      d.platformMinFeeGBP != null ? Math.round(d.platformMinFeeGBP * 100) : null,
    stripeAccountLabel: d.stripeAccountLabel || null,
    supportEmail: d.supportEmail || null,
    payoutInstructions: d.payoutInstructions || null,
    updatedAt: new Date(),
  };

  await db
    .insert(schema.platformSettings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: schema.platformSettings.id, set: values });

  revalidatePath("/admin/settings");
  return { success: true };
}

const planSchema = z.object({
  key: z.string().min(1).max(40).regex(/^[a-z0-9_-]+$/, "Key must be lowercase letters, numbers, _ or -."),
  label: z.string().min(1).max(120),
  durationDays: z.coerce.number().int().min(1).max(3650),
  priceGBP: z.coerce.number().min(0),
});

export async function addFeaturedPlan(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireAdmin();
  const parsed = planSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  try {
    await db.insert(schema.featuredPlans).values({
      key: d.key,
      label: d.label,
      durationDays: d.durationDays,
      priceMinor: Math.round(d.priceGBP * 100),
    });
  } catch {
    return { error: "A plan with that key already exists." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/coach/featured");
  return { success: true };
}

export async function toggleFeaturedPlan(formData: FormData) {
  await requireAdmin();
  const planId = String(formData.get("planId") ?? "");
  const active = formData.get("active") === "true";
  if (!planId) return;
  await db
    .update(schema.featuredPlans)
    .set({ active: !active })
    .where(eq(schema.featuredPlans.id, planId));
  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/coach/featured");
}
