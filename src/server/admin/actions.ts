"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";

async function requireAdmin() {
  return requireRole("admin");
}

export async function verifyCoach(formData: FormData) {
  await requireAdmin();
  const coachId = String(formData.get("coachId") ?? "");
  if (!coachId) return;
  await db
    .update(schema.coachProfiles)
    .set({ verificationStatus: "verified", status: "active", updatedAt: new Date() })
    .where(eq(schema.coachProfiles.id, coachId));
  revalidatePath("/admin/coaches");
  revalidatePath(`/coach/${coachId}`);
}

export async function rejectCoach(formData: FormData) {
  await requireAdmin();
  const coachId = String(formData.get("coachId") ?? "");
  if (!coachId) return;
  await db
    .update(schema.coachProfiles)
    .set({ verificationStatus: "rejected", updatedAt: new Date() })
    .where(eq(schema.coachProfiles.id, coachId));
  revalidatePath("/admin/coaches");
}

export async function suspendCoach(formData: FormData) {
  await requireAdmin();
  const coachId = String(formData.get("coachId") ?? "");
  if (!coachId) return;
  await db
    .update(schema.coachProfiles)
    .set({ status: "paused", updatedAt: new Date() })
    .where(eq(schema.coachProfiles.id, coachId));
  revalidatePath("/admin/coaches");
  revalidatePath(`/coach/${coachId}`);
}

export async function activateCoach(formData: FormData) {
  await requireAdmin();
  const coachId = String(formData.get("coachId") ?? "");
  if (!coachId) return;
  await db
    .update(schema.coachProfiles)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(schema.coachProfiles.id, coachId));
  revalidatePath("/admin/coaches");
}

export async function hideReview(formData: FormData) {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  if (!reviewId) return;
  await db
    .update(schema.reviews)
    .set({ hidden: true })
    .where(eq(schema.reviews.id, reviewId));
  revalidatePath("/admin/reviews");
}

export async function showReview(formData: FormData) {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  if (!reviewId) return;
  await db
    .update(schema.reviews)
    .set({ hidden: false })
    .where(eq(schema.reviews.id, reviewId));
  revalidatePath("/admin/reviews");
}

const sportSchema = z.object({
  name: z.string().min(1).max(80),
  category: z.string().min(1).max(80),
  icon: z.string().max(80).optional(),
});

export type SportState = { error?: string; success?: boolean } | undefined;

export async function addSport(_prev: SportState, formData: FormData): Promise<SportState> {
  await requireAdmin();
  const parsed = sportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid." };
  const { name, category, icon } = parsed.data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  try {
    await db.insert(schema.sports).values({ name, slug, category, icon: icon || null });
  } catch {
    return { error: "A sport with that name already exists." };
  }
  revalidatePath("/admin/sports");
  revalidatePath("/discover");
  return { success: true };
}

export async function toggleSport(formData: FormData) {
  await requireAdmin();
  const sportId = String(formData.get("sportId") ?? "");
  const active = formData.get("active") === "true";
  if (!sportId) return;
  await db
    .update(schema.sports)
    .set({ active: !active })
    .where(eq(schema.sports.id, sportId));
  revalidatePath("/admin/sports");
  revalidatePath("/discover");
}
