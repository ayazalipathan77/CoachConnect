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

const adminCoachProfileSchema = z.object({
  coachId: z.string().min(1),
  headline: z.string().max(160).optional(),
  bio: z.string().max(2000).optional(),
  defaultRateGBP: z.coerce.number().min(0).optional(),
  visibility: z.enum(["public", "unlisted", "paused"]),
  status: z.enum(["pending_review", "active", "paused", "suspended"]),
});

export type AdminCoachState = { error?: string; success?: boolean } | undefined;

/** Admin-side direct edit of a coach's profile — fields that don't touch auth. */
export async function adminUpdateCoachProfile(
  _prev: AdminCoachState,
  formData: FormData,
): Promise<AdminCoachState> {
  await requireAdmin();
  const parsed = adminCoachProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  await db
    .update(schema.coachProfiles)
    .set({
      headline: d.headline || null,
      bio: d.bio || null,
      defaultRateMinor: d.defaultRateGBP != null ? Math.round(d.defaultRateGBP * 100) : null,
      visibility: d.visibility,
      status: d.status,
      updatedAt: new Date(),
    })
    .where(eq(schema.coachProfiles.id, d.coachId));

  revalidatePath("/admin/coaches");
  revalidatePath(`/admin/coaches/${d.coachId}/edit`);
  revalidatePath(`/coach/${d.coachId}`);
  return { success: true };
}

const adminUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().max(160).optional(),
  email: z.string().email(),
  role: z.enum(["coach", "client", "admin"]),
});

export type AdminUserState = { error?: string; success?: boolean } | undefined;

/** Admin-side direct edit of a user's base account fields. */
export async function adminUpdateUser(
  _prev: AdminUserState,
  formData: FormData,
): Promise<AdminUserState> {
  await requireAdmin();
  const parsed = adminUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  try {
    await db
      .update(schema.users)
      .set({ name: d.name || null, email: d.email, role: d.role, updatedAt: new Date() })
      .where(eq(schema.users.id, d.userId));
  } catch {
    return { error: "That email is already in use." };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
