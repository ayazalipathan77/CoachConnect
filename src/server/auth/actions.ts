"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/server/db";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

export type AuthState = { error?: string } | undefined;

const signupSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[a-zA-Z]/, "Include at least one letter.")
    .regex(/[0-9]/, "Include at least one number."),
  role: z.enum(["client", "coach"]),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }
  const { name, email, password, role } = parsed.data;

  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1);
  if (existing.length) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(schema.users)
    .values({ name, email: email.toLowerCase(), passwordHash, role })
    .returning({ id: schema.users.id });

  // Create the matching profile row.
  if (role === "coach") {
    await db.insert(schema.coachProfiles).values({ userId: user.id });
  } else {
    await db.insert(schema.clientProfiles).values({ userId: user.id });
  }

  await createSession({ userId: user.id, role, name, email: email.toLowerCase() });
  redirect(role === "coach" ? "/dashboard/coach" : "/dashboard");
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }
  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1);

  if (!user || !user.passwordHash) {
    return { error: "No account found with those credentials." };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: "Incorrect email or password." };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });
  redirect(user.role === "coach" ? "/dashboard/coach" : user.role === "admin" ? "/admin" : "/dashboard");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
