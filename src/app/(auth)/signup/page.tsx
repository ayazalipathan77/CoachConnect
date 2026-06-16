import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Sign up — CoachConnect" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const sp = await searchParams;
  const initialRole = sp.role === "coach" ? "coach" : "client";
  return (
    <AuthShell
      title={initialRole === "coach" ? "Join as a Coach" : "Create your account"}
      subtitle={
        initialRole === "coach"
          ? "Start earning. Set your schedule. Build your brand."
          : "Start training — or start coaching — in minutes."
      }
    >
      <AuthForm mode="signup" initialRole={initialRole} />
    </AuthShell>
  );
}
