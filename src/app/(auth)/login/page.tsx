import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Log in — CoachConnect" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your sessions.">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
