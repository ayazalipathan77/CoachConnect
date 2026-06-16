import { eq } from "drizzle-orm";
import { User } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/server/auth/current-user";
import { db, schema } from "@/server/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileForm } from "@/components/coach/ProfileForm";

export default async function CoachProfilePage() {
  const user = await requireRole("coach");

  const [profile] = await db
    .select({
      headline: schema.coachProfiles.headline,
      bio: schema.coachProfiles.bio,
      philosophy: schema.coachProfiles.philosophy,
      experienceYears: schema.coachProfiles.experienceYears,
      experienceLevel: schema.coachProfiles.experienceLevel,
      defaultRateMinor: schema.coachProfiles.defaultRateMinor,
      visibility: schema.coachProfiles.visibility,
      completeness: schema.coachProfiles.completeness,
    })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, user.userId))
    .limit(1);

  const [userData] = await db
    .select({ locationCity: schema.users.locationCity })
    .from(schema.users)
    .where(eq(schema.users.id, user.userId))
    .limit(1);

  const completeness = profile?.completeness ?? 0;

  return (
    <DashboardShell user={user}>
      <div className="mb-6">
        <Link href="/dashboard/coach" className="text-white/40 hover:text-white transition-colors text-sm">
          ← Dashboard
        </Link>
      </div>

      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <User className="w-5 h-5 text-brand" />
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight">My profile</h1>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-brand transition-all" style={{ width: `${completeness}%` }} />
          </div>
          <span className="text-brand text-sm font-bold">{completeness}% complete</span>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-3xl p-8">
          <ProfileForm
            defaultValues={{
              headline: profile?.headline ?? null,
              bio: profile?.bio ?? null,
              philosophy: profile?.philosophy ?? null,
              experienceYears: profile?.experienceYears ?? 0,
              experienceLevel: profile?.experienceLevel ?? "intermediate",
              defaultRateMinor: profile?.defaultRateMinor ?? null,
              visibility: profile?.visibility ?? "public",
              locationCity: userData?.locationCity ?? null,
            }}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
