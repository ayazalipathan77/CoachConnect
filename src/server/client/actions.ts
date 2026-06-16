"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";

export type ClientProfileState = { error?: string; success?: boolean } | undefined;

const clientProfileSchema = z.object({
  name: z.string().min(1).max(120),
  locationCity: z.string().max(100).optional(),
  locationPostcode: z.string().max(16).optional(),
  dob: z.string().optional(),
});

export async function updateClientProfile(
  _prev: ClientProfileState,
  formData: FormData,
): Promise<ClientProfileState> {
  const user = await requireRole("client");

  const parsed = clientProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const dob = d.dob ? new Date(d.dob) : null;
  if (dob && Number.isNaN(dob.getTime())) return { error: "Invalid date of birth." };

  await db
    .update(schema.users)
    .set({
      name: d.name,
      locationCity: d.locationCity || null,
      locationPostcode: d.locationPostcode || null,
    })
    .where(eq(schema.users.id, user.userId));

  await db
    .update(schema.clientProfiles)
    .set({ dob: dob ?? undefined, updatedAt: new Date() })
    .where(eq(schema.clientProfiles.userId, user.userId));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function updateClientAvatar(
  _prev: ClientProfileState,
  formData: FormData,
): Promise<ClientProfileState> {
  const user = await requireRole("client");
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (!imageUrl) return { error: "No image provided." };

  if (!imageUrl.startsWith("data:image/") && !imageUrl.startsWith("https://")) {
    return { error: "Invalid image format." };
  }
  if (imageUrl.startsWith("data:") && imageUrl.length > 680 * 500) {
    return { error: "Image too large. Please use an image under 500 KB." };
  }

  await db.update(schema.users).set({ image: imageUrl }).where(eq(schema.users.id, user.userId));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function addClientSport(formData: FormData): Promise<void> {
  const user = await requireRole("client");
  const sportId = String(formData.get("sportId") ?? "").trim();

  const [client] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, user.userId))
    .limit(1);
  if (!client || !sportId) return;

  await db
    .insert(schema.clientPreferredSports)
    .values({ clientId: client.id, sportId })
    .onConflictDoNothing();

  revalidatePath("/dashboard/profile");
}

export async function removeClientSport(formData: FormData): Promise<void> {
  const user = await requireRole("client");
  const sportId = String(formData.get("sportId") ?? "").trim();

  const [client] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, user.userId))
    .limit(1);
  if (!client || !sportId) return;

  await db
    .delete(schema.clientPreferredSports)
    .where(
      and(
        eq(schema.clientPreferredSports.clientId, client.id),
        eq(schema.clientPreferredSports.sportId, sportId),
      ),
    );

  revalidatePath("/dashboard/profile");
}
