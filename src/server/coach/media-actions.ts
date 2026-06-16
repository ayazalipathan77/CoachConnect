"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";

export type MediaState = { error?: string; success?: boolean } | undefined;

const MAX_DOC_BYTES = 2 * 1024 * 1024; // 2 MB
// base64 overhead ≈ 4/3; 2 MB raw ≈ 2.73 MB base64 ≈ 2,867,200 chars
const MAX_BASE64_CHARS = Math.ceil(MAX_DOC_BYTES * 1.4);

const uploadSchema = z.object({
  title: z.string().min(1).max(200),
  dataUrl: z.string().min(1),
});

export async function uploadCoachDocument(
  _prev: MediaState,
  formData: FormData,
): Promise<MediaState> {
  const user = await requireRole("coach");

  const parsed = uploadSchema.safeParse({
    title: formData.get("title"),
    dataUrl: formData.get("dataUrl"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { title, dataUrl } = parsed.data;

  if (!dataUrl.startsWith("data:")) return { error: "Invalid file format." };

  if (dataUrl.length > MAX_BASE64_CHARS) {
    return { error: "File too large. Maximum size is 2 MB." };
  }

  // Rough byte size from base64 length
  const sizeBytes = Math.round(dataUrl.length * 0.75);

  await db.insert(schema.media).values({
    ownerId: user.userId,
    type: "document",
    provider: "local",
    url: dataUrl,
    publicId: null,
    title,
    status: "pending",
    sizeBytes,
  });

  revalidatePath("/dashboard/coach/profile");
  return { success: true };
}

export async function deleteCoachDocument(formData: FormData): Promise<void> {
  const user = await requireRole("coach");
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  if (!mediaId) return;

  await db
    .delete(schema.media)
    .where(and(eq(schema.media.id, mediaId), eq(schema.media.ownerId, user.userId)));

  revalidatePath("/dashboard/coach/profile");
}
