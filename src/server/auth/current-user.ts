import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";

/**
 * Read the current session, memoized per-request with React `cache` so multiple
 * components can call it without redundant cookie reads.
 */
export const getCurrentUser = cache(async (): Promise<SessionPayload | null> => {
  return getSession();
});

/** Guard for protected pages — redirects to /login when unauthenticated. */
export async function requireUser(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Guard for role-specific areas. */
export async function requireRole(
  role: SessionPayload["role"],
): Promise<SessionPayload> {
  const user = await requireUser();
  if (user.role !== role) redirect("/dashboard");
  return user;
}
