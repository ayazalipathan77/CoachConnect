import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Sign up — CoachConnect" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start training — or start coaching — in minutes."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
