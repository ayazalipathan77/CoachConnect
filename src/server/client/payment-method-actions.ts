"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";

export type PaymentMethodState = { error?: string; success?: boolean } | undefined;

async function clientProfileId(userId: string): Promise<string | null> {
  const [c] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, userId))
    .limit(1);
  return c?.id ?? null;
}

// Mock card add — no real tokenization or card-number validation beyond
// shape; we only ever persist the brand/last4/expiry, never a full PAN.
const cardSchema = z.object({
  brand: z.string().min(1).max(40),
  cardNumber: z.string().regex(/^\d{12,19}$/, "Enter a 12–19 digit card number (demo data — not validated against a real network)."),
  expMonth: z.coerce.number().int().min(1).max(12),
  expYear: z.coerce.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + 20),
});

export async function addCard(_prev: PaymentMethodState, formData: FormData): Promise<PaymentMethodState> {
  const user = await requireRole("client");
  const clientId = await clientProfileId(user.userId);
  if (!clientId) return { error: "Client profile not found." };

  const parsed = cardSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const existing = await db
    .select({ id: schema.clientPaymentMethods.id })
    .from(schema.clientPaymentMethods)
    .where(and(eq(schema.clientPaymentMethods.clientId, clientId), eq(schema.clientPaymentMethods.kind, "card")));

  await db.insert(schema.clientPaymentMethods).values({
    clientId,
    kind: "card",
    brand: d.brand,
    last4: d.cardNumber.slice(-4),
    expMonth: d.expMonth,
    expYear: d.expYear,
    isDefault: existing.length === 0,
  });

  revalidatePath("/dashboard/payment-methods");
  return { success: true };
}

const bankSchema = z.object({
  bankName: z.string().min(1).max(160),
  accountHolderName: z.string().min(1).max(160),
  accountNumber: z.string().regex(/^\d{6,18}$/, "Enter a 6–18 digit account number (demo data)."),
});

export async function addRefundAccount(
  _prev: PaymentMethodState,
  formData: FormData,
): Promise<PaymentMethodState> {
  const user = await requireRole("client");
  const clientId = await clientProfileId(user.userId);
  if (!clientId) return { error: "Client profile not found." };

  const parsed = bankSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const existing = await db
    .select({ id: schema.clientPaymentMethods.id })
    .from(schema.clientPaymentMethods)
    .where(and(eq(schema.clientPaymentMethods.clientId, clientId), eq(schema.clientPaymentMethods.kind, "bank")));

  await db.insert(schema.clientPaymentMethods).values({
    clientId,
    kind: "bank",
    bankName: d.bankName,
    accountHolderName: d.accountHolderName,
    accountLast4: d.accountNumber.slice(-4),
    isDefault: existing.length === 0,
  });

  revalidatePath("/dashboard/payment-methods");
  return { success: true };
}

export async function setDefaultPaymentMethod(formData: FormData) {
  const user = await requireRole("client");
  const clientId = await clientProfileId(user.userId);
  const methodId = String(formData.get("methodId") ?? "");
  const kind = String(formData.get("kind") ?? "");
  if (!clientId || !methodId) return;

  await db.transaction(async (tx) => {
    await tx
      .update(schema.clientPaymentMethods)
      .set({ isDefault: false })
      .where(and(eq(schema.clientPaymentMethods.clientId, clientId), eq(schema.clientPaymentMethods.kind, kind as "card" | "bank")));
    await tx
      .update(schema.clientPaymentMethods)
      .set({ isDefault: true })
      .where(and(eq(schema.clientPaymentMethods.id, methodId), eq(schema.clientPaymentMethods.clientId, clientId)));
  });

  revalidatePath("/dashboard/payment-methods");
}

export async function removePaymentMethod(formData: FormData) {
  const user = await requireRole("client");
  const clientId = await clientProfileId(user.userId);
  const methodId = String(formData.get("methodId") ?? "");
  if (!clientId || !methodId) return;
  await db
    .delete(schema.clientPaymentMethods)
    .where(and(eq(schema.clientPaymentMethods.id, methodId), eq(schema.clientPaymentMethods.clientId, clientId)));
  revalidatePath("/dashboard/payment-methods");
}
