"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/server/db";
import { config } from "@/server/config";
import { requireRole } from "@/server/auth/current-user";

export type SlotState = { error?: string } | undefined;
export type ProfileState = { error?: string; success?: boolean } | undefined;

const profileSchema = z.object({
  headline: z.string().max(160).optional(),
  bio: z.string().max(2000).optional(),
  philosophy: z.string().max(1000).optional(),
  experienceYears: z.coerce.number().int().min(0).max(50).optional(),
  experienceLevel: z.enum(["beginner_friendly", "intermediate", "advanced"]).optional(),
  defaultRateMinor: z.coerce.number().int().min(0).optional(),
  visibility: z.enum(["public", "unlisted", "paused"]).optional(),
  locationCity: z.string().max(100).optional(),
});

export async function updateCoachProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireRole("coach");
  const coachId = await coachProfileId(user.userId);
  if (!coachId) return { error: "Coach profile not found." };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const rateMinor = d.defaultRateMinor !== undefined
    ? Math.round(d.defaultRateMinor * 100)
    : undefined;

  // Derive a simple completeness score from filled fields.
  const fields = [d.headline, d.bio, d.locationCity, d.philosophy, d.experienceYears];
  const filled = fields.filter((f) => f !== undefined && String(f).trim().length > 0).length;
  const completeness = Math.min(100, 20 + Math.round((filled / fields.length) * 80));

  await db
    .update(schema.coachProfiles)
    .set({
      headline: d.headline ?? null,
      bio: d.bio ?? null,
      philosophy: d.philosophy ?? null,
      experienceYears: d.experienceYears ?? 0,
      experienceLevel: d.experienceLevel,
      defaultRateMinor: rateMinor ?? null,
      visibility: d.visibility,
      completeness,
      updatedAt: new Date(),
    })
    .where(eq(schema.coachProfiles.id, coachId));

  await db
    .update(schema.users)
    .set({ locationCity: d.locationCity ?? null })
    .where(eq(schema.users.id, user.userId));

  revalidatePath("/dashboard/coach");
  revalidatePath("/dashboard/coach/profile");
  revalidatePath(`/coach/${coachId}`);
  return { success: true };
}

async function coachProfileId(userId: string): Promise<string | null> {
  const [c] = await db
    .select({ id: schema.coachProfiles.id })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, userId))
    .limit(1);
  return c?.id ?? null;
}

const slotSchema = z.object({
  date: z.string().min(1, "Pick a date."),
  time: z.string().min(1, "Pick a start time."),
  durationMin: z.coerce.number().int().positive(),
  sessionType: z.string().min(1, "Choose a session type."),
  feeGBP: z.coerce.number().min(0, "Fee can't be negative."),
  sportId: z.string().optional(),
  venueId: z.string().optional(),
  newVenueName: z.string().optional(),
  newVenueCity: z.string().optional(),
});

export async function createSlot(
  _prev: SlotState,
  formData: FormData,
): Promise<SlotState> {
  const user = await requireRole("coach");
  const coachId = await coachProfileId(user.userId);
  if (!coachId) return { error: "Coach profile not found." };

  const parsed = slotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const startAt = new Date(`${d.date}T${d.time}:00`);
  if (Number.isNaN(startAt.getTime())) return { error: "Invalid date or time." };
  if (startAt.getTime() < Date.now()) return { error: "Slot must be in the future." };

  const feeMinor = Math.round(d.feeGBP * 100);
  if (feeMinor !== 0 && feeMinor < config.PLATFORM_MIN_FEE_MINOR) {
    return { error: `Minimum fee is £${(config.PLATFORM_MIN_FEE_MINOR / 100).toFixed(2)} (or free).` };
  }

  // Resolve venue: existing selection or inline new venue.
  let venueId = d.venueId && d.venueId !== "new" ? d.venueId : null;
  if (d.venueId === "new" && d.newVenueName) {
    const [v] = await db
      .insert(schema.venues)
      .values({ coachId, name: d.newVenueName, city: d.newVenueCity || null })
      .returning({ id: schema.venues.id });
    venueId = v.id;
  }

  await db.insert(schema.slots).values({
    coachId,
    venueId,
    sportId: d.sportId || null,
    startAt,
    durationMin: d.durationMin,
    sessionType: d.sessionType,
    feeMinor,
    currency: config.PLATFORM_CURRENCY,
    status: "open",
  });

  // Ensure the coach is listed under this sport for discovery.
  if (d.sportId) {
    await db
      .insert(schema.coachSports)
      .values({ coachId, sportId: d.sportId })
      .onConflictDoNothing();
  }

  revalidatePath("/dashboard/coach/slots");
  revalidatePath("/dashboard/coach");
  redirect("/dashboard/coach/slots?created=1");
}

export async function cancelSlot(formData: FormData): Promise<void> {
  const user = await requireRole("coach");
  const coachId = await coachProfileId(user.userId);
  const slotId = String(formData.get("slotId") ?? "");
  if (!coachId || !slotId) return;

  // Only open slots (no confirmed booking) can be removed here.
  await db
    .update(schema.slots)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(schema.slots.id, slotId), eq(schema.slots.coachId, coachId), eq(schema.slots.status, "open")));

  revalidatePath("/dashboard/coach/slots");
}
