"use server";

import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { integrations } from "@/server/integrations";
import { hashPassword } from "./password";

export type ResetRequestState = { error?: string; success?: boolean } | undefined;
export type ResetState = { error?: string; success?: boolean } | undefined;

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

const emailSchema = z.object({ email: z.string().email("Please enter a valid email.") });

/** Request a password reset: generate a token, store its hash, email the link. */
export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }
  const email = parsed.data.email.toLowerCase();

  const [user] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  // Always report success to avoid leaking which emails exist.
  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await db.insert(schema.passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const base = process.env.APP_URL ?? "http://localhost:3000";
    const link = `${base}/reset-password/${token}`;

    // Mock email — logs the link so it's testable without a real provider.
    console.log(`[password-reset] Reset link for ${email}: ${link}`);
    await integrations.email.send({
      to: email,
      subject: "Reset your CoachConnect password",
      html: `<p>Click the link below to reset your password. It expires in 1 hour.</p><p><a href="${link}">${link}</a></p>`,
      text: `Reset your password (expires in 1 hour): ${link}`,
    });
  }

  return { success: true };
}

const resetSchema = z
  .object({
    token: z.string().min(1, "Missing reset token."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-zA-Z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirm: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

/** Validate a reset token and set a new password. */
export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { token, password } = parsed.data;
  const tokenHash = sha256(token);

  const [record] = await db
    .select({ id: schema.passwordResetTokens.id, userId: schema.passwordResetTokens.userId })
    .from(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.tokenHash, tokenHash),
        isNull(schema.passwordResetTokens.usedAt),
        gt(schema.passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!record) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(schema.users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(schema.users.id, record.userId));

  await db
    .update(schema.passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.passwordResetTokens.id, record.id));

  return { success: true };
}
